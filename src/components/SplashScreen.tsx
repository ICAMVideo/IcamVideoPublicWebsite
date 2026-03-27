"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  onComplete: () => void;
  /** When false the splash holds after the enter animation until the hero frame is ready. */
  waitForReady?: boolean;
};

const BRAND = "#090088";

const WORDS = ["iCAM", "Video", "Telematics"] as const;

function CornerFrames({ drawOut }: { drawOut: boolean }) {
  const stroke = "rgba(15, 23, 42, 0.14)";
  const r = 40;
  const w = 240;
  const h = 168;
  const corners = [
    { x: 24, y: 24, transform: undefined as string | undefined },
    { x: "100%", y: 24, transform: `translate(${-(w + 24)}, 0)` },
    { x: 24, y: "100%", transform: `translate(0, ${-(h + 24)})` },
    {
      x: "100%",
      y: "100%",
      transform: `translate(${-(w + 24)}, ${-(h + 24)})`,
    },
  ] as const;

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-[2] h-full w-full"
      aria-hidden
    >
      {corners.map((c, i) => (
        <motion.rect
          key={i}
          x={c.x}
          y={c.y}
          width={w}
          height={h}
          rx={r}
          fill="none"
          stroke={stroke}
          strokeWidth={1}
          transform={c.transform}
          initial={{ pathLength: 0, opacity: 1 }}
          animate={{
            pathLength: drawOut ? 0 : 1,
            opacity: drawOut ? 0 : 1,
          }}
          transition={{
            pathLength: {
              duration: drawOut ? 0.5 : 1.1,
              ease: drawOut ? [0.4, 0, 1, 1] : [0.22, 1, 0.36, 1],
              delay: drawOut ? 0.08 + (3 - i) * 0.05 : i * 0.07,
            },
            opacity: {
              duration: 0.3,
              delay: drawOut ? 0.35 + (3 - i) * 0.04 : 0,
            },
          }}
        />
      ))}
    </svg>
  );
}

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
    y: -22,
    rotateX: 6,
    filter: "blur(6px)",
    transition: {
      duration: 0.36,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
};

const HOLD_MS = 560;
const EXIT_ROOT_DELAY_MS = 360;
const EXIT_ROOT_DURATION_MS = 0.52;
const UNMOUNT_AFTER_EXIT_MS = Math.round(EXIT_ROOT_DELAY_MS + EXIT_ROOT_DURATION_MS * 1000) + 80;

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

  if (reduceMotion) {
    return (
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-[color:var(--background)]"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.45, ease: "easeOut", delay: 0.15 }}
        onAnimationComplete={finish}
      >
        <p className="text-balance px-4 text-center text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl md:text-6xl">
          iCAM Video Telematics
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[color:var(--background)]"
      initial={{ opacity: 1 }}
      animate={
        phase === "exit"
          ? { opacity: 0, scale: 1.02, filter: "blur(12px)" }
          : { opacity: 1, scale: 1, filter: "blur(0px)" }
      }
      transition={{
        duration: EXIT_ROOT_DURATION_MS,
        delay: phase === "exit" ? EXIT_ROOT_DELAY_MS / 1000 : 0,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_95%_80%_at_50%_45%,oklch(0.99_0.006_85)_0%,oklch(0.96_0.01_78)_55%,oklch(0.93_0.02_270)_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_120%_85%_at_50%_100%,transparent_45%,oklch(0.25_0.04_270_/_0.06)_100%)]"
        aria-hidden
      />

      <motion.div
        className="pointer-events-none absolute left-1/2 top-[min(32%,11rem)] z-[3] h-[3px] w-[min(16rem,72vw)] -translate-x-1/2 rounded-full bg-[#090088] shadow-[0_0_28px_oklch(0.35_0.18_278_/_0.28)]"
        style={{ backgroundColor: BRAND }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={
          phase === "exit"
            ? { scaleX: 0, opacity: 0 }
            : { scaleX: 1, opacity: 1 }
        }
        transition={{
          scaleX: {
            duration: phase === "exit" ? 0.42 : 0.88,
            ease: phase === "exit" ? [0.4, 0, 1, 1] : [0.22, 1, 0.36, 1],
            delay: phase === "exit" ? 0 : 0.22,
          },
          opacity: { duration: 0.22 },
        }}
      />

      <CornerFrames drawOut={phase === "exit"} />

      <div
        className="relative z-[4] max-w-[min(100%,42rem)] px-5 sm:max-w-none sm:px-8 [perspective:1200px]"
        style={{ transformStyle: "preserve-3d" }}
      >
        <motion.div
          className="flex flex-wrap items-baseline justify-center gap-x-[0.32em] gap-y-2 text-center"
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
          className="mt-8 text-center text-sm font-medium uppercase tracking-[0.22em] text-zinc-600 sm:mt-10 sm:text-base sm:tracking-[0.28em]"
          initial={{ opacity: 0, y: 8 }}
          animate={
            phase === "exit"
              ? { opacity: 0, y: -6 }
              : { opacity: 1, y: 0 }
          }
          transition={{
            duration: phase === "exit" ? 0.28 : 0.55,
            delay: phase === "exit" ? 0 : 0.95,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          Your Future Starts With Us
        </motion.p>
      </div>
    </motion.div>
  );
}
