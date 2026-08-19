import type { Metadata, Viewport } from "next";
import { Inter, Bebas_Neue } from "next/font/google";
import "./globals.css";

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

// Condensed display face for headings and the dive-bar section signage.
const display = Bebas_Neue({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Theka Finder — Mumbai liquor shops near you",
    template: "%s · Theka Finder",
  },
  description:
    "Find liquor shops across Mumbai: opening hours, what's open now, and what regulars say. A locator only — no delivery, no sales.",
  openGraph: {
    title: "Theka Finder",
    description:
      "Find liquor shops across Mumbai — hours, reviews and the dive bars worth the trip.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#fbfaf8",
  width: "device-width",
  initialScale: 1,
  // Never block pinch-zoom; some people need it to read a map.
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${body.variable} ${display.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
