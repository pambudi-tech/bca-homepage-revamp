import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import PrioritasMemberHeader from "@/components/prioritas/PrioritasMemberHeader";
import PrivilegeSectionTabs from "@/components/prioritas/PrivilegeSectionTabs";
import SignaturePrivilegeExperience from "@/components/prioritas/SignaturePrivilegeExperience";
import { getFeaturedBannerBackdrops } from "@/components/prioritas/featured-banner-backdrops";
import { PRIORITAS_EVENT_FEATURED_BANNER_SLIDES } from "@/components/prioritas/featured-banner-data";
import { getPrivilegePromos } from "@/lib/partner-privileges";
import { getPrioritasSourceEvents, getPrioritasSourcePromos } from "@/lib/prioritas-source-data";

export default async function PrioritasMemberPrivilegePage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ section?: string }> }) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  const privilegeT = await getTranslations("signaturePrivilege");
  const now = new Date();
  const activeSection = (["signature", "lifestyle", "event", "promo"] as const).includes(query.section as "signature" | "lifestyle" | "event" | "promo") ? query.section as "signature" | "lifestyle" | "event" | "promo" : "signature";
  const promos = activeSection === "lifestyle" ? getPrivilegePromos("lifestyle")
    : activeSection === "event" ? getPrioritasSourceEvents()
    : activeSection === "promo" ? getPrioritasSourcePromos()
    : getPrivilegePromos("complimentary");
  const signaturePromos = getPrivilegePromos("signature");
  const bannerBackdrops = activeSection === "event" ? await getFeaturedBannerBackdrops(PRIORITAS_EVENT_FEATURED_BANNER_SLIDES) : {};

  return <>
    <PrioritasMemberHeader activeTab="privilege" title={privilegeT("subNav.privilege")} compactTitleTabGap>
      <PrivilegeSectionTabs activeSection={activeSection} />
    </PrioritasMemberHeader>
    <SignaturePrivilegeExperience promos={promos} signaturePromos={signaturePromos} now={now} memberArea directoryOnly={activeSection !== "signature"} activeTab={activeSection} bannerBackdrops={bannerBackdrops} />
  </>;
}
