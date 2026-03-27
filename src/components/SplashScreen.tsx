"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useId, useRef, useState } from "react";

type Props = {
  onComplete: () => void;
};

const BRAND = "#090088";

const WORDS = ["iCAM", "Video", "Telematics"] as const;

function FilmGrain({ filterId }: { filterId: string }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[1] overflow-hidden opacity-[0.06]"
      aria-hidden
    >
      <svg className="h-full w-full">
        <filter id={filterId}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves={4}
            stitchTiles="stitch"
            result="noise"
          />
          <feColorMatrix type="saturate" values="0" in="noise" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${filterId})`} />
      </svg>
    </div>
  );
}

function CornerFrames({ drawOut }: { drawOut: boolean }) {
  const stroke = "rgba(15, 23, 42, 0.2)";
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
    y: 40,
    rotateX: -14,
    filter: "blur(12px)",
  },
  show: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.75,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
  exit: {
    opacity: 0,
    y: -26,
    rotateX: 10,
    filter: "blur(10px)",
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

export function SplashScreen({ onComplete }: Props) {
  const reduceMotion = useReducedMotion();
  const noiseId = useId().replace(/:/g, "");
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
    const t = window.setTimeout(() => setPhase("exit"), HOLD_MS);
    return () => window.clearTimeout(t);
  }, [phase]);

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
        <p className="text-balance text-center text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
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
          ? { opacity: 0, scale: 1.025, filter: "blur(16px)" }
          : { opacity: 1, scale: 1, filter: "blur(0px)" }
      }
      transition={{
        duration: EXIT_ROOT_DURATION_MS,
        delay: phase === "exit" ? EXIT_ROOT_DELAY_MS / 1000 : 0,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_90%_72%_at_50%_42%,oklch(0.98_0.008_85)_0%,oklch(0.94_0.012_78)_48%,oklch(0.89_0.025_270)_100%)] opacity-[0.92]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_130%_90%_at_50%_115%,transparent_50%,oklch(0.2_0.05_270_/_0.08)_100%)]"
        aria-hidden
      />

      <FilmGrain filterId={`splash-grain-${noiseId}`} />

      <motion.div
        className="pointer-events-none absolute left-1/2 top-[min(36%,13rem)] z-[3] h-[2px] w-[min(11rem,40vw)] -translate-x-1/2 rounded-full bg-[#090088] shadow-[0_0_24px_oklch(0.35_0.2_278_/_0.35)]"
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
        className="relative z-[4] px-6 [perspective:880px]"
        style={{ transformStyle: "preserve-3d" }}
      >
        <motion.div
          className="flex flex-wrap items-baseline justify-center gap-x-[0.38em] gap-y-1"
          variants={wordContainer}
          initial="hidden"
          animate={phase === "exit" ? "exit" : "show"}
        >
          {WORDS.map((word, i) => (
            <motion.span
              key={word}
              className={`inline-block text-[clamp(1.9rem,7.8vw,4.35rem)] font-semibold leading-[1.04] tracking-[-0.025em] text-zinc-950 ${
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
          className="mt-6 text-center text-[10px] font-semibold uppercase tracking-[0.38em] text-zinc-500"
          initial={{ opacity: 0, y: 10 }}
          animate={
            phase === "exit"
              ? { opacity: 0, y: -8 }
              : { opacity: 1, y: 0 }
          }
          transition={{
            duration: phase === "exit" ? 0.28 : 0.55,
            delay: phase === "exit" ? 0 : 1.02,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          Fleet video telematics
        </motion.p>
      </div>
    </motion.div>
  );
}
