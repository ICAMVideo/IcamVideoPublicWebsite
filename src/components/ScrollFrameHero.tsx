"use client";

import { BRAND_BLUE } from "@/lib/brand";
import { preferNativeScroll } from "@/lib/preferNativeScroll";
import { frameSrc } from "@/lib/terminalFrameUrl";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

const CURSOR_OFFSET = 14;

gsap.registerPlugin(ScrollTrigger);

/**
 * Sticky hero is 100vh; scroll distance through the section ≈ (return − 100)vh.
 * Scales with `frames.length` from `readTerminalManifest()` (e.g. ~335 WebPs).
 * Raise the multiplier if the scrub still feels fast.
 */
function heroSectionHeightVh(frameCount: number): number {
  if (frameCount <= 0) return 100;
  return Math.max(480, Math.round(120 + frameCount * 2.35));
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
      gsap.set(el, { autoAlpha: 1, color: "#ffffff" });
    }
    return;
  }

  const n = Math.max(1, videoFrameCount);
  const startP =
    n > startFrameIndex ? startFrameIndex / n : 0;
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
      gsap.set(el, { autoAlpha: 0, color: "#ffffff" });
    }
    return;
  }

  const exact = twP * total;
  const revealed = Math.min(total, Math.floor(exact));
  const letterFrac = exact - revealed;

  for (let i = 0; i < total; i++) {
    const el = letters[i];
    if (i < revealed) {
      gsap.set(el, { autoAlpha: 1, color: "#ffffff" });
    } else if (i === revealed && revealed < total) {
      const alpha = gsap.utils.clamp(
        0.06,
        1,
        letterFrac < 0.001 ? 1 : letterFrac * 1.35
      );
      gsap.set(el, { autoAlpha: alpha, color: ACCENT });
    } else {
      gsap.set(el, { autoAlpha: 0, color: "#ffffff" });
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
      ? TYPEWRITER_START_FRAME_INDEX / n
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

  const pEraseStart = eraseStartIdx / n;
  const pEraseEnd = eraseEndIdx / n;

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
      gsap.set(el, { autoAlpha: 0, color: "#ffffff" });
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
      gsap.set(el, { autoAlpha: 0, color: "#ffffff" });
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
      gsap.set(el, { autoAlpha: alpha, color: ACCENT });
    } else if (i === eLo && eFr > 0.001) {
      const alpha = gsap.utils.clamp(
        0.06,
        1,
        (1 - eFr) * 1.35
      );
      gsap.set(el, { autoAlpha: alpha, color: ACCENT });
    } else if (i > eLo && i < hLo) {
      gsap.set(el, { autoAlpha: 1, color: "#ffffff" });
    } else if (i === hLo && hFr > 0.001 && hi < total) {
      const alpha = gsap.utils.clamp(
        0.06,
        1,
        hFr < 0.001 ? 1 : hFr * 1.35
      );
      gsap.set(el, { autoAlpha: alpha, color: ACCENT });
    } else if (i === eLo && eFr <= 0.001 && eLo < hLo) {
      gsap.set(el, { autoAlpha: 1, color: "#ffffff" });
    } else if (
      i === eLo &&
      eFr <= 0.001 &&
      eLo === hLo &&
      hFr > 0.001 &&
      hi < total
    ) {
      const alpha = gsap.utils.clamp(0.06, 1, hFr * 1.35);
      gsap.set(el, { autoAlpha: alpha, color: ACCENT });
    } else {
      gsap.set(el, { autoAlpha: 0, color: "#ffffff" });
    }
  }
}

