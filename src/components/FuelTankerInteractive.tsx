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

type Hotspot = {
  id: string;
  label: string;
  left: string;
  top: string;
  detail: string;
  icon: LucideIcon;
  moduleImageSrc?: string;
};

type ModuleSeed = {
  label: string;
  icon: LucideIcon;
  detail: string;
};

const RING_MODULES: ModuleSeed[] = [
  {
    label: "INTEGRATION",
    icon: Wrench,
    detail: "Integration layer connecting third-party tools and workflows.",
  },
  {
    label: "VIDEO UNIT",
    icon: Camera,
    detail: "Core recording hub with event capture and remote playback support.",
  },
  {
    label: "CAMERAS",
    icon: Camera,
    detail: "Multi-camera layout for vehicle and environment coverage.",
  },
  {
    label: "FATIGUE CAMERA",
    icon: AlertTriangle,
    detail: "Driver-facing stream with fatigue and distraction alerts.",
  },
  {
    label: "ADAS CAMERA",
    icon: CarFront,
    detail: "Forward-safety feed for collision and lane-related events.",
  },
  {
    label: "EXD CAMERAS",
    icon: ShieldAlert,
    detail: "Extended camera channels for additional blind-spot visibility.",
  },
  {
    label: "PEOPLE COUNTER",
    icon: UsersRound,
    detail: "Passenger/occupancy counting for utilization and operations.",
  },
  {
    label: "GPS LOCATION",
    icon: LocateFixed,
    detail: "Live location, route replay, and trip breadcrumb context.",
  },
  {
    label: "CANBUS",
    icon: PlugZap,
    detail: "Vehicle telemetry integration for engine and behavior signals.",
  },
  {
    label: "VOICE COMMS",
    icon: Radio,
    detail: "Two-way voice communication with control-room connectivity.",
  },
  {
    label: "DRIVER ID",
    icon: FileBadge2,
    detail: "Driver authentication for accountability and shift attribution.",
  },
  {
    label: "ONBOARD SCREEN",
    icon: Tv,
    detail: "In-cab screen for playback, prompts, and workflow status.",
  },
  {
    label: "DOOR SWITCH",
    icon: DoorOpen,
    detail: "Door activity monitoring for security and audit trails.",
  },
  {
    label: "PTO SWITCH",
    icon: KeyRound,
    detail: "PTO state tracking for work-cycle and utilization insights.",
  },
  {
    label: "CRASH ALERT",
    icon: Siren,
    detail: "Immediate impact alerts with linked video and telemetry.",
  },
  {
    label: "JAMMING DETECTION",
    icon: Radio,
    detail: "Signal-interference detection for anti-tamper workflows.",
  },
  {
    label: "DRIVER BEHAVIOUR",
    icon: UserRound,
    detail: "Driving behavior trends for coaching and risk reduction.",
  },
  {
    label: "REPORTS & BI ANALYTICS",
    icon: BarChart3,
    detail: "Operational, safety, and compliance reporting in one stack.",
  },
  {
    label: "24/7 BUREAU",
    icon: Gauge,
    detail: "Continuous monitoring and escalation support services.",
  },
  {
    label: "THEFT RECOVERY",
    icon: Truck,
    detail: "Incident response with map, video, and recovery workflow context.",
  },
  {
    label: "WEB SYSTEM",
    icon: Monitor,
    detail: "Web portal for operations, playback, and reporting.",
  },
  {
    label: "ANDROID / IOS APP",
    icon: Smartphone,
    detail: "Mobile access for live views, events, and operational status.",
  },
];

function toHotspots(seeds: ModuleSeed[]): Hotspot[] {
  const centerX = 50;
  const centerY = 51;
  const radiusX = 34;
  const radiusY = 35;
  const startDeg = -125;
  return seeds.map((seed, i) => {
    const angle = ((startDeg + (360 / seeds.length) * i) * Math.PI) / 180;
    return {
      id: seed.label.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      label: seed.label,
      left: `${centerX + radiusX * Math.cos(angle)}%`,
      top: `${centerY + radiusY * Math.sin(angle)}%`,
      detail: seed.detail,
      icon: seed.icon,
    };
  });
}

