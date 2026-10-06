"use client";

import Link from "next/link";
import { CONTACT, TAGLINE } from "@/lib/brand";
import { solutions } from "@/lib/solutions";
import { StoryNav } from "./StoryNav";
import { StoryHero } from "./StoryHero";
import { CapabilityScene } from "./CapabilityScene";
import { PartnersRibbon } from "./PartnersRibbon";
import { ImageMarquee } from "./ImageMarquee";
import { Counter, LineReveal, ParallaxImage, Reveal } from "./primitives";

const GALLERY = [
  { src: "/story/gallery/driver.webp", alt: "Driver's hands on a truck steering wheel" },
  { src: "/story/gallery/cockpit.webp", alt: "Digital instrument cluster while driving" },
  { src: "/story/gallery/road.webp", alt: "Driver's view of the road at dusk" },
  { src: "/story/gallery/crew.webp", alt: "Driver in hi-vis at the wheel" },
  { src: "/story/gallery/night.webp", alt: "Night driving through city lights" },
  { src: "/story/respond.webp", alt: "Operations control room" },
  { src: "/story/gallery/trails.webp", alt: "Light trails on a night highway" },
  { src: "/story/mining.webp", alt: "A haul truck working heavy ground" },
];

const vehicleSolutions = solutions.filter((s) => s.slug !== "all");

// Impact / outcome metrics. VALUES ARE ILLUSTRATIVE PLACEHOLDERS — replace with
// iCAM's own verified figures (the on-page note flags them as illustrative).
const METRICS: { value: string; label: string }[] = [
  { value: "80%", label: "Fewer fatigue events" },
  { value: "60%", label: "Less fuel lost to theft" },
  { value: "45%", label: "Lower accident risk" },
  { value: "24/7", label: "Eyes on your fleet" },
];

