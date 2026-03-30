"use client";

import { drawImageCover, drawImageCoverFocal } from "@/lib/canvasImageCover";
import { BRAND_BLUE } from "@/lib/brand";
import { FrameBitmapCache } from "@/lib/frameBitmapCache";
import {
  isWebKit,
  isWindows,
  LENIS_ENABLED,
  preferNativeScroll,
} from "@/lib/preferNativeScroll";
import { hasFullTerminalWarmupForFrames } from "@/lib/terminalFrameBlobWarmup";
import { frameSrc } from "@/lib/terminalFrameUrl";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

const CURSOR_OFFSET = 14;

/** Max decoded frames kept in RAM; avoids LRU evict → re-decode during fast scrub (see eager decode sweep). */
const BITMAP_CACHE_MAX = 1200;

/**
 * Safari only: use every Nth source frame for the canvas (decode + draw).
 * Halves main-thread decode work; overlay timing still uses full `modeIdx` from scroll progress.
 */
const WEBKIT_FRAME_STRIDE = 2;

gsap.registerPlugin(ScrollTrigger);

/**
 * ScrollTrigger `scrub` duration (seconds): timeline progress eases toward scroll
 * position. Higher = less violent frame-index changes while the wheel/trackpad
 * moves fast, so WebP decode can keep up. Lenis README + GSAP setup is already
 * correct; this is the knob that actually paces the canvas vs CPU decode.
 *
 * @see https://github.com/darkroomengineering/lenis/blob/main/README.md (GSAP section)
 */
function scrubSmoothingSeconds(): number {
  if (!LENIS_ENABLED) {
    if (isWebKit()) {
      /** Safari: main-thread decode — ease ScrollTrigger progress to reduce index churn. */
      return 1.96;
    }
    if (isWindows()) {
      /** Windows Chrome/Edge: ease scrub vs canvas + compositing (still worker-decoded). */
      return 1.46;
    }
    /** Native scroll on Mac/Linux Chromium — keep progress responsive. */
    return 0.72;
  }
  if (preferNativeScroll()) return 1.25;
  if (isWebKit()) return 1.15;
  return 0.68;
}

/**
 * Sticky hero is 100vh; scroll distance through the section is this outer height.
 * Progress 0→1 is spread across it, so **smaller total vh ⇒ more frame steps per
 * wheel notch** (reference sites often feel like ~3–5 frames per scroll).
 *
 * Old `max(600, 120 + n*5.5)` was ~6 vh per frame for large n — very “slow” scrub.
 * **`HERO_SCROLL_VH_FLOOR` must stay below `BASE + n×PER_FRAME` for your frame count,**
 * or changing PER_FRAME does nothing (a high floor used to hide small PER_FRAME tweaks).
 */
const HERO_SCROLL_VH_PER_FRAME = 1.05;
const HERO_SCROLL_VH_BASE = 56;
/** Minimum section height (vh); keep low so per-frame multiplier actually applies. */
const HERO_SCROLL_VH_FLOOR = 96;

function heroSectionHeightVh(frameCount: number): number {
  if (frameCount <= 0) return 100;
  return Math.max(
    HERO_SCROLL_VH_FLOOR,
    Math.round(HERO_SCROLL_VH_BASE + frameCount * HERO_SCROLL_VH_PER_FRAME)
  );
}

type Props = {
  frames: string[];
  active: boolean;
};

const ACCENT = BRAND_BLUE;

/** Phase 1 text begins erasing from the start at this frame index. */
const FRAME_ERASE_START = "frame_0241.webp";
/** Phase 1 text is fully gone by this frame. */
const FRAME_ERASE_END = "frame_0405.webp";
/** Phase 2 typewriter begins at this frame. */
const FRAME_PHASE2_START = "frame_0451.webp";

const LINE1 = "iCAM Video";
const LINE2 = "at the future of logistics";

/** Second headline — runs after the cinematic frame, same typewriter style. */
const PHASE2_LINE1 = "Video, GPS & safety";
const PHASE2_LINE2 = "unified on one platform";

const TYPEWRITER_START_FRAME_INDEX = 4;
const TYPEWRITER_SCROLL = 0.32;
const TYPEWRITER_PROGRESS_EPS = 0.003;
const FAST_BLEND_VELOCITY = 0.085;

/** Matches `computeScrollBlend`: scroll progress `p` maps to frame index `t = p * (n-1)`. */
function scrollProgressDenominator(n: number): number {
  return n > 1 ? n - 1 : 1;
}

function frameIndexToScrollProgress(frameIndex: number, n: number): number {
  if (n <= 1) return 0;
  return frameIndex / scrollProgressDenominator(n);
}

/** Avoid `gsap.set` per letter every frame (major main-thread cost during scrub). */
function setHeroLetter(el: HTMLElement, alpha: number, color: string) {
  const hidden = alpha < 0.002;
  el.style.visibility = hidden ? "hidden" : "visible";
  el.style.opacity = hidden ? "0" : String(alpha);
  el.style.color = color;
}

