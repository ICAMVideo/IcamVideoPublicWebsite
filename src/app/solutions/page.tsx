import Link from "next/link";
import type { Metadata } from "next";
import { StoryNav } from "@/components/story/StoryNav";
import { StoryFooter } from "@/components/story/StoryFooter";
import { Reveal } from "@/components/story/primitives";
import { solutions } from "@/lib/solutions";
import { solutionDetails, defaultDetail } from "@/lib/solutionDetail";

export const metadata: Metadata = {
  title: "Solutions by vehicle — iCAM Video Telematics",
  description:
    "iCAM video telematics configured by vehicle type — tipper, tautliner, fuel tanker, bus, mining, taxi, ambulance and more.",
};

const vehicles = solutions.filter((s) => s.slug !== "all");

export default function SolutionsPage() {
  return (
    <main className="bg-[color:var(--paper)] text-[color:var(--ink)]">
      <StoryNav pinned />

      {/* header */}
      <section className="mx-auto max-w-[1400px] px-5 pb-6 pt-32 sm:px-8 sm:pt-40 lg:px-12">
        <Reveal>
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-sm font-medium text-[color:var(--ink-3)] transition-colors hover:text-[color:var(--ink)]"
          >
            <span aria-hidden className="transition-transform duration-300 group-hover:-translate-x-1">←</span>
            Home
          </Link>
        </Reveal>
        <div className="mt-10 max-w-4xl">
          <Reveal>
            <h1
              className="font-display text-[color:var(--ink)]"
              style={{ fontSize: "clamp(2.4rem, 7vw, 5rem)", lineHeight: 1.02, letterSpacing: "-0.025em" }}
            >
              Built around the vehicle.
            </h1>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="measure mt-7 text-lg leading-relaxed text-[color:var(--ink-2)] sm:text-xl">
              The platform is the same; the build is not. Cameras, sensors and
              workflows are configured to how each vehicle actually runs — from
              the tip face to the long linehaul to the mine.
            </p>
          </Reveal>
        </div>
      </section>

      {/* vehicle list */}
      <section className="mx-auto max-w-[1400px] px-5 pb-24 pt-10 sm:px-8 lg:px-12">
        <div className="grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((s, i) => {
            const d = solutionDetails[s.slug] ?? defaultDetail;
            return (
              <Reveal key={s.slug} delay={(i % 3) * 0.06}>
                <Link href={`/solutions/${s.slug}`} className="group block">
                  <figure className="relative aspect-[4/3] w-full overflow-hidden bg-[color:var(--paper-2)]">
                    <img
                      src={s.imageSrc}
                      alt={s.imageAlt}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-contain p-7 transition-transform duration-[800ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.05]"
                    />
                  </figure>
                  <div className="mt-5 flex items-start justify-between gap-4 border-t border-[color:var(--line)] pt-5">
                    <div>
                      <h2 className="font-display text-xl text-[color:var(--ink)]">{s.name}</h2>
                      <p className="mt-1.5 text-sm leading-relaxed text-[color:var(--ink-2)]">{d.blurb}</p>
                    </div>
                    <span className="mt-1 shrink-0 text-[color:var(--ink-3)] transition-all duration-300 group-hover:translate-x-1 group-hover:text-[color:var(--accent)]">→</span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      <StoryFooter />
    </main>
  );
}
