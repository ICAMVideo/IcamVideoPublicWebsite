"use client";

import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCallback, useLayoutEffect, useState } from "react";
import { MarketingSections } from "./MarketingSections";
import { ScrollVideoHero } from "./ScrollVideoHero";
import { SiteNav } from "./SiteNav";
import { SplashScreen } from "./SplashScreen";

function scrollTopHard() {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

export function HomeExperience() {
  const [splashDone, setSplashDone] = useState(false);
  const [heroReady, setHeroReady] = useState(false);

  const onVideoReady = useCallback(() => {
    setHeroReady(true);
  }, []);

  useLayoutEffect(() => {
    const prev = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    scrollTopHard();
    return () => {
      window.history.scrollRestoration = prev;
    };
  }, []);

  const handleSplashComplete = useCallback(() => {
    if (!heroReady) return;
    scrollTopHard();
    setSplashDone(true);
    requestAnimationFrame(() => {
      scrollTopHard();
      ScrollTrigger.refresh();
      scrollTopHard();
    });
  }, [heroReady]);

  return (
    <main className="flex min-h-dvh flex-col bg-[color:var(--background)] text-zinc-900">
      <SiteNav />
      <ScrollVideoHero onVideoReady={onVideoReady} />
      {!splashDone ? (
        <SplashScreen
          onComplete={handleSplashComplete}
          waitForReady={heroReady}
        />
      ) : null}
      <MarketingSections />
    </main>
  );
}