function preloadFrame(frames: string[], i: number) {
  if (i < 0 || i >= frames.length) return;
  const img = new Image();
  img.src = frameSrc(frames[i]);
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

export function ScrollFrameHero({ frames, active }: Props) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const phase1Ref = useRef<HTMLDivElement | null>(null);
  const phase2Ref = useRef<HTMLDivElement | null>(null);
  const followerRef = useRef<HTMLDivElement | null>(null);
  const imgARef = useRef<HTMLImageElement | null>(null);
  const imgBRef = useRef<HTMLImageElement | null>(null);
  const topIsARef = useRef(true);
  const displayedIndexRef = useRef<number | null>(null);
  const loadGenerationRef = useRef(0);
  const targetFrameRef = useRef(0);
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

    const a = imgARef.current;
    const b = imgBRef.current;
    if (!a || !b) return;

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
    let lastNextForPreload = -1;
    let prevMode: HeroOverlayMode | undefined;

    const syncFrame = (want: number) => {
      if (want < 0 || want >= frames.length) return;
      const url = frameSrc(frames[want]);

      if (displayedIndexRef.current === null) {
        a.src = url;
        b.src = url;
        a.style.zIndex = "2";
        b.style.zIndex = "1";
        topIsARef.current = true;
        displayedIndexRef.current = want;
        return;
      }

      if (want === displayedIndexRef.current) return;

      const topEl = topIsARef.current ? a : b;
      const bottomEl = topIsARef.current ? b : a;
      const gen = ++loadGenerationRef.current;

      const bringBottomForward = () => {
        if (gen !== loadGenerationRef.current) return;
        if (targetFrameRef.current !== want) return;
        if (displayedIndexRef.current === want) return;
        bottomEl.style.zIndex = "2";
        topEl.style.zIndex = "1";
        topIsARef.current = bottomEl === a;
        displayedIndexRef.current = want;
      };

      bottomEl.onload = () => {
        requestAnimationFrame(bringBottomForward);
      };
      bottomEl.src = url;

      if (bottomEl.complete && bottomEl.naturalWidth > 0) {
        requestAnimationFrame(bringBottomForward);
      }
    };

    const scrubSeconds = preferNativeScroll() ? 0.45 : 0.72;

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

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: scrubSeconds,
        onUpdate: (self) => {
          const p = self.progress;
          const n = frames.length;
          const next = Math.min(n - 1, Math.max(0, Math.floor(p * n)));
          targetFrameRef.current = next;
          syncFrame(next);
          if (next !== lastNextForPreload) {
            lastNextForPreload = next;
            preloadFrame(frames, next - 2);
            preloadFrame(frames, next - 1);
            preloadFrame(frames, next + 1);
            preloadFrame(frames, next + 2);
          }

          const mode = getOverlayMode(next, eraseEndIdx, phase2StartIdx);

          if (prevMode !== mode) {
            prevMode = mode;
            applyOverlayMode(mode);
          }

          if (mode === "phase1" && p1) {
            if (!letterEls1) {
              letterEls1 = Array.from(
                p1.querySelectorAll<HTMLElement>("[data-type-char]")
              );
            }
            applyPhase1Typewriter(
              p,
              letterEls1,
              reduceMotion,
              n,
              eraseStartIdx,
              eraseEndIdx
            );
          } else if (mode === "phase2" && p2 && phase2StartIdx >= 0) {
            if (!letterEls2) {
              letterEls2 = Array.from(
                p2.querySelectorAll<HTMLElement>("[data-type-char]")
              );
            }
            applyTypewriter(
              p,
              letterEls2,
              reduceMotion,
              n,
              phase2StartFrameIndex
            );
          }
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

    displayedIndexRef.current = null;
    loadGenerationRef.current += 1;
    targetFrameRef.current = 0;
    syncFrame(0);
    lastNextForPreload = 0;
    preloadFrame(frames, 0);
    preloadFrame(frames, 1);
    preloadFrame(frames, 2);

    ScrollTrigger.refresh();
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    return () => {
      ctx.revert();
      displayedIndexRef.current = null;
      loadGenerationRef.current += 1;
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
    "max-w-[28rem] text-balance text-center text-white font-semibold tracking-tight drop-shadow-[0_2px_28px_rgba(0,0,0,0.55)] sm:max-w-5xl lg:max-w-6xl";

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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgARef}
            src={frameSrc(frames[0])}
            alt=""
            decoding="async"
            fetchPriority="high"
            draggable={false}
            className="absolute inset-0 z-[1] h-full w-full object-cover [backface-visibility:hidden] [transform:translateZ(0)]"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgBRef}
            src={frameSrc(frames[0])}
            alt=""
            decoding="async"
            draggable={false}
            className="absolute inset-0 z-[2] h-full w-full object-cover [backface-visibility:hidden] [transform:translateZ(0)]"
          />

          <div
            ref={phase1Ref}
            className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-5 pt-[min(18vh,9rem)] sm:px-10 sm:pt-[min(22vh,11rem)]"
          >
            <h2
              className={lineClass}
              aria-label={`${LINE1} ${LINE2}`}
            >
              <span className="block text-[clamp(2.65rem,10.5vw,6.25rem)] leading-[1.05]">
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
              <span className="mt-5 block text-[clamp(2rem,6.75vw,4.25rem)] leading-[1.08]">
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
              <span className="block text-[clamp(2.2rem,8.5vw,5rem)] leading-[1.06]">
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
              <span className="mt-5 block text-[clamp(1.75rem,5.5vw,3.25rem)] leading-[1.1]">
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
