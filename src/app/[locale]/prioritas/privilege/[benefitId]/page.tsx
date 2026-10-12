import { notFound, redirect } from "next/navigation";
import { getPrivilegeOffer, getPrivilegePromos } from "@/lib/partner-privileges";
import { privilegeDetailBase } from "@/lib/privilege-paths";
import { routing } from "@/i18n/routing";

type DetailParams = { locale: string; benefitId: string };
export const dynamicParams = false;

export function generateStaticParams() {
  const ids = [...new Set([...getPrivilegePromos("signature"), ...getPrivilegePromos("complimentary")].map(item => item.id))];
  return routing.locales.flatMap(locale => ids.map(benefitId => ({ locale, benefitId })));
}

export default async function LegacyPrivilegeDetailPage({ params }: { params: Promise<DetailParams> }) {
  const { locale, benefitId } = await params;
  const section = getPrivilegeOffer("signature", benefitId) ? "signature" : "complimentary";
  if (!getPrivilegeOffer(section, benefitId)) notFound();
  redirect(`${locale === "id" ? "" : `/${locale}`}${privilegeDetailBase("/prioritas", section)}/${encodeURIComponent(benefitId)}`);
}
