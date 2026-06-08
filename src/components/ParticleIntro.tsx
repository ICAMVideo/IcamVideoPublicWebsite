"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { TAGLINE } from "@/lib/brand";

type Props = { onComplete: () => void };

const EXIT_MS = 1150;

/**
 * Interactive entry gate: a mouse-reactive constellation of glowing particles
 * arranged into road-like lanes. Clicking "Enter" (or anywhere) makes the
 * whole field accelerate outward and dissipate, then reveals the homepage.
 * Replaces the radar loader; shown once per session. Static under reduced motion.
 */
export function ParticleIntro({ onComplete }: Props) {
  const reduce = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [exiting, setExiting] = useState(false);

  const exitRef = useRef(false);
  const exitStartRef = useRef(0);
  const doneRef = useRef(false);
  const finishRef = useRef(onComplete);
  useEffect(() => {
    finishRef.current = onComplete;
  }, [onComplete]);

  const startExit = useCallback(() => {
    if (exitRef.current) return;
    exitStartRef.current =
      typeof performance !== "undefined" ? performance.now() : 0;
    exitRef.current = true;
    setExiting(true);
    if (reduce) {
      window.setTimeout(() => {
        if (!doneRef.current) {
          doneRef.current = true;
          finishRef.current();
        }
      }, 420);
    }
  }, [reduce]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") startExit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [startExit]);

  useEffect(() => {
    if (reduce) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let w = 0,
      h = 0,
      cx = 0,
      cy = 0,
      raf = 0;
    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
    const COLORS = ["#1d6fe0", "#58a6ff", "#9db8ff"];

    type P = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      c: string;
      tw: number;
    };
    let ps: P[] = [];

    const build = () => {
      const count = Math.max(70, Math.min(190, Math.floor((w * h) / 8800)));
      ps = [];
      const laneCount = 5;
      const lanes: { ox: number; oy: number; ux: number; uy: number }[] = [];
      for (let l = 0; l < laneCount; l++) {
        const a = Math.PI * 0.25 + (Math.random() - 0.5) * 1.1;
        lanes.push({
          ox: Math.random() * w,
          oy: Math.random() * h,
          ux: Math.cos(a),
          uy: Math.sin(a),
        });
      }
      const span = Math.max(w, h) * 1.2;
      for (let i = 0; i < count; i++) {
        let x: number, y: number;
        if (Math.random() < 0.62) {
          const ln = lanes[(Math.random() * laneCount) | 0];
          const t = (Math.random() - 0.5) * span;
          const j = (Math.random() - 0.5) * 28;
          x = ln.ox + ln.ux * t - ln.uy * j;
          y = ln.oy + ln.uy * t + ln.ux * j;
        } else {
          x = Math.random() * w;
          y = Math.random() * h;
        }
        ps.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 0.16,
          vy: (Math.random() - 0.5) * 0.16,
          r: Math.random() * 1.7 + 0.5,
          c: COLORS[(Math.random() * COLORS.length) | 0],
          tw: Math.random() * Math.PI * 2,
        });
      }
    };

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      cx = w / 2;
      cy = h / 2;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    };

    const onMove = (e: PointerEvent) => {
      mouse.tx = e.clientX;
      mouse.ty = e.clientY;
    };
    const onLeave = () => {
      mouse.tx = -9999;
      mouse.ty = -9999;
    };

    const R = 185;
    const R2 = R * R;
    const maxD = 120;
    const maxD2 = maxD * maxD;

    const frame = (ts: number) => {
      raf = requestAnimationFrame(frame);

      if (mouse.x < -9000) {
        mouse.x = mouse.tx;
        mouse.y = mouse.ty;
      } else {
        mouse.x += (mouse.tx - mouse.x) * 0.12;
        mouse.y += (mouse.ty - mouse.y) * 0.12;
      }
      const mouseOn = mouse.tx > -9000;

      const exit = exitRef.current;
      let fade = 1;
      if (exit) {
        const el = ts - exitStartRef.current;
        fade = Math.max(0, 1 - el / EXIT_MS);
        if (el >= EXIT_MS) {
          if (!doneRef.current) {
            doneRef.current = true;
            finishRef.current();
          }
          cancelAnimationFrame(raf);
          return;
        }
      }

      ctx.clearRect(0, 0, w, h);

      for (const p of ps) {
        if (exit) {
          const dx = p.x - cx;
          const dy = p.y - cy;
          const d = Math.hypot(dx, dy) || 1;
          p.vx += (dx / d) * 0.9;
          p.vy += (dy / d) * 0.9;
          p.vx *= 1.04;
          p.vy *= 1.04;
        } else {
          if (mouseOn) {
            const dx = mouse.x - p.x;
            const dy = mouse.y - p.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < R2) {
              const f = (1 - Math.sqrt(d2) / R) * 0.0009;
              p.vx += dx * f;
              p.vy += dy * f;
            }
          }
          p.vx *= 0.99;
          p.vy *= 0.99;
        }
        p.x += p.vx;
        p.y += p.vy;
        if (!exit) {
          if (p.x < -24) p.x = w + 24;
          else if (p.x > w + 24) p.x = -24;
          if (p.y < -24) p.y = h + 24;
          else if (p.y > h + 24) p.y = -24;
        }
      }

      // connections
      ctx.lineWidth = 1;
      for (let i = 0; i < ps.length; i++) {
        const a = ps[i];
        for (let j = i + 1; j < ps.length; j++) {
          const b = ps[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dd = dx * dx + dy * dy;
          if (dd < maxD2) {
            const dist = Math.sqrt(dd);
            let al = (1 - dist / maxD) * 0.5 * fade;
            if (mouseOn) {
              const mx = (a.x + b.x) / 2 - mouse.x;
              const my = (a.y + b.y) / 2 - mouse.y;
              if (mx * mx + my * my < R2) al *= 1.9;
            }
            if (al > 0.01) {
              ctx.strokeStyle = `rgba(88,166,255,${Math.min(0.75, al)})`;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
        }
      }

      // dots with glow
      ctx.save();
      for (const p of ps) {
        const tw = 0.6 + 0.4 * Math.sin(ts * 0.002 + p.tw);
        ctx.beginPath();
        ctx.fillStyle = p.c;
        ctx.shadowColor = p.c;
        ctx.shadowBlur = 8 * tw;
        ctx.globalAlpha = Math.min(1, 0.55 + 0.45 * tw) * fade;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // cursor glow
      if (mouseOn && !exit) {
        const g = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          R * 0.9
        );
        g.addColorStop(0, "rgba(29,111,224,0.10)");
        g.addColorStop(1, "rgba(29,111,224,0)");
        ctx.fillStyle = g;
        ctx.fillRect(mouse.x - R, mouse.y - R, R * 2, R * 2);
      }
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, [reduce]);

  return (
    <div
      className="fixed inset-0 z-[100] cursor-pointer select-none overflow-hidden bg-[#04050c]"
      onClick={startExit}
      role="button"
      tabIndex={-1}
      aria-label="Enter the iCAM Video Telematics site"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {/* vignette for text legibility */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 58%, rgba(4,5,12,0) 30%, rgba(4,5,12,0.55) 100%)",
        }}
      />

      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
        animate={exiting ? { opacity: 0, y: -12 } : { opacity: 1, y: 0 }}
        transition={{ duration: exiting ? 0.32 : 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.p
          className="font-hud text-[10px] uppercase tracking-[0.4em] text-[#8ec2ff] sm:text-xs"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
        >
          iCAM Video Telematics
        </motion.p>

        <motion.h1
          className="mt-6 flex items-center gap-3 text-4xl font-semibold tracking-tight text-white sm:text-6xl md:text-7xl"
          initial={{ opacity: 0, filter: "blur(12px)", y: 14 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{ delay: 0.35, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="text-[#1d6fe0]" aria-hidden>
            ›
          </span>
          Explore the Intelligent Road
        </motion.h1>

        <motion.p
          className="mt-5 max-w-md text-sm text-white/70 sm:text-base"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          {TAGLINE} — video, GPS and AI safety in one connected platform.
        </motion.p>

        <motion.button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            startExit();
          }}
          className="pointer-events-auto mt-10 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/[0.04] px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-[#1d6fe0] hover:bg-[#1d6fe0]/15"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.6 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          Enter
          <span aria-hidden className="text-[#8ec2ff]">
            →
          </span>
        </motion.button>

        <motion.p
          className="font-hud mt-6 text-[10px] uppercase tracking-[0.3em] text-white/35"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          Move your cursor · click anywhere to enter
        </motion.p>
      </motion.div>
    </div>
  );
}
