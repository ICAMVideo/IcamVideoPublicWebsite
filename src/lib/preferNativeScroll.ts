/**
 * Site-wide Lenis toggle. Set `false` to use native browser scroll everywhere
 * (SmoothScroll skips Lenis; ScrollFrameHero uses native scrub/prefetch tuning).
 */
export const LENIS_ENABLED = false;

/**
 * Whether the current browser should skip Lenis and use native scroll instead.
 * True when `LENIS_ENABLED` is off, on iOS (Lenis + ticker fights OS momentum), etc.
 */
export function preferNativeScroll(): boolean {
  if (!LENIS_ENABLED) return true;
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const iOS =
    /iPad|iPhone|iPod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  return iOS;
}

/** True on any WebKit browser (Safari desktop, iOS, etc). */
export function isWebKit(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return (
    /Safari/i.test(ua) &&
    !/Chrome|Chromium|CriOS|FxiOS|Edg|OPR|Brave/i.test(ua)
  );
}

/** Windows desktop + tablet (Chromium/Edge/Firefox); used for decode/prefetch tuning. */
export function isWindows(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Windows/i.test(navigator.userAgent);
}
