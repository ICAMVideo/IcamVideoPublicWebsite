"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

type ServiceCard = {
  id: string;
  title: string;
  intro: string;
  bullets: readonly string[];
};

function BulletList({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-5 space-y-3 text-sm leading-relaxed text-[color:var(--text-muted)]">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span
            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--data)] shadow-[0_0_8px_var(--data)]"
            aria-hidden
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function ScrollLinkedServicesCarousel({
  items,
}: {
  items: readonly ServiceCard[];
}) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const pin = pinRef.current;
    const track = trackRef.current;
    if (!section || !pin || !track) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduceMotion) {
      gsap.set(track, { x: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      const maxX = Math.max(0, track.scrollWidth - pin.clientWidth);
      gsap.set(track, { x: 0 });
      if (maxX <= 0) return;

      gsap.to(track, {
        x: () => -Math.max(0, track.scrollWidth - pin.clientWidth),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top+=72",
          end: () =>
            `+=${
              Math.max(0, track.scrollWidth - pin.clientWidth) +
              pin.clientHeight * 0.55
            }`,
          scrub: 1.1,
          pin,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
    }, section);

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [items]);

  return (
    <div ref={sectionRef} className="relative mt-12">
      <div ref={pinRef} className="overflow-hidden">
        <div ref={trackRef} className="flex gap-5 pr-5 will-change-transform">
          {items.map((block, i) => (
            <article
              key={block.id}
              id={block.id}
              className="hud-corners group relative min-w-[84vw] overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-7 transition-colors hover:border-[color:var(--accent)] sm:min-w-[66vw] lg:min-w-[34rem]"
            >
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="font-hud text-xs tabular-nums text-[color:var(--data-soft)]">
                    {String(i + 1).padStart(2, "0")} /{" "}
                    {String(items.length).padStart(2, "0")}
                  </span>
                  <span className="font-hud text-[10px] uppercase tracking-[0.24em] text-[color:var(--text-faint)]">
                    MODULE
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-semibold tracking-tight text-[color:var(--foreground)]">
                  {block.title}
                </h3>
                <p className="mt-4 text-sm leading-[1.7] text-[color:var(--text-muted)]">
                  {block.intro}
                </p>
                <BulletList items={block.bullets} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
