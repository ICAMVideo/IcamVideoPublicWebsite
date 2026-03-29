import { frameSrc } from "@/lib/terminalFrameUrl";

function isIOSLike(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return (
    /iPad|iPhone|iPod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

/** index → image bytes, filled during splash + background. */
const warmBlobs = new Map<number, Blob>();

let warmGeneration = 0;

/**
 * Bytes for frame `i` if warmup already fetched them.
 * `FrameBitmapCache` uses this so scroll can skip `fetch` for those indices.
 */
export function getWarmTerminalBlob(i: number): Blob | undefined {
  return warmBlobs.get(i);
}

export function clearTerminalBlobWarmup(): void {
  warmGeneration++;
  warmBlobs.clear();
}

/** How many indices we eventually aim to warm for this sequence length. */
export function warmFrameTargetCount(total: number): number {
  if (total <= 0) return 0;
  if (isIOSLike()) return Math.min(56, total);
  return total;
}

/** True when every target index has a blob. */
export function hasFullTerminalWarmupForFrames(frames: string[]): boolean {
  const n = warmFrameTargetCount(frames.length);
  for (let i = 0; i < n; i++) {
    if (!warmBlobs.has(i)) return false;
  }
  return true;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Splash may dismiss before this many frames exist; deep scroll can still fetch until
 * background warm finishes (same as reference sites: no network *once* fully warm).
 */
const SPLASH_PREFIX_LEN = 40;

/** Never block the hero longer than this while waiting on `SPLASH_PREFIX_LEN`. */
const SPLASH_MAX_WAIT_MS = 6_500;

const MAX_MAIN_PASSES = 12;
const WARM_WORKER_POOL = 4;
const WARM_BATCH_SIZE = 8;
const WARM_BATCH_DELAY_MS = 50;

function warmMainThreadRange(
  frames: string[],
  rangeStart: number,
  rangeEnd: number,
  gen: number
): Promise<void> {
  const span = rangeEnd - rangeStart;
  if (span <= 0) return Promise.resolve();

  const concurrency = isIOSLike() ? 4 : 18;
  let next = rangeStart;
  const take = () => {
    if (gen !== warmGeneration) return -1;
    while (next < rangeEnd) {
      const i = next;
      next++;
      if (!warmBlobs.has(i)) return i;
    }
    return -1;
  };

  const worker = async () => {
    for (;;) {
      const i = take();
      if (i < 0) return;
      try {
        const url = frameSrc(frames[i]);
        const r = await fetch(url, { cache: "force-cache" });
        if (!r.ok) continue;
        const blob = await r.blob();
        if (gen !== warmGeneration) return;
        warmBlobs.set(i, blob);
      } catch {
        /* ignore */
      }
    }
  };

  return Promise.all(
    Array.from({ length: Math.min(concurrency, span) }, () => worker())
  ).then(() => {});
}

/**
 * Fetch workers: safe with `next dev --webpack`. (Turbopack + `new URL` workers can hang.)
 */
function canUseWarmWorkers(): boolean {
  return typeof Worker !== "undefined" && typeof import.meta.url !== "undefined";
}

async function tryWarmWithWorkersRange(
  frames: string[],
  rangeStart: number,
  limit: number,
  gen: number
): Promise<boolean> {
  if (!canUseWarmWorkers() || rangeStart >= limit) {
    return false;
  }

  let workerUrl: URL;
  try {
    workerUrl = new URL(
      "../workers/terminalWarmFetch.worker.ts",
      import.meta.url
    );
  } catch {
    return false;
  }

  const pool = Math.min(WARM_WORKER_POOL, Math.max(1, limit - rangeStart));
  let nextIndex = rangeStart;

  const runOneWorker = (w: Worker) =>
    new Promise<void>((resolveWorker) => {
      const step = () => {
        if (gen !== warmGeneration) {
          w.terminate();
          resolveWorker();
          return;
        }
        const items: Array<{ i: number; url: string }> = [];
        while (items.length < WARM_BATCH_SIZE && nextIndex < limit) {
          const i = nextIndex++;
          if (warmBlobs.has(i)) continue;
          items.push({ i, url: frameSrc(frames[i]) });
        }
        if (items.length === 0) {
          w.terminate();
          resolveWorker();
          return;
        }
        const onMsg = (ev: MessageEvent<{ payload: Array<{ i: number; ok: boolean; buf?: ArrayBuffer }> }>) => {
          w.removeEventListener("message", onMsg);
          w.removeEventListener("error", onErr);
          const { payload } = ev.data;
          if (gen === warmGeneration) {
            for (const item of payload) {
              if (item.ok && item.buf != null) {
                warmBlobs.set(item.i, new Blob([item.buf], { type: "image/webp" }));
              }
            }
          }
          setTimeout(step, WARM_BATCH_DELAY_MS);
        };
        const onErr = () => {
          w.removeEventListener("message", onMsg);
          w.removeEventListener("error", onErr);
          setTimeout(step, WARM_BATCH_DELAY_MS);
        };
        w.addEventListener("message", onMsg);
        w.addEventListener("error", onErr);
        try {
          w.postMessage({ items });
        } catch {
          onErr();
        }
      };
      step();
    });

  const workers: Worker[] = [];
  try {
    for (let k = 0; k < pool; k++) {
      workers.push(new Worker(workerUrl, { type: "module" }));
    }
    await Promise.all(workers.map((w) => runOneWorker(w)));
    return gen === warmGeneration;
  } catch {
    for (const w of workers) {
      try {
        w.terminate();
      } catch {
        /* ignore */
      }
    }
    return false;
  }
}

async function runFullWarmupInBackground(
  frames: string[],
  limit: number,
  gen: number
): Promise<void> {
  if (gen !== warmGeneration) return;
  await tryWarmWithWorkersRange(frames, 0, limit, gen);
  if (gen !== warmGeneration) return;
  let passes = 0;
  while (
    gen === warmGeneration &&
    !indicesRangeFilled(0, limit) &&
    passes < MAX_MAIN_PASSES
  ) {
    await warmMainThreadRange(frames, 0, limit, gen);
    passes++;
  }
}

function prefixReady(gen: number, prefix: number): boolean {
  for (let i = 0; i < prefix; i++) {
    if (!warmBlobs.has(i)) return false;
  }
  return true;
}

async function waitUntilSplashReady(
  gen: number,
  prefix: number
): Promise<void> {
  while (gen === warmGeneration) {
    if (prefixReady(gen, prefix)) return;
    await sleep(40);
  }
}

/**
 * **Hybrid (matches how fast reference sites *feel*)**: start loading the **entire**
 * sequence immediately in the background (workers + main). The splash only waits until
 * the **first `SPLASH_PREFIX_LEN` frames** exist or **`SPLASH_MAX_WAIT_MS`** — whichever
 * comes first — so you are not blocked for minutes. After that, scrubbing uses warm
 * blobs where available; the rest fill in quietly until `hasFullTerminalWarmupForFrames`.
 */
export function warmTerminalFrameBlobs(frames: string[]): Promise<void> {
  const limit = warmFrameTargetCount(frames.length);
  if (limit === 0) return Promise.resolve();

  clearTerminalBlobWarmup();
  const gen = warmGeneration;
  const prefix = Math.min(SPLASH_PREFIX_LEN, limit);

  return (async () => {
    if (gen !== warmGeneration) return;

    void runFullWarmupInBackground(frames, limit, gen);

    await Promise.race([
      waitUntilSplashReady(gen, prefix),
      sleep(SPLASH_MAX_WAIT_MS),
    ]);
  })();
}

function indicesRangeFilled(start: number, end: number): boolean {
  for (let i = start; i < end; i++) {
    if (!warmBlobs.has(i)) return false;
  }
  return true;
}
