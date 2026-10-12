"use client";

import { privilegeDetailBase } from "@/lib/privilege-paths";
import { useState, useSyncExternalStore } from "react";
import { useLocale, useTranslations } from "next-intl";
import PrioritasDetailSubnav from "@/components/prioritas/PrioritasDetailSubnav";
import Navbar from "@/components/home/Navbar";
import HeroSection from "@/components/home/HeroSection";
import ScrollCue from "@/components/home/ScrollCue";
import SectionAnchor from "@/components/home/SectionAnchor";
import Footer from "@/components/home/Footer";
import { BackToTopAction } from "@/components/home/BackToTop";
import SearchOverlay from "@/components/home/SearchOverlay";
import { ProductAccordion } from "@/components/home/ProductSection";
import PrioritasFeaturedBanner from "@/components/prioritas/PrioritasFeaturedBanner";
import { PRIORITAS_EVENT_FEATURED_BANNER_SLIDES, MERCEDES_AD_SLIDE } from "@/components/prioritas/featured-banner-data";
import SolitaireEventPromoDesktopSlider from "@/components/solitaire/SolitaireEventPromoDesktopSlider";
import { SOLITAIRE_EVENT_SLIDES } from "@/components/solitaire/event-slides";
import KursRatesCarousel from "@/components/prioritas/KursRatesCarousel";
import PrioritasContactSection from "@/components/prioritas/PrioritasContactSection";
import { PrioritasDirectoryPanel } from "@/components/prioritas/PrioritasDirectory";
import ContentCard from "@/components/prioritas/ContentCard";
import SignatureDirectoryCard from "@/components/prioritas/SignatureDirectoryCard";
import MagazineCard from "@/components/prioritas/MagazineCard";
import magazineIssues from "@/components/prioritas/magazine-issues.json";
import { signatureCards } from "@/components/prioritas/signature-card-data";
import { getPrivilegePromos } from "@/lib/partner-privileges";
import { EVENT_PROMO_SAMPLES } from "@/components/prioritas/event-data";
import { PrioritasButton } from "@/components/prioritas/PrioritasButton";
import { formatKursUpdatedAt, type KursEntry } from "@/lib/kurs";


import { CatalogBlueprintContext, CatalogEdgeCaseContext, CatalogFeaturedKindContext } from "./CatalogView";
import { useContext } from "react";

const subscribeLocation = (callback: () => void) => { window.addEventListener("popstate", callback); return () => window.removeEventListener("popstate", callback); };

