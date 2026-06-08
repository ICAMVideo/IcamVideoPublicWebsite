"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  BarChart3,
  Camera,
  CarFront,
  FileBadge2,
  Gauge,
  LocateFixed,
  Monitor,
  PlugZap,
  Radio,
  Smartphone,
  ShieldAlert,
  Siren,
  UserRound,
  UsersRound,
  KeyRound,
  Tv,
  DoorOpen,
  Truck,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

type ModuleSeed = {
  label: string;
  icon: LucideIcon;
  detail: string;
};

const RING_MODULES: ModuleSeed[] = [
  { label: "Integration", icon: Wrench, detail: "Integration layer connecting third-party tools and workflows into one platform." },
  { label: "Video Unit (MDVR)", icon: Camera, detail: "Core recording hub with event capture, live streaming and remote playback." },
  { label: "Cameras", icon: Camera, detail: "Multi-channel camera layout for full vehicle and environment coverage." },
  { label: "Fatigue Camera", icon: AlertTriangle, detail: "Driver-facing AI stream with fatigue, distraction and phone-use alerts." },
  { label: "ADAS Camera", icon: CarFront, detail: "Forward-safety feed for collision, headway and pedestrian warnings." },
  { label: "Ext. Cameras", icon: ShieldAlert, detail: "Extended camera channels for additional blind-spot visibility." },
  { label: "People Counter", icon: UsersRound, detail: "Passenger / occupancy counting for utilisation and operations." },
  { label: "GPS Location", icon: LocateFixed, detail: "Live location, route replay and trip breadcrumb context." },
  { label: "CANBUS", icon: PlugZap, detail: "Vehicle telemetry integration for engine, fuel and behaviour signals." },
  { label: "Voice Comms", icon: Radio, detail: "Two-way voice communication with control-room connectivity." },
  { label: "Driver ID", icon: FileBadge2, detail: "Driver authentication for accountability and shift attribution." },
  { label: "Onboard Screen", icon: Tv, detail: "In-cab screen for playback, prompts and workflow status." },
  { label: "Door Switch", icon: DoorOpen, detail: "Door-activity monitoring for security and audit trails." },
  { label: "PTO Switch", icon: KeyRound, detail: "PTO state tracking for work-cycle and utilisation insights." },
  { label: "Crash Alert", icon: Siren, detail: "Immediate impact alerts with linked video and telemetry." },
  { label: "Jamming Detection", icon: Radio, detail: "Signal-interference detection for anti-tamper workflows." },
  { label: "Driver Behaviour", icon: UserRound, detail: "Driving-behaviour trends and scoring for coaching and risk reduction." },
  { label: "Reports & BI", icon: BarChart3, detail: "450+ operational, safety and compliance report layouts in one stack." },
  { label: "24/7 Bureau", icon: Gauge, detail: "Continuous monitoring, alarm handling and escalation support." },
  { label: "Theft Recovery", icon: Truck, detail: "Incident response with map, video and recovery-workflow context." },
  { label: "Web System", icon: Monitor, detail: "Web portal for operations, playback and reporting." },
  { label: "iOS / Android App", icon: Smartphone, detail: "Mobile access for live views, events and operational status." },
];

type Hotspot = ModuleSeed & { id: string; left: number; top: number };

function buildHotspots(seeds: ModuleSeed[]): Hotspot[] {
  const cx = 50;
  const cy = 50;
  const rx = 45.5;
  const ry = 43;
  const start = -90; // first pin at top
  return seeds.map((seed, i) => {
    const a = ((start + (360 / seeds.length) * i) * Math.PI) / 180;
    return {
      ...seed,
      id: seed.label.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      left: cx + rx * Math.cos(a),
      top: cy + ry * Math.sin(a),
    };
  });
}

type Props = {
  imageSrc?: string;
  imageAlt?: string;
  name?: string;
};

