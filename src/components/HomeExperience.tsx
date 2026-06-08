"use client";

import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCallback, useLayoutEffect, useState } from "react";
import { MarketingSections } from "./MarketingSections";
import { Hero3D } from "./Hero3D";
import { SiteNav } from "./SiteNav";
import { LoadingScreen } from "./LoadingScreen";

function scrollTopHard() {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

export function HomeExperience() {
  const [splashDone, setSplashDone] = useState(false);
  const [heroReady, setHeroReady] = useState(false);

  const onHeroReady = useCallback(() => {
    setHeroReady(true);
  }, []);

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
    if (!heroReady) return;
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
  }, [heroReady]);

  return (
    <main className="flex min-h-dvh flex-col bg-[color:var(--background)] text-[color:var(--foreground)]">
      <SiteNav />
      <Hero3D onReady={onHeroReady} />
      {!splashDone ? (
        <LoadingScreen
          onComplete={handleSplashComplete}
          waitForReady={heroReady}
        />
      ) : null}
      <MarketingSections />
    </main>
  );
}
