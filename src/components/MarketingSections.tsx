import { BrandLogo } from "@/components/BrandLogo";

const sectors = [
  "Transport",
  "Mining",
  "Construction",
  "Logistics",
  "Industrial",
] as const;

const pillars = [
  {
    label: "One ecosystem",
    text: "Video, GPS, telematics, driver analytics, and BI reporting in a single platform—web, desktop, and mobile.",
  },
  {
    label: "Evidence plus context",
    text: "Visual proof alongside sensor and location data so teams respond with clarity—not guesswork.",
  },
  {
    label: "Built for heavy industry",
    text: "Deployments aligned to how commercial fleets run in transport, resources, construction, and logistics.",
  },
] as const;

const productSections = [
  {
    id: "video-telematics",
    title: "Video telematics systems",
    intro:
      "High-definition in-vehicle cameras integrated with telematics hardware capture both what happened on the road and the vehicle data behind it—giving managers a contextualised view of operations.",
    bullets: [
      "Multi-camera configurations with up to 16 channels for road-facing and driver-facing coverage.",
      "Configurable resolutions from VGA through to Full HD (1080p).",
      "Event-triggered recording for accidents, harsh braking, speeding, collisions, and alarms—with historical footage by date and time.",
      "GPS, accelerometers, Wi-Fi, and cellular connectivity (4G / SIM) on devices.",
      "Live video streaming over mobile networks for real-time visibility when it matters.",
    ],
  },
  {
    id: "tracking-hardware",
    title: "Tracking & telematics hardware",
    intro:
      "Beyond video, iCAM supplies tracking devices that monitor location and vehicle status continuously, with sensor data fed back into the same central platform as your video and events.",
    bullets: [
      "GPS under continuous and event-triggered reporting.",
      "Support for CANBus, fuel probes, temperature sensors, driver ID (RFID), two-way communication, and satellite modules where required.",
      "Real-time speed, idle time, route history, and trip detail.",
    ],
  },
  {
    id: "adas-safety",
    title: "Driver fatigue & ADAS",
    intro:
      "AI-enabled safety cameras and systems detect risky behaviour early—alerting the control room and, where configured, the driver in-cab to help prevent incidents before they escalate.",
    bullets: [
      "Fatigue and drowsiness alerts.",
      "Distraction and mobile phone use detection.",
      "Headway warnings, collision alerts, and pedestrian detection.",
      "Facial recognition on select camera systems.",
    ],
  },
  {
    id: "platform-software",
    title: "Platform software & interfaces",
    intro:
      "The stack is designed for day-to-day fleet operations: one place for playback, maps, trips, alerts, and reporting—whether your team works from a control room or the field.",
    bullets: [
      "Web dashboard, desktop client, and mobile apps (iOS & Android).",
      "Integrated video playback, GPS, trip history, event timelines, alerts, reporting, and analytics.",
      "Customisable notifications via app, web, email, or SMS.",
      "Mobile access to live positions, event markers, map trip playback, and vehicle status.",
    ],
  },
  {
    id: "analytics-reporting",
    title: "Analytics, intelligence & reporting",
    intro:
      "Business intelligence and reporting turn telematics and video into decisions—from utilisation and risk to driver coaching and leadership summaries.",
    bullets: [
      "Extensive report library (450+ templates) spanning utilisation, driver performance, trips, risk exposure, and more.",
      "Driver scoring and behaviour reporting to highlight patterns and improvement areas.",
      "Fleet efficiency, cost, productivity, and operational effectiveness analysis.",
    ],
  },
  {
    id: "monitoring-support",
    title: "Monitoring & support services",
    intro:
      "iCAM backs deployments with monitoring and technical services so hardware and software deliver in the field—not only on paper.",
    bullets: [
      "24/7 monitoring bureau including vehicle recovery and alarm handling.",
      "Professional installation and deployment expertise.",
      "Tier-1 support for customers and technical teams.",
    ],
  },
] as const;

const operationsBands = [
  {
    title: "Control room clarity",
    text: "Synchronised video, GPS, and sensor data in one timeline so teams can validate incidents, coach drivers, and escalate with confidence.",
    points: [
      "Single operational timeline across events, trips, and footage.",
      "Faster triage through context-rich incident views.",
      "Aligned evidence for internal and external reporting.",
    ],
  },
  {
    title: "Field-ready reliability",
    text: "Deployments and support are designed around harsh routes, long duty cycles, and distributed teams that need dependable uptime.",
    points: [
      "Monitoring bureau workflows for alarms and recovery support.",
      "Installation standards for heavy-industry operating conditions.",
      "Tier-1 technical support for rapid issue handling.",
    ],
  },
] as const;

