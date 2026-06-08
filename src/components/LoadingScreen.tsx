"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { ShaderField } from "./ShaderField";
import { TAGLINE } from "@/lib/brand";

type Props = {
  onComplete: () => void;
  /** Holds the loader at ~90% until the hero frame is decoded. */
  waitForReady?: boolean;
};

const BOOT_LINES = [
  "ESTABLISHING SECURE UPLINK",
  "GPS LOCK ACQUIRED · 25.86°S 28.19°E",
  "CAMERA CHANNELS 01–16 · ONLINE",
  "ADAS · DRIVER-FATIGUE AI · ARMED",
  "SYNCING TELEMETRY STREAM",
] as const;

const MIN_VISIBLE_MS = 1600;
const EXIT_MS = 950;

function useBootProgress(ready: boolean, motionOk: boolean) {
  const [pct, setPct] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    let raf = 0;
    const tick = (ts: number) => {
      if (startRef.current == null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      // Reduced motion: jump straight to ready. Otherwise climb toward 92%
      // over ~MIN_VISIBLE_MS, then release to 100 once the hero is ready.
      const ceil = !motionOk
        ? 100
        : ready && elapsed > MIN_VISIBLE_MS
          ? 100
          : 92;
      setPct((p) => {
        const next = motionOk ? p + (ceil - p) * 0.045 + 0.25 : ceil;
        return next >= ceil ? ceil : next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ready, motionOk]);

  return Math.min(100, Math.round(pct));
}

export function LoadingScreen({ onComplete, waitForReady = true }: Props) {
  const reduceMotion = useReducedMotion();
  const motionOk = !reduceMotion;
  const [lineIdx, setLineIdx] = useState(0);
  const [exiting, setExiting] = useState(false);
  const doneRef = useRef(false);

  const pct = useBootProgress(waitForReady, motionOk);

  // Lock page scroll while visible.
  useEffect(() => {
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, []);

  // Reveal boot log lines in sequence (instantly under reduced motion).
  useEffect(() => {
    const step = motionOk ? 360 : 0;
    const id = window.setInterval(() => {
      setLineIdx((i) => (i < BOOT_LINES.length ? i + 1 : i));
    }, step || 16);
    return () => clearInterval(id);
  }, [motionOk]);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    onComplete();
  }, [onComplete]);

  // When fully loaded, run the exit wipe then hand off.
  useEffect(() => {
    if (pct < 100 || !waitForReady) return;
    if (!motionOk) {
      finish();
      return;
    }
    const t1 = window.setTimeout(() => setExiting(true), 420);
    const t2 = window.setTimeout(finish, 420 + EXIT_MS);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [pct, waitForReady, motionOk, finish]);

  const ready = pct >= 100;

  return (
    <motion.div
      className="fixed inset-0 z-[100] overflow-hidden bg-[#050814] text-white"
      initial={{ opacity: 1 }}
      animate={exiting ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: EXIT_MS / 1000, ease: [0.7, 0, 0.84, 0] }}
    >
      {/* GPU radar field */}
      <div className="absolute inset-0">
        <ShaderField
          intensity={1.1}
          speed={1.15}
          accentHex="#4f6bff"
          dataHex="#58a6ff"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 hud-grid opacity-[0.35]" />

      {/* Exit scan-wipe */}
      <AnimatePresence>
        {exiting && motionOk ? (
          <motion.div
            className="absolute inset-x-0 z-30 h-[40vh]"
            style={{
              background:
                "linear-gradient(180deg, transparent, rgba(45,212,255,0.18) 70%, rgba(141,138,255,0.5))",
            }}
            initial={{ top: "-40vh" }}
            animate={{ top: "100vh" }}
            transition={{ duration: EXIT_MS / 1000, ease: [0.65, 0, 0.35, 1] }}
          />
        ) : null}
      </AnimatePresence>

      <div className="relative z-20 flex h-full flex-col items-center justify-center px-6">
        {/* status chip */}
        <motion.div
          className="font-hud flex items-center gap-2 text-[10px] uppercase tracking-[0.32em] text-[#8ec2ff] sm:text-[11px]"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="hud-blink inline-block h-1.5 w-1.5 rounded-full bg-[#34d399] shadow-[0_0_10px_#34d399]" />
          iCAM TELEMATICS · LINK
        </motion.div>

        {/* brand */}
        <motion.h1
          className="mt-7 text-center text-6xl font-bold leading-[0.95] tracking-[-0.04em] sm:text-7xl md:text-8xl"
          initial={{ opacity: 0, filter: "blur(14px)", y: 16 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        >
          <span className="text-white">iCAM</span>
        </motion.h1>
        <motion.p
          className="mt-3 text-center text-sm font-medium uppercase tracking-[0.42em] text-zinc-300 sm:text-base"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.45 }}
        >
          Video Telematics
        </motion.p>
        <motion.p
          className="mt-4 text-center text-base font-light italic text-[#9db0ff] sm:text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          “{TAGLINE}”
        </motion.p>

        {/* boot log */}
        <div className="mt-10 h-[7.5rem] w-full max-w-[24rem] font-hud text-[11px] leading-relaxed text-white/70 sm:text-xs">
          {BOOT_LINES.slice(0, lineIdx).map((line) => (
            <motion.div
              key={line}
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-[#34d399]">›</span>
              <span className="flex-1">{line}</span>
              <span className="text-[#34d399]">OK</span>
            </motion.div>
          ))}
        </div>

        {/* progress */}
        <div className="mt-4 w-full max-w-[24rem]">
          <div className="flex items-center justify-between font-hud text-[10px] uppercase tracking-[0.2em] text-white/45">
            <span>{ready ? "SYSTEM READY" : "INITIALISING"}</span>
            <span className="tabular-nums text-[#8ec2ff]">
              {String(pct).padStart(3, "0")}%
            </span>
          </div>
          <div className="mt-2 h-px w-full overflow-hidden bg-white/10">
            <motion.div
              className="h-full bg-[#58a6ff]"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
