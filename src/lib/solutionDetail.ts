/**
 * Per-vehicle editorial content for the /solutions/[slug] pages.
 * Framing only — every capability named here is part of iCAM's confirmed
 * product stack (video/MDVR, GPS + CANBUS telematics, ADAS & fatigue AI,
 * platform, BI, 24/7 bureau). No invented specs or claims.
 */

export type SolutionDetail = {
  /** one-line descriptor used on the solutions index */
  blurb: string;
  /** opening paragraph on the detail page */
  lede: string;
  /** what iCAM fits / why it matters for this vehicle */
  focus: { title: string; body: string }[];
};

export const solutionDetails: Record<string, SolutionDetail> = {
  "tipper-side-tipper": {
    blurb: "Short cycles, blind spots and every tip accounted for.",
    lede: "Tippers and side-tippers live between the quarry, the weighbridge and the tip face — short cycles, heavy blind spots, and tip events that have to be tied back to a load.",
    focus: [
      { title: "Blind-spot & reversing coverage", body: "Multi-channel cameras around the load and tip areas, so the work the driver can't see is still on record." },
      { title: "PTO & tip-event logging", body: "Every tip captured — where, when and against which trip — through CANBUS and PTO inputs." },
      { title: "Site geofences", body: "Load site, tip face and weighbridge as zones: arrivals, dwell time and exits, automatically." },
      { title: "Driving-risk data", body: "Harsh braking, speed and idle via CANBUS and the on-board accelerometer, scored per driver." },
    ],
  },
  "tautliner-box-body": {
    blurb: "Long linehaul, cargo integrity and evidence for every claim.",
    lede: "Tautliners and box bodies run the long linehaul — the shifts where fatigue sets in, cargo doors matter, and a disputed claim needs footage, not a statement.",
    focus: [
      { title: "Fatigue & distraction AI", body: "Driver-facing camera watching for fatigue, distraction and phone use across long shifts." },
      { title: "Door-open monitoring", body: "Know when cargo doors open and where — tied to the trip and the footage." },
      { title: "Full route & trip history", body: "Continuous GPS with route replay and trip detail, across provinces and borders." },
      { title: "Evidence on demand", body: "Live HD streaming, event-triggered clips and historical footage by date and time for claims and PODs." },
    ],
  },
  "fuel-tanker": {
    blurb: "High value, high risk — tamper, geofence and the bureau watching.",
    lede: "A fuel tanker is a high-value, high-risk load. The build leans on security, sensor integration and the monitoring bureau as much as on cameras.",
    focus: [
      { title: "Tamper, jamming & panic", body: "Jamming detection and a panic alarm routed straight to the 24/7 bureau for recovery and response." },
      { title: "Geofencing", body: "Depots, approved offloads and no-go zones as live zones, with alerts on breach." },
      { title: "Fuel & temperature sensing", body: "Fuel-level and temperature probes integrated via CANBUS and third-party inputs." },
      { title: "ADAS for the heavy haul", body: "Collision, headway and pedestrian warnings for the long, loaded run." },
    ],
  },
  bus: {
    blurb: "Passengers counted, drivers watched, a panic button that works.",
    lede: "A bus carries people, not cargo — so the system is built around passenger safety, occupancy and the long route the driver sits through.",
    focus: [
      { title: "Passenger counting", body: "Occupancy and utilisation per route, captured on board." },
      { title: "Driver fatigue monitoring", body: "Fatigue and distraction AI for the long hours behind the wheel." },
      { title: "In-saloon cameras & panic", body: "Interior coverage and a panic alarm for incidents on board." },
      { title: "On-board screen", body: "In-cab screen for prompts, playback and workflow status." },
    ],
  },
  "yellow-metal-mining": {
    blurb: "Big machines, dust and pedestrians — built to survive the site.",
    lede: "Yellow metal lives off-road: huge blind spots, pedestrians on foot, and an environment of dust, heat and vibration that most hardware doesn't come back from.",
    focus: [
      { title: "Extended & blind-spot cameras", body: "Additional channels for the blind spots that come with large machines." },
      { title: "Rugged install", body: "Specified for dust, vibration and heat — manufactured to CE/ISO, Tier-1 standards." },
      { title: "Asset & machine tracking", body: "Tracking for machines and assets, not only road vehicles." },
      { title: "Collision & pedestrian warnings", body: "ADAS tuned for busy sites where people and machines share ground." },
    ],
  },
  "taxi-car": {
    blurb: "A panic button, a watching bureau and a clear chain of accountability.",
    lede: "Minibus taxis and light vehicles need the essentials done well: a panic button that reaches someone, driver accountability, and a vehicle you can recover.",
    focus: [
      { title: "Panic alarm & recovery", body: "Panic routed to the 24/7 monitoring bureau, with vehicle recovery on the line." },
      { title: "Driver ID", body: "Driver identification for accountability across shifts and vehicles." },
      { title: "Compact camera", body: "In-cab and road-facing coverage sized for light vehicles." },
      { title: "Live tracking", body: "Real-time location, routes and trip history on web and mobile." },
    ],
  },
  "ambulance-security": {
    blurb: "Dispatch, two-way voice and video the moment it matters.",
    lede: "Emergency and security fleets are judged on response. The build is about live location, instant voice and evidence the moment an incident lands.",
    focus: [
      { title: "Two-way voice comms", body: "Talk to the vehicle and the control room through the same system." },
      { title: "Panic & crash alerts", body: "Immediate alerts with linked video the moment they trigger." },
      { title: "Live dispatch location", body: "Real-time positions for fast, informed dispatch and response." },
      { title: "Bay & door monitoring", body: "Coverage of equipment bays and doors for security and audit." },
    ],
  },
  other: {
    blurb: "Forklifts, plant, trailers — if it moves, it can be covered.",
    lede: "Forklifts, plant, trailers and anything else: the same platform, configured to the equipment rather than the road.",
    focus: [
      { title: "Track anything", body: "Vehicles, machines, assets and trailers on one map." },
      { title: "Sensor integration", body: "CANBUS plus third-party sensors for the readings that matter to your equipment." },
      { title: "Cameras to suit", body: "Channel count and placement configured to the machine." },
      { title: "Custom reporting", body: "Alerts and reports drawn from 450+ layouts and 10,000+ data fields." },
    ],
  },
};

export const defaultDetail: SolutionDetail = {
  blurb: "iCAM video telematics, configured to the vehicle.",
  lede: "The full iCAM platform — video, tracking, safety AI and 24/7 monitoring — configured to how this vehicle actually runs.",
  focus: [
    { title: "Vehicle video", body: "Multi-channel HD cameras with live, event and historical footage." },
    { title: "Tracking & telematics", body: "GPS, CANBUS and sensor data on one platform." },
    { title: "Driver safety", body: "ADAS and fatigue AI that warn before an incident." },
    { title: "24/7 bureau", body: "Monitoring, alarms and recovery around the clock." },
  ],
};
