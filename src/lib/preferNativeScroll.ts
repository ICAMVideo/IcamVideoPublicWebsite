/**
 * Whether the current browser should skip Lenis and use native scroll instead.
 * Now only true on iOS (touch-only), where Lenis + ticker fights the OS momentum.
 * **Desktop Safari now uses Lenis** — with canvas-based scrubbing there's no reason
 * to exclude it, and native scroll gave choppy ScrollTrigger updates.
 */
export function preferNativeScroll(): boolean {
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
