"use client";

import { isWebKit, preferNativeScroll } from "@/lib/preferNativeScroll";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useEffect } from "react";

gsap.registerPlugin(ScrollTrigger);

/**
 * Inertial smooth scrolling + ties Lenis into GSAP's ticker so ScrollTrigger
 * stays in sync. Skipped only when prefers-reduced-motion is set or on iOS
 * (where OS momentum conflicts with Lenis). Desktop Safari now uses Lenis.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    if (preferNativeScroll()) {
      return;
    }

    const root = document.documentElement;
    root.classList.add("lenis", "lenis-smooth");

    const webkit = isWebKit();

    const lenis = new Lenis({
      lerp: webkit ? 0.1 : 0.09,
      smoothWheel: true,
      syncTouch: !webkit,
      syncTouchLerp: 0.08,
      wheelMultiplier: 1,
      touchMultiplier: 1,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const onTick = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      root.classList.remove("lenis", "lenis-smooth");
      gsap.ticker.remove(onTick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      ScrollTrigger.refresh();
    };
  }, []);

  return <>{children}</>;
}
