import type { Metadata, Viewport } from "next";
import { Big_Shoulders, Gochi_Hand, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import ScratchBackground from "@/components/ScratchBackground";
import "./itinerary.css";
import "./site.css";
import "./blog.css";

const display = Big_Shoulders({ subsets: ["latin"], weight: ["700", "800", "900"], variable: "--font-display" });
const body = Instrument_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-body" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["500"], variable: "--font-mono" });
const hand = Gochi_Hand({ subsets: ["latin"], weight: "400", variable: "--font-hand" });

export const metadata: Metadata = {
  title: "Puebla ’26",
  description: "Our Puebla trip, Oct 19–28, 2026: the itinerary and Jack’s trip blog.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable} ${hand.variable}`}>
      <body>
        <ScratchBackground />
        <SiteHeader />
        <main className="wrap">{children}</main>
      </body>
    </html>
  );
}
