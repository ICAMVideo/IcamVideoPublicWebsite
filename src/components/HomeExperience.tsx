"use client";

import { warmTerminalFrameBlobs } from "@/lib/terminalFrameBlobWarmup";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
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
  const [blobWarmReady, setBlobWarmReady] = useState(false);
  const framesKey = frames.join("|");

  useEffect(() => {
    if (frames.length === 0) {
      setBlobWarmReady(true);
      return;
    }

    let cancelled = false;
    setBlobWarmReady(false);

    void warmTerminalFrameBlobs(frames).then(() => {
      if (!cancelled) setBlobWarmReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [framesKey, frames]);

  useLayoutEffect(() => {
    const prev = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    scrollTopHard();
    return () => {
      window.history.scrollRestoration = prev;
    };
  }, []);

  const handleSplashComplete = useCallback(() => {
    if (!blobWarmReady) return;
    scrollTopHard();
    setSplashDone(true);
    requestAnimationFrame(() => {
      scrollTopHard();
      ScrollTrigger.refresh();
      scrollTopHard();
    });
  }, [blobWarmReady]);

  return (
    <main className="flex min-h-dvh flex-col bg-[color:var(--background)] text-zinc-900">
      {/* Fixed under splash (z-100); reveals with hero as doors split — not after splash unmount */}
      <SiteNav />
      <ScrollFrameHero
        key={framesKey}
        frames={frames}
        active={frames.length > 0}
      />
      {!splashDone ? (
        <SplashScreen
          onComplete={handleSplashComplete}
          waitForReady={blobWarmReady}
        />
      ) : null}
      <MarketingSections />
    </main>
  );
}