function applyTypewriter(
  heroProgress: number,
  letters: HTMLElement[],
  reduceMotion: boolean,
  videoFrameCount: number,
  startFrameIndex: number
) {
  if (letters.length === 0) return;
  if (reduceMotion) {
    for (const el of letters) {
      setHeroLetter(el, 1, "#ffffff");
    }
    return;
  }

  const n = Math.max(1, videoFrameCount);
  const startP =
    n > startFrameIndex ? frameIndexToScrollProgress(startFrameIndex, n) : 0;
  const twEnd = Math.min(1, startP + TYPEWRITER_SCROLL);
  const twP =
    heroProgress < startP
      ? 0
      : gsap.utils.clamp(
          0,
          1,
          gsap.utils.mapRange(startP, twEnd, 0, 1, heroProgress)
        );

  const total = letters.length;
  if (twP <= 0) {
    for (const el of letters) {
      setHeroLetter(el, 0, "#ffffff");
    }
    return;
  }

  const exact = twP * total;
  const revealed = Math.min(total, Math.floor(exact));
  const letterFrac = exact - revealed;

  for (let i = 0; i < total; i++) {
    const el = letters[i];
    if (i < revealed) {
      setHeroLetter(el, 1, "#ffffff");
    } else if (i === revealed && revealed < total) {
      const alpha = gsap.utils.clamp(
        0.06,
        1,
        letterFrac < 0.001 ? 1 : letterFrac * 1.35
      );
      setHeroLetter(el, alpha, ACCENT);
    } else {
      setHeroLetter(el, 0, "#ffffff");
    }
  }
}

/**
 * Phase 1: forward typewriter, then letters are removed from the **start** of the
 * phrase between `eraseStartIdx` and `eraseEndIdx` (scroll-synced).
 */
function applyPhase1Typewriter(
  heroProgress: number,
  letters: HTMLElement[],
  reduceMotion: boolean,
  videoFrameCount: number,
  eraseStartIdx: number,
  eraseEndIdx: number
) {
  if (letters.length === 0) return;

  if (reduceMotion) {
    applyTypewriter(
      heroProgress,
      letters,
      true,
      videoFrameCount,
      TYPEWRITER_START_FRAME_INDEX
    );
    return;
  }

  const validErase =
    eraseStartIdx >= 0 &&
    eraseEndIdx >= 0 &&
    eraseStartIdx < eraseEndIdx;

  if (!validErase) {
    applyTypewriter(
      heroProgress,
      letters,
      false,
      videoFrameCount,
      TYPEWRITER_START_FRAME_INDEX
    );
    return;
  }

  const n = Math.max(1, videoFrameCount);
  const total = letters.length;
  const startP =
    n > TYPEWRITER_START_FRAME_INDEX
      ? frameIndexToScrollProgress(TYPEWRITER_START_FRAME_INDEX, n)
      : 0;
  const twEnd = Math.min(1, startP + TYPEWRITER_SCROLL);
  const twP =
    heroProgress < startP
      ? 0
      : gsap.utils.clamp(
          0,
          1,
          gsap.utils.mapRange(startP, twEnd, 0, 1, heroProgress)
        );

  let forwardExact = twP * total;
  if (twP >= 1) {
    forwardExact = total;
  }

  const pEraseStart = frameIndexToScrollProgress(eraseStartIdx, n);
  const pEraseEnd = frameIndexToScrollProgress(eraseEndIdx, n);

  let eaten = 0;
  if (heroProgress >= pEraseStart && pEraseStart < pEraseEnd) {
    const erP = gsap.utils.clamp(
      0,
      1,
      gsap.utils.mapRange(pEraseStart, pEraseEnd, 0, 1, heroProgress)
    );
    eaten = erP * forwardExact;
  } else if (heroProgress >= pEraseEnd) {
    eaten = forwardExact;
  }

  const hi = forwardExact;
  if (hi <= 0.0001 || eaten >= hi - 1e-6) {
    for (const el of letters) {
      setHeroLetter(el, 0, "#ffffff");
    }
    return;
  }

  const eLo = Math.floor(eaten);
  const eFr = eaten - eLo;
  const hLo = Math.floor(hi);
  const hFr = hi - hLo;

  for (let i = 0; i < total; i++) {
    const el = letters[i];
    if (i < eLo) {
      setHeroLetter(el, 0, "#ffffff");
    } else if (
      i === eLo &&
      eLo === hLo &&
      eFr > 0.001 &&
      hFr > 0.001 &&
      hi < total
    ) {
      const alpha = gsap.utils.clamp(
        0.06,
        1,
        (1 - eFr) * hFr * 1.35
      );
      setHeroLetter(el, alpha, ACCENT);
    } else if (i === eLo && eFr > 0.001) {
      const alpha = gsap.utils.clamp(
        0.06,
        1,
        (1 - eFr) * 1.35
      );
      setHeroLetter(el, alpha, ACCENT);
    } else if (i > eLo && i < hLo) {
      setHeroLetter(el, 1, "#ffffff");
    } else if (i === hLo && hFr > 0.001 && hi < total) {
      const alpha = gsap.utils.clamp(
        0.06,
        1,
        hFr < 0.001 ? 1 : hFr * 1.35
      );
      setHeroLetter(el, alpha, ACCENT);
    } else if (i === eLo && eFr <= 0.001 && eLo < hLo) {
      setHeroLetter(el, 1, "#ffffff");
    } else if (
      i === eLo &&
      eFr <= 0.001 &&
      eLo === hLo &&
      hFr > 0.001 &&
      hi < total
    ) {
      const alpha = gsap.utils.clamp(0.06, 1, hFr * 1.35);
      setHeroLetter(el, alpha, ACCENT);
    } else {
      setHeroLetter(el, 0, "#ffffff");
    }
  }
}