export function CatalogStageContent({ id, brand, rates, backdrops, withSubnav = false }: { withSubnav?: boolean; id: string; brand: "prioritas" | "solitaire"; rates: KursEntry[]; backdrops: Record<string,string> }) {
  const locale = useLocale();
  const p = useTranslations("prioritasHero");
  const s = useTranslations("solitaireHero");
  const sig = useTranslations("signaturePrivilege");
  const magazine = useTranslations("magazineIndex");
  const b = useTranslations("componentCatalog.board");
  const c = useTranslations("componentCatalog");
  const blueprint = useContext(CatalogBlueprintContext);
  const edgeCase = useContext(CatalogEdgeCaseContext);
  const featuredKind = useContext(CatalogFeaturedKindContext);
  const [searchOpen,setSearchOpen] = useState(true);
  const [page,setPage] = useState(1);
  const solitaire = brand === "solitaire";
  const hero = solitaire ? s : p;
  const anchors = ["privilege","eventPromo","bankingSolution","magazine","financialReport"].map(key=>({key,target:`#catalog-${key}`,label:p(`sections.${key}` as Parameters<typeof p>[0])}));
  let component: React.ReactNode;
  switch(id) {
    case "hero": component = <HeroSection brandedHomepage slides={[{image:solitaire ? "/assets/soliprio/solitaire-image.webp" : "/assets/prioritas/hero-banner.webp",alt:hero("bannerAlt"),title:edgeCase ? b("edgeSamples.heroTitle") : hero("title"),cta:{label:hero("cta"),icon:"/assets/cycle1/chevron-right-1.svg",variant:"primary",tone:brand},brandMark:{src:solitaire ? "/assets/soliprio/solitaire-logo.svg" : "/assets/prioritas/logo.svg",alt:brand}}, ...(["weeknd","jrf"] as const).map(key=>({image:key === "weeknd" ? "/assets/cycle1/hero-banner.webp" : "/assets/cycle1/hero-banner-jrf.webp",alt:p(`campaigns.${key}Alt`),title:p(`campaigns.${key}Title`),cta:{label:p(`campaigns.${key}Cta`),icon:"/assets/cycle1/download-icon.svg",variant:"secondary" as const,tone:brand as "prioritas" | "solitaire"}}))]} mobileStack={<ScrollCue />} desktopStack={<ScrollCue />} />; break;
    case "navbar": component = <div className={`relative min-h-[600px] ${solitaire ? "bg-neutral-900" : "bg-pbrown-800"}`}><Navbar variant={brand} staticOnMobile disableHideShow />{withSubnav ? <PrioritasDetailSubnav label={sig("subNavLabel")} privilege={sig("subNav.privilege")} banking={sig("subNav.banking")} magazine={sig("subNav.magazine")} basePath={`/${brand}`} tone={brand} /> : null}</div>; break;
    case "section-nav": component = <div><SectionAnchor items={anchors} label={p("sectionNavLabel")} variant={brand} sticky={false} preview/></div>; break;
    case "directory-panel": component = <PrioritasDirectoryPanel headingId="catalog-directory-title" header={<h2 id="catalog-directory-title" className="text-title">{p("eventPromo.heading")}</h2>} emptyMessage={c("noResults")} page={page} total={18} onPageChange={setPage} tone={brand}>{EVENT_PROMO_SAMPLES.slice(0,3).map(event=><ContentCard key={event.id} variant="event" item={event} now={new Date("2026-10-09T12:00:00+07:00")} solitaire={solitaire}/>)}</PrioritasDirectoryPanel>; break;
    case "privilege-card": {
      const card = signatureCards[0];
      const promo = getPrivilegePromos("signature").find(item => item.id === card.id);
      component = <section className={`relative isolate overflow-x-clip py-8 ${solitaire ? "bg-neutral-200" : "bg-pgold-200"}`}>
        <div aria-hidden className="absolute inset-0 opacity-40 [background:radial-gradient(ellipse_at_0%_50%,white_0%,transparent_38%),radial-gradient(ellipse_at_100%_18%,white_0%,transparent_36%)]" />
        <div className="relative mx-auto max-w-[1280px] px-4 xl:px-0">
          <div className="hide-scrollbar relative -mx-4 mt-8 flex h-[360px] snap-x snap-mandatory items-center gap-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:mt-6 sm:grid sm:h-auto sm:snap-none sm:overflow-visible sm:px-0 sm:grid-cols-2 xl:grid-cols-3 xl:gap-6 sm:transition-[height] sm:duration-500 sm:ease-in-out motion-reduce:transition-none">
            <SignatureDirectoryCard href={`${privilegeDetailBase(`/${brand}`, "signature")}/${card.id}`} image={`/assets/prioritas/signature-privilege/${card.image}`} title={promo?.title ?? sig("tabs.signature")} tone={brand} active />
          </div>
        </div>
      </section>;
      break;
    }
    case "magazine-card": {
      const issue = magazineIssues[0];
      component = <div className="mx-auto w-full max-w-[1280px] px-4 xl:px-0"><section className={`relative mt-0 -left-4 w-[calc(100%+2rem)] rounded-t-[20px] bg-white shadow-card xl:left-0 xl:w-full xl:rounded-xl ${solitaire ? "text-neutral-800" : "text-pbrown-800"}`}>
        <div className="mx-auto w-full max-w-[1280px] p-4 xl:p-6">
          <div className="relative z-0 mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            <figure className="min-w-0">
              <MagazineCard title={issue.title} action={magazine("readNow")} image={issue.image} imageAlt={magazine("coverAlt",{title:issue.title})} href={`/member/login?from=${brand}&magazine=${encodeURIComponent(issue.slug)}`} className="aspect-[3/4] w-full" usePrioritasButtonLibrary tone={brand} />
              <figcaption className="mt-4 text-center text-size-body-m font-medium text-neutral-700">{issue.title}</figcaption>
            </figure>
          </div>
        </div>
      </section></div>;
      break;
    }
    case "privilege-accordion": component = <div className="relative mx-auto w-full max-w-[1280px] px-4 xl:px-0"><ProductAccordion autoplay={!blueprint} layout="solitaire" controls items={["lounge","health","event"].map(key=>({key,title:p(`privilege.cards.${key}.title` as Parameters<typeof p>[0]),description:"",action:p(`privilege.cards.${key}.action` as Parameters<typeof p>[0]),href:"/solitaire/privilege",image:`/assets/solitaire/privilege/${key}-source.png`}))} defaultKey="lounge"/></div>; break;
    case "featured-event": {
      const entries = featuredKind === "ads" ? [{slide:MERCEDES_AD_SLIDE,title:p("eventPromo.featuredTitles.mercedesAds"),cta:p("eventPromo.featuredCtas.mercedesAds")}] : solitaire ? SOLITAIRE_EVENT_SLIDES.map((slide,index)=>({slide:{id:`solitaire-event-${index}`,image:slide.image,alt:slide.alt},title:slide.title,cta:slide.action})) : PRIORITAS_EVENT_FEATURED_BANNER_SLIDES.map((slide,index)=>({slide,title:[p("eventPromo.featuredTitles.javaJazz"),p("eventPromo.featuredTitles.mercedesAds"),p("eventPromo.featuredTitles.theWeeknd"),p("eventPromo.featuredTitles.brightspot")][index],cta:p("eventPromo.featuredCta")})).filter(entry=>!entry.slide.isAd);
      component = <PrioritasFeaturedBanner key={featuredKind} slides={entries.map(entry=>entry.slide)} initialIndex={0} titles={entries.map(entry=>edgeCase ? b("edgeSamples.eventTitle") : entry.title)} cta={entries.map(entry=>entry.cta)} backdrops={backdrops} buttonTheme={brand}/>;
      break;
    }
    case "event-overlap": component = <div className="mx-auto w-full max-w-[1280px] pb-24"><SolitaireEventPromoDesktopSlider slides={SOLITAIRE_EVENT_SLIDES}/></div>; break;
    case "kurs-carousel": component = <div className={`p-6 ${solitaire ? "bg-neutral-100" : "bg-pbrown-700"}`}><KursRatesCarousel tone={brand} rates={rates} copy={{buy:p("bankingSolution.buy"),sell:p("bankingSolution.sell"),updatedAt:p("bankingSolution.updatedAt",{date:formatKursUpdatedAt(rates[0]?.updatedAt ?? 0,locale)}),refresh:p("bankingSolution.refresh"),previous:p("bankingSolution.previous"),next:p("bankingSolution.next")}}/></div>; break;
    case "floating-action": component = <div className="relative h-60 [transform:translateZ(0)]"><BackToTopAction shown label={b("backToTop")} onClick={()=>window.scrollTo({top:0,behavior:"smooth"})}/></div>; break;
    case "search-overlay": component = <div className="relative min-h-[800px] bg-neutral-200 p-6"><PrioritasButton tone={brand} onClick={()=>setSearchOpen(true)}>{b("openSearch")}</PrioritasButton><SearchOverlay open={searchOpen} onClose={()=>setSearchOpen(false)} initialSegment={solitaire ? "Solitaire" : "Prioritas"}/></div>; break;
    case "contact-footer": component = <div><PrioritasContactSection tone={brand} copy={{heading:p("contact.heading"),riplayTitle:p("contact.riplayTitle"),download:p("contact.download"),contactTitle:p("contact.contactTitle"),phone:p("contact.phone")}}/><Footer variant="prioritas" tone={brand}/></div>; break;
  }
  return component;
}

export default function CatalogStage({ rates, backdrops }: { rates: KursEntry[]; backdrops: Record<string,string> }) {
  const search = useSyncExternalStore(subscribeLocation, () => window.location.search, () => "");
  const query = new URLSearchParams(search);
  return <CatalogStageContent id={query.get("item") ?? "hero"} brand={query.get("brand") === "solitaire" ? "solitaire" : "prioritas"} rates={rates} backdrops={backdrops} />;
}
