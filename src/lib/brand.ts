/**
 * Brand constants + verified iCAM facts (sourced from icamvideo.co.za,
 * the company LinkedIn page, and the Road Freight Association listing).
 */

/** Deep brand blue (logo / print). On dark UI use BRAND_ACCENT instead. */
export const BRAND_BLUE = "#090088";
/** Legacy light-UI hover token (kept for back-compat). */
export const BRAND_BLUE_BRIGHT = "#0b00a8";
/** Brightened brand indigo for dark command-center surfaces. */
export const BRAND_ACCENT = "#6d6cff";
/** Cyan telemetry/data accent. */
export const BRAND_DATA = "#2dd4ff";

export const TAGLINE = "Get The Full Picture";

export const CONTACT = {
  phone: "086 115 8527",
  phoneAlt: "076 992 4038",
  email: "marketing@icamvideo.co.za",
  addressLines: [
    "Regency Terrace (Block A)",
    "81 Regency Drive, Route 21 Corporate Park",
    "Irene, 0157, Gauteng, South Africa",
  ],
  founded: "2015",
  region: "South Africa",
} as const;

/** Headline stats advertised on the iCAM site. */
export const STATS = [
  { value: "1–16", label: "camera channels", note: "Models for every vehicle type" },
  { value: "2TB", label: "onboard storage", note: "Up to ~900 hours of footage" },
  { value: "450+", label: "report layouts", note: "10,000+ configurable data fields" },
  { value: "24/7", label: "monitoring bureau", note: "Recovery, alarms & support" },
] as const;
