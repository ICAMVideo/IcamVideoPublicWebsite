/**
 * Lenis + gsap.ticker integration is a common source of jank on WebKit (Safari,
 * iOS browsers). Native scroll keeps ScrollTrigger accurate with less main-thread work.
 */
export function preferNativeScroll(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const iOS =
    /iPad|iPhone|iPod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (iOS) return true;
  return (
    /Safari/i.test(ua) &&
    !/Chrome|Chromium|CriOS|FxiOS|Edg|OPR|Brave/i.test(ua)
  );
}
