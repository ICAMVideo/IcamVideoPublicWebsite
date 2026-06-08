"use client";

import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCallback, useLayoutEffect, useState } from "react";
import { MarketingSections } from "./MarketingSections";
import { MapHero } from "./MapHero";
import { SiteNav } from "./SiteNav";
import { ParticleIntro } from "./ParticleIntro";

function scrollTopHard() {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

export function HomeExperience() {
  const [splashDone, setSplashDone] = useState(false);

  useLayoutEffect(() => {
    const prev = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    scrollTopHard();
    // Show the splash only once per browser session — returning to the home
    // page (or refreshing) afterwards goes straight to the hero. Runs before
    // paint so the loader never flashes on a revisit.
    try {
      if (sessionStorage.getItem("icam-splash-seen") === "1") {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSplashDone(true);
      }
    } catch {
      /* sessionStorage unavailable — fall back to showing the splash */
    }
    return () => {
      window.history.scrollRestoration = prev;
    };
  }, []);

  const handleSplashComplete = useCallback(() => {
    try {
      sessionStorage.setItem("icam-splash-seen", "1");
    } catch {
      /* ignore */
    }
    scrollTopHard();
    setSplashDone(true);
    requestAnimationFrame(() => {
      scrollTopHard();
      ScrollTrigger.refresh();
      scrollTopHard();
    });
  }, []);

  return (
    <main className="flex min-h-dvh flex-col bg-[color:var(--background)] text-[color:var(--foreground)]">
      <SiteNav />
      <MapHero />
      {!splashDone ? <ParticleIntro onComplete={handleSplashComplete} /> : null}
      <MarketingSections />
    </main>
  );
}
