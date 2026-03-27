import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import { SmoothScroll } from "@/components/SmoothScroll";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  variable: "--font-sans-brand",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "iCAM Video Telematics — Fleet video, GPS & AI safety",
  description:
    "South African video-enabled fleet telematics: multi-channel HD cameras, GPS and sensor tracking, ADAS and fatigue alerts, unified web and mobile platform, BI reporting, and 24/7 monitoring.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plexSans.variable} antialiased`}>
      <body className="min-h-full font-sans">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
