"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  onComplete: () => void;
  /** When false the splash holds after the enter animation until the hero frame is ready. */
  waitForReady?: boolean;
};

const BRAND = "#090088";

const WORDS = ["iCAM", "Video", "Telematics"] as const;

/** Rotates while frames warm — reads as brand story, not a loading bar. */
const STORY_LINES = [
  "Your future starts with visibility — not guesswork.",
  "Video, GPS, and safety in one platform for fleets that operate 24/7.",
  "Evidence and context when every second on the road counts.",
  "From the yard to the highway — clarity for operators and drivers alike.",
] as const;

const HOLD_MS = 560;
const DOOR_S = 0.88;
const EXIT_CONTENT_S = 0.32;
const UNMOUNT_AFTER_EXIT_MS = Math.round(
  Math.max(DOOR_S, EXIT_CONTENT_S) * 1000
) + 180;

const wordContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.095, delayChildren: 0.38 },
  },
  exit: {
    transition: { staggerChildren: 0.05, staggerDirection: -1 as const },
  },
};

const wordItem = {
  hidden: {
    opacity: 0,
    y: 36,
    rotateX: -8,
    filter: "blur(6px)",
  },
  show: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.72,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
  exit: {
    opacity: 0,
    y: -18,
    rotateX: 6,
    filter: "blur(6px)",
    transition: {
      duration: 0.32,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
};

function StoryRotation({
  active,
  motionOk,
  className = "",
}: {
  active: boolean;
  motionOk: boolean;
  className?: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % STORY_LINES.length);
    }, 3_600);
    return () => clearInterval(id);
  }, [active]);

  if (!active) return null;

  const line = STORY_LINES[index];
  const textClass =
    "text-balance text-lg font-medium leading-snug text-zinc-700 sm:text-xl md:text-2xl lg:text-[1.65rem] lg:leading-snug";

  if (!motionOk) {
    return (
      <div
        className={`mx-auto w-full max-w-[min(36rem,92vw)] text-center ${className}`}
        aria-live="polite"
      >
        <p className={textClass}>{line}</p>
      </div>
    );
  }

  return (
    <div
      className={`mx-auto w-full max-w-[min(36rem,92vw)] text-center ${className}`}
      aria-live="polite"
    >
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          className={textClass}
        >
          {line}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

export function SplashScreen({ onComplete, waitForReady = true }: Props) {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<"show" | "hold" | "exit">("show");
  const enterScheduledRef = useRef(false);
  const completeRef = useRef(false);

  const finish = useCallback(() => {
    if (completeRef.current) return;
    completeRef.current = true;
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    if (phase !== "exit") return;
    const t = window.setTimeout(finish, UNMOUNT_AFTER_EXIT_MS);
    return () => window.clearTimeout(t);
  }, [phase, finish]);

  const scheduleHold = useCallback(() => {
    if (enterScheduledRef.current) return;
    enterScheduledRef.current = true;
    window.setTimeout(() => setPhase("hold"), 60);
  }, []);

  useEffect(() => {
    if (phase !== "hold") return;
    if (!waitForReady) return;
    const t = window.setTimeout(() => setPhase("exit"), HOLD_MS);
    return () => window.clearTimeout(t);
  }, [phase, waitForReady]);

  useEffect(() => {
    if (reduceMotion) return;
    const maxEnterMs =
      380 + (WORDS.length - 1) * 95 + 750 + 150;
    const t = window.setTimeout(() => scheduleHold(), maxEnterMs);
    return () => window.clearTimeout(t);
  }, [reduceMotion, scheduleHold]);

  useEffect(() => {
    if (!reduceMotion) return;
    const t = window.setTimeout(() => scheduleHold(), 320);
    return () => window.clearTimeout(t);
  }, [reduceMotion, scheduleHold]);

  const loadingActive = !waitForReady && phase !== "exit";

  if (reduceMotion) {
    return (
      <div className="fixed inset-0 z-[100] pointer-events-auto">
        <motion.div
          className="absolute inset-0 bg-[color:var(--background)]/93 backdrop-blur-[2px]"
          initial={{ opacity: 1 }}
          animate={{
            opacity: phase === "exit" ? 0 : 1,
          }}
          transition={{
            duration: 0.5,
            ease: "easeOut",
          }}
        />
        <div className="relative flex h-full flex-col items-center justify-center px-5">
          <p className="text-balance text-center text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
            iCAM Video Telematics
          </p>
          <p className="mt-6 text-center text-xs font-medium uppercase tracking-[0.22em] text-zinc-600 sm:text-sm">
            Your Future Starts With Us
          </p>
          <div className="mt-8 w-full">
            <StoryRotation active={loadingActive} motionOk={false} />
          </div>
        </div>
      </div>
    );
  }

  const doorEase = [0.22, 1, 0.36, 1] as const;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden pointer-events-auto">
      {/* Hero / page shows in the gap as doors slide apart */}
      <motion.div
        className="absolute inset-y-0 left-0 z-20 w-1/2 border-r border-zinc-900/[0.06] bg-[color:var(--background)] shadow-[4px_0_32px_rgba(15,23,42,0.07)]"
        initial={{ x: 0 }}
        animate={{ x: phase === "exit" ? "-100%" : 0 }}
        transition={{ duration: DOOR_S, ease: doorEase }}
      />
      <motion.div
        className="absolute inset-y-0 right-0 z-20 w-1/2 border-l border-zinc-900/[0.06] bg-[color:var(--background)] shadow-[-4px_0_32px_rgba(15,23,42,0.07)]"
        initial={{ x: 0 }}
        animate={{ x: phase === "exit" ? "100%" : 0 }}
        transition={{ duration: DOOR_S, ease: doorEase }}
      />

      <div
        className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center px-5 pb-[min(18vh,8rem)] pt-[min(10vh,4rem)] sm:px-8"
        style={{ perspective: 1200 }}
      >
        <motion.div
          className="pointer-events-none absolute left-1/2 top-[min(30%,10rem)] z-10 h-[3px] w-[min(16rem,72vw)] -translate-x-1/2 rounded-full shadow-[0_0_28px_oklch(0.35_0.18_278_/_0.28)]"
          style={{ backgroundColor: BRAND }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={
            phase === "exit"
              ? { scaleX: 0, opacity: 0 }
              : { scaleX: 1, opacity: 1 }
          }
          transition={{
            scaleX: {
              duration: phase === "exit" ? 0.35 : 0.88,
              ease: phase === "exit" ? [0.4, 0, 1, 1] : [0.22, 1, 0.36, 1],
              delay: phase === "exit" ? 0 : 0.22,
            },
            opacity: { duration: 0.2 },
          }}
        />

        <motion.div
          className="relative z-20 max-w-[min(100%,42rem)] text-center [transform-style:preserve-3d]"
          initial={{ opacity: 1, scale: 1 }}
          animate={
            phase === "exit"
              ? { opacity: 0, scale: 0.96, y: -8 }
              : { opacity: 1, scale: 1, y: 0 }
          }
          transition={{
            duration: EXIT_CONTENT_S,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          <motion.div
            className="flex flex-wrap items-baseline justify-center gap-x-[0.32em] gap-y-2"
            variants={wordContainer}
            initial="hidden"
            animate={phase === "exit" ? "exit" : "show"}
          >
            {WORDS.map((word, i) => (
              <motion.span
                key={word}
                className={`inline-block text-center text-6xl font-semibold leading-[1.05] tracking-[-0.03em] text-zinc-950 sm:text-7xl md:text-8xl ${
                  word === "iCAM" ? "font-bold" : ""
                }`}
                variants={wordItem}
                style={{ transformStyle: "preserve-3d" }}
                onAnimationComplete={(def) => {
                  if (def !== "show" || i !== WORDS.length - 1) return;
                  scheduleHold();
                }}
              >
                {word}
              </motion.span>
            ))}
          </motion.div>

          <motion.p
            className="mt-6 text-sm font-medium uppercase tracking-[0.22em] text-zinc-600 sm:mt-8 sm:text-base sm:tracking-[0.28em]"
            initial={{ opacity: 0, y: 8 }}
            animate={
              phase === "exit"
                ? { opacity: 0, y: -6 }
                : { opacity: 1, y: 0 }
            }
            transition={{
              duration: phase === "exit" ? 0.24 : 0.55,
              delay: phase === "exit" ? 0 : 0.95,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            Your Future Starts With Us
          </motion.p>

          <div className="mt-7 sm:mt-9">
            <StoryRotation active={loadingActive} motionOk />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
