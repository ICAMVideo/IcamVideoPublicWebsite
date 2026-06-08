"use client";

import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

type Direction = "up" | "down" | "left" | "right";

const EASE = [0.22, 1, 0.36, 1] as const;

function offsetFor(dir: Direction, dist: number) {
  switch (dir) {
    case "down":
      return { y: -dist };
    case "left":
      return { x: -dist };
    case "right":
      return { x: dist };
    default:
      return { y: dist };
  }
}

/** Single element that slides + fades into view on scroll. */
export function Reveal({
  children,
  delay = 0,
  direction = "up",
  distance = 32,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: Direction;
  distance?: number;
  className?: string;
  as?: "div" | "li" | "article" | "section";
}) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as] as typeof motion.div;
  const off = offsetFor(direction, distance);
  return (
    <MotionTag
      className={className}
      initial={
        reduce
          ? { opacity: 0 }
          : { opacity: 0, ...off, filter: "blur(6px)" }
      }
      whileInView={
        reduce
          ? { opacity: 1 }
          : { opacity: 1, x: 0, y: 0, filter: "blur(0px)" }
      }
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.7, ease: EASE, delay }}
    >
      {children}
    </MotionTag>
  );
}

/**
 * Scroll-LINKED reveal (GSAP-ScrollTrigger "scrub" style). The element's
 * position + opacity are driven directly by how far it has travelled through
 * the viewport, so it slides in as you scroll down and back out as you scroll
 * up. A light spring smooths the Lenis steps.
 */
export function ScrollReveal({
  children,
  direction = "up",
  distance = 80,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  direction?: Direction;
  distance?: number;
  className?: string;
  as?: "div" | "li" | "article" | "section";
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const MotionTag = motion[as] as typeof motion.div;

  // 0 = element top just entered the bottom of the viewport,
  // 1 = element centre has risen to ~62% of the viewport height.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center 62%"],
  });
  const p = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    mass: 0.35,
  });

  const off = offsetFor(direction, distance);
  const x = useTransform(p, [0, 1], [off.x ?? 0, 0]);
  const y = useTransform(p, [0, 1], [off.y ?? 0, 0]);
  const opacity = useTransform(p, [0, 0.55], [0, 1]);

  if (reduce) {
    return (
      <MotionTag ref={ref} className={className}>
        {children}
      </MotionTag>
    );
  }

  return (
    <MotionTag ref={ref} className={className} style={{ x, y, opacity }}>
      {children}
    </MotionTag>
  );
}

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.04 },
  },
};

/** Parent that cascades its <StaggerItem> children in as it enters view. */
export function StaggerGroup({
  children,
  className,
  amount = 0.2,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  amount?: number;
  as?: "div" | "ul" | "section";
}) {
  const MotionTag = motion[as] as typeof motion.div;
  return (
    <MotionTag
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
    >
      {children}
    </MotionTag>
  );
}

/** Child of <StaggerGroup>; inherits the cascade timing from its parent. */
export function StaggerItem({
  children,
  className,
  direction = "up",
  distance = 36,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  direction?: Direction;
  distance?: number;
  as?: "div" | "li" | "article";
}) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as] as typeof motion.div;
  const off = offsetFor(direction, distance);
  const variants: Variants = {
    hidden: reduce
      ? { opacity: 0 }
      : { opacity: 0, ...off, scale: 0.96, filter: "blur(6px)" },
    show: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: { duration: 0.65, ease: EASE },
    },
  };
  return (
    <MotionTag className={className} variants={variants}>
      {children}
    </MotionTag>
  );
}

/** Counts up to a numeric target when scrolled into view. Non-numeric
 *  values (e.g. "1–16", "2TB", "24/7") render verbatim. */
export function Counter({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  const reduce = useReducedMotion();

  const match = value.match(/^(\d[\d,]*)(.*)$/);
  const target = match ? parseInt(match[1].replace(/,/g, ""), 10) : null;
  const suffix = match ? match[2] : "";

  const [display, setDisplay] = useState(
    target != null && !reduce ? "0" : value
  );

  useEffect(() => {
    if (target == null || reduce || !inView) {
      if (target != null && (reduce || !inView)) return;
      return;
    }
    let raf = 0;
    const dur = 1100;
    let start = 0;
    const tick = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(target * eased).toLocaleString() + suffix);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, suffix, reduce]);

  return (
    <span ref={ref} className={className}>
      {target == null ? value : display}
    </span>
  );
}
