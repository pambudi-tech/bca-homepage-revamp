import type { Metadata } from "next";
import PartnerPrivilegeDetailPage from "@/components/prioritas/PartnerPrivilegeDetailPage";
import { getPrivilegeOffer, getPrivilegePromos } from "@/lib/partner-privileges";
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
    title: `${offer.benefit.benefit} | BCA Prioritas`,
    description: offer.partner.description,
  };
}

export default async function ComplimentaryPrivilegeDetailPage({ params }: { params: Promise<DetailParams> }) {
  const { locale, benefitId } = await params;
  const section = getPrivilegeOffer("signature", benefitId) ? "signature" : "complimentary";
  return <PartnerPrivilegeDetailPage locale={locale} partnerId={benefitId} section={section} />;
}
