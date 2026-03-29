import {
  destroyTerminalDecodePool,
  getTerminalDecodePool,
} from "@/lib/terminalDecodePool";
import { getWarmTerminalBlob } from "@/lib/terminalFrameBlobWarmup";

/**
 * LRU cache of decoded frames for canvas scrubbing.
 * First visit: `fetch` → `blob` → `createImageBitmap`. After that, the **blob is
 * retained** in memory; if the ImageBitmap is LRU-evicted, the next visit only
 * re-decodes (no second `fetch`, so DevTools stops “spiking” on repeat frames).
 *
 * WebKit serializes heavy decodes — we cap concurrent `createImageBitmap` calls.
 * AbortController cancels in-flight **network** prefetches far from the scrub head.
 */
function isIOSLike(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return (
    /iPad|iPhone|iPod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function defaultDecodeConcurrency(): number {
  if (typeof navigator === "undefined") return 4;
  const ua = navigator.userAgent;
  if (isIOSLike()) return 1;
  if (
    /Safari/i.test(ua) &&
    !/Chrome|Chromium|CriOS|Edg|OPR|Brave/i.test(ua)
  ) {
    return 2;
  }
  /** Chrome/Edge/Firefox: higher parallelism hides disk-cache + decode latency when scrubbing fast. */
  return 8;
}

export class FrameBitmapCache {
  private readonly max: number;
  private readonly decodeConcurrency: number;
  /** Off-main-thread decode (Chromium prod); falls back to main on failure. */
  private readonly useWorkerDecode: boolean;
  /** Keep fetched blobs in RAM for instant re-decode (skipped on iOS to save memory). */
  private readonly retainBlobBytes: boolean;
  private readonly map = new Map<number, ImageBitmap>();
  /**
   * Raw bytes kept after the first successful fetch. Re-decoding after an ImageBitmap
   * LRU eviction skips `fetch()` entirely (no extra Network rows; avoids cache revalidation work).
   */
  private readonly byteCache = new Map<number, Blob>();
  /** LRU order: oldest at front, newest at end */
  private readonly lru: number[] = [];
  private readonly inflight = new Map<number, Promise<ImageBitmap | undefined>>();
  private readonly abortControllers = new Map<number, AbortController>();
  /** Indices that must not be evicted (current scrub targets + neighbors). */
  private pinned = new Set<number>();

  private dead = false;
  private decodeRunning = 0;
  private decodeWait: Array<{
    resolve: () => void;
    reject: (e: Error) => void;
  }> = [];

  constructor(
    maxEntries = 48,
    decodeConcurrency?: number,
    useWorkerDecode = false
  ) {
    this.max = maxEntries;
    this.decodeConcurrency = decodeConcurrency ?? defaultDecodeConcurrency();
    this.useWorkerDecode = useWorkerDecode;
    this.retainBlobBytes = !isIOSLike();
  }

  /** Decode WebP/PNG blob to bitmap; worker path avoids blocking the main thread. */
  private decodeBitmap(blob: Blob): Promise<ImageBitmap> {
    const pool = this.useWorkerDecode ? getTerminalDecodePool() : null;
    if (pool) {
      return pool.decode(blob).catch(() =>
        this.withDecodeSlot(() => createImageBitmap(blob))
      );
    }
    return this.withDecodeSlot(() => createImageBitmap(blob));
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

  private finishDecode(
    i: number,
    decodePromise: Promise<ImageBitmap>
  ): Promise<ImageBitmap | undefined> {
    return decodePromise
      .then((bmp) => {
        this.inflight.delete(i);
        this.abortControllers.delete(i);
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
        this.abortControllers.delete(i);
        if (this.dead) return undefined;
        if (err instanceof DOMException && err.name === "AbortError") {
          return undefined;
        }
        if (
          err instanceof Error &&
          err.message === "FrameBitmapCache destroyed"
        ) {
          return undefined;
        }
        throw err;
      });
  }

  getOrLoad(i: number, url: string): Promise<ImageBitmap | undefined> {
    if (this.dead) return Promise.resolve(undefined);

    const existing = this.map.get(i);
    if (existing) {
      this.bump(i);
      return Promise.resolve(existing);
    }

    let p = this.inflight.get(i);
    if (p) return p;

    const warmBlob = getWarmTerminalBlob(i);
    const cachedBlob =
      warmBlob ??
      (this.retainBlobBytes ? this.byteCache.get(i) : undefined);
    if (cachedBlob) {
      p = this.finishDecode(i, this.decodeBitmap(cachedBlob));
      this.inflight.set(i, p);
      return p;
    }

    const ac = new AbortController();
    this.abortControllers.set(i, ac);

    const decoded = fetch(url, { cache: "force-cache", signal: ac.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`Frame fetch ${r.status}`);
        return r.blob();
      })
      .then((blob) => {
        if (this.dead) throw new Error("FrameBitmapCache destroyed");
        if (this.retainBlobBytes) this.byteCache.set(i, blob);
        return this.decodeBitmap(blob);
      });

    p = this.finishDecode(i, decoded);
    this.inflight.set(i, p);
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

  /**
   * Abort prefetches that are far from `center` (in index space).
   * A tight window caused thrashing during fast scroll: we'd abort work we still
   * needed, then pay fetch+decode again — felt like a 0.5–1s freeze.
   */
  cancelDistant(center: number, minDistance: number): void {
    for (const [idx, ac] of this.abortControllers) {
      if (Math.abs(idx - center) > minDistance) {
        ac.abort();
        this.abortControllers.delete(idx);
        this.inflight.delete(idx);
      }
    }
  }

  destroy() {
    this.dead = true;
    if (this.useWorkerDecode) destroyTerminalDecodePool();
    for (const ac of this.abortControllers.values()) ac.abort();
    this.abortControllers.clear();
    for (const w of this.decodeWait) {
      w.reject(new Error("FrameBitmapCache destroyed"));
    }
    this.decodeWait.length = 0;
    for (const bmp of this.map.values()) bmp.close();
    this.map.clear();
    this.byteCache.clear();
    this.lru.length = 0;
    this.inflight.clear();
    this.pinned.clear();
  }
}
