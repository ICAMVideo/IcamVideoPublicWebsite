"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { LineReveal } from "./primitives";

export function StoryHero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  // image drifts down + scales a touch; copy lifts and fades as you leave
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.16]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.72], [1, 0]);

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[620px] w-full overflow-hidden bg-[color:var(--ink)]">
      <motion.img
        src="/story/hero.webp"
        alt="A truck on an open South African highway at dusk"
        fetchPriority="high"
        decoding="async"
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ y: imgY, scale: imgScale, objectPosition: "center 42%" }}
      />
      {/* warm cinematic grade + legibility scrim */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(16,13,8,0.42) 0%, rgba(16,13,8,0.05) 26%, rgba(16,13,8,0.05) 50%, rgba(16,13,8,0.78) 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 mix-blend-soft-light opacity-[0.5]"
        style={{ background: "radial-gradient(120% 80% at 50% 30%, rgba(255,214,150,0.35), transparent 60%)" }}
      />

      <motion.div
        style={{ y: copyY, opacity: copyOpacity }}
        className="absolute inset-x-0 bottom-0 z-10"
      >
        <div className="mx-auto max-w-[1400px] px-5 pb-[clamp(3rem,8vh,6rem)] sm:px-8 lg:px-12">
          <h1
            className="font-display text-[color:var(--on-image)]"
            style={{ fontSize: "clamp(2.9rem, 9vw, 6rem)", lineHeight: 0.98, letterSpacing: "-0.02em" }}
          >
            <LineReveal lines={["Get the", "full picture."]} delay={0.35} />
          </h1>

          <motion.p
            className="mt-7 max-w-[34ch] text-base leading-relaxed text-[color:var(--on-image)]/85 sm:text-lg"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
          >
            AI driver safety, fuel-loss protection and risk — managed for the
            fleets that keep Southern Africa moving.
          </motion.p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
        className="pointer-events-none absolute bottom-7 right-5 z-10 hidden items-center gap-3 text-[color:var(--on-image)]/70 sm:right-8 sm:flex lg:right-12"
      >
        <span className="text-[0.7rem] font-medium uppercase tracking-[0.24em]">Scroll</span>
        <span className="relative block h-10 w-px overflow-hidden bg-[color:var(--on-image)]/30">
          <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_1.9s_ease-in-out_infinite] bg-[color:var(--on-image)]" />
        </span>
      </motion.div>

      <style>{`@keyframes scrollcue{0%{transform:translateY(-100%)}60%,100%{transform:translateY(200%)}}`}</style>
    </section>
  );
}
