import PublicPrivilegeView from "./PublicPrivilegeView";
import type { PrioritasIndexTab } from "./PrioritasIndexTabs";
import { getPrivilegePromos } from "@/lib/partner-privileges";
import { getPrioritasSourceEvents, getPrioritasSourcePromos } from "@/lib/prioritas-source-data";
import { getPromos } from "@/lib/promos";
import { getFeaturedBannerBackdrops } from "./featured-banner-backdrops";
import { PRIORITAS_EVENT_FEATURED_BANNER_SLIDES } from "./featured-banner-data";

export default async function PublicPrivilegePage({ brand, section }: { brand: "prioritas" | "solitaire"; section?: string | string[] }) {
  const activeSection: PrioritasIndexTab = section === "lifestyle" || section === "event" || section === "promo" ? section : "signature";
  const now = new Date();
  const promos = activeSection === "lifestyle" ? getPrivilegePromos("lifestyle")
    : activeSection === "promo" ? [...getPrioritasSourcePromos(), ...await getPromos(now)]
    : getPrivilegePromos("complimentary");
  const bannerBackdrops = activeSection === "event" ? await getFeaturedBannerBackdrops(PRIORITAS_EVENT_FEATURED_BANNER_SLIDES) : {};

  return <PublicPrivilegeView brand={brand} activeSection={activeSection} promos={promos} signaturePromos={getPrivilegePromos("signature")} events={activeSection === "event" ? getPrioritasSourceEvents() : []} bannerBackdrops={bannerBackdrops} now={now.toISOString()} />;
}
