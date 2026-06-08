import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { SmoothScroll } from "@/components/SmoothScroll";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  variable: "--font-sans-brand",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-mono-brand",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "iCAM Video Telematics — Get The Full Picture",
  description:
    "Proudly South African video telematics. Multi-channel HD MDVR cameras, GPS & sensor tracking, ADAS & driver-fatigue AI, a unified web/desktop/mobile platform, 450+ BI reports, and a 24/7 monitoring bureau for transport, mining, construction and logistics fleets.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

// Applied before paint to avoid a theme flash. Default: dark.
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('icam-theme');if(t==='light'){document.documentElement.classList.add('light');}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plexSans.variable} ${plexMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-full font-sans">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