export function StoryHome() {
  return (
    <main className="bg-[color:var(--paper)] text-[color:var(--ink)]">
      <StoryNav />
      <StoryHero />

      {/* ---------- OPENING STATEMENT ---------- */}
      <section className="mx-auto max-w-[1400px] px-5 py-[clamp(5rem,14vh,10rem)] sm:px-8 lg:px-12">
        <div className="max-w-5xl">
          <h2
            className="font-display text-[color:var(--ink)]"
            style={{ fontSize: "clamp(2.2rem, 6vw, 4.6rem)", lineHeight: 1.05, letterSpacing: "-0.025em" }}
          >
            <LineReveal
              lines={[
                "Fatigue. Fuel loss.",
                "Risk you can't see —",
                <span key="e" className="text-[color:var(--ink-3)]">
                  we manage all three.
                </span>,
              ]}
            />
          </h2>
          <Reveal delay={0.12}>
            <p className="measure mt-10 text-xl leading-relaxed text-[color:var(--ink-2)]">
              iCAM runs the safety, security and risk layer for your fleet — AI
              on the cameras, our bureau on the alerts — as a managed service,
              not another device to babysit.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---------- IMPACT (outcome metrics) ---------- */}
      <section className="border-y border-[color:var(--line)] bg-[color:var(--paper-2)]">
        <div className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 lg:py-16 lg:px-12">
          <Reveal>
            <h2
              className="font-display text-[color:var(--ink)]"
              style={{ fontSize: "clamp(1.6rem, 3.6vw, 2.4rem)", letterSpacing: "-0.02em" }}
            >
              What it changes for your fleet.
            </h2>
          </Reveal>
          <div className="mt-10 grid grid-cols-2 gap-y-10 lg:grid-cols-4">
            {METRICS.map((m, i) => (
              <Reveal
                key={m.label}
                delay={i * 0.08}
                className={`px-1 lg:px-8 ${i > 0 ? "lg:border-l lg:border-[color:var(--line)]" : ""}`}
              >
                <div
                  className="font-display leading-none text-[color:var(--ink)]"
                  style={{ fontSize: "clamp(2.8rem, 6vw, 4.4rem)", letterSpacing: "-0.02em" }}
                >
                  <Counter value={m.value} />
                </div>
                <p className="mt-3 text-sm font-medium text-[color:var(--ink-2)]">{m.label}</p>
              </Reveal>
            ))}
          </div>
          <p className="mt-10 max-w-2xl text-xs leading-relaxed text-[color:var(--ink-3)]">
            Illustrative outcomes — we baseline against your own fleet and report
            the real numbers back to you.
          </p>
        </div>
      </section>

      {/* ---------- PARTNERS (moving ribbon) ---------- */}
      <PartnersRibbon />

      {/* ---------- CAPABILITIES (sticky scene) ---------- */}
      <CapabilityScene />

      {/* ---------- IMAGE RIBBON (ADAS / fleet) ---------- */}
      <ImageMarquee images={GALLERY} />

      {/* ---------- FOOTPRINT ---------- */}
      <section id="footprint" className="relative scroll-mt-20">
        <ParallaxImage
          src="/story/footprint.webp"
          alt="Aerial view of a fleet of trucks at a depot"
          className="h-[92vh] min-h-[560px] w-full"
          position="center"
          strength={12}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(16,13,8,0.55) 0%, rgba(16,13,8,0.1) 40%, rgba(16,13,8,0.72) 100%)" }}
        />
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-8 lg:px-12">
            <div className="max-w-2xl text-[color:var(--on-image)]">
              <h2
                className="font-display"
                style={{ fontSize: "clamp(2.2rem, 6vw, 4.6rem)", lineHeight: 1.02, letterSpacing: "-0.02em" }}
              >
                <LineReveal lines={["Two offices.", "A region of coverage."]} />
              </h2>
              <Reveal delay={0.15}>
                <p className="mt-7 max-w-xl text-lg leading-relaxed text-[color:var(--on-image)]/85">
                  We&apos;re based in Pretoria and Cape Town — but the fleets we
                  look after don&apos;t stop at the border. iCAM supports
                  vehicles running cross-border, all the way up to the DRC.
                </p>
              </Reveal>
              <Reveal delay={0.25}>
                <div className="mt-8 flex max-w-xl flex-wrap gap-x-5 gap-y-2 text-sm text-[color:var(--on-image)]/70">
                  {["South Africa", "Botswana", "Namibia", "Zimbabwe", "Mozambique", "Zambia", "Malawi", "DRC"].map((c) => (
                    <span key={c} className="border-b border-[color:var(--on-image)]/20 pb-1">{c}</span>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- SOLUTIONS ---------- */}
      <section className="mx-auto max-w-[1400px] px-5 py-[clamp(5rem,12vh,9rem)] sm:px-8 lg:px-12">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <h2
              className="font-display max-w-2xl text-[color:var(--ink)]"
              style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)", lineHeight: 1.04, letterSpacing: "-0.02em" }}
            >
              Configured to how your fleet actually runs.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <Link href="/solutions" className="group inline-flex items-center gap-2 text-sm font-medium text-[color:var(--accent)]">
              <span className="relative">
                All solutions
                <span className="absolute -bottom-1 left-0 h-px w-full bg-current opacity-40 transition-opacity group-hover:opacity-100" />
              </span>
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <div
            className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-5"
            style={{ scrollbarWidth: "thin" }}
          >
            {vehicleSolutions.map((s) => (
              <Link
                key={s.slug}
                href={`/solutions/${s.slug}`}
                className="group w-[78vw] shrink-0 snap-start sm:w-[42vw] lg:w-[29vw]"
              >
                <figure className="relative aspect-[4/3] w-full overflow-hidden bg-[color:var(--paper-2)]">
                  <img
                    src={s.imageSrc}
                    alt={s.imageAlt}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-contain p-6 transition-transform duration-[800ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.05]"
                  />
                </figure>
                <div className="mt-4 flex items-center justify-between border-t border-[color:var(--line)] pt-4">
                  <span className="text-base font-medium">{s.name}</span>
                  <span className="text-[color:var(--ink-3)] transition-all duration-300 group-hover:translate-x-1 group-hover:text-[color:var(--accent)]">→</span>
                </div>
              </Link>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ---------- HEAVY INDUSTRY BAND ---------- */}
      <section className="relative">
        <ParallaxImage
          src="/story/mining.webp"
          alt="A haul truck working heavy ground"
          className="h-[72vh] min-h-[460px] w-full"
          position="center"
          strength={12}
        />
        <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(16,13,8,0.7) 0%, rgba(16,13,8,0.2) 55%, transparent 100%)" }} />
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-8 lg:px-12">
            <div className="max-w-xl text-[color:var(--on-image)]">
              <h2 className="font-display" style={{ fontSize: "clamp(2rem, 5.2vw, 3.8rem)", lineHeight: 1.03, letterSpacing: "-0.02em" }}>
                <LineReveal lines={["Built for the", "hardest roads."]} />
              </h2>
              <Reveal delay={0.15}>
                <p className="mt-6 max-w-md text-lg leading-relaxed text-[color:var(--on-image)]/85">
                  Manufactured to CE and ISO standards with Tier-1 components —
                  from the yard to the pit to the open highway.
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- CLOSE + CONTACT ---------- */}
      <section id="contact" className="relative scroll-mt-20">
        <ParallaxImage
          src="/story/close.webp"
          alt="An open road heading into the landscape"
          className="min-h-[760px] w-full"
          position="center"
          strength={10}
        />
        <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(16,13,8,0.5) 0%, rgba(16,13,8,0.35) 45%, rgba(16,13,8,0.9) 100%)" }} />
        <div className="absolute inset-0 flex flex-col">
          <div className="flex flex-1 items-center">
            <div className="mx-auto w-full max-w-[1400px] px-5 py-28 sm:px-8 lg:px-12">
              <div className="max-w-3xl text-[color:var(--on-image)]">
                <h2 className="font-display" style={{ fontSize: "clamp(2.6rem, 7vw, 5.4rem)", lineHeight: 1, letterSpacing: "-0.025em" }}>
                  <LineReveal lines={["Your future", "starts with us."]} />
                </h2>
                <Reveal delay={0.15}>
                  <p className="mt-7 max-w-xl text-lg leading-relaxed text-[color:var(--on-image)]/85">
                    Tell us what you run and where it goes. We&apos;ll scope the
                    cameras, tracking, safety AI and monitoring around your fleet.
                  </p>
                </Reveal>
                <Reveal delay={0.25}>
                  <a
                    href={`mailto:${CONTACT.email}`}
                    className="group mt-10 inline-flex items-center gap-3 font-display text-2xl text-[color:var(--on-image)] sm:text-3xl"
                  >
                    <span className="relative">
                      {CONTACT.email}
                      <span className="absolute -bottom-1 left-0 h-px w-full bg-[color:var(--on-image)]/40 transition-all duration-300 group-hover:bg-[color:var(--on-image)]" />
                    </span>
                    <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
                  </a>
                  <div className="mt-8 flex flex-wrap gap-x-10 gap-y-3 text-sm text-[color:var(--on-image)]/75">
                    <a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`} className="hover:text-[color:var(--on-image)]">{CONTACT.phone}</a>
                    <a href={`tel:${CONTACT.phoneAlt.replace(/\s/g, "")}`} className="hover:text-[color:var(--on-image)]">{CONTACT.phoneAlt}</a>
                    <span>{CONTACT.addressLines.join(", ")}</span>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>

          <footer className="relative border-t border-[color:var(--on-image)]/15">
            <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-5 py-8 text-[color:var(--on-image)]/70 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
              <div className="flex items-baseline gap-2.5">
                <span className="font-display text-xl text-[color:var(--on-image)]">iCAM</span>
                <span className="text-[0.62rem] font-semibold uppercase tracking-[0.26em]">Video Telematics</span>
              </div>
              <p className="text-xs">
                {TAGLINE} · © {new Date().getFullYear()} iCAM Video Telematics ·
                Proudly South African
              </p>
            </div>
          </footer>
        </div>
      </section>
    </main>
  );
}
