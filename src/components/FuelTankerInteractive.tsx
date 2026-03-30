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
  PlugZap,
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
  placeholder: string;
};

const hotspots: Hotspot[] = [
  {
    id: "video-unit",
    label: "Video unit",
    left: "46%",
    top: "16%",
    detail: "Core recording hub with event capture and remote playback support.",
    icon: Camera,
    placeholder: "Video feed placeholder",
  },
  {
    id: "fatigue-camera",
    label: "Fatigue camera",
    left: "64%",
    top: "22%",
    detail: "Driver-facing camera stream with fatigue and distraction alerts.",
    icon: AlertTriangle,
    placeholder: "Fatigue event placeholder",
  },
  {
    id: "adas-camera",
    label: "ADAS camera",
    left: "71%",
    top: "34%",
    detail: "Forward-safety feed for headway, collision risk, and lane events.",
    icon: CarFront,
    placeholder: "ADAS alert placeholder",
  },
  {
    id: "gps-location",
    label: "GPS location",
    left: "74%",
    top: "46%",
    detail: "Live location, route replay, and trip breadcrumb context.",
    icon: LocateFixed,
    placeholder: "Map replay placeholder",
  },
  {
    id: "canbus",
    label: "CANBus",
    left: "76%",
    top: "58%",
    detail: "Vehicle telemetry integration for engine and behavior signals.",
    icon: PlugZap,
    placeholder: "CANBus telemetry placeholder",
  },
  {
    id: "driver-id",
    label: "Driver ID",
    left: "68%",
    top: "72%",
    detail: "Driver authentication for accountability and shift attribution.",
    icon: FileBadge2,
    placeholder: "Driver identification placeholder",
  },
  {
    id: "reports",
    label: "Reports & BI",
    left: "26%",
    top: "60%",
    detail: "Operational, safety, and compliance reporting in one stack.",
    icon: BarChart3,
    placeholder: "Reporting panel placeholder",
  },
  {
    id: "theft-recovery",
    label: "Theft recovery",
    left: "24%",
    top: "42%",
    detail: "Incident response workflow with map, video, and escalation context.",
    icon: Gauge,
    placeholder: "Recovery workflow placeholder",
  },
];

export function FuelTankerInteractive() {
  const [activeId, setActiveId] = useState(hotspots[0].id);
  const active = useMemo(
    () => hotspots.find((h) => h.id === activeId) ?? hotspots[0],
    [activeId]
  );
  const ActiveIcon = active.icon;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-3 sm:p-4">
        <Image
          src="/FuelSolution/truck.png"
          alt="Fuel tanker with telematics capability map"
          width={1200}
          height={860}
          className="h-auto w-full rounded-xl object-contain"
          priority
        />
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
              <div className="mt-3 rounded-lg border border-zinc-200/90 bg-zinc-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  Image placeholder
                </p>
                <p className="mt-1 text-xs font-medium text-zinc-700">
                  {active.placeholder}
                </p>
                <div className="mt-3 space-y-2">
                  <div className="h-2 w-full rounded bg-zinc-200" />
                  <div className="h-2 w-4/5 rounded bg-zinc-200/85" />
                  <div className="h-2 w-3/5 rounded bg-zinc-200/70" />
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
                  ? "h-10 min-w-10 scale-105 border-[color:var(--accent)] bg-[color:var(--accent)] px-2 text-white shadow-lg"
                  : "h-8 min-w-8 border-zinc-300 bg-white/90 px-2 text-zinc-700 hover:scale-105 hover:border-zinc-400"
              }`}
              style={{ left: spot.left, top: spot.top }}
              aria-pressed={activeSpot}
              onClick={() => setActiveId(spot.id)}
            >
              {activeSpot ? (
                spot.label
              ) : (
                <SpotIcon className="h-3.5 w-3.5" aria-hidden />
              )}
            </button>
          );
        })}
      </div>

      <aside className="rounded-2xl border border-zinc-200 bg-[color:var(--surface)] p-5 sm:p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Interactive points
        </p>
        <h3 className="mt-3 text-xl font-semibold tracking-tight text-zinc-900">
          {active.label}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600">
          {active.detail}
        </p>
        <ul className="mt-6 space-y-2">
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
