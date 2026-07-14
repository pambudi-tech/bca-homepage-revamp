import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import SmoothScroll from "@/components/SmoothScroll";
import "./globals.css";

const bcaSans = localFont({
  variable: "--font-bca-sans",
  src: [
    { path: "../fonts/bca-sans/BCASans-Light.ttf", weight: "300", style: "normal" },
    { path: "../fonts/bca-sans/BCASans-LightItalic.ttf", weight: "300", style: "italic" },
    { path: "../fonts/bca-sans/BCASans-Regular.ttf", weight: "400", style: "normal" },
    { path: "../fonts/bca-sans/BCASans-Italic.ttf", weight: "400", style: "italic" },
    { path: "../fonts/bca-sans/BCASans-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../fonts/bca-sans/BCASans-SemiBoldItalic.ttf", weight: "600", style: "italic" },
    { path: "../fonts/bca-sans/BCASans-Bold.ttf", weight: "700", style: "normal" },
    { path: "../fonts/bca-sans/BCASans-BoldItalic.ttf", weight: "700", style: "italic" },
    { path: "../fonts/bca-sans/BCASans-Extrabold.ttf", weight: "800", style: "normal" },
    { path: "../fonts/bca-sans/BCASans-ExtraboldItalic.ttf", weight: "800", style: "italic" },
  ],
});

export const metadata: Metadata = {
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
    <html lang="id" className={`${bcaSans.variable} h-full antialiased overscroll-none bg-[#f4f8fc]`}>
      <body className="min-h-full flex flex-col overscroll-none bg-[#f4f8fc]">
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}