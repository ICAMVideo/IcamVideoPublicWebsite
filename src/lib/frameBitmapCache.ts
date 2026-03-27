/**
 * LRU cache of decoded frames for canvas scrubbing.
 * Uses fetch + createImageBitmap (same pixels as <img>, fewer DOM layers).
 */
export class FrameBitmapCache {
  private readonly max: number;
  private readonly map = new Map<number, ImageBitmap>();
  /** LRU order: oldest at front, newest at end */
  private readonly lru: number[] = [];
  private readonly inflight = new Map<number, Promise<ImageBitmap>>();

  constructor(maxEntries = 24) {
    this.max = maxEntries;
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

  private evictOne() {
    const victim = this.lru.shift();
    if (victim === undefined) return;
    this.map.get(victim)?.close();
    this.map.delete(victim);
  }

  getOrLoad(i: number, url: string): Promise<ImageBitmap> {
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
        .then((blob) => createImageBitmap(blob))
        .then((bmp) => {
          this.inflight.delete(i);
          while (this.lru.length >= this.max) this.evictOne();
          this.map.get(i)?.close();
          this.map.set(i, bmp);
          this.bump(i);
          return bmp;
        })
        .catch((err) => {
          this.inflight.delete(i);
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
    for (const bmp of this.map.values()) bmp.close();
    this.map.clear();
    this.lru.length = 0;
    this.inflight.clear();
  }
}
