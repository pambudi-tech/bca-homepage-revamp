import { setRequestLocale } from "next-intl/server";
import SignaturePrivilegeExperience from "@/components/prioritas/SignaturePrivilegeExperience";
import { getPrivilegePromos } from "@/lib/partner-privileges";

export default async function SolitaireLifestylePrivilegePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <SignaturePrivilegeExperience
    promos={getPrivilegePromos("lifestyle")}
    now={new Date()}
    directoryOnly
    activeTab="lifestyle"
    publicBasePath="/solitaire"
  />;
}
