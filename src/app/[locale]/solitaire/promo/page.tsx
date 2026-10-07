import { setRequestLocale } from "next-intl/server";
import SignaturePrivilegeExperience from "@/components/prioritas/SignaturePrivilegeExperience";
import { getPrioritasSourcePromos } from "@/lib/prioritas-source-data";
import { getPromos } from "@/lib/promos";

export default async function SolitairePromoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const now = new Date();
  const promos = [...getPrioritasSourcePromos(), ...await getPromos(now)];

  return <SignaturePrivilegeExperience
    promos={promos}
    now={now}
    directoryOnly
    activeTab="promo"
    publicBasePath="/solitaire"
  />;
}
