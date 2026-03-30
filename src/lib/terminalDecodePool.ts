import { isWebKit } from "@/lib/preferNativeScroll";

/**
 * Blob worker avoids Next dev/Turbopack `new Worker(new URL(...))` staying "(pending)".
 * Same script in prod — no separate chunk to load.
 */
const INLINE_DECODE_WORKER_SOURCE = `
self.onmessage = async (e) => {
  try {
    const bmp = await createImageBitmap(e.data.blob);
    self.postMessage({ ok: true, bmp }, [bmp]);
  } catch {
    self.postMessage({ ok: false });
  }
};
`.trim();

/** Enough workers for Windows + high decode concurrency without queue stalls. */
const POOL_SIZE = 8;

type Job = {
  blob: Blob;
  resolve: (bmp: ImageBitmap) => void;
  reject: (e: Error) => void;
};

/**
 * Off-main-thread `createImageBitmap` on Chromium-class browsers (incl. dev server).
 * WebKit uses the main-thread decode path in FrameBitmapCache.
 */
export function canUseTerminalDecodeWorkers(): boolean {
  return typeof Worker !== "undefined" && !isWebKit();
}

class TerminalDecodePool {
  private readonly workers: Worker[] = [];
  private readonly queue: Job[] = [];
  private busy = new Set<Worker>();
  private readonly objectUrl: string;

  constructor() {
    this.objectUrl = URL.createObjectURL(
      new Blob([INLINE_DECODE_WORKER_SOURCE], {
        type: "application/javascript",
      })
    );
    for (let k = 0; k < POOL_SIZE; k++) {
      const w = new Worker(this.objectUrl);
      w.onmessage = (ev) => this.onMessage(w, ev);
      w.onerror = () => this.onWorkerError(w);
      this.workers.push(w);
    }
  }

  decode(blob: Blob): Promise<ImageBitmap> {
    return new Promise((resolve, reject) => {
      this.queue.push({ blob, resolve, reject });
      this.pump();
    });
  }

  private pump() {
    for (const w of this.workers) {
      if (this.busy.has(w) || this.queue.length === 0) continue;
      const job = this.queue.shift()!;
      this.busy.add(w);
      (w as Worker & { __job?: Job }).__job = job;
      try {
        w.postMessage({ blob: job.blob });
      } catch {
        this.busy.delete(w);
        delete (w as Worker & { __job?: Job }).__job;
        job.reject(new Error("postMessage failed"));
        this.pump();
      }
    }
  }

  private onMessage(
    w: Worker,
    ev: MessageEvent<{ ok: boolean; bmp?: ImageBitmap }>
  ) {
    const job = (w as Worker & { __job?: Job }).__job;
    delete (w as Worker & { __job?: Job }).__job;
    this.busy.delete(w);
    const d = ev.data;
    if (job) {
      if (d.ok && d.bmp) job.resolve(d.bmp);
      else job.reject(new Error("worker decode failed"));
    }
    this.pump();
  }

  private onWorkerError(w: Worker) {
    const job = (w as Worker & { __job?: Job }).__job;
    delete (w as Worker & { __job?: Job }).__job;
    this.busy.delete(w);
    if (job) job.reject(new Error("worker error"));
    try {
      w.terminate();
    } catch {
      /* ignore */
    }
    const ix = this.workers.indexOf(w);
    if (ix >= 0) this.workers.splice(ix, 1);
    this.pump();
  }

  destroy() {
    for (const w of this.workers) {
      try {
        w.terminate();
      } catch {
        /* ignore */
      }
    }
    this.workers.length = 0;
    try {
      URL.revokeObjectURL(this.objectUrl);
    } catch {
      /* ignore */
    }
    this.busy.clear();
    for (const j of this.queue) {
      j.reject(new Error("decode pool destroyed"));
    }
    this.queue.length = 0;
  }
}

let pool: TerminalDecodePool | null = null;

export function getTerminalDecodePool(): TerminalDecodePool | null {
  if (!canUseTerminalDecodeWorkers()) return null;
  if (!pool) {
    try {
      pool = new TerminalDecodePool();
    } catch {
      pool = null;
    }
  }
  return pool;
}

export function destroyTerminalDecodePool(): void {
  pool?.destroy();
  pool = null;
}
