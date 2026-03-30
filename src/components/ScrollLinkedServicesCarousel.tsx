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
    <ul className="mt-5 space-y-3 text-sm leading-relaxed text-zinc-600">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-zinc-400" aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function PlaceholderVisual({ title }: { title: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-300/80 bg-gradient-to-br from-zinc-100 via-zinc-50 to-white p-5">
      <div className="absolute inset-0 opacity-40 [background:radial-gradient(circle_at_20%_20%,rgba(9,0,136,0.12),transparent_52%)]" />
      <div className="relative">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
          Placeholder module
        </p>
        <p className="mt-2 text-sm font-semibold text-zinc-800">{title}</p>
        <div className="mt-4 space-y-2">
          <div className="h-2.5 w-5/6 rounded bg-zinc-300/70" />
          <div className="h-2.5 w-3/4 rounded bg-zinc-300/60" />
          <div className="h-2.5 w-2/3 rounded bg-zinc-300/50" />
        </div>
      </div>
    </div>
  );
}

export function ScrollLinkedServicesCarousel({ items }: { items: readonly ServiceCard[] }) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const pin = pinRef.current;
    const track = trackRef.current;
    if (!section || !pin || !track) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
              className="min-w-[84vw] rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_8px_24px_-18px_rgba(15,23,42,0.45)] sm:min-w-[66vw] lg:min-w-[38rem]"
            >
              <p className="text-xs font-semibold tabular-nums text-zinc-400">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-zinc-900">
                {block.title}
              </h3>
              <p className="mt-4 text-sm leading-[1.7] text-zinc-600">{block.intro}</p>
              <BulletList items={block.bullets} />
              <div className="mt-6">
                <PlaceholderVisual title={`${block.title} visual placeholder`} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