type HeroOverlayMode = "phase1" | "between" | "phase2";

function getOverlayMode(
  frameIndex: number,
  eraseEndIdx: number,
  phase2StartIdx: number
): HeroOverlayMode {
  if (phase2StartIdx >= 0 && frameIndex >= phase2StartIdx) {
    return "phase2";
  }
  if (
    eraseEndIdx >= 0 &&
    frameIndex >= eraseEndIdx &&
    (phase2StartIdx < 0 || frameIndex < phase2StartIdx)
  ) {
    return "between";
  }
  return "phase1";
}

function computeScrollBlend(
  p: number,
  n: number,
  reduceMotion: boolean,
  stride: number = 1
): { modeIdx: number; i0: number; i1: number; blend: number } {
  if (n <= 0) return { modeIdx: 0, i0: 0, i1: 0, blend: 0 };
  const t = p * (n - 1);
  const modeIdx = Math.min(n - 1, Math.max(0, Math.round(t)));

  if (reduceMotion) {
    const raw = Math.floor(p * scrollProgressDenominator(n));
    const k =
      stride <= 1
        ? Math.min(n - 1, Math.max(0, raw))
        : Math.min(n - 1, Math.max(0, Math.floor(raw / stride) * stride));
    return { modeIdx, i0: k, i1: k, blend: 0 };
  }
  if (n === 1) return { modeIdx: 0, i0: 0, i1: 0, blend: 0 };

  if (stride <= 1) {
    const i0 = Math.min(n - 1, Math.max(0, Math.floor(t)));
    const i1 = Math.min(n - 1, i0 + 1);
    const blend = t - i0;
    return { modeIdx, i0, i1, blend };
  }

  const i0 = Math.min(n - 1, Math.max(0, Math.floor(t / stride) * stride));
  let i1 = Math.min(n - 1, i0 + stride);
  if (i1 <= i0) i1 = Math.min(n - 1, i0 + 1);
  const blend = (t - i0) / Math.max(1e-6, i1 - i0);
  return { modeIdx, i0, i1, blend };
}

/** Decode order for background warm: closest indices first. With stride>1, only those indices (fewer decodes on Safari). */
function buildFrameDecodeOrder(
  frameCount: number,
  centerIndex: number,
  stride: number
): number[] {
  if (frameCount <= 0) return [];
  const c = Math.max(0, Math.min(frameCount - 1, Math.round(centerIndex)));
  const out =
    stride <= 1
      ? Array.from({ length: frameCount }, (_, i) => i)
      : Array.from({ length: frameCount }, (_, i) => i).filter(
          (i) => i % stride === 0
        );
  if (out.length === 0) return [0];
  out.sort((a, b) => Math.abs(a - c) - Math.abs(b - c));
  return out;
}

