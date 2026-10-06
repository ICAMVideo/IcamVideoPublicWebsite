"use client";

import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

const EASE = [0.23, 1, 0.32, 1] as const;

/** Quiet fade + rise as it enters view (once). Emil ease-out, from an
 *  already-sensible default; reduced-motion keeps the fade only. */
export function Reveal({
  children,
  delay = 0,
  y = 20,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "p" | "li" | "span" | "figure";
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as] as typeof motion.div;
  return (
    <Tag
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y, filter: "blur(6px)" }}
      whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.85, ease: EASE, delay }}
    >
      {children}
    </Tag>
  );
}

/** Display heading revealed line-by-line: each line is clipped, then lifts.
 *  Pass the already-broken lines. */
export function LineReveal({
  lines,
  className,
  lineClassName,
  delay = 0,
  stagger = 0.09,
}: {
  lines: React.ReactNode[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  stagger?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  return (
    <span ref={ref} className={className} aria-label={undefined}>
      {lines.map((line, i) => (
        <span key={i} className={`reveal-line ${lineClassName ?? ""}`}>
          <span
            style={{
              transform: inView ? "translateY(0)" : "translateY(108%)",
              transitionDelay: `${delay + i * stagger}s`,
            }}
          >
            {line}
          </span>
        </span>
      ))}
    </span>
  );
}

/** Full-bleed image that drifts (and optionally scales) against scroll.
 *  The image is oversized so the drift never exposes an edge. */
export function ParallaxImage({
  src,
  alt,
  className,
  strength = 14,
  scaleFrom = 1.12,
  priority = false,
  position = "center",
}: {
  src: string;
  alt: string;
  className?: string;
  strength?: number;
  scaleFrom?: number;
  priority?: boolean;
  position?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [`-${strength}%`, `${strength}%`]);
  const scale = useTransform(scrollYProgress, [0, 1], [scaleFrom, 1]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className ?? ""}`}>
      <motion.img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        style={
          reduce
            ? { position: "absolute", inset: "-2% 0", width: "100%", height: "104%", objectFit: "cover", objectPosition: position }
            : {
                position: "absolute",
                inset: `-${strength + 4}% 0`,
                width: "100%",
                height: `${100 + (strength + 4) * 2}%`,
                objectFit: "cover",
                objectPosition: position,
                y,
                scale,
              }
        }
      />
    </div>
  );
}

/** Count-up when scrolled into view; non-numeric prefix/suffix preserved. */
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

  const m = value.match(/^(\D*)(\d[\d,]*)(.*)$/);
  const target = m ? parseInt(m[2].replace(/,/g, ""), 10) : null;
  const pre = m ? m[1] : "";
  const suf = m ? m[3] : "";

  const [display, setDisplay] = useState(
    target != null && !reduce ? `${pre}0${suf}` : value
  );

  useEffect(() => {
    if (target == null || reduce || !inView) return;
    let raf = 0;
    let start = 0;
    const dur = 1200;
    const tick = (t: number) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      setDisplay(`${pre}${Math.round(target * e)}${suf}`);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, pre, suf, reduce]);

  return (
    <span ref={ref} className={className}>
      {target == null ? value : display}
    </span>
  );
}
