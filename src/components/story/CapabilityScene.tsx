"use client";

import { useEffect, useRef, useState } from "react";
import { Reveal } from "./primitives";

type Step = {
  n: string;
  verb: string;
  title: string;
  body: string;
  specs: string[];
  img: string;
  alt: string;
};

const STEPS: Step[] = [
  {
    n: "01",
    verb: "Fatigue",
    title: "Fatigue, caught in time.",
    body: "We spot a drowsy or distracted driver and act before it becomes a crash.",
    specs: ["Driver safety", "Fewer incidents"],
    img: "/story/see.webp",
    alt: "View from inside a truck cab at dusk",
  },
  {
    n: "02",
    verb: "Fuel",
    title: "Fuel that stops disappearing.",
    body: "Siphoning, off-route stops and unexplained drops — flagged the moment they happen.",
    specs: ["Loss prevention", "Theft recovery"],
    img: "/story/footprint.webp",
    alt: "Aerial view of a fleet depot",
  },
  {
    n: "03",
    verb: "Risk",
    title: "Risk you can actually manage.",
    body: "Driver scoring and hard evidence — lower claims, lower premiums, fewer surprises.",
    specs: ["Driver scoring", "Incident proof"],
    img: "/story/know.webp",
    alt: "Aerial view of a highway interchange",
  },
  {
    n: "04",
    verb: "Managed",
    title: "Watched 24/7, so you aren't.",
    body: "Our bureau handles the alarms, incidents and recovery around the clock. It's a service, not a job we hand back to you.",
    specs: ["Managed bureau", "Rapid response"],
    img: "/story/respond.webp",
    alt: "An operations control room",
  },
];

export function CapabilityScene() {
  const [active, setActive] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const i = Number((e.target as HTMLElement).dataset.step);
            setActive(i);
          }
        });
      },
      { rootMargin: "-48% 0px -48% 0px", threshold: 0 }
    );
    stepRefs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <section id="capabilities" className="scroll-mt-20 bg-[color:var(--paper)]">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <div className="max-w-3xl border-t border-[color:var(--line)] pt-10">
          <Reveal>
            <h2
              className="font-display text-[color:var(--ink)]"
              style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)", lineHeight: 1.04, letterSpacing: "-0.02em" }}
            >
              What we manage for you.
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="measure mt-6 text-lg leading-relaxed text-[color:var(--ink-2)]">
              Not cameras and cabling — outcomes. The risk your fleet runs every
              day, handled as a managed service.
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-10 lg:mt-20 lg:grid-cols-2 lg:gap-20">
          {/* sticky image */}
          <div className="hidden lg:block">
            <div className="sticky top-0 flex h-screen items-center">
              <figure className="relative aspect-[4/5] w-full overflow-hidden bg-[color:var(--paper-3)] shadow-[var(--shadow)]">
                {STEPS.map((s, i) => (
                  <img
                    key={s.n}
                    src={s.img}
                    alt={s.alt}
                    loading={i === 0 ? "eager" : "lazy"}
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.23,1,0.32,1)]"
                    style={{
                      opacity: active === i ? 1 : 0,
                      transform: active === i ? "scale(1)" : "scale(1.06)",
                    }}
                  />
                ))}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(16,13,8,0.6)] via-transparent to-transparent" />
                <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6 text-[color:var(--on-image)]">
                  <span className="font-display text-5xl leading-none">{STEPS[active].verb}</span>
                  <span className="font-mono text-xs tracking-widest opacity-80">
                    {STEPS[active].n} / {String(STEPS.length).padStart(2, "0")}
                  </span>
                </figcaption>
              </figure>
            </div>
          </div>

          {/* steps */}
          <div>
            {STEPS.map((s, i) => (
              <div
                key={s.n}
                data-step={i}
                ref={(el) => {
                  stepRefs.current[i] = el;
                }}
                className="flex min-h-[72vh] flex-col justify-center border-t border-[color:var(--line)] py-12 first:border-t-0 lg:min-h-screen lg:border-t-0 lg:py-0"
              >
                {/* inline image on mobile */}
                <div className="relative mb-7 aspect-[4/3] w-full overflow-hidden bg-[color:var(--paper-3)] shadow-[var(--shadow-soft)] lg:hidden">
                  <img src={s.img} alt={s.alt} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                </div>

                <Reveal>
                  <div className="flex items-baseline gap-4">
                    <span className="font-mono text-xs tracking-widest text-[color:var(--accent)]">{s.n}</span>
                    <span className="h-px flex-1 bg-[color:var(--line)]" />
                  </div>
                  <h3
                    className="font-display mt-6 text-[color:var(--ink)]"
                    style={{ fontSize: "clamp(1.9rem, 4vw, 2.8rem)", lineHeight: 1.05, letterSpacing: "-0.02em" }}
                  >
                    {s.title}
                  </h3>
                  <p className="measure mt-5 text-lg leading-relaxed text-[color:var(--ink-2)]">
                    {s.body}
                  </p>
                  <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2">
                    {s.specs.map((sp) => (
                      <li key={sp} className="flex items-center gap-2 text-sm text-[color:var(--ink-2)]">
                        <span className="h-1 w-1 rounded-full bg-[color:var(--accent)]" aria-hidden />
                        {sp}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
