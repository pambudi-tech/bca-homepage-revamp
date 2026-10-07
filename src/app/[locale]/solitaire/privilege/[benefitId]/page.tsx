import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PartnerPrivilegeDetailPage from "@/components/prioritas/PartnerPrivilegeDetailPage";
import Footer from "@/components/home/Footer";
import { getPrivilegeOffer } from "@/lib/partner-privileges";
import { getPrivilegePromos } from "@/lib/partner-privileges";
import { routing } from "@/i18n/routing";

type DetailParams = { locale: string; benefitId: string };

export const dynamicParams = false;

export function generateStaticParams() {
  const ids = [...new Set([...getPrivilegePromos("signature"), ...getPrivilegePromos("complimentary")].map((item) => item.id))];
  return routing.locales.flatMap((locale) => ids.map((benefitId) => ({ locale, benefitId })));
}

export async function generateMetadata({ params }: { params: Promise<DetailParams> }): Promise<Metadata> {
  const { benefitId } = await params;
  const offer = getPrivilegeOffer("signature", benefitId) ?? getPrivilegeOffer("complimentary", benefitId);
  if (!offer) return {};
  return {
    title: `${offer.benefit.benefit} | BCA Solitaire`,
    description: offer.partner.description,
  };
}

export default async function SolitairePrivilegeDetailPage({ params }: { params: Promise<DetailParams> }) {
  const { locale, benefitId } = await params;
  const section = getPrivilegeOffer("signature", benefitId) ? "signature" : "complimentary";
  if (!getPrivilegeOffer(section, benefitId)) notFound();
  return <>
    <PartnerPrivilegeDetailPage locale={locale} partnerId={benefitId} section={section} publicBasePath="/solitaire" />
    <Footer variant="prioritas" tone="solitaire" hideMagazineLink />
  </>;
}
