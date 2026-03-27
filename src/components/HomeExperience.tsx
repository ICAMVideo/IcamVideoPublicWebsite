"use client";

import { frameSrc } from "@/lib/terminalFrameUrl";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
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

/**
 * Preload the first few frames during splash so the canvas has pixels
 * immediately when the hero activates. Returns a promise that resolves
 * once frame 0 is decoded (or after a safety timeout).
 */
function preloadFirstFrames(frames: string[]): Promise<void> {
  if (frames.length === 0) return Promise.resolve();

  const decodeFrame = (url: string): Promise<void> =>
    fetch(url, { cache: "force-cache" })
      .then((r) => r.blob())
      .then((blob) => createImageBitmap(blob))
      .then((bmp) => {
        bmp.close();
      })
      .catch(() => {});

  const first = decodeFrame(frameSrc(frames[0]));

  const batch = frames.slice(1, 6);
  for (const f of batch) {
    void decodeFrame(frameSrc(f));
  }

  const timeout = new Promise<void>((resolve) =>
    setTimeout(resolve, 3000)
  );

  return Promise.race([first, timeout]);
}

export function HomeExperience({ frames }: Props) {
  const [splashDone, setSplashDone] = useState(false);
  const [firstFrameReady, setFirstFrameReady] = useState(false);
  const framesKey = frames.join("|");
  const preloadStarted = useRef(false);

  useEffect(() => {
    if (preloadStarted.current) return;
    preloadStarted.current = true;
    void preloadFirstFrames(frames).then(() => setFirstFrameReady(true));
  }, [frames]);

  useLayoutEffect(() => {
    const prev = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    scrollTopHard();
    return () => {
      window.history.scrollRestoration = prev;
    };
  }, []);

  const handleSplashComplete = useCallback(() => {
    if (!firstFrameReady) return;
    scrollTopHard();
    setSplashDone(true);
    requestAnimationFrame(() => {
      scrollTopHard();
      ScrollTrigger.refresh();
      scrollTopHard();
    });
  }, [firstFrameReady]);

  return (
    <main className="flex min-h-dvh flex-col bg-[color:var(--background)] text-zinc-900">
      {!splashDone ? (
        <SplashScreen
          onComplete={handleSplashComplete}
          waitForReady={firstFrameReady}
        />
      ) : null}
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
