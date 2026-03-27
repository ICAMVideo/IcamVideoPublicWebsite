/**
 * LRU cache of decoded frames for canvas scrubbing.
 * fetch + createImageBitmap. WebKit serializes heavy decodes — many parallel
 * createImageBitmap calls freeze Safari; we cap concurrent decodes.
 */
function defaultDecodeConcurrency(): number {
  if (typeof navigator === "undefined") return 4;
  const ua = navigator.userAgent;
  const iOS =
    /iPad|iPhone|iPod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (iOS) return 1;
  if (
    /Safari/i.test(ua) &&
    !/Chrome|Chromium|CriOS|Edg|OPR|Brave/i.test(ua)
  ) {
    return 4;
  }
  return 5;
}

export class FrameBitmapCache {
  private readonly max: number;
  private readonly decodeConcurrency: number;
  private readonly map = new Map<number, ImageBitmap>();
  /** LRU order: oldest at front, newest at end */
  private readonly lru: number[] = [];
  private readonly inflight = new Map<number, Promise<ImageBitmap | undefined>>();
  /** Indices that must not be evicted (current scrub targets + neighbors). */
  private pinned = new Set<number>();

  private dead = false;
  private decodeRunning = 0;
  private decodeWait: Array<{
    resolve: () => void;
    reject: (e: Error) => void;
  }> = [];

  constructor(maxEntries = 48, decodeConcurrency?: number) {
    this.max = maxEntries;
    this.decodeConcurrency = decodeConcurrency ?? defaultDecodeConcurrency();
  }

  private enterDecodeSlot(): Promise<void> {
    if (this.dead) {
      return Promise.reject(new Error("FrameBitmapCache destroyed"));
    }
    return new Promise((resolve, reject) => {
      if (this.dead) {
        reject(new Error("FrameBitmapCache destroyed"));
        return;
      }
      if (this.decodeRunning < this.decodeConcurrency) {
        this.decodeRunning++;
        resolve();
        return;
      }
      this.decodeWait.push({ resolve, reject });
    });
  }

  private leaveDecodeSlot() {
    this.decodeRunning--;
    if (this.dead || this.decodeWait.length === 0) return;
    const w = this.decodeWait.shift()!;
    this.decodeRunning++;
    w.resolve();
  }

  private async withDecodeSlot<T>(task: () => Promise<T>): Promise<T> {
    let acquired = false;
    try {
      await this.enterDecodeSlot();
      acquired = true;
      return await task();
    } finally {
      if (acquired) this.leaveDecodeSlot();
    }
  }

  /** Call before decode / peek so hot frames are not LRU-evicted during fast scroll. */
  setPinned(indices: Iterable<number>) {
    this.pinned = new Set(indices);
  }

  /** Move to MRU end if present (keeps likely-next frames in RAM). */
  touchIfPresent(i: number) {
    if (this.map.has(i)) this.bump(i);
  }

  peek(i: number): ImageBitmap | undefined {
    const b = this.map.get(i);
    if (!b) return undefined;
    this.bump(i);
    return b;
  }

  private bump(i: number) {
    const ix = this.lru.indexOf(i);
    if (ix >= 0) this.lru.splice(ix, 1);
    this.lru.push(i);
  }

  /** Evict LRU entry that is not pinned; if all pinned, evict oldest anyway. */
  private evictOne(): boolean {
    for (let i = 0; i < this.lru.length; i++) {
      const victim = this.lru[i];
      if (this.pinned.has(victim)) continue;
      this.lru.splice(i, 1);
      this.map.get(victim)?.close();
      this.map.delete(victim);
      return true;
    }
    const victim = this.lru.shift();
    if (victim === undefined) return false;
    this.map.get(victim)?.close();
    this.map.delete(victim);
    return true;
  }

  getOrLoad(i: number, url: string): Promise<ImageBitmap | undefined> {
    if (this.dead) return Promise.resolve(undefined);

    const existing = this.map.get(i);
    if (existing) {
      this.bump(i);
      return Promise.resolve(existing);
    }

    let p = this.inflight.get(i);
    if (!p) {
      p = fetch(url, { cache: "force-cache" })
        .then((r) => {
          if (!r.ok) throw new Error(`Frame fetch ${r.status}`);
          return r.blob();
        })
        .then((blob) => {
          if (this.dead) throw new Error("FrameBitmapCache destroyed");
          return this.withDecodeSlot(() => createImageBitmap(blob));
        })
        .then((bmp) => {
          this.inflight.delete(i);
          if (this.dead) {
            bmp.close();
            throw new Error("FrameBitmapCache destroyed");
          }
          while (this.lru.length >= this.max) {
            if (!this.evictOne()) break;
          }
          this.map.get(i)?.close();
          this.map.set(i, bmp);
          this.bump(i);
          return bmp;
        })
        .catch((err) => {
          this.inflight.delete(i);
          if (this.dead) return undefined;
          if (
            err instanceof Error &&
            err.message === "FrameBitmapCache destroyed"
          ) {
            return undefined;
          }
          throw err;
        });
      this.inflight.set(i, p);
    }
    return p;
  }

  /** Start decode if missing; ignore errors (e.g. bad index in dev). */
  prefetch(i: number, url: string, onReady?: () => void): void {
    if (i < 0 || this.map.has(i) || this.inflight.has(i)) return;
    void this.getOrLoad(i, url)
      .then(() => {
        onReady?.();
      })
      .catch(() => {});
  }

  destroy() {
    this.dead = true;
    for (const w of this.decodeWait) {
      w.reject(new Error("FrameBitmapCache destroyed"));
    }
    this.decodeWait.length = 0;
    for (const bmp of this.map.values()) bmp.close();
    this.map.clear();
    this.lru.length = 0;
    this.inflight.clear();
    this.pinned.clear();
  }
}
