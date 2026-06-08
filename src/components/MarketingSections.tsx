"use client";

import Image from "next/image";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { Reveal, Counter, ScrollReveal } from "@/components/Reveal";
import { CONTACT, STATS, TAGLINE } from "@/lib/brand";
import { solutions } from "@/lib/solutions";

const sectors = ["Transport", "Mining", "Construction", "Logistics", "Industrial"] as const;

const pillars = [
  {
    label: "Driver Safety",
    text: "ADAS and driver-fatigue AI warn before incidents — fatigue, distraction, phone use, headway and collision.",
  },
  {
    label: "Road & Fleet Safety",
    text: "Live video, GPS and sensor context in one platform so teams respond with proof, not guesswork.",
  },
  {
    label: "Fleet Optimisation",
    text: "Tier-1 hardware to CE/ISO standards, 450+ report layouts, and driver scoring that drives real change.",
  },
] as const;

const productSections = [
  {
    id: "video-telematics",
    title: "Vehicle Video Systems (MDVR)",
    intro:
      "HD in-vehicle cameras fused with telematics capture both what happened on the road and the vehicle data behind it — full context for every event.",
    bullets: [
      "1 to 16 camera channels with models to suit all vehicle types.",
      "Resolution configurable from VGA up to Full HD 1080P.",
      "64GB to 2TB onboard storage — up to ~900 hours of footage.",
      "Embedded GPS, Wi-Fi, 4G (SIM) and accelerometer on every device.",
      "Live stream, event/alarm-triggered clips, and historical footage by date/time.",
    ],
  },
  {
    id: "tracking-hardware",
    title: "Tracking & Telematics",
    intro:
      "An all-encompassing range of devices for any sector — tracking vehicles, machines, assets and trailers into the same platform as your video.",
    bullets: [
      "Continuous and event-triggered GPS reporting.",
      "CANBUS access plus third-party integration (fuel probes, temperature control).",
      "Driver ID, RFID buttons, two-way communication and satellite modules.",
      "Real-time speed, idle time, route history and trip detail.",
    ],
  },
  {
    id: "adas-safety",
    title: "Driver Fatigue & ADAS",
    intro:
      "On-board AI safety cameras detect risky behaviour early — alerting the control room and, where configured, the driver in-cab.",
    bullets: [
      "Fatigue and distraction warnings.",
      "Mobile-phone-use detection.",
      "Headway, collision and pedestrian warnings.",
      "Facial recognition available on the fatigue camera.",
    ],
  },
  {
    id: "platform-software",
    title: "Integrated Platform",
    intro:
      "One place for playback, maps, trips, alerts and reporting — built for control rooms and field teams alike.",
    bullets: [
      "Web, desktop, iOS and Android versions.",
      "Integrated telematics, video and fleet management.",
      "Customisable notifications and event timelines.",
      "Live positions, map trip playback and vehicle status on mobile.",
    ],
  },
  {
    id: "analytics-reporting",
    title: "Reports & Business Intelligence",
    intro:
      "Customizable reporting turns telematics and video into decisions — from utilisation and risk to driver coaching and leadership summaries.",
    bullets: [
      "450+ report setup/layout options across the fleet.",
      "Up to 10,000 possible data fields.",
      "Customized driver behaviour & scoring with your own weightings.",
      "Management-level down to per-vehicle and per-driver metrics.",
    ],
  },
  {
    id: "monitoring-support",
    title: "24/7 Bureau & Support",
    intro:
      "iCAM backs deployments with monitoring and technical services so hardware and software deliver in the field — not just on paper.",
    bullets: [
      "Vehicle recovery, alarm monitoring and incident management.",
      "Various monitoring packages, including video monitoring.",
      "Driver behaviour monitoring.",
      "1st and 2nd tier technical support on a 24/7 basis.",
    ],
  },
] as const;

const adasFeatures = [
  "Fatigue warning",
  "Distraction warning",
  "Mobile phone use",
  "Headway warning",
  "Collision warning",
  "Pedestrian warning",
  "Facial recognition",
] as const;

