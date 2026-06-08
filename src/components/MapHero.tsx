"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Map as MlMap, Marker as MlMarker } from "maplibre-gl";
import { TAGLINE } from "@/lib/brand";

/**
 * Interactive operations map hero. A pan / zoom / rotate MapLibre map (free,
 * keyless CARTO tiles) showing iCAM's two head offices (Pretoria & Cape Town)
 * and the cross-border support footprint up to the DRC. "View SA operations"
 * flies into Gauteng and reveals geofences, vehicles and live alerts
 * (Fatigue, Panic, PTO / Trip). Follows the site light/dark theme.
 */

const STYLE_DARK = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";
const STYLE_LIGHT = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

type LngLat = [number, number];

const REGION = { center: [25.5, -19.5] as LngLat, zoom: 3.5, pitch: 38, bearing: -12 };
const SA_VIEW = { center: [28.0, -25.95] as LngLat, zoom: 8.1, pitch: 58, bearing: -18 };

// Two head offices + cross-border support coverage (no physical offices abroad).
const POINTS: { name: string; coord: LngLat; type: "office" | "coverage" }[] = [
  { name: "Pretoria · Head Office", coord: [28.19, -25.86], type: "office" },
  { name: "Cape Town · Head Office", coord: [18.42, -33.92], type: "office" },
  { name: "Johannesburg", coord: [28.04, -26.2], type: "coverage" },
  { name: "Durban", coord: [31.02, -29.86], type: "coverage" },
  { name: "Gqeberha", coord: [25.6, -33.96], type: "coverage" },
  { name: "Bloemfontein", coord: [26.21, -29.12], type: "coverage" },
  { name: "Maseru · Lesotho", coord: [27.48, -29.31], type: "coverage" },
  { name: "Mbabane · Eswatini", coord: [31.13, -26.32], type: "coverage" },
  { name: "Gaborone · Botswana", coord: [25.91, -24.65], type: "coverage" },
  { name: "Windhoek · Namibia", coord: [17.08, -22.57], type: "coverage" },
  { name: "Harare · Zimbabwe", coord: [31.05, -17.83], type: "coverage" },
  { name: "Maputo · Mozambique", coord: [32.59, -25.97], type: "coverage" },
  { name: "Beira · Mozambique", coord: [34.84, -19.84], type: "coverage" },
  { name: "Lusaka · Zambia", coord: [28.32, -15.39], type: "coverage" },
  { name: "Kitwe · Zambia", coord: [28.21, -12.82], type: "coverage" },
  { name: "Lilongwe · Malawi", coord: [33.78, -13.98], type: "coverage" },
  { name: "Luanda · Angola", coord: [13.23, -8.84], type: "coverage" },
  { name: "Lubumbashi · DRC", coord: [27.48, -11.66], type: "coverage" },
  { name: "Kolwezi · DRC", coord: [25.47, -10.71], type: "coverage" },
  { name: "Dar es Salaam · Tanzania", coord: [39.28, -6.79], type: "coverage" },
];

// Cross-border support corridors radiating from Gauteng.
const CORRIDORS: LngLat[][] = [
  [[28.04, -26.2], [28.19, -25.86], [29.45, -23.9], [30.0, -22.2], [28.32, -15.39], [27.48, -11.66], [25.47, -10.71]],
  [[28.19, -25.86], [31.13, -26.32], [32.59, -25.97], [34.84, -19.84]],
  [[28.19, -25.86], [26.21, -29.12], [18.42, -33.92]],
  [[25.91, -24.65], [17.08, -22.57]],
  [[28.32, -15.39], [33.78, -13.98], [39.28, -6.79]],
];

const GEOFENCES: { name: string; center: LngLat; radiusKm: number; kind: "depot" | "mine" }[] = [
  { name: "Irene HQ Depot", center: [28.19, -25.86], radiusKm: 5, kind: "depot" },
  { name: "City Deep Logistics", center: [28.11, -26.22], radiusKm: 4, kind: "depot" },
  { name: "Rustenburg Mine Zone", center: [27.24, -25.67], radiusKm: 12, kind: "mine" },
];

const SA_VEHICLES: { id: string; coord: LngLat; state: "ok" | "warn" | "crit" }[] = [
  { id: "GP 14-RT", coord: [28.16, -25.92], state: "ok" },
  { id: "GP 22-LX", coord: [28.07, -26.12], state: "crit" },
  { id: "GP 30-QF", coord: [27.3, -25.7], state: "warn" },
  { id: "GP 19-BB", coord: [28.24, -25.8], state: "ok" },
];