export function ScrollFrameHero({ frames, active }: Props) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const phase1Ref = useRef<HTMLDivElement | null>(null);
  const phase2Ref = useRef<HTMLDivElement | null>(null);
  const followerRef = useRef<HTMLDivElement | null>(null);
  const canvasWrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  /** Latest scrub progress; eager decode + WebKit prioritise frames near here. */
  const scrollProgressRef = useRef(0);
  const posRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const [finePointer, setFinePointer] = useState(false);
  const [cursorOnHero, setCursorOnHero] = useState(false);

  useLayoutEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const sync = () => setFinePointer(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const applyFollowerTransform = () => {
    const el = followerRef.current;
    if (!el) return;
    const { x, y } = posRef.current;
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  const queueFollowerPosition = () => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      applyFollowerTransform();
    });
  };

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const framesKey = frames.join("\0");

  useLayoutEffect(() => {
    if (!active || frames.length === 0 || !sectionRef.current) return;

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    const canvas = canvasRef.current;
    const wrap = canvasWrapRef.current;
    if (!canvas || !wrap) return;

    // `desynchronized` targets Chrome’s low-latency path; WebKit can show glitches or missed paints.
    const c2d = canvas.getContext("2d", {
      alpha: false,
      ...(isWebKit() ? {} : { desynchronized: true }),
    });
    if (!c2d) return;

    const section = sectionRef.current;
    const p1 = phase1Ref.current;
    const p2 = phase2Ref.current;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const eraseStartIdx = frames.findIndex((f) => f === FRAME_ERASE_START);
    const eraseEndIdx = frames.findIndex((f) => f === FRAME_ERASE_END);
    const phase2StartIdx = frames.findIndex((f) => f === FRAME_PHASE2_START);
    const phase2StartFrameIndex =
      phase2StartIdx >= 0 ? phase2StartIdx : TYPEWRITER_START_FRAME_INDEX;

    let letterEls1: HTMLElement[] | null = null;
    let letterEls2: HTMLElement[] | null = null;
    let lastProgressTs = 0;
    let lastProgress = 0;
    let scrollVelocity = 0;
    let scrollDirection = 1;
    let scrollFastForPin = false;
    let prevMode: HeroOverlayMode | undefined;
    let lastPhase1Progress = -1;
    let lastPhase2Progress = -1;

    const webkit = isWebKit();
    const windows = isWindows();
    /** WebKit: only every Nth frame is drawn/decoded; overlay phases still use full `modeIdx`. */
    const frameStride = webkit ? WEBKIT_FRAME_STRIDE : 1;
    /** After splash blob warmup, decoding is cheap — keep cross-frame blend + i1 even on fast wheel. */
    const fullBlobWarm = hasFullTerminalWarmupForFrames(frames);
    /** Blob inline workers decode off main thread in dev + prod (no Turbopack `URL` worker chunk). */
    const useWorkerDecode = !webkit;
    /** Never raise WebKit decode slots to 14 — `createImageBitmap` runs on the main thread there. */
    const decodeConcurrencyOverride = fullBlobWarm
      ? webkit
        ? 1
        : 14
      : undefined;
    /** Large enough to retain the full sequence once decoded (was 64/96 — evictions caused freezes on hard scroll). */
    const bitmapCacheSize = Math.min(frames.length, BITMAP_CACHE_MAX);
    const cache = new FrameBitmapCache(
      bitmapCacheSize,
      decodeConcurrencyOverride,
      useWorkerDecode
    );
    let cancelled = false;

    let warmPollId: number | null = null;
    let eagerDecodeRafId: number | null = null;
    let eagerDecodeSweepStarted = false;

    const cancelEagerDecodeRaf = () => {
      if (eagerDecodeRafId == null) return;
      cancelAnimationFrame(eagerDecodeRafId);
      eagerDecodeRafId = null;
    };

    /**
     * After blobs are warm, decode via rAF. Order is **closest to current scroll first** (not
     * always 0→n). On WebKit, each tick also **prefers the current scrub pair (i0,i1)** so fast
     * scroll wins decode slots before the rest of the spiral.
     */
    const runEagerDecodeSweep = () => {
      if (eagerDecodeSweepStarted || cancelled) return;
      eagerDecodeSweepStarted = true;
      const len = frames.length;
      const center = scrollProgressRef.current * Math.max(0, len - 1);
      const decodeOrder = buildFrameDecodeOrder(len, center, frameStride);
      let cursor = 0;
      const tick = () => {
        if (cancelled) {
          cancelEagerDecodeRaf();
          return;
        }
        if (cursor >= decodeOrder.length) {
          eagerDecodeRafId = null;
          return;
        }
        const batch = webkit ? 2 : windows ? 10 : 12;
        const queueDecode = (j: number) => {
          void cache
            .getOrLoad(j, frameSrc(frames[j]))
            .then(() => {
              if (!cancelled) scheduleTryPaint();
            })
            .catch(() => {});
        };
        if (webkit) {
          const { i0, i1 } = computeScrollBlend(
            scrollProgressRef.current,
            len,
            reduceMotion,
            frameStride
          );
          queueDecode(i0);
          if (i1 !== i0) queueDecode(i1);
        }
        for (let k = 0; k < batch && cursor < decodeOrder.length; k++) {
          queueDecode(decodeOrder[cursor++]);
        }
        eagerDecodeRafId = requestAnimationFrame(tick);
      };
      eagerDecodeRafId = requestAnimationFrame(tick);
    };

    const tryStartEagerDecodeWhenWarm = () => {
      if (cancelled || eagerDecodeSweepStarted) return;
      if (!hasFullTerminalWarmupForFrames(frames)) return;
      if (warmPollId != null) {
        clearInterval(warmPollId);
        warmPollId = null;
      }
      runEagerDecodeSweep();
    };

    tryStartEagerDecodeWhenWarm();
    warmPollId = window.setInterval(() => tryStartEagerDecodeWhenWarm(), 400) as unknown as number;

    const sizeRef = { w: 0, h: 0 };
    const paintStateRef = {
      i0: 0,
      i1: 0,
      blend: 0,
      rm: reduceMotion,
    };

    /** Last frame we fully painted from the scrub target (for hold on fast scroll). */
    let lastPainted: { i0: number; i1: number; blend: number } | null = null;

    /**
     * When we fall behind (target frames not decoded yet), schedule rAF repaints
     * until we catch up. This makes Safari recover quickly after fast scroll.
     */
    let catchUpRaf: number | null = null;

    /** Skip redundant full canvas clears when scrub target unchanged (cheap vs two cover draws). */
    let lastDrawSig = "";

    /**
     * Prefetch + decode completions can fire dozens of promises in one frame — one paint per rAF.
     */
    let paintCoalesceRaf: number | null = null;
    const scheduleTryPaint = () => {
      if (cancelled) return;
      if (paintCoalesceRaf != null) return;
      paintCoalesceRaf = requestAnimationFrame(() => {
        paintCoalesceRaf = null;
        if (!cancelled) tryPaint();
      });
    };

    const scheduleCatchUp = () => {
      if (catchUpRaf != null || cancelled) return;
      catchUpRaf = requestAnimationFrame(() => {
        catchUpRaf = null;
        if (cancelled) return;
        const b0 = cache.peek(paintStateRef.i0);
        if (!b0) {
          scheduleCatchUp();
          return;
        }
        tryPaint();
      });
    };

    const pinAround = (i0: number, i1: number, n: number) => {
      const s = new Set<number>();
      const ring = scrollFastForPin
        ? [0, 1, -1, 2, -2, 3, -3]
        : [0, 1, -1, 2, -2];
      for (const base of [i0, i1]) {
        for (const d of ring) {
          const i = base + d;
          if (i >= 0 && i < n) s.add(i);
        }
      }
      if (lastPainted) {
        if (lastPainted.i0 >= 0 && lastPainted.i0 < n) s.add(lastPainted.i0);
        if (lastPainted.i1 >= 0 && lastPainted.i1 < n) s.add(lastPainted.i1);
      }
      cache.setPinned(s);
    };

    const tryPaint = () => {
      if (cancelled) return;
      const { w, h } = sizeRef;
      if (w < 1 || h < 1) return;

      const n = frames.length;
      const target = paintStateRef;
      pinAround(target.i0, target.i1, n);
      cache.touchIfPresent(target.i0);
      cache.touchIfPresent(target.i1);

      let i0 = target.i0;
      let i1 = target.i1;
      let blend = target.blend;
      const rm = target.rm;

      let b0 = cache.peek(i0);
      let b1 = cache.peek(i1);
      let fromTarget = true;

      if (!b0 && lastPainted) {
        const lb0 = cache.peek(lastPainted.i0);
        const lb1 = cache.peek(lastPainted.i1);
        if (lb0) {
          fromTarget = false;
          b0 = lb0;
          if (
            lastPainted.i0 === lastPainted.i1 ||
            lastPainted.blend < 0.002
          ) {
            i0 = lastPainted.i0;
            i1 = lastPainted.i0;
            blend = 0;
            b1 = lb0;
          } else if (lb1) {
            i0 = lastPainted.i0;
            i1 = lastPainted.i1;
            blend = lastPainted.blend;
            b1 = lb1;
          } else {
            i0 = lastPainted.i0;
            i1 = lastPainted.i0;
            blend = 0;
            b1 = lb0;
          }
        }
        scheduleCatchUp();
      }

      const drawSig = `${i0}:${i1}:${blend.toFixed(3)}:${rm}:${Boolean(b0)}:${Boolean(b1)}`;
      if (drawSig === lastDrawSig) return;
      lastDrawSig = drawSig;

      if (!b0) return;

      const narrow = w < 640;
      const drawFrame = (
        ctx: CanvasRenderingContext2D,
        bitmap: NonNullable<typeof b0>,
        cw: number,
        ch: number
      ) => {
        if (narrow) drawImageCoverFocal(ctx, bitmap, cw, ch, 0.5, 0.35);
        else drawImageCover(ctx, bitmap, cw, ch);
      };

      /** Snapshot what we actually drew (for hold-frame + cache pinning). */
      const recordIfTarget = () => {
        if (!fromTarget) return;
        const t = target;
        if (t.rm || t.i0 === t.i1 || t.blend < 0.002) {
          lastPainted = { i0: t.i0, i1: t.i0, blend: 0 };
          return;
        }
        const p0 = cache.peek(t.i0);
        const p1 = cache.peek(t.i1);
        if (p0 && !p1) {
          lastPainted = { i0: t.i0, i1: t.i0, blend: 0 };
          return;
        }
        if (t.blend > 0.998 && p1) {
          lastPainted = { i0: t.i1, i1: t.i1, blend: 0 };
          return;
        }
        if (p0 && p1) {
          lastPainted = { i0: t.i0, i1: t.i1, blend: t.blend };
        }
      };

      if (rm) {
        drawFrame(c2d, b0, w, h);
        recordIfTarget();
        return;
      }

      if (i0 === i1 || blend < 0.002) {
        drawFrame(c2d, b0, w, h);
        recordIfTarget();
        return;
      }

      if (!b1) {
        drawFrame(c2d, b0, w, h);
        recordIfTarget();
        return;
      }

      if (blend > 0.998) {
        drawFrame(c2d, b1, w, h);
        recordIfTarget();
        return;
      }

      drawFrame(c2d, b0, w, h);
      c2d.globalAlpha = blend;
      drawFrame(c2d, b1, w, h);
      c2d.globalAlpha = 1;
      recordIfTarget();
    };

    const resizeCanvas = () => {
      if (cancelled) return;
      /** Safari / Windows: cheaper backing store; Mac Chrome can afford 1.5×. */
      const dprCap = webkit ? 1.05 : windows ? 1.1 : 1.5;
      const dpr = Math.min(dprCap, window.devicePixelRatio || 1);
      const cw = wrap.clientWidth;
      const ch = wrap.clientHeight;
      if (cw < 1 || ch < 1) return;
      lastDrawSig = "";
      sizeRef.w = cw;
      sizeRef.h = ch;
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
      canvas.style.width = `${cw}px`;
      canvas.style.height = `${ch}px`;
      c2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      tryPaint();
    };

    const ro = new ResizeObserver(() => resizeCanvas());
    ro.observe(wrap);
    resizeCanvas();

    const prefetchWindow = (center: number, dir: number, vel: number) => {
      const n = frames.length;
      const native = preferNativeScroll();
      const baseRadius = native
        ? webkit
          ? 22
          : windows
            ? 20
            : 28
        : webkit
          ? 40
          : 52;
      const fast = vel > 0.06;
      const ahead = fast ? Math.round(baseRadius * 2) : baseRadius;
      const behind = fast ? Math.round(baseRadius * 0.5) : baseRadius;

      const list: number[] = [];
      const lo = Math.max(0, center - (dir >= 0 ? behind : ahead));
      const hi = Math.min(n - 1, center + (dir >= 0 ? ahead : behind));
      for (let idx = lo; idx <= hi; idx++) {
        if (frameStride > 1 && idx % frameStride !== 0) continue;
        list.push(idx);
      }
      if (list.length === 0 && frameStride > 1 && n > 0) {
        const snap = Math.min(
          n - 1,
          Math.max(0, Math.floor(center / frameStride) * frameStride)
        );
        list.push(snap);
      }

      list.sort(
        (a, b) => Math.abs(a - center) - Math.abs(b - center)
      );

      cache.cancelDistant(center, webkit ? 130 : 160);

      let ptr = 0;
      /** Fewer decode starts per frame on WebKit (main-thread) and Windows (GPU/memory). */
      const batch = !native
        ? 6
        : webkit
          ? 2
          : windows
            ? 8
            : 10;
      const pump = () => {
        if (cancelled) return;
        for (let k = 0; k < batch && ptr < list.length; k++, ptr++) {
          cache.prefetch(
            list[ptr],
            frameSrc(frames[list[ptr]]),
            scheduleTryPaint
          );
        }
        if (ptr >= list.length) return;
        requestAnimationFrame(pump);
      };
      pump();
    };

    const scrubSeconds = scrubSmoothingSeconds();

    const applyOverlayMode = (mode: HeroOverlayMode) => {
      const scrollHints = section.querySelectorAll<HTMLElement>(
        "[data-scroll-hint]"
      );

      if (p1) {
        gsap.set(p1, {
          autoAlpha: mode === "phase1" ? 1 : 0,
          pointerEvents: "none",
        });
      }
      if (p2) {
        gsap.set(p2, {
          autoAlpha: mode === "phase2" ? 1 : 0,
          pointerEvents: "none",
        });
      }

      if (scrollHints.length > 0) {
        if (mode === "between") {
          gsap.set(scrollHints, { autoAlpha: 0 });
        } else {
          gsap.set(scrollHints, { clearProps: "autoAlpha" });
        }
      }
    };

    /** Coalesce many ScrollTrigger `onUpdate` ticks into one paint + prefetch per display frame. */
    let scrubRafId: number | null = null;
    let pendingProgress = 0;

    const scheduleScrubFrame = () => {
      if (scrubRafId != null || cancelled) return;
      scrubRafId = requestAnimationFrame(() => {
        scrubRafId = null;
        if (cancelled) return;
        applyScrollVisuals(pendingProgress);
      });
    };

    const applyScrollVisuals = (p: number) => {
      scrollProgressRef.current = p;
      const now = performance.now();
      const n = frames.length;

      if (lastProgressTs > 0) {
        const dt = Math.max(1, now - lastProgressTs);
        const dp = p - lastProgress;
        scrollVelocity = (Math.abs(dp) / dt) * 1000;
        scrollDirection = dp >= 0 ? 1 : -1;
      }
      lastProgressTs = now;
      lastProgress = p;
      scrollFastForPin = scrollVelocity > 0.06;

      const { modeIdx, i0, i1, blend } = computeScrollBlend(
        p,
        n,
        reduceMotion,
        frameStride
      );
      paintStateRef.i0 = i0;
      paintStateRef.i1 = i1;
      const safariBlendCut = 0.042;
      const winBlendCut = 0.055;
      const blendVelocityCut = webkit
        ? safariBlendCut
        : windows
          ? winBlendCut
          : FAST_BLEND_VELOCITY;
      const killBlendForSpeed =
        !reduceMotion &&
        (scrollVelocity > blendVelocityCut ||
          (!fullBlobWarm &&
            scrollVelocity > (webkit ? 0.07 : windows ? 0.09 : 0.12)));
      paintStateRef.blend = killBlendForSpeed ? 0 : blend;
      paintStateRef.rm = reduceMotion;

      pinAround(i0, i1, n);

      const repaintWhenReady = () => {
        if (cancelled) return;
        scheduleTryPaint();
      };

      void cache
        .getOrLoad(i0, frameSrc(frames[i0]))
        .then(repaintWhenReady)
        .catch(() => {});
      const loadBlendNeighbor =
        fullBlobWarm ||
        scrollVelocity <=
          (webkit ? safariBlendCut : windows ? winBlendCut : FAST_BLEND_VELOCITY);
      if (i1 !== i0 && loadBlendNeighbor) {
        void cache
          .getOrLoad(i1, frameSrc(frames[i1]))
          .then(repaintWhenReady)
          .catch(() => {});
      }
      tryPaint();

      const preloadCenter = Math.round((i0 + i1) / 2);
      prefetchWindow(preloadCenter, scrollDirection, scrollVelocity);

      const mode = getOverlayMode(modeIdx, eraseEndIdx, phase2StartIdx);

      if (prevMode !== mode) {
        prevMode = mode;
        lastPhase1Progress = -1;
        lastPhase2Progress = -1;
        applyOverlayMode(mode);
      }

      if (mode === "phase1" && p1) {
        if (!letterEls1) {
          letterEls1 = Array.from(
            p1.querySelectorAll<HTMLElement>("[data-type-char]")
          );
        }
        if (
          lastPhase1Progress < 0 ||
          Math.abs(p - lastPhase1Progress) >= TYPEWRITER_PROGRESS_EPS
        ) {
          applyPhase1Typewriter(
            p,
            letterEls1,
            reduceMotion,
            n,
            eraseStartIdx,
            eraseEndIdx
          );
          lastPhase1Progress = p;
        }
      } else if (mode === "phase2" && p2 && phase2StartIdx >= 0) {
        if (!letterEls2) {
          letterEls2 = Array.from(
            p2.querySelectorAll<HTMLElement>("[data-type-char]")
          );
        }
        if (
          lastPhase2Progress < 0 ||
          Math.abs(p - lastPhase2Progress) >= TYPEWRITER_PROGRESS_EPS
        ) {
          applyTypewriter(
            p,
            letterEls2,
            reduceMotion,
            n,
            phase2StartFrameIndex
          );
          lastPhase2Progress = p;
        }
      }
    };

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: scrubSeconds,
        onUpdate: (self) => {
          pendingProgress = self.progress;
          scheduleScrubFrame();
        },
      });

      const initialMode = getOverlayMode(0, eraseEndIdx, phase2StartIdx);
      prevMode = initialMode;
      applyOverlayMode(initialMode);

      if (p1) {
        gsap.set(p1, { y: 0 });
        const els1 = Array.from(
          p1.querySelectorAll<HTMLElement>("[data-type-char]")
        );
        applyPhase1Typewriter(
          0,
          els1,
          reduceMotion,
          frames.length,
          eraseStartIdx,
          eraseEndIdx
        );
      }
      if (p2) {
        gsap.set(p2, { y: 0 });
        const els2 = Array.from(
          p2.querySelectorAll<HTMLElement>("[data-type-char]")
        );
        applyTypewriter(
          0,
          els2,
          reduceMotion,
          frames.length,
          phase2StartFrameIndex
        );
      }

      const hints = section.querySelectorAll<HTMLElement>("[data-scroll-hint]");
      if (hints.length > 0) gsap.set(hints, { clearProps: "autoAlpha" });
    }, section);

    const init = computeScrollBlend(0, frames.length, reduceMotion, frameStride);
    paintStateRef.i0 = init.i0;
    paintStateRef.i1 = init.i1;
    paintStateRef.blend = init.blend;
    paintStateRef.rm = reduceMotion;
    prefetchWindow(0, 1, 0);
    void cache
      .getOrLoad(init.i0, frameSrc(frames[init.i0]))
      .then(() => {
        if (!cancelled) scheduleTryPaint();
      })
      .catch(() => {});
    if (init.i1 !== init.i0) {
      void cache
        .getOrLoad(init.i1, frameSrc(frames[init.i1]))
        .then(() => {
          if (!cancelled) scheduleTryPaint();
        })
        .catch(() => {});
    }

    ScrollTrigger.refresh();
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    return () => {
      cancelled = true;
      if (warmPollId != null) {
        clearInterval(warmPollId);
        warmPollId = null;
      }
      cancelEagerDecodeRaf();
      if (scrubRafId != null) {
        cancelAnimationFrame(scrubRafId);
        scrubRafId = null;
      }
      if (paintCoalesceRaf != null) {
        cancelAnimationFrame(paintCoalesceRaf);
        paintCoalesceRaf = null;
      }
      if (catchUpRaf != null) cancelAnimationFrame(catchUpRaf);
      ro.disconnect();
      cache.destroy();
      ctx.revert();
    };
  }, [active, frames, framesKey, frames.length]);

  if (frames.length === 0) {
    return (
      <section className="relative flex min-h-dvh items-center justify-center bg-zinc-100 px-6">
        <p className="max-w-md text-center text-sm text-zinc-600">
          Add image files to{" "}
          <code className="rounded bg-zinc-200 px-1 py-0.5 text-zinc-800">
            public/terminal/
          </code>{" "}
          (PNG, WebP, JPG, SVG, AVIF, or GIF). They are listed automatically.
        </p>
      </section>
    );
  }

  const handleHeroMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!finePointer) return;
    posRef.current = {
      x: e.clientX + CURSOR_OFFSET,
      y: e.clientY + CURSOR_OFFSET,
    };
    queueFollowerPosition();
  };

  const handleHeroMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!finePointer) return;
    setCursorOnHero(true);
    posRef.current = {
      x: e.clientX + CURSOR_OFFSET,
      y: e.clientY + CURSOR_OFFSET,
    };
    applyFollowerTransform();
  };

  const lineClass =
    "w-full max-w-full text-balance text-center text-white font-semibold tracking-tight drop-shadow-[0_2px_28px_rgba(0,0,0,0.55)] sm:max-w-5xl lg:max-w-6xl";

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: `${heroSectionHeightVh(frames.length)}vh` }}
      aria-label="Scroll-driven sequence"
    >
      <span className="sr-only">
        iCAM Video at the future of logistics—then a second headline about video,
        GPS and safety. Text timing follows the scroll frame sequence. Scroll
        vertically to scrub.
      </span>
      <div
        className={`sticky top-0 flex h-dvh w-full flex-col bg-black ${
          finePointer ? "cursor-none" : ""
        }`}
        onMouseEnter={handleHeroMouseEnter}
        onMouseLeave={() => {
          setCursorOnHero(false);
          if (rafRef.current != null) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
          }
        }}
        onMouseMove={handleHeroMouseMove}
      >
        {finePointer ? (
          <div
            ref={followerRef}
            data-scroll-hint
            className={`pointer-events-none fixed left-0 top-0 z-30 flex items-center gap-2.5 will-change-transform transition-opacity duration-200 ${
              cursorOnHero ? "opacity-100" : "opacity-0"
            }`}
            style={{ transform: "translate3d(0px, 0px, 0)" }}
            aria-hidden
          >
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="absolute inset-0 rounded-full border border-white/90 bg-white/20 shadow-[0_0_12px_rgba(255,255,255,0.35)]" />
              <span className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-white/85">
              Scroll to explore
            </span>
          </div>
        ) : (
          <p
            data-scroll-hint
            className="pointer-events-none absolute left-6 top-24 z-10 text-[10px] font-medium uppercase tracking-[0.25em] text-white/70 sm:top-28"
          >
            Scroll to explore
          </p>
        )}
        <div className="relative isolate flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-neutral-950">
          <div
            ref={canvasWrapRef}
            className="absolute inset-0 z-[1] [transform:translateZ(0)]"
          >
            <canvas
              ref={canvasRef}
              role="img"
              aria-label="Scroll-driven product sequence"
              className="block h-full w-full [backface-visibility:hidden]"
            />
          </div>

          <div
            ref={phase1Ref}
            className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-5 pt-[min(18vh,9rem)] sm:px-10 sm:pt-[min(22vh,11rem)]"
          >
            <h2
              className={lineClass}
              aria-label={`${LINE1} ${LINE2}`}
            >
              <span className="block text-[clamp(1.75rem,8vw,6.25rem)] leading-[1.05]">
                {LINE1.split("").map((ch, i) => (
                  <span
                    key={`h1-${i}`}
                    data-type-char
                    className="inline-block min-w-[0.25ch] opacity-0"
                    aria-hidden
                  >
                    {ch === " " ? "\u00A0" : ch}
                  </span>
                ))}
              </span>
              <span className="mt-3 block text-[clamp(1.15rem,5vw,4.25rem)] leading-[1.08] sm:mt-5">
                {LINE2.split("").map((ch, i) => (
                  <span
                    key={`h2-${i}`}
                    data-type-char
                    className="inline-block min-w-[0.25ch] opacity-0"
                    aria-hidden
                  >
                    {ch === " " ? "\u00A0" : ch}
                  </span>
                ))}
              </span>
            </h2>
          </div>

          <div
            ref={phase2Ref}
            className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-5 pt-[min(18vh,9rem)] sm:px-10 sm:pt-[min(22vh,11rem)]"
          >
            <h2
              className={lineClass}
              aria-label={`${PHASE2_LINE1} ${PHASE2_LINE2}`}
            >
              <span className="block text-[clamp(1.45rem,6.5vw,5rem)] leading-[1.06]">
                {PHASE2_LINE1.split("").map((ch, i) => (
                  <span
                    key={`p2-h1-${i}`}
                    data-type-char
                    className="inline-block min-w-[0.25ch] opacity-0"
                    aria-hidden
                  >
                    {ch === " " ? "\u00A0" : ch}
                  </span>
                ))}
              </span>
              <span className="mt-3 block text-[clamp(1.05rem,4.2vw,3.25rem)] leading-[1.1] sm:mt-5">
                {PHASE2_LINE2.split("").map((ch, i) => (
                  <span
                    key={`p2-h2-${i}`}
                    data-type-char
                    className="inline-block min-w-[0.25ch] opacity-0"
                    aria-hidden
                  >
                    {ch === " " ? "\u00A0" : ch}
                  </span>
                ))}
              </span>
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
}
