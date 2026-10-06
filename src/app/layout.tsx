import type { Metadata } from "next";
import { Hanken_Grotesk, Libre_Caslon_Display, IBM_Plex_Mono } from "next/font/google";
import { SmoothScroll } from "@/components/SmoothScroll";
import "./globals.css";

const sans = Hanken_Grotesk({
  variable: "--font-sans-brand",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const display = Libre_Caslon_Display({
  variable: "--font-display-brand",
  subsets: ["latin"],
  weight: ["400"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono-brand",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "iCAM Video Telematics — Get The Full Picture",
  description:
    "Proudly South African video telematics. In-vehicle HD cameras, GPS & sensor tracking, ADAS & driver-fatigue AI, one platform and a 24/7 monitoring bureau — for the fleets that keep Southern Africa moving.",
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
    <html
      lang="en"
      className={`${sans.variable} ${display.variable} ${mono.variable} antialiased`}
    >
      <body className="min-h-full font-sans">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
