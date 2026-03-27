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

          <aside className="border border-[color:var(--border)] bg-[color:var(--surface)] p-8 shadow-[0_1px_0_rgba(15,20,25,0.04)] sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              At a glance
            </p>
            <ul className="mt-8 space-y-8">
              {pillars.map((p) => (
                <li
                  key={p.label}
                  className="border-l-2 border-[color:var(--accent)] pl-5"
                >
                  <p className="text-sm font-semibold text-zinc-900">{p.label}</p>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                    {p.text}
                  </p>
                </li>
              ))}
            </ul>
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
              Hardware, software, and services in one stack
            </h2>
            <p className="mt-5 text-base leading-[1.75] text-zinc-600 sm:text-lg">
              From in-vehicle capture and sensors to dashboards, analytics, and
              24/7 monitoring—each layer is designed to work together so your
              fleet sees the full picture.
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-3xl space-y-16 border-t border-[color:var(--border)] pt-16">
            {productSections.map((block, i) => (
              <article
                key={block.id}
                id={block.id}
                className="scroll-mt-28 border-b border-[color:var(--border)] pb-16 last:border-b-0 last:pb-0"
              >
                <p className="text-xs font-semibold tabular-nums text-zinc-400">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
                  {block.title}
                </h3>
                <p className="mt-4 text-base leading-[1.75] text-zinc-600">
                  {block.intro}
                </p>
                <BulletList items={block.bullets} />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="border-t border-zinc-800 bg-zinc-950 px-5 py-20 text-zinc-100 sm:px-8 sm:py-24"
        aria-labelledby="ops-heading"
      >
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--accent-on-dark)]">
                Operations & support
              </p>
              <h2
                id="ops-heading"
                className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl"
              >
                From reactive incidents to proactive fleet control
              </h2>
              <p className="mt-6 text-base leading-[1.75] text-zinc-400">
                South African and regional fleets face high-liability routes,
                remote sites, and round-the-clock movement. iCAM combines
                structured data, video, and bureau services so control rooms and
                field teams can act quickly—with reporting that stands up to
                internal review, insurers, and regulators.
              </p>
            </div>
            <ul className="space-y-5">
              {[
                "Synchronised video, GPS, and sensor data in one timeline and reporting layer.",
                "Monitoring bureau services for alarms, recovery, and escalation—not just software licenses.",
                "Installation and tier-1 support aimed at reliable uptime in harsh operating environments.",
              ].map((line) => (
                <li
                  key={line}
                  className="flex gap-3 text-sm leading-relaxed text-zinc-300"
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
