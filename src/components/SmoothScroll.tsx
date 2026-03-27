"use client";

import { isWebKit, preferNativeScroll } from "@/lib/preferNativeScroll";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useEffect } from "react";

gsap.registerPlugin(ScrollTrigger);

/**
 * Matches Lenis + GSAP guidance: `scroll` → ScrollTrigger.update, ticker raf,
 * lagSmoothing(0). That fixes sync/jank; it does not speed up image decode.
 *
 * @see https://github.com/darkroomengineering/lenis/blob/main/README.md
 *
 * Skipped when prefers-reduced-motion or on iOS (native scroll; see preferNativeScroll).
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
      lerp: webkit ? 0.075 : 0.085,
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