const hotspots: Hotspot[] = toHotspots(RING_MODULES);

export function FuelTankerInteractive() {
  const [activeId, setActiveId] = useState(hotspots[0].id);
  const active = useMemo(
    () => hotspots.find((h) => h.id === activeId) ?? hotspots[0],
    [activeId]
  );
  const ActiveIcon = active.icon;
  const centerRingClass =
    "pointer-events-none absolute left-1/2 top-1/2 h-[min(56vw,25rem)] w-[min(56vw,25rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-zinc-300/75";

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-b from-zinc-50 to-zinc-100 p-3 sm:p-4">
        <div className={centerRingClass} />
        <div className={`${centerRingClass} scale-[0.82]`} />
        <div className={`${centerRingClass} scale-[1.16]`} />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
              className="w-[min(78vw,21rem)] rounded-xl border border-white/75 bg-white/92 p-3 shadow-[0_14px_32px_-18px_rgba(15,23,42,0.55)] backdrop-blur-sm"
            >
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--accent)] text-sm">
                  <ActiveIcon className="h-4 w-4 text-white" />
                </span>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600">
                  {active.label}
                </p>
              </div>
              <div className="mt-3 overflow-hidden rounded-lg border border-zinc-200/90 bg-zinc-50 p-2">
                {active.moduleImageSrc ? (
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-md bg-zinc-100">
                    <Image
                      src={active.moduleImageSrc}
                      alt={`${active.label} module preview`}
                      fill
                      sizes="(max-width: 1024px) 78vw, 21rem"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-[16/9] w-full rounded-md bg-zinc-200/60" />
                )}
                <div className="mt-2 space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                    Module image
                  </p>
                  <p className="text-xs font-medium text-zinc-700">
                    Add `{`/public/interactive/${active.id}.png`}` to replace this preview.
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        {hotspots.map((spot) => {
          const activeSpot = spot.id === active.id;
          const SpotIcon = spot.icon;
          return (
            <button
              key={spot.id}
              type="button"
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border text-[10px] font-semibold uppercase tracking-[0.08em] transition-all duration-300 ${
                activeSpot
                  ? "h-12 min-w-12 scale-105 border-[color:var(--accent)] bg-[color:var(--accent)] px-3 text-white shadow-[0_10px_24px_-10px_rgba(9,0,136,0.8)] ring-4 ring-white/75"
                  : "h-11 min-w-11 border-zinc-100 bg-white text-zinc-900 shadow-[0_8px_18px_-10px_rgba(15,23,42,0.9)] px-3 hover:scale-105 hover:border-white"
              }`}
              style={{ left: spot.left, top: spot.top }}
              aria-pressed={activeSpot}
              onClick={() => setActiveId(spot.id)}
            >
              <SpotIcon className="h-5 w-5" aria-hidden />
            </button>
          );
        })}
      </div>

      <aside className="flex max-h-[70vh] flex-col rounded-2xl border border-zinc-200 bg-[color:var(--surface)] p-5 sm:p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Interactive points
        </p>
        <h3 className="mt-3 text-xl font-semibold tracking-tight text-zinc-900">
          {active.label}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600">
          {active.detail}
        </p>
        <ul className="mt-5 min-h-0 space-y-2 overflow-y-auto pr-1">
          {hotspots.map((spot) => (
            <li key={spot.id}>
              <button
                type="button"
                onClick={() => setActiveId(spot.id)}
                className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                  active.id === spot.id
                    ? "border-[color:var(--accent)] bg-[color:var(--surface-elevated)] text-zinc-900"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-900"
                }`}
              >
                {spot.label}
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
