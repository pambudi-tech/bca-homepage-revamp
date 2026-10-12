import PublicPrivilegeView from "./PublicPrivilegeView";
import { Suspense } from "react";
import PublicPrivilegeRouter, { type PublicPrivilegeSections } from "./PublicPrivilegeRouter";
import type { PrioritasIndexTab } from "./PrioritasIndexTabs";
import { getPrivilegePromos } from "@/lib/partner-privileges";
import { getPrioritasSourceEvents, getPrioritasSourcePromos } from "@/lib/prioritas-source-data";
import { getPromos } from "@/lib/promos";
import { getFeaturedBannerBackdrops } from "./featured-banner-backdrops";
import { PRIORITAS_EVENT_FEATURED_BANNER_SLIDES } from "./featured-banner-data";

export default async function PublicPrivilegePage({ brand, section }: { brand: "prioritas" | "solitaire"; section?: string | string[] }) {
  const activeSection: PrioritasIndexTab = section === "lifestyle" || section === "event" || section === "promo" ? section : "signature";
  const now = new Date();
  const [livePromos, bannerBackdrops] = await Promise.all([
    getPromos(now), getFeaturedBannerBackdrops(PRIORITAS_EVENT_FEATURED_BANNER_SLIDES),
  ]);
  const shared = { brand, signaturePromos: getPrivilegePromos("signature"), now: now.toISOString() };
  const sections: PublicPrivilegeSections = {
    signature: { ...shared, activeSection: "signature", promos: getPrivilegePromos("complimentary"), events: [], bannerBackdrops: {} },
    lifestyle: { ...shared, activeSection: "lifestyle", promos: getPrivilegePromos("lifestyle"), events: [], bannerBackdrops: {} },
    event: { ...shared, activeSection: "event", promos: [], events: getPrioritasSourceEvents(), bannerBackdrops },
    promo: { ...shared, activeSection: "promo", promos: [...getPrioritasSourcePromos(), ...livePromos], events: [], bannerBackdrops: {} },
  };
  if (section !== undefined) return <PublicPrivilegeView {...sections[activeSection]} />;
  return <Suspense fallback={<PublicPrivilegeView {...sections.signature} />}>
    <PublicPrivilegeRouter sections={sections} />
  </Suspense>;
}
