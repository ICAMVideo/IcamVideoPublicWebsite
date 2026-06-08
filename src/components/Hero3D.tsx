"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useEffect, useRef } from "react";
import { ShaderField } from "./ShaderField";
import { TAGLINE } from "@/lib/brand";

type Props = { onReady?: () => void };

/**
 * Immersive parallax hero — layered CSS 3D transforms (perspective + preserve-3d)
 * that tilt to the pointer and drift on scroll. No WebGL 3D / Three.js; the only
 * GPU layer is the radar ShaderField backdrop. Degrades to a static composition
 * under prefers-reduced-motion / touch.
 */

/** A depth layer that parallaxes against the shared pointer springs. */
function Layer({
  sx,
  sy,
  depth,
  z = 0,
  className,
  children,
}: {
  sx: MotionValue<number>;
  sy: MotionValue<number>;
  depth: number;
  z?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const x = useTransform(sx, [-0.5, 0.5], [depth, -depth]);
  const y = useTransform(sy, [-0.5, 0.5], [depth, -depth]);
  return (
    <motion.div
      className={className}
      style={{ x, y, translateZ: z, transformStyle: "preserve-3d" }}
    >
      {children}
    </motion.div>
  );
}

function TelemetryChip({
  label,
  value,
  tone = "data",
}: {
  label: string;
  value: string;
  tone?: "data" | "signal" | "accent";
}) {
  const dot =
    tone === "signal"
      ? "bg-[#34d399] shadow-[0_0_10px_#34d399]"
      : tone === "accent"
        ? "bg-[#4f6bff] shadow-[0_0_10px_#4f6bff]"
        : "bg-[#58a6ff] shadow-[0_0_10px_#58a6ff]";
  return (
    <div className="hud-corners rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <span className={`hud-blink inline-block h-1.5 w-1.5 rounded-full ${dot}`} />
        <span className="font-hud text-[10px] uppercase tracking-[0.2em] text-white/50">
          {label}
        </span>
      </div>
      <div className="font-hud mt-1 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

export function Hero3D({ onReady }: Props) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 90, damping: 18, mass: 0.4 });
  const sy = useSpring(my, { stiffness: 90, damping: 18, mass: 0.4 });

  const rotateY = useTransform(sx, [-0.5, 0.5], [10, -10]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [-8, 8]);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      mx.set((e.clientX - r.left) / r.width - 0.5);
      my.set((e.clientY - r.top) / r.height - 0.5);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, mx, my]);

  return (
    <section
      ref={ref}
      aria-label="iCAM Video Telematics"
      className="relative h-dvh min-h-[640px] w-full overflow-hidden bg-[#050814]"
      style={{ perspective: 1200 }}
    >
      {/* GPU radar backdrop — stays vivid blue regardless of theme */}
      <div className="absolute inset-0">
        <ShaderField
          intensity={1.05}
          speed={1.05}
          accentHex="#4f6bff"
          dataHex="#58a6ff"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 hud-grid opacity-[0.16]" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 60% at 50% 48%, transparent 40%, rgba(4,5,12,0.55) 100%), linear-gradient(180deg, rgba(4,5,12,0.55) 0%, transparent 24%, transparent 62%, rgba(4,5,12,0.95) 100%)",
        }}
      />

      {/* corner readouts */}
      <div className="pointer-events-none absolute left-4 top-20 z-20 font-hud text-[10px] uppercase tracking-[0.2em] text-white/55 sm:left-8 sm:top-24 sm:text-[11px]">
        <div className="flex items-center gap-2">
          <span className="hud-blink inline-block h-1.5 w-1.5 rounded-full bg-[#34d399]" />
          REC · CH 01–16
        </div>
        <div className="mt-1 text-white/35">1080P · 4G UPLINK</div>
      </div>
      <div className="pointer-events-none absolute right-4 top-20 z-20 text-right font-hud text-[10px] uppercase tracking-[0.2em] text-white/55 sm:right-8 sm:top-24 sm:text-[11px]">
        <div>GPS · LOCKED</div>
        <div className="mt-1 text-white/35">ADAS · ARMED</div>
      </div>

      {/* 3D parallax stage */}
      <motion.div
        className="absolute inset-0 z-10 flex items-center justify-center"
        style={{
          rotateX: reduce ? 0 : rotateX,
          rotateY: reduce ? 0 : rotateY,
          transformStyle: "preserve-3d",
          y: contentY,
          opacity: contentOpacity,
        }}
      >
        {/* centre radar lens */}
        <Layer
          sx={sx}
          sy={sy}
          depth={reduce ? 0 : 22}
          z={-60}
          className="absolute"
        >
          <div className="relative h-[clamp(18rem,46vw,34rem)] w-[clamp(18rem,46vw,34rem)]">
            {[0.42, 0.66, 0.9].map((s, i) => (
              <motion.div
                key={s}
                className="absolute inset-0 rounded-full border border-white/18"
                style={{ scale: s }}
                animate={reduce ? {} : { rotate: i % 2 === 0 ? 360 : -360 }}
                transition={{
                  duration: 60 + i * 30,
                  ease: "linear",
                  repeat: Infinity,
                }}
              />
            ))}
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(79,107,255,0.16),transparent_62%)]" />
            {/* sweep arm */}
            <motion.div
              className="absolute left-1/2 top-1/2 h-1/2 w-px origin-bottom"
              style={{
                background:
                  "linear-gradient(to top, rgba(45,212,255,0.9), transparent)",
              }}
              animate={reduce ? {} : { rotate: 360 }}
              transition={{ duration: 6, ease: "linear", repeat: Infinity }}
            />
            <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#58a6ff] shadow-[0_0_18px_#58a6ff]" />
          </div>
        </Layer>

        {/* floating telemetry chips */}
        <Layer
          sx={sx}
          sy={sy}
          depth={reduce ? 0 : 60}
          z={60}
          className="pointer-events-none absolute left-[6%] top-[26%] hidden lg:block"
        >
          <TelemetryChip label="Speed" value="62 km/h" tone="data" />
        </Layer>
        <Layer
          sx={sx}
          sy={sy}
          depth={reduce ? 0 : 75}
          z={80}
          className="pointer-events-none absolute right-[7%] top-[32%] hidden lg:block"
        >
          <TelemetryChip label="Fatigue AI" value="ALERT · 0" tone="signal" />
        </Layer>
        <Layer
          sx={sx}
          sy={sy}
          depth={reduce ? 0 : 70}
          z={70}
          className="pointer-events-none absolute bottom-[22%] left-[12%] hidden lg:block"
        >
          <TelemetryChip label="Trip" value="REC · 2:14:07" tone="accent" />
        </Layer>
        <Layer
          sx={sx}
          sy={sy}
          depth={reduce ? 0 : 55}
          z={50}
          className="pointer-events-none absolute bottom-[26%] right-[11%] hidden lg:block"
        >
          <TelemetryChip label="Channels" value="16 / 16" tone="data" />
        </Layer>

        {/* headline (closest to camera) */}
        <Layer
          sx={sx}
          sy={sy}
          depth={reduce ? 0 : 14}
          z={120}
          className="relative px-6 text-center"
        >
          <motion.p
            className="font-hud text-[11px] uppercase tracking-[0.4em] text-[#8ec2ff] [text-shadow:0_1px_12px_rgba(0,0,0,0.8)] sm:text-xs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Proudly South African video telematics
          </motion.p>
          <motion.h1
            className="mt-5 max-w-4xl text-balance text-5xl font-bold leading-[0.98] tracking-[-0.03em] text-white [text-shadow:0_2px_40px_rgba(0,0,0,0.7)] sm:text-7xl md:text-8xl"
            initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.3, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="text-white">{TAGLINE}</span>
          </motion.h1>
          <motion.p
            className="mx-auto mt-6 max-w-xl text-pretty text-sm leading-relaxed text-white/85 [text-shadow:0_1px_14px_rgba(0,0,0,0.85)] sm:text-base"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.6 }}
          >
            Video, GPS, telematics and AI safety in one platform — evidence and
            context for fleets that operate 24/7.
          </motion.p>
          <motion.div
            className="mt-9 flex flex-wrap items-center justify-center gap-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <a
              href="#services"
              className="inline-flex items-center justify-center rounded-full bg-[#4f6bff] px-7 py-3 text-sm font-semibold text-white shadow-[0_8px_22px_-12px_rgba(79,107,255,0.6)] transition hover:bg-[#6b83ff]"
            >
              Explore the systems
            </a>
            <a
              href="#contact"
              className="inline-flex items-center justify-center rounded-full border border-white/18 bg-white/[0.04] px-7 py-3 text-sm font-semibold text-white/90 backdrop-blur-sm transition hover:bg-white/[0.1]"
            >
              Talk to our team
            </a>
          </motion.div>
        </Layer>
      </motion.div>

      {/* scroll hint */}
      <motion.div
        className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 font-hud text-[10px] uppercase tracking-[0.32em] text-white/60"
        style={{ opacity: contentOpacity }}
      >
        <span className="inline-block animate-[float-y_2s_ease-in-out_infinite]">
          ↓ Scroll to explore
        </span>
      </motion.div>
    </section>
  );
}