const operationsBands = [
  {
    title: "Control-room clarity",
    text: "Synchronised video, GPS and sensor data on one timeline so teams can validate incidents, coach drivers and escalate with confidence.",
    points: [
      "A single operational timeline across events, trips and footage.",
      "Faster triage through context-rich incident views.",
      "Aligned evidence for internal and external reporting.",
    ],
  },
  {
    title: "Field-ready reliability",
    text: "Manufactured to CE/ISO standards with Tier-1 quality, deployments are designed around harsh routes, long duty cycles and distributed teams.",
    points: [
      "Monitoring-bureau workflows for alarms and recovery support.",
      "Installation standards for heavy-industry operating conditions.",
      "Tier-1 technical support for rapid issue handling.",
    ],
  },
] as const;

const clientLogos = Array.from({ length: 8 }, () => "Your logo here");

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="font-hud text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--data-soft)]">
      {children}
    </p>
  );
}

export function MarketingSections() {
  return (
    <>
      {/* ---------- OVERVIEW ---------- */}
      <section
        id="overview"
        className="scroll-mt-24 overflow-hidden border-t border-[color:var(--border)] bg-[color:var(--background)] px-5 py-24 sm:px-8 sm:py-32"
      >
        <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start lg:gap-20">
          <Reveal direction="left">
            <SectionLabel>System Overview</SectionLabel>
            <h2 className="mt-6 text-balance text-3xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-[2.55rem] lg:text-[3.1rem] lg:leading-[1.08]">
              Integrated video telematics for{" "}
              <span className="text-[color:var(--accent)]">commercial fleets</span>
            </h2>
            <p className="mt-8 max-w-2xl text-pretty text-base leading-[1.85] text-[color:var(--text-muted)] sm:text-lg">
              iCAM Video Telematics is a proudly South African specialist that
              supplies, installs, maintains and monitors vehicle video systems,
              tracking &amp; telematics, ADAS/driver-fatigue systems, integrated
              platforms, BI reporting, and monitoring &amp; recovery — for the
              broader fleet, transport, construction and mining industries.
            </p>
            <p className="mt-6 max-w-2xl text-pretty text-base leading-[1.85] text-[color:var(--text-muted)] sm:text-lg">
              The result isn&apos;t just more data points — it&apos;s visual
              evidence and context together, reducing ambiguity and supporting
              proactive safety and operational decisions.
            </p>
            <div className="mt-9 flex flex-wrap gap-2.5">
              {sectors.map((s) => (
                <span
                  key={s}
                  className="font-hud inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-3.5 py-1.5 text-[11px] uppercase tracking-[0.14em] text-[color:var(--text-muted)]"
                >
                  {s}
                </span>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href="#services"
                className="inline-flex items-center justify-center rounded-md bg-[color:var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-[var(--shadow-accent)] transition hover:bg-[color:var(--accent-bright)]"
              >
                Explore the systems
              </a>
              <a
                href="#contact"
                className="inline-flex items-center justify-center rounded-md border border-[color:var(--border-strong)] px-6 py-3 text-sm font-semibold text-[color:var(--foreground)] transition hover:bg-[color:var(--surface)]"
              >
                Talk to our team
              </a>
            </div>
          </Reveal>

          <div className="space-y-8">
            {pillars.map((p) => (
              <ScrollReveal
                key={p.label}
                direction="right"
                distance={70}
                className="border-l-2 border-[color:var(--accent)] pl-5"
              >
                <p className="text-base font-semibold text-[color:var(--foreground)]">
                  {p.label}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-[color:var(--text-muted)]">
                  {p.text}
                </p>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* live stats strip */}
        <div className="mx-auto mt-16 grid max-w-6xl grid-cols-2 gap-y-8 border-y border-[color:var(--border)] py-10 lg:grid-cols-4 lg:gap-y-0 lg:divide-x lg:divide-[color:var(--border)]">
          {STATS.map((s, i) => (
            <ScrollReveal
              key={s.label}
              direction={i % 2 === 0 ? "left" : "right"}
              distance={60}
              className="px-2 lg:px-7"
            >
              <Counter
                value={s.value}
                className="font-hud text-3xl font-semibold text-[color:var(--foreground)] sm:text-4xl"
              />
              <p className="mt-2 text-sm font-medium text-[color:var(--accent-on-dark)]">
                {s.label}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[color:var(--text-faint)]">
                {s.note}
              </p>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ---------- CORE SYSTEMS (grid) ---------- */}
      <section
        id="services"
        className="scroll-mt-24 overflow-hidden border-t border-[color:var(--border)] bg-[color:var(--surface)] px-5 py-20 sm:px-8 sm:py-28"
      >
        <div className="mx-auto max-w-6xl">
          <Reveal className="max-w-3xl">
            <SectionLabel>Core Products &amp; Systems</SectionLabel>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-[2.5rem]">
              One connected operating system for fleets
            </h2>
            <p className="mt-5 text-base leading-[1.8] text-[color:var(--text-muted)] sm:text-lg">
              From capture and tracking to safety AI, BI reporting and recovery
              support — each capability is built to work together.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-x-14 gap-y-12 md:grid-cols-2">
            {productSections.map((p, i) => (
              <ScrollReveal
                key={p.id}
                direction={i % 2 === 0 ? "left" : "right"}
                distance={60}
              >
                <div id={p.id} className="scroll-mt-24 border-t border-[color:var(--border)] pt-6">
                  <div className="flex items-center gap-3">
                    <span className="font-hud text-sm tabular-nums font-semibold text-[color:var(--accent-on-dark)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-xl font-semibold tracking-tight text-[color:var(--foreground)]">
                      {p.title}
                    </h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-muted)]">
                    {p.intro}
                  </p>
                  <ul className="mt-4 space-y-2.5">
                    {p.bullets.map((b) => (
                      <li
                        key={b}
                        className="flex gap-2.5 text-sm leading-relaxed text-[color:var(--text-muted)]"
                      >
                        <span
                          className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--accent-on-dark)]"
                          aria-hidden
                        />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- ADAS SAFETY BAND ---------- */}
      <section className="overflow-hidden border-t border-[color:var(--border)] bg-[color:var(--bg-deep)] px-5 py-24 sm:px-8 sm:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <Reveal direction="left">
            <SectionLabel>AI Driver Safety</SectionLabel>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-[2.5rem]">
              Warnings before incidents — not after
            </h2>
            <p className="mt-5 text-base leading-[1.8] text-[color:var(--text-muted)] sm:text-lg">
              iCAM&apos;s on-board Fatigue &amp; ADAS cameras watch the road and
              the driver, raising in-cab and control-room alerts the moment risk
              appears.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 gap-x-10 sm:grid-cols-2">
            {adasFeatures.map((f, i) => (
              <ScrollReveal
                key={f}
                direction={i % 2 === 0 ? "left" : "right"}
                distance={50}
                className="flex items-center gap-3 border-b border-[color:var(--border)] py-3.5"
              >
                <svg
                  className="h-4 w-4 shrink-0 text-[color:var(--accent-on-dark)]"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M3.5 8.5l3 3 6-7"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-sm font-medium text-[color:var(--foreground)]">
                  {f}
                </span>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- SOLUTIONS TEASER ---------- */}
      <section className="overflow-hidden border-t border-[color:var(--border)] bg-[color:var(--background)] px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <SectionLabel>Solutions by Vehicle Type</SectionLabel>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-[2.5rem]">
                Configured to how your fleet actually runs
              </h2>
            </div>
            <Link
              href="/solutions"
              className="font-hud text-xs uppercase tracking-[0.2em] text-[color:var(--data-soft)] transition hover:text-[color:var(--accent)]"
            >
              View all solutions →
            </Link>
          </Reveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {solutions
              .filter((s) => s.slug !== "all")
              .map((item, i) => (
                <ScrollReveal
                  key={item.slug}
                  direction={i % 2 === 0 ? "left" : "right"}
                  distance={90}
                >
                  <Link
                    href={`/solutions/${item.slug}`}
                    className="group block overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] transition hover:-translate-y-1 hover:border-[color:var(--accent)]"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-[color:var(--surface-elevated)]">
                      <Image
                        src={item.imageSrc}
                        alt={item.imageAlt}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex items-center justify-between p-5">
                      <span className="text-base font-semibold text-[color:var(--foreground)]">
                        {item.name}
                      </span>
                      <span className="font-hud text-xs text-[color:var(--text-faint)] transition group-hover:text-[color:var(--accent)]">
                        OPEN →
                      </span>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
          </div>
        </div>
      </section>

      {/* ---------- OPERATIONS ---------- */}
      <section
        className="overflow-hidden border-t border-[color:var(--border)] bg-[color:var(--surface)] px-5 py-20 sm:px-8 sm:py-24"
        aria-labelledby="ops-heading"
      >
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <SectionLabel>Operations &amp; Support</SectionLabel>
            <h2
              id="ops-heading"
              className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-4xl"
            >
              Built for heavy industry, backed 24/7
            </h2>
          </Reveal>
          <div className="mt-12 space-y-12">
            {operationsBands.map((band, i) => (
              <ScrollReveal key={band.title} direction={i % 2 === 0 ? "left" : "right"} distance={60}>
                <div className="grid gap-6 border-t border-[color:var(--border)] pt-8 lg:grid-cols-[0.4fr_0.6fr] lg:gap-10">
                  <div>
                    <span className="font-hud text-xs tabular-nums text-[color:var(--accent-on-dark)]">
                      0{i + 1}
                    </span>
                    <h3 className="mt-3 text-2xl font-semibold tracking-tight text-[color:var(--foreground)]">
                      {band.title}
                    </h3>
                    <p className="mt-4 text-sm leading-[1.8] text-[color:var(--text-muted)]">
                      {band.text}
                    </p>
                  </div>
                  <ul className="grid content-center gap-3">
                    {band.points.map((line) => (
                      <li
                        key={line}
                        className="flex gap-3 text-sm leading-relaxed text-[color:var(--text-muted)]"
                      >
                        <span
                          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--accent-on-dark)]"
                          aria-hidden
                        />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CLIENTS MARQUEE ---------- */}
      <section className="border-t border-[color:var(--border)] bg-[color:var(--background)] px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionLabel>Trusted across heavy industry</SectionLabel>
          <div className="mt-8 overflow-hidden py-2">
            <div className="client-marquee-track">
              {[...clientLogos, ...clientLogos].map((name, i) => (
                <div
                  key={`${name}-${i}`}
                  className="font-hud mx-6 inline-flex min-w-[9rem] items-center justify-center text-xs uppercase tracking-[0.18em] text-[color:var(--text-faint)]"
                >
                  {name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- CONTACT ---------- */}
      <section
        id="contact"
        className="scroll-mt-24 border-t border-[color:var(--border)] bg-[color:var(--surface)] px-5 py-24 sm:px-8 sm:py-32"
      >
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <SectionLabel>Get In Touch</SectionLabel>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-[2.7rem]">
              {TAGLINE}.
            </h2>
            <p className="mt-6 text-base leading-[1.8] text-[color:var(--text-muted)] sm:text-lg">
              Share your fleet profile, sectors and regions — we&apos;ll help you
              scope cameras, tracking hardware, ADAS, integrations and rollout
              across South African and cross-border operations.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a
              href={`mailto:${CONTACT.email}`}
              className="inline-flex items-center justify-center rounded-md bg-[color:var(--accent)] px-8 py-3.5 text-sm font-semibold text-white shadow-[var(--shadow-accent)] transition hover:bg-[color:var(--accent-bright)]"
            >
              {CONTACT.email}
            </a>
            <a
              href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}
              className="font-hud inline-flex items-center justify-center rounded-md border border-[color:var(--border-strong)] px-8 py-3.5 text-sm font-semibold text-[color:var(--foreground)] transition hover:bg-[color:var(--background)]"
            >
              {CONTACT.phone}
            </a>
          </Reveal>

          <Reveal delay={0.16} className="mt-8 text-sm leading-relaxed text-[color:var(--text-faint)]">
            {CONTACT.addressLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-[color:var(--border)] bg-[color:var(--bg-deep)] px-5 py-12 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-md">
          <div className="flex items-center gap-3">
            <span className="inline-flex shrink-0" aria-hidden>
              <BrandLogo className="h-10 w-auto sm:h-11" alt="" priority={false} />
            </span>
            <span className="text-sm font-semibold text-[color:var(--foreground)]">
              iCAM Video Telematics
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-faint)]">
            Proudly South African provider of integrated video telematics, GPS
            tracking, ADAS/driver-fatigue AI, BI reporting and 24/7 monitoring
            for transport, mining, construction, logistics and industry.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-sm text-[color:var(--text-faint)] sm:items-end sm:text-right">
          <a
            href={`mailto:${CONTACT.email}`}
            className="text-[color:var(--text-muted)] transition hover:text-[color:var(--foreground)]"
          >
            {CONTACT.email}
          </a>
          <a
            href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}
            className="font-hud transition hover:text-[color:var(--foreground)]"
          >
            {CONTACT.phone} · {CONTACT.phoneAlt}
          </a>
          {CONTACT.addressLines.map((line) => (
            <span key={line}>{line}</span>
          ))}
          <span className="mt-2 opacity-70">
            © {new Date().getFullYear()} iCAM Video Telematics. All rights
            reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
