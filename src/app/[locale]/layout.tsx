import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { hasLocale } from "next-intl";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import SmoothScroll from "@/components/SmoothScroll";
import Preloader from "@/components/Preloader";
import { routing } from "@/i18n/routing";
import "../globals.css";

// Only the three weights the design actually uses. The italic, Light (300) and
// Extrabold (800) cuts were dropped — nothing referenced them, and every file
// listed here is preloaded into <head>, so an unused weight is pure page weight.
// WOFF2 rather than the source TTF: same glyphs, ~60% smaller over the wire.
const bcaSans = localFont({
  variable: "--font-bca-sans",
  src: [
    { path: "../../fonts/bca-sans/BCASans-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../fonts/bca-sans/BCASans-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../../fonts/bca-sans/BCASans-Bold.woff2", weight: "700", style: "normal" },
  ],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bca.co.id"),
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      images: [{ url: "/opengraph-bcacoid.png", width: 1200, height: 640 }],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: ["/opengraph-bcacoid.png"],
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#005CAA",
};

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "nav" });

  return (
    <html lang={locale} className={`${bcaSans.variable} h-full antialiased overscroll-none bg-blue-100`}>
      <body className="min-h-full flex flex-col overscroll-none bg-blue-100">
        <NextIntlClientProvider>
          {/* First focusable element on the page: lets keyboard users jump the
              navbar, segment picker and mega-menu triggers straight to the
              content. `sr-only` keeps it out of the visual design until it
              takes focus, at which point `focus:not-sr-only` brings it on
              screen. */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-blue-500"
          >
            {t("skipToContent")}
          </a>
          <SmoothScroll>
            {/* Server-rendered, and visible from the first paint by CSS alone —
                see the .pre-* block in globals.css. */}
            <Preloader />
            {children}
          </SmoothScroll>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