export function FuelTankerInteractive({
  imageSrc = "/FuelSolution/truck.png",
  imageAlt = "Vehicle telematics layout",
  name = "Vehicle",
}: Props) {
  const hotspots = useMemo(() => buildHotspots(RING_MODULES), []);
  const [activeId, setActiveId] = useState(hotspots[0].id);
  const active = hotspots.find((h) => h.id === activeId) ?? hotspots[0];
  const ActiveIcon = active.icon;

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
      {/* ---- Stage ---- */}
      <div className="relative aspect-[5/4] overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] sm:aspect-[16/11]">
        <div className="pointer-events-none absolute inset-0 hud-grid opacity-60" />

        {/* concentric rings */}
        {[0.58, 0.78, 0.98].map((s) => (
          <div
            key={s}
            className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[color:var(--border)]"
            style={{ transform: `translate(-50%,-50%) scale(${s})` }}
          />
        ))}

        {/* active module chip */}
        <div className="absolute left-4 top-4 z-20 flex items-center gap-2">
          <span className="font-hud text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-faint)]">
            {name}
          </span>
        </div>
        <div className="absolute right-4 top-4 z-20">
          <AnimatePresence mode="wait">
            <motion.span
              key={active.id}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.2 }}
              className="font-hud inline-flex items-center gap-1.5 rounded-full border border-[color:var(--border-strong)] bg-[color:var(--surface-elevated)] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[color:var(--data-soft)]"
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--accent)]" />
              {active.label}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* centre vehicle */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[44%] w-[52%] -translate-x-1/2 -translate-y-1/2">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="(max-width: 1024px) 60vw, 38vw"
            className="object-contain drop-shadow-[0_10px_24px_rgba(0,0,0,0.35)]"
            priority={false}
          />
        </div>

        {/* hotspots */}
        {hotspots.map((spot) => {
          const isActive = spot.id === active.id;
          const SpotIcon = spot.icon;
          return (
            <button
              key={spot.id}
              type="button"
              title={spot.label}
              aria-label={spot.label}
              aria-pressed={isActive}
              onClick={() => setActiveId(spot.id)}
              style={{ left: `${spot.left}%`, top: `${spot.top}%` }}
              className={`absolute z-10 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border transition-all duration-300 ${
                isActive
                  ? "scale-125 border-transparent bg-[color:var(--accent)] text-white shadow-[var(--shadow-accent)]"
                  : "border-[color:var(--border-strong)] bg-[color:var(--surface-elevated)] text-[color:var(--text-muted)] hover:scale-110 hover:border-[color:var(--accent)] hover:text-[color:var(--foreground)]"
              }`}
            >
              <SpotIcon className="h-4 w-4" aria-hidden />
              {isActive ? (
                <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[color:var(--accent)] opacity-30" />
              ) : null}
            </button>
          );
        })}
      </div>

      {/* ---- Detail panel ---- */}
      <aside className="hud-corners rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5 sm:p-6">
        <p className="font-hud text-[10px] font-semibold uppercase tracking-[0.24em] text-[color:var(--data-soft)]">
          Interactive Points
        </p>

        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
            className="mt-4"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--accent)] text-white">
                <ActiveIcon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="text-lg font-semibold tracking-tight text-[color:var(--foreground)]">
                {active.label}
              </h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-muted)]">
              {active.detail}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="mt-5 border-t border-[color:var(--border)] pt-4">
          <p className="font-hud text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-faint)]">
            {RING_MODULES.length} modules
          </p>
          <ul className="mt-3 max-h-[20rem] space-y-1.5 overflow-y-auto pr-1">
            {hotspots.map((spot) => {
              const isActive = spot.id === active.id;
              const SpotIcon = spot.icon;
              return (
                <li key={spot.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(spot.id)}
                    className={`flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-sm transition ${
                      isActive
                        ? "border-[color:var(--accent)] bg-[color:var(--surface-elevated)] text-[color:var(--foreground)]"
                        : "border-transparent text-[color:var(--text-muted)] hover:border-[color:var(--border)] hover:bg-[color:var(--surface-elevated)] hover:text-[color:var(--foreground)]"
                    }`}
                  >
                    <SpotIcon
                      className={`h-4 w-4 shrink-0 ${
                        isActive
                          ? "text-[color:var(--accent)]"
                          : "text-[color:var(--text-faint)]"
                      }`}
                      aria-hidden
                    />
                    {spot.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>
    </div>
  );
}