const proofCards = [
  { label: "Coverage", value: "24/7", note: "Monitoring and escalation support" },
  { label: "Report library", value: "450+", note: "Operational, safety, and BI templates" },
  { label: "Platform access", value: "3", note: "Web, desktop, and mobile interfaces" },
  { label: "Camera channels", value: "Up to 16", note: "Flexible in-vehicle configurations" },
] as const;

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--accent)]">
      {children}
    </p>
  );
}

function BulletList({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-5 space-y-3 text-sm leading-relaxed text-zinc-600">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span
            className="mt-2 h-1 w-1 shrink-0 rounded-full bg-zinc-400"
            aria-hidden
          />
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

export function MarketingSections() {
  return (
    <>
      <section
        id="overview"
        className="scroll-mt-24 border-t border-[color:var(--border)] bg-[color:var(--background)] px-5 py-20 sm:px-8 sm:py-28"
      >
        <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-20 lg:items-start">
          <div>
            <SectionLabel>Overview</SectionLabel>
            <h1 className="mt-5 text-balance text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl lg:text-[2.65rem] lg:leading-[1.12]">
              Integrated video telematics for commercial fleets
            </h1>
            <p className="mt-8 max-w-xl text-pretty text-base leading-[1.75] text-zinc-600 sm:text-lg">
              iCAM Video Telematics is a South African technology provider
              specialising in video-enabled fleet telematics and vehicle
              monitoring for commercial operators across transport, mining,
              construction, logistics, and industrial sectors. The platform
              unites advanced video, GPS tracking, telematics data, driver
              behaviour analytics, AI-assisted safety monitoring, and business
              intelligence—accessible through a unified ecosystem on web and
              mobile devices.
            </p>
            <p className="mt-6 max-w-xl text-pretty text-base leading-[1.75] text-zinc-600 sm:text-lg">
              The result is not just more data points, but visual evidence and
              context together—reducing ambiguity, improving response times, and
              supporting proactive safety and operational decisions.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {sectors.map((s) => (
                <span
                  key={s}
                  className="inline-flex border border-zinc-200 bg-[color:var(--surface)] px-3 py-1 text-xs font-medium text-zinc-700"
                >
                  {s}
                </span>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href="#services"
                className="inline-flex items-center justify-center border border-zinc-900/15 bg-[color:var(--surface)] px-5 py-2.5 text-sm font-semibold text-zinc-900 shadow-sm transition hover:border-zinc-900/25 hover:bg-[color:var(--surface-elevated)]"
              >
                Core products & systems
              </a>
              <a
                href="#contact"
                className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-zinc-700 underline decoration-zinc-300 underline-offset-4 transition hover:text-zinc-900 hover:decoration-zinc-500"
              >
                Request a conversation
              </a>
            </div>
          </div>

          <aside className="space-y-4">
            {pillars.map((p) => (
              <div
                key={p.label}
                className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-[0_1px_0_rgba(15,20,25,0.04)]"
              >
                <p className="text-sm font-semibold text-zinc-900">{p.label}</p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                  {p.text}
                </p>
              </div>
            ))}
            <PlaceholderVisual title="Platform map & command center snapshot" />
          </aside>
        </div>
      </section>

      <section
        id="services"
        className="scroll-mt-24 border-t border-[color:var(--border)] bg-[color:var(--surface)] px-5 py-20 sm:px-8 sm:py-28"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <SectionLabel>Core products & systems</SectionLabel>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
              Horizontal service carousel
            </h2>
            <p className="mt-5 text-base leading-[1.75] text-zinc-600 sm:text-lg">
              Scroll sideways through service cards. Each card keeps one clear
              capability story with supporting bullets.
            </p>
          </div>

          <div className="mt-12 overflow-x-auto pb-2 [scrollbar-width:thin]">
            <div className="flex snap-x snap-mandatory gap-5">
              {productSections.map((block, i) => (
                <article
                  key={block.id}
                  id={block.id}
                  className="min-w-[86%] snap-start rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_8px_24px_-18px_rgba(15,23,42,0.45)] sm:min-w-[70%] lg:min-w-[46%]"
                >
                  <p className="text-xs font-semibold tabular-nums text-zinc-400">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold tracking-tight text-zinc-900">
                    {block.title}
                  </h3>
                  <p className="mt-4 text-sm leading-[1.7] text-zinc-600">
                    {block.intro}
                  </p>
                  <BulletList items={block.bullets} />
                  <div className="mt-6">
                    <PlaceholderVisual title={`${block.title} visual placeholder`} />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        className="border-t border-[color:var(--border)] bg-[color:var(--surface-elevated)] px-5 py-20 sm:px-8 sm:py-24"
        aria-labelledby="ops-heading"
      >
        <div className="mx-auto max-w-6xl">
          <SectionLabel>Operations & support</SectionLabel>
          <h2
            id="ops-heading"
            className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl"
          >
            Alternating two-column operational depth
          </h2>
          <div className="mt-12 space-y-6">
            {operationsBands.map((band, i) => (
              <article
                key={band.title}
                className={`grid gap-6 rounded-2xl border border-zinc-200 p-6 sm:p-8 lg:grid-cols-2 lg:gap-10 ${
                  i % 2 === 0 ? "bg-white" : "bg-zinc-950 text-zinc-100"
                }`}
              >
                <div className={i % 2 === 0 ? "" : "lg:order-2"}>
                  <h3
                    className={`text-2xl font-semibold tracking-tight ${
                      i % 2 === 0 ? "text-zinc-900" : "text-white"
                    }`}
                  >
                    {band.title}
                  </h3>
                  <p
                    className={`mt-4 text-sm leading-[1.8] ${
                      i % 2 === 0 ? "text-zinc-600" : "text-zinc-300"
                    }`}
                  >
                    {band.text}
                  </p>
                  <ul className="mt-5 space-y-3">
                    {band.points.map((line) => (
                      <li
                        key={line}
                        className={`flex gap-3 text-sm leading-relaxed ${
                          i % 2 === 0 ? "text-zinc-700" : "text-zinc-300"
                        }`}
                      >
                        <span
                          className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${
                            i % 2 === 0
                              ? "bg-[color:var(--accent)]"
                              : "bg-[color:var(--accent-on-dark)]"
                          }`}
                          aria-hidden
                        />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={i % 2 === 0 ? "" : "lg:order-1"}>
                  <PlaceholderVisual title={`${band.title} schematic placeholder`} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-800 bg-zinc-950 px-5 py-16 text-zinc-100 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <SectionLabel>Proof points</SectionLabel>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {proofCards.map((card) => (
              <article
                key={card.label}
                className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5"
              >
                <p className="text-xs uppercase tracking-[0.15em] text-zinc-400">
                  {card.label}
                </p>
                <p className="mt-3 text-2xl font-semibold text-white">
                  {card.value}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {card.note}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="contact"
        className="scroll-mt-24 border-t border-[color:var(--border)] bg-[color:var(--surface-elevated)] px-5 py-20 sm:px-8 sm:py-28"
      >
        <div className="mx-auto max-w-2xl text-center">
          <SectionLabel>Contact</SectionLabel>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            Speak with our team
          </h2>
          <p className="mt-6 text-base leading-relaxed text-zinc-600 sm:text-lg">
            Share your fleet profile, sectors, and regions—we&apos;ll help you
            scope cameras, tracking hardware, integrations, and rollout for
            South African and cross-border operations.
          </p>
          <a
            href="mailto:hello@icamvideo.com"
            className="mt-10 inline-flex items-center justify-center bg-[color:var(--accent)] px-10 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[color:var(--accent-bright)]"
          >
            hello@icamvideo.com
          </a>
          <p className="mt-4 text-xs text-zinc-500">
            Typical response within two business days.
          </p>
        </div>
      </section>

      <footer className="border-t border-zinc-800 bg-zinc-950 px-5 py-12 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="inline-flex shrink-0" aria-hidden>
                <BrandLogo
                  className="h-10 w-auto sm:h-11"
                  alt=""
                  priority={false}
                />
              </span>
              <span className="text-sm font-semibold text-white">
                iCAM Video Telematics
              </span>
            </div>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
              South African provider of integrated video telematics, GPS
              tracking, AI-assisted safety, and fleet intelligence for transport,
              mining, construction, logistics, and industry.
            </p>
          </div>
          <div className="flex flex-col gap-4 text-sm text-zinc-500 sm:items-end">
            <a
              href="mailto:hello@icamvideo.com"
              className="text-zinc-400 transition hover:text-white"
            >
              hello@icamvideo.com
            </a>
            <span className="text-zinc-600">
              © {new Date().getFullYear()} iCAM Video. All rights reserved.
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
