import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import BackToTop from "@/components/home/BackToTop";
import CookieBanner from "@/components/home/CookieBanner";
import Navbar from "@/components/home/Navbar";
import ScrollReveal from "@/components/ScrollReveal";
import PromoDetailExperience from "@/components/promo/PromoDetailExperience";
import type { AppLocale } from "@/i18n/routing";
import { getMegaMenuContent } from "@/lib/megamenu";
import { getProductCategories } from "@/lib/products";
import { getPromos } from "@/lib/promos";

type PromoDetailParams = { locale: string; promoId: string };

export async function generateMetadata({ params }: { params: Promise<PromoDetailParams> }): Promise<Metadata> {
  const { promoId } = await params;
  const promo = (await getPromos(new Date())).find((item) => item.id === promoId);
  if (!promo) return {};
  return { title: promo.title, description: promo.details || promo.brand };
}

export default async function PromoDetailPage({ params }: { params: Promise<PromoDetailParams> }) {
  const { locale, promoId } = await params;
  setRequestLocale(locale);
  const now = new Date();
  const [produk, megamenu, promos] = await Promise.all([
    getProductCategories(locale as AppLocale),
    getMegaMenuContent(locale as AppLocale),
    getPromos(now),
  ]);
  const promo = promos.find((item) => item.id === promoId);
  if (!promo) notFound();
  const relatedPromos = promos.filter((item) => item.id !== promo.id && item.category === promo.category).slice(0, 3);
  const fallbackRelatedPromos = relatedPromos.length === 3 ? relatedPromos : promos.filter((item) => item.id !== promo.id).slice(0, 3);

  return (
    <main id="main-content" className="flex min-h-screen flex-1 flex-col overflow-x-clip bg-neutral-100">
      <Navbar productCategories={produk.categories} megamenuContent={megamenu} variant="promo" />
      <PromoDetailExperience promo={promo} relatedPromos={fallbackRelatedPromos} now={now} />
      <BackToTop />
      <CookieBanner />
      <ScrollReveal />
    </main>
  );
}