type Alert = { type: string; level: "warn" | "crit" | "info"; veh: string; where: string };
const ALERTS: Alert[] = [
  { type: "Driver Fatigue", level: "warn", veh: "GP 14-RT", where: "N1 North · Midrand" },
  { type: "Panic Alarm", level: "crit", veh: "GP 22-LX", where: "Tembisa" },
  { type: "PTO Trip", level: "info", veh: "GP 30-QF", where: "Rustenburg Mine Zone" },
  { type: "Geofence Exit", level: "info", veh: "GP 19-BB", where: "Irene HQ Depot" },
  { type: "Harsh Braking", level: "warn", veh: "GP 22-LX", where: "R21 · Kempton Park" },
];

function circlePolygon(center: LngLat, radiusKm: number, steps = 56): LngLat[] {
  const [lng, lat] = center;
  const out: LngLat[] = [];
  const dLat = radiusKm / 110.574;
  const dLng = radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180));
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * 2 * Math.PI;
    out.push([lng + dLng * Math.cos(a), lat + dLat * Math.sin(a)]);
  }
  return out;
}

const levelColor: Record<Alert["level"], string> = {
  crit: "#ef4444",
  warn: "#f5a623",
  info: "#1d6fe0",
};

export function MapHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const markersRef = useRef<MlMarker[]>([]);
  const themeInitRef = useRef(true);
  const modeRef = useRef<"region" | "sa">("region");

  const [ready, setReady] = useState(false);
  const [light, setLight] = useState(false);
  const [mode, setMode] = useState<"region" | "sa">("region");
  const [toasts, setToasts] = useState<(Alert & { id: number })[]>([]);
  const [log, setLog] = useState<(Alert & { id: number })[]>([]);
  const [unread, setUnread] = useState(0);
  const [bellOpen, setBellOpen] = useState(false);
  const idRef = useRef(0);

  modeRef.current = mode;

  // follow site theme
  useEffect(() => {
    const el = document.documentElement;
    const update = () => setLight(el.classList.contains("light"));
    update();
    const obs = new MutationObserver(update);
    obs.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  // (re)add all sources + layers (called on initial load and after setStyle)
  const addOps = useCallback((map: MlMap, isLight: boolean) => {
    if (map.getSource("corridor")) return;
    const labelColor = isLight ? "#0b1230" : "#dbe6ff";
    const haloColor = isLight ? "#ffffff" : "#04050c";

    map.addSource("corridor", {
      type: "geojson",
      data: { type: "Feature", properties: {}, geometry: { type: "MultiLineString", coordinates: CORRIDORS } },
    });
    map.addLayer({
      id: "corridor-glow", type: "line", source: "corridor",
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": "#1d6fe0", "line-width": 7, "line-opacity": 0.16, "line-blur": 6 },
    });
    map.addLayer({
      id: "corridor-line", type: "line", source: "corridor",
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": isLight ? "#1d4ed8" : "#7cb8ff", "line-width": 2, "line-dasharray": [2, 1.6], "line-opacity": 0.9 },
    });

    map.addSource("points", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: POINTS.map((d) => ({
          type: "Feature",
          properties: { name: d.name, office: d.type === "office" ? 1 : 0 },
          geometry: { type: "Point", coordinates: d.coord },
        })),
      },
    });
    map.addLayer({
      id: "point-halo", type: "circle", source: "points",
      paint: {
        "circle-radius": ["case", ["==", ["get", "office"], 1], 13, 0],
        "circle-color": "#1d6fe0", "circle-opacity": 0.28, "circle-blur": 0.6,
      },
    });
    map.addLayer({
      id: "point-dot", type: "circle", source: "points",
      paint: {
        "circle-radius": ["case", ["==", ["get", "office"], 1], 6, 3.5],
        "circle-color": [
          "case", ["==", ["get", "office"], 1],
          isLight ? "#090088" : "#ffffff",
          isLight ? "#1d6fe0" : "#7cb8ff",
        ],
        "circle-stroke-color": isLight ? "#ffffff" : "#04122e",
        "circle-stroke-width": 1.5,
      },
    });
    map.addLayer({
      id: "point-label", type: "symbol", source: "points",
      layout: {
        "text-field": ["get", "name"],
        "text-size": ["case", ["==", ["get", "office"], 1], 12.5, 10.5],
        "text-offset": [0, 1.3], "text-anchor": "top",
        "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
      },
      paint: { "text-color": labelColor, "text-halo-color": haloColor, "text-halo-width": 1.4 },
    });

    map.addSource("geofences", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: GEOFENCES.map((g) => ({
          type: "Feature",
          properties: { name: g.name, kind: g.kind },
          geometry: { type: "Polygon", coordinates: [circlePolygon(g.center, g.radiusKm)] },
        })),
      },
    });
    map.addLayer({
      id: "geofence-fill", type: "fill", source: "geofences",
      layout: { visibility: "none" },
      paint: { "fill-color": ["case", ["==", ["get", "kind"], "mine"], "#f5a623", "#1d6fe0"], "fill-opacity": 0.18 },
    });
    map.addLayer({
      id: "geofence-line", type: "line", source: "geofences",
      layout: { visibility: "none" },
      paint: { "line-color": ["case", ["==", ["get", "kind"], "mine"], "#f5a623", "#1d6fe0"], "line-width": 2.2, "line-dasharray": [2, 1.5], "line-opacity": 1 },
    });
    map.addLayer({
      id: "geofence-label", type: "symbol", source: "geofences",
      layout: { visibility: "none", "text-field": ["get", "name"], "text-size": 11, "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"] },
      paint: { "text-color": labelColor, "text-halo-color": haloColor, "text-halo-width": 1.4 },
    });
  }, []);

  const setGeofenceVisible = useCallback((show: boolean) => {
    const map = mapRef.current;
    if (!map) return;
    const v = show ? "visible" : "none";
    ["geofence-fill", "geofence-line", "geofence-label"].forEach((id) => {
      if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", v);
    });
  }, []);

  const addVehicleMarkers = useCallback(async () => {
    const map = mapRef.current;
    if (!map || markersRef.current.length) return;
    const maplibregl = (await import("maplibre-gl")).default;
    SA_VEHICLES.forEach((v) => {
      const el = document.createElement("div");
      el.className = `icam-veh icam-veh--${v.state}`;
      el.innerHTML = `<span class="icam-veh__pulse"></span><span class="icam-veh__dot"></span>`;
      markersRef.current.push(new maplibregl.Marker({ element: el }).setLngLat(v.coord).addTo(map));
    });
  }, []);

  const clearVehicleMarkers = useCallback(() => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
  }, []);

  // build the map (once)
  useEffect(() => {
    let cancelled = false;
    let map: MlMap | null = null;

    (async () => {
      const maplibregl = (await import("maplibre-gl")).default;
      if (cancelled || !containerRef.current) return;
      const initLight = document.documentElement.classList.contains("light");

      map = new maplibregl.Map({
        container: containerRef.current,
        style: initLight ? STYLE_LIGHT : STYLE_DARK,
        center: REGION.center, zoom: REGION.zoom, pitch: REGION.pitch, bearing: REGION.bearing,
        minZoom: 3, maxZoom: 15,
        maxBounds: [[8, -37], [43, -2]],
        attributionControl: { compact: true },
        dragRotate: true,
        // Page scroll passes through; zoom needs Ctrl/⌘ + scroll (or pinch on touch),
        // so the map never traps the page scroll.
        cooperativeGestures: true,
      });
      mapRef.current = map;
      map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "bottom-right");

      map.on("zoomend", () => {
        const m = mapRef.current;
        if (m) setMode(m.getZoom() >= 6.2 ? "sa" : "region");
      });

      map.on("load", () => {
        if (!map) return;
        addOps(map, initLight);
        setReady(true);
      });
    })();

    return () => {
      cancelled = true;
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map?.remove();
      mapRef.current = null;
    };
  }, [addOps]);

  // swap basemap style when theme changes (skip first run — init already set it)
  useEffect(() => {
    if (themeInitRef.current) {
      themeInitRef.current = false;
      return;
    }
    const map = mapRef.current;
    if (!map) return;
    map.setStyle(light ? STYLE_LIGHT : STYLE_DARK);
    map.once("idle", () => {
      const m = mapRef.current;
      if (!m) return;
      addOps(m, light);
      setGeofenceVisible(modeRef.current === "sa");
    });
  }, [light, addOps, setGeofenceVisible]);

  // reveal SA detail (geofences + vehicles) in SA mode
  useEffect(() => {
    if (!ready) return;
    if (mode === "sa") {
      setGeofenceVisible(true);
      addVehicleMarkers();
    } else {
      setGeofenceVisible(false);
      clearVehicleMarkers();
    }
  }, [mode, ready, setGeofenceVisible, addVehicleMarkers, clearVehicleMarkers]);

  // live alert feed (SA mode)
  useEffect(() => {
    if (mode !== "sa") {
      setToasts([]);
      setLog([]);
      setUnread(0);
      setBellOpen(false);
      return;
    }
    let i = 0;
    const timeouts: number[] = [];
    const fire = () => {
      const base = ALERTS[i % ALERTS.length];
      i += 1;
      const id = ++idRef.current;
      const item = { ...base, id };
      setLog((cur) => [item, ...cur].slice(0, 40));
      setUnread((u) => u + 1);
      setToasts((cur) => [item, ...cur].slice(0, 2));
      const t = window.setTimeout(() => setToasts((cur) => cur.filter((x) => x.id !== id)), 5200);
      timeouts.push(t);
    };
    fire();
    const iv = window.setInterval(fire, 7000);
    return () => {
      window.clearInterval(iv);
      timeouts.forEach((t) => window.clearTimeout(t));
    };
  }, [mode]);

  const goSA = useCallback(() => {
    mapRef.current?.flyTo({ ...SA_VIEW, duration: 2600, essential: true });
  }, []);
  const goRegion = useCallback(() => {
    mapRef.current?.flyTo({ ...REGION, duration: 2400, essential: true });
  }, []);
  const toggleBell = useCallback(() => {
    setBellOpen((o) => {
      if (!o) setUnread(0);
      return !o;
    });
  }, []);

  // ---- theme-aware overlay classes ----
  const headingCls = light ? "text-[color:var(--foreground)]" : "text-white";
  const subCls = light ? "text-[color:var(--text-muted)]" : "text-white/80";
  const labelCls = light ? "text-[color:var(--accent)]" : "text-[#7cb8ff]";
  const hintCls = light ? "text-[color:var(--text-faint)]" : "text-white/45";
  const ghostBtn = light
    ? "border border-[color:var(--border-strong)] text-[color:var(--foreground)] hover:bg-[color:var(--surface)]"
    : "border border-white/25 bg-white/[0.04] text-white hover:bg-white/[0.1]";
  const panelCls = light
    ? "border border-[color:var(--border)] bg-white/95 text-[color:var(--foreground)]"
    : "border border-white/12 bg-[#0a0f22]/90 text-white";
  const subTextCls = light ? "text-[color:var(--text-muted)]" : "text-white/60";
  const scrim = light
    ? "linear-gradient(90deg, rgba(238,241,248,0.96) 0%, rgba(238,241,248,0.6) 34%, rgba(238,241,248,0) 62%), linear-gradient(0deg, rgba(238,241,248,0.92) 0%, rgba(238,241,248,0) 30%)"
    : "linear-gradient(90deg, rgba(4,5,12,0.92) 0%, rgba(4,5,12,0.6) 34%, rgba(4,5,12,0) 62%), linear-gradient(0deg, rgba(4,5,12,0.85) 0%, rgba(4,5,12,0) 30%)";

  return (
    <section
      aria-label="iCAM Video Telematics operations map"
      className="relative h-dvh min-h-[640px] w-full overflow-hidden bg-[color:var(--bg-deep)]"
    >
      <div ref={containerRef} className="absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute inset-0" style={{ background: scrim }} />

      {/* HUD */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-center px-5 sm:px-10 lg:px-16">
        <div className="max-w-xl">
          <motion.p
            className={`font-hud text-[10px] uppercase tracking-[0.32em] sm:text-xs ${labelCls}`}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          >
            Offices in Pretoria &amp; Cape Town · cross-border support
          </motion.p>
          <motion.h1
            className={`mt-4 text-balance text-5xl font-bold leading-[0.98] tracking-[-0.03em] sm:text-6xl md:text-7xl ${headingCls}`}
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {TAGLINE}
          </motion.h1>
          <motion.p
            className={`mt-5 max-w-md text-pretty text-sm leading-relaxed sm:text-base ${subCls}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.6 }}
          >
            {mode === "region"
              ? "Two head offices in South Africa — Pretoria & Cape Town. We support fleets that run cross-border, all the way up to the DRC. Drag, zoom and rotate the live map."
              : "South African operations — live vehicles, geofenced depots and mine zones, with fatigue, panic and PTO/trip alerts as they happen."}
          </motion.p>

          <motion.div
            className="pointer-events-auto mt-8 flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32, duration: 0.6 }}
          >
            {mode === "region" ? (
              <button type="button" onClick={goSA} disabled={!ready}
                className="inline-flex items-center gap-2 rounded-md bg-[color:var(--accent)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-bright)] disabled:opacity-60">
                View SA operations <span aria-hidden>→</span>
              </button>
            ) : (
              <button type="button" onClick={goRegion}
                className="inline-flex items-center gap-2 rounded-md bg-[color:var(--accent)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-bright)]">
                <span aria-hidden>←</span> Back to footprint
              </button>
            )}
            <a href="#contact" className={`inline-flex items-center justify-center rounded-md px-6 py-3 text-sm font-semibold backdrop-blur-sm transition ${ghostBtn}`}>
              Talk to our team
            </a>
          </motion.div>

          <p className={`mt-5 font-hud text-[10px] uppercase tracking-[0.24em] ${hintCls}`}>
            Drag to pan · ⌘/Ctrl + scroll to zoom · use the +/− controls
          </p>
        </div>
      </div>

      {/* bell + notification log (SA mode) */}
      {mode === "sa" ? (
        <div className="absolute right-4 top-20 z-30 sm:right-6">
          <button type="button" onClick={toggleBell}
            aria-label={`Operations alerts${unread ? ` (${unread} new)` : ""}`}
            className={`pointer-events-auto relative flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-md transition hover:border-[color:var(--accent)] ${panelCls}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 9a6 6 0 1112 0c0 5 2 6 2 6H4s2-1 2-6z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10 20a2 2 0 004 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            {unread > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ef4444] px-1 text-[10px] font-bold text-white">
                {unread > 9 ? "9+" : unread}
              </span>
            ) : null}
          </button>

          <AnimatePresence>
            {bellOpen ? (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.98 }} transition={{ duration: 0.2 }}
                className={`pointer-events-auto absolute right-0 top-full mt-2 w-[min(22rem,86vw)] overflow-hidden rounded-xl shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)] backdrop-blur-md ${panelCls}`}>
                <div className="flex items-center justify-between border-b border-[color:var(--border)] px-4 py-3">
                  <span className="font-hud text-[11px] uppercase tracking-[0.2em] opacity-80">Live Alerts</span>
                  <span className="font-hud text-[10px] opacity-50">{log.length} events</span>
                </div>
                <ul className="max-h-[20rem] divide-y divide-[color:var(--border)] overflow-y-auto">
                  {log.length === 0 ? (
                    <li className="px-4 py-6 text-center text-xs opacity-50">No alerts yet</li>
                  ) : (
                    log.map((a) => (
                      <li key={a.id} className="flex items-start gap-2.5 px-4 py-2.5">
                        <span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: levelColor[a.level] }} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold">{a.type}</p>
                          <p className={`font-hud mt-0.5 text-[11px] ${subTextCls}`}>{a.veh} · {a.where}</p>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      ) : null}

      {/* occasional toasts (SA mode) */}
      <div className="pointer-events-none absolute bottom-16 right-4 z-20 flex w-[min(20rem,82vw)] flex-col gap-2 sm:bottom-6 sm:right-6">
        <AnimatePresence initial={false}>
          {toasts.map((a) => (
            <motion.div key={a.id} layout
              initial={{ opacity: 0, x: 60, scale: 0.96 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 60, scale: 0.96 }} transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className={`rounded-lg px-3.5 py-2.5 backdrop-blur-md ${panelCls}`}>
              <div className="flex items-center gap-2">
                <span className="hud-blink inline-block h-2 w-2 rounded-full" style={{ backgroundColor: levelColor[a.level], boxShadow: `0 0 8px ${levelColor[a.level]}` }} />
                <span className="text-sm font-semibold">{a.type}</span>
                <span className="font-hud ml-auto text-[10px] uppercase tracking-[0.12em]" style={{ color: levelColor[a.level] }}>
                  {a.level === "crit" ? "Critical" : a.level === "warn" ? "Warning" : "Info"}
                </span>
              </div>
              <div className={`font-hud mt-1 flex items-center gap-2 text-[11px] ${subTextCls}`}>
                <span className="opacity-90">{a.veh}</span><span>·</span><span>{a.where}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {!ready ? (
        <div className={`pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 font-hud text-[10px] uppercase tracking-[0.3em] ${hintCls}`}>
          Loading map…
        </div>
      ) : null}
    </section>
  );
}
