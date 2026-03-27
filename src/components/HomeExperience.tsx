"use client";

import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCallback, useLayoutEffect, useState } from "react";
import { MarketingSections } from "./MarketingSections";
import { ScrollFrameHero } from "./ScrollFrameHero";
import { SiteNav } from "./SiteNav";
import { SplashScreen } from "./SplashScreen";

type Props = {
  frames: string[];
};

function scrollTopHard() {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

export function HomeExperience({ frames }: Props) {
  const [splashDone, setSplashDone] = useState(false);
  const framesKey = frames.join("|");

  useLayoutEffect(() => {
    const prev = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    scrollTopHard();
    return () => {
      window.history.scrollRestoration = prev;
    };
  }, []);

  const handleSplashComplete = useCallback(() => {
    scrollTopHard();
    setSplashDone(true);
    requestAnimationFrame(() => {
      scrollTopHard();
      ScrollTrigger.refresh();
      scrollTopHard();
    });
  }, []);

  return (
    <main className="flex min-h-dvh flex-col bg-[color:var(--background)] text-zinc-900">
      {!splashDone ? <SplashScreen onComplete={handleSplashComplete} /> : null}
      {splashDone ? <SiteNav /> : null}
      <ScrollFrameHero
        key={splashDone ? framesKey : "pre-splash"}
        frames={frames}
        active={splashDone}
      />
      <MarketingSections />
    </main>
  );
}
