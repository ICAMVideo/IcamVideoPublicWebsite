"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

const HERO_SCROLL_VH_PER_FRAME = 1.7;
const HERO_SCROLL_VH_BASE = 56;
const HERO_SCROLL_VH_FLOOR = 96;
const FALLBACK_SECTION_VH = 320;

function sectionHeightVh(frameCount: number): number {
  if (frameCount <= 0) return FALLBACK_SECTION_VH;
  return Math.max(
    HERO_SCROLL_VH_FLOOR,
    Math.round(HERO_SCROLL_VH_BASE + frameCount * HERO_SCROLL_VH_PER_FRAME)
  );
}

const VIDEO_SRC = "/terminal/output.mp4";
const VIDEO_START_S = 4;

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

  const timingN = 600;
  const sectionVh = sectionHeightVh(timingN);

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
      } else {
        video.pause();
      }

      ScrollTrigger.refresh();
      if (!readyFired) {
        readyFired = true;
        onReadyRef.current?.();
      }
    };

    if (video.readyState >= 1) {
      onMeta();
    } else {
      video.addEventListener("loadedmetadata", onMeta, { once: true });
      video.addEventListener(
        "error",
        () => {
          if (!readyFired) {
            readyFired = true;
            onReadyRef.current?.();
          }
        },
        { once: true }
      );
    }

    ScrollTrigger.refresh();
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    return () => {
      cancelled = true;
      cancelAnimationFrame(videoRafId);
      if (scrubRafId != null) cancelAnimationFrame(scrubRafId);
      video.pause();
      ctx.revert();
    };
  }, [timingN]);

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
              className="h-auto max-h-dvh w-full object-contain [backface-visibility:hidden]"
              src={VIDEO_SRC}
              width={1280}
              height={720}
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
