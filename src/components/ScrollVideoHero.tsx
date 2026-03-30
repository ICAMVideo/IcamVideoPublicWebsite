"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

gsap.registerPlugin(ScrollTrigger);

const HERO_SCROLL_VH_PER_FRAME = 2.35;
const HERO_SCROLL_VH_BASE = 64;
const HERO_SCROLL_VH_FLOOR = 112;
const FALLBACK_SECTION_VH = 320;

function sectionHeightVh(frameCount: number): number {
  if (frameCount <= 0) return FALLBACK_SECTION_VH;
  return Math.max(
    HERO_SCROLL_VH_FLOOR,
    Math.round(HERO_SCROLL_VH_BASE + frameCount * HERO_SCROLL_VH_PER_FRAME)
  );
}

const VIDEO_SRC_DESKTOP = "/terminal/output.mp4";
const VIDEO_SRC_MOBILE = "/terminal/output-mobile.mp4";

/** Tailwind `lg` (1024px): match nav / typical desktop layout. */
const MOBILE_VIDEO_MQ = "(max-width: 1023px)";

const VIDEO_START_S = 4;
const VIDEO_PREWARM_MS = 900;

const SCRUB_SMOOTH_S = 1.2;
const TIME_LERP = 0.11;

/** iOS WebKit often won't composite video frames while paused + seeking; muted play() fixes scrub previews. */
function prefersIOSInlineScrubWorkaround(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/i.test(ua)) return true;
  return (
    navigator.platform === "MacIntel" && typeof navigator.maxTouchPoints === "number" && navigator.maxTouchPoints > 1
  );
}

type Props = {
  onVideoReady?: () => void;
};

export function ScrollVideoHero({ onVideoReady }: Props) {
  const onReadyRef = useRef(onVideoReady);
  onReadyRef.current = onVideoReady;

  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [videoSrc, setVideoSrc] = useState(VIDEO_SRC_DESKTOP);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_VIDEO_MQ);
    const apply = () =>
      setVideoSrc(mq.matches ? VIDEO_SRC_MOBILE : VIDEO_SRC_DESKTOP);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const timingN = 600;
  const sectionVh = sectionHeightVh(timingN);

  const mobileAsset = videoSrc === VIDEO_SRC_MOBILE;

  useLayoutEffect(() => {
    if (!sectionRef.current) return;

    const section = sectionRef.current;
    const video = videoRef.current;
    if (!video) return;

    const iosScrubWorkaround = prefersIOSInlineScrubWorkaround();
    video.defaultMuted = true;
    video.muted = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.load();

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let targetTime = 0;
    let videoRafId = 0;
    let cancelled = false;
    let prewarmTimerId: number | null = null;

    const tickVideo = () => {
      if (cancelled) return;
      const d = video.duration;
      if (!Number.isFinite(d) || d <= 0) {
        videoRafId = requestAnimationFrame(tickVideo);
        return;
      }
      if (reduceMotion) {
        video.currentTime = targetTime;
      } else {
        const t = video.currentTime;
        const next = t + (targetTime - t) * TIME_LERP;
        video.currentTime =
          Math.abs(targetTime - next) < 0.025 ? targetTime : next;
      }
      videoRafId = requestAnimationFrame(tickVideo);
    };

    const applyScrollVisuals = (p: number) => {
      const d = video.duration;
      if (Number.isFinite(d) && d > 0) {
        const start = Math.min(VIDEO_START_S, Math.max(0, d - 0.05));
        targetTime = start + p * Math.max(0, d - start);
        if (reduceMotion) {
          video.currentTime = targetTime;
        }
      }
    };

    let scrubRafId: number | null = null;
    let pendingProgress = 0;

    const scheduleScrub = () => {
      if (scrubRafId != null || cancelled) return;
      scrubRafId = requestAnimationFrame(() => {
        scrubRafId = null;
        if (cancelled) return;
        applyScrollVisuals(pendingProgress);
      });
    };

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: reduceMotion ? (false as const) : SCRUB_SMOOTH_S,
        onUpdate: (self) => {
          pendingProgress = self.progress;
          scheduleScrub();
        },
      });

      applyScrollVisuals(0);
    }, section);

    if (!reduceMotion) {
      videoRafId = requestAnimationFrame(tickVideo);
    }

    let readyFired = false;
    const fireReadyOnce = () => {
      if (readyFired) return;
      readyFired = true;
      onReadyRef.current?.();
    };

    const onMeta = () => {
      const d = video.duration;
      const start = Number.isFinite(d)
        ? Math.min(VIDEO_START_S, Math.max(0, d - 0.05))
        : VIDEO_START_S;
      video.currentTime = start;
      targetTime = start;
      applyScrollVisuals(pendingProgress);

      if (iosScrubWorkaround) {
        video.muted = true;
        void video.play().catch(() => {});
        fireReadyOnce();
      } else {
        // Prime decoder/network while splash is visible, then reset.
        const done = () => {
          if (cancelled) return;
          video.pause();
          video.currentTime = start;
          targetTime = start;
          applyScrollVisuals(pendingProgress);
          fireReadyOnce();
        };

        void video
          .play()
          .then(() => {
            if (cancelled) return;
            prewarmTimerId = window.setTimeout(done, VIDEO_PREWARM_MS);
          })
          .catch(() => {
            // If autoplay prewarm is blocked, still proceed.
            done();
          });
      }

      ScrollTrigger.refresh();
    };

    if (video.readyState >= 1) {
      onMeta();
    } else {
      video.addEventListener("loadedmetadata", onMeta, { once: true });
      video.addEventListener(
        "error",
        () => {
          fireReadyOnce();
        },
        { once: true }
      );
    }

    ScrollTrigger.refresh();
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    return () => {
      cancelled = true;
      if (prewarmTimerId != null) window.clearTimeout(prewarmTimerId);
      cancelAnimationFrame(videoRafId);
      if (scrubRafId != null) cancelAnimationFrame(scrubRafId);
      video.pause();
      ctx.revert();
    };
  }, [timingN, videoSrc]);

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: `${sectionVh}vh` }}
      aria-label="Scroll-driven video"
    >
      <span className="sr-only">
        Scroll vertically to scrub the product video.
      </span>
      <div className="sticky top-0 flex h-dvh w-full flex-col bg-black">
        <div className="relative isolate flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-neutral-950">
          <div className="absolute inset-0 z-[1] flex items-center justify-center [transform:translateZ(0)]">
            <video
              ref={videoRef}
              className="h-full w-full object-cover lg:h-auto lg:max-h-dvh lg:object-contain [backface-visibility:hidden]"
              src={videoSrc}
              width={mobileAsset ? 720 : 1280}
              height={mobileAsset ? 406 : 720}
              preload="auto"
              muted
              playsInline
              disablePictureInPicture
              aria-label="Scroll-driven product video"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
