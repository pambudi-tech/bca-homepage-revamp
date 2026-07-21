import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import SmoothScroll from "@/components/SmoothScroll";
import Preloader from "@/components/Preloader";
import "./globals.css";

// Only the three weights the design actually uses. The italic, Light (300) and
// Extrabold (800) cuts were dropped — nothing referenced them, and every file
// listed here is preloaded into <head>, so an unused weight is pure page weight.
// WOFF2 rather than the source TTF: same glyphs, ~60% smaller over the wire.
const bcaSans = localFont({
  variable: "--font-bca-sans",
  src: [
    { path: "../fonts/bca-sans/BCASans-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/bca-sans/BCASans-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../fonts/bca-sans/BCASans-Bold.woff2", weight: "700", style: "normal" },
  ],
});

export const metadata: Metadata = {
  // Resolves the relative OG/Twitter image URLs below. Without it Next falls
  // back to localhost:3000 and warns at build time.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bca.co.id"),
  title: "BCA - Senantiasa di Sisi Anda",
  description: "Prototype revamp homepage BCA.co.id",
  openGraph: {
    title: "BCA - Senantiasa di Sisi Anda",
    description: "Prototype revamp homepage BCA.co.id",
    images: [{ url: "/opengraph-bcacoid.png", width: 1200, height: 640 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "BCA - Senantiasa di Sisi Anda",
    description: "Prototype revamp homepage BCA.co.id",
    images: ["/opengraph-bcacoid.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#005CAA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${bcaSans.variable} h-full antialiased overscroll-none bg-blue-100`}>
      <body className="min-h-full flex flex-col overscroll-none bg-blue-100">
        <SmoothScroll>
          {/* Server-rendered, and visible from the first paint by CSS alone —
              see the .pre-* block in globals.css. */}
          <Preloader />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}