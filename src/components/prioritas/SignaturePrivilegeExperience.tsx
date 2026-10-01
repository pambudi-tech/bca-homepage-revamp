"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ContentCard from "@/components/prioritas/ContentCard";
import type { Promo } from "@/components/home/promo-data";
import type { EventPromo } from "@/components/prioritas/event-data";
import type { PrivilegePromo } from "@/lib/partner-privileges";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { PrioritasIndexTab } from "@/components/prioritas/PrioritasIndexTabs";
import { useIsLive } from "@/lib/useIsLive";
import { useLenis } from "@/components/SmoothScroll";
import { BackToTopAction } from "@/components/home/BackToTop";
import { DIRECTORY_PAGE_SIZE, PrioritasDirectoryCategories, PrioritasDirectoryFilters, PrioritasDirectoryPanel } from "@/components/prioritas/PrioritasDirectory";
import PrioritasDirectoryDropdown from "@/components/prioritas/PrioritasDirectoryDropdown";
import { PrioritasButton, PrioritasButtonIcon, prioritasButtonClassName } from "@/components/prioritas/PrioritasButton";
import PrioritasFeaturedBanner from "@/components/prioritas/PrioritasFeaturedBanner";
import { PRIORITAS_EVENT_FEATURED_BANNER_SLIDES } from "@/components/prioritas/featured-banner-data";

const ASSET_ROOT = "/assets/prioritas/signature-privilege";
const signatureCards = [
  { id: "executive-airport-lounge", image: "privilege-01.png" },
  { id: "airport-transfer-domestik", image: "/assets/prioritas/partners/airport-transfer-domestik.jpg" },
  { id: "airport-transfer-internasional", image: "/assets/prioritas/partners/airport-transfer-internasional.jpg" },
  { id: "medical-check-up-internasional", image: "privilege-11.png" },
  { id: "deteksi-dini-kanker-dan-penyakit-jantung", image: "privilege-10.png" },
  { id: "padel-court", image: "privilege-03.png" },
  // Keep repeated cards in the expanded example rail, each linking to its detail page.
  { id: "executive-airport-lounge", image: "privilege-02.png" },
  { id: "airport-transfer-domestik", image: "/assets/prioritas/partners/airport-transfer-domestik.jpg" },
] as const;

const SIGNATURE_AUTOPLAY_MS = 6000;
const chipCategories = ["travel", "health", "lifestyle", "culinary", "beauty", "education", "home", "business"] as const;

const chipIcons: Record<(typeof chipCategories)[number], string> = {
  beauty: "beauty",
  culinary: "fnb",
  health: "health",
  travel: "travel",
  lifestyle: "lifestyle",
  education: "edu",
  home: "home",
  business: "business",
};

type SignaturePrivilegeExperienceProps = {
  promos: Array<Promo | PrivilegePromo>;
  signaturePromos?: PrivilegePromo[];
  now: Date;
  directoryOnly?: boolean;
  activeTab?: PrioritasIndexTab;
  initialCategories?: string[];
  memberArea?: boolean;
  bannerBackdrops?: Record<string, string>;
};

function isPrivilegePromo(promo: Promo): promo is PrivilegePromo {
  return "privilegeCategory" in promo;
}

function randomOrderKey(id: string) {
  let hash = 2166136261;
  for (const character of id) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export default function SignaturePrivilegeExperience({ promos, signaturePromos = [], now, directoryOnly = false, activeTab, initialCategories = [], memberArea = false, bannerBackdrops = {} }: SignaturePrivilegeExperienceProps) {
  const t = useTranslations("signaturePrivilege");
  const heroT = useTranslations("prioritasHero");
  const lenis = useLenis();
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => initialCategories.filter((category) => chipCategories.some((chip) => chip === category)));
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [birthdayChecked, setBirthdayChecked] = useState(false);
  const [activeSignatureCard, setActiveSignatureCard] = useState(0);
  const [signatureExpanded, setSignatureExpanded] = useState(false);
  const [renderSignatureExtras, setRenderSignatureExtras] = useState(false);
  const [mobileSignatureRail, setMobileSignatureRail] = useState(false);
  const [signatureProgress, setSignatureProgress] = useState(0);
  const signatureAnimationFrameRef = useRef<number | null>(null);
  const signatureAnimationTimerRef = useRef<number | null>(null);
  const pausedSignatureRef = useRef(false);
  const signatureSectionRef = useRef<HTMLElement>(null);
  const signatureRailRef = useRef<HTMLDivElement>(null);
  const directoryPanelRef = useRef<HTMLElement>(null);
  const [directoryInViewport, setDirectoryInViewport] = useState(true);
  const [directoryBelowViewport, setDirectoryBelowViewport] = useState(true);
  const signatureCardRefs = useRef<Array<HTMLElement | null>>([]);
  const signatureLive = useIsLive(signatureSectionRef);
  const currentTab = activeTab ?? (directoryOnly ? "lifestyle" : "signature");
  const orderedPromos = useMemo(
    () => currentTab === "signature" ? [...promos].sort((a, b) => randomOrderKey(`prioritas-complimentary:${a.id}`) - randomOrderKey(`prioritas-complimentary:${b.id}`)) : promos,
    [currentTab, promos],
  );
  const availableChipCategories = chipCategories;
  const visibleSignatureCards = renderSignatureExtras || mobileSignatureRail ? signatureCards : signatureCards.slice(0, 6);
  const activeSignatureCardCount = signatureExpanded || mobileSignatureRail ? signatureCards.length : Math.min(6, signatureCards.length);
  const brandOptions = useMemo(() => {
    const brands = [...new Set(promos.map((promo) => promo.brand))];
    return currentTab === "promo" ? brands.slice(0, 8) : brands;
  }, [currentTab, promos]);
  const filteredPromos = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return orderedPromos.filter((promo) => {
      const categoryMatch = isPrivilegePromo(promo)
        ? selectedCategories.length === 0 || selectedCategories.includes(promo.privilegeCategory)
        : selectedCategories.length === 0 || selectedCategories.some((category) =>
        (category === "beauty" && promo.category === "health-beauty")
        || (category === "culinary" && promo.category === "fnb")
        || (category === "health" && promo.category === "health-beauty")
        || (category === "travel" && promo.category === "travel")
        || (category === "lifestyle" && ["hobby", "fashion-shopping", "retail"].includes(promo.category))
        || (currentTab === "promo" && category === "lifestyle" && promo.category === "entertainment")
        || (category === "education" && promo.category === "hobby")
        || (category === "home" && ["home-electronics", "groceries"].includes(promo.category))
        || (category === "business" && promo.category === "others")
        || (currentTab === "promo" && category === "business" && ["telco", "ecommerce", "loyalty-reward"].includes(promo.category))
      );
      const birthdayMatch = !birthdayChecked || currentTab !== "signature" || (isPrivilegePromo(promo) && promo.birthdayGift);
      const haystack = `${promo.title} ${promo.brand}`.toLocaleLowerCase();
      return categoryMatch && birthdayMatch && (!normalizedQuery || haystack.includes(normalizedQuery));
    });
  }, [birthdayChecked, currentTab, orderedPromos, query, selectedCategories]);
  const visiblePromos = filteredPromos.slice((page - 1) * DIRECTORY_PAGE_SIZE, page * DIRECTORY_PAGE_SIZE);

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 639px)");
    const updateMobileRail = () => {
      setMobileSignatureRail(mobileQuery.matches);
      if (!mobileQuery.matches) {
        setSignatureExpanded(false);
        setRenderSignatureExtras(false);
      }
    };
    updateMobileRail();
    mobileQuery.addEventListener("change", updateMobileRail);
    return () => mobileQuery.removeEventListener("change", updateMobileRail);
  }, []);

  useEffect(() => {
    if (directoryOnly || currentTab !== "signature") return;
    const panel = directoryPanelRef.current;
    if (!panel) return;
    const observer = new IntersectionObserver(([entry]) => {
      setDirectoryInViewport(entry.isIntersecting);
      setDirectoryBelowViewport(entry.boundingClientRect.top >= window.innerHeight);
    });
    observer.observe(panel);
    return () => observer.disconnect();
  }, [currentTab, directoryOnly]);

  const showComplimentaryDirectory = !directoryOnly && currentTab === "signature" && !directoryInViewport;
  const goToComplimentaryDirectory = () => {
    const panel = directoryPanelRef.current;
    if (!panel) return;
    const offset = window.matchMedia("(min-width: 1280px)").matches ? -80 : -72;
    if (lenis) lenis.scrollTo(panel, { offset, duration: 1 });
    else window.scrollTo({ top: window.scrollY + panel.getBoundingClientRect().top + offset, behavior: "smooth" });
  };

  useEffect(() => {
    if (!signatureLive || activeSignatureCardCount < 2) return;
    const timer = window.setInterval(() => {
      if (pausedSignatureRef.current) return;
      setSignatureProgress((current) => {
        if (current >= 100) {
          setActiveSignatureCard((active) => {
            const next = (active + 1) % activeSignatureCardCount;
            const rail = signatureRailRef.current;
            const card = signatureCardRefs.current[next];
            if (rail && card) rail.scrollTo({ left: card.offsetLeft - (rail.clientWidth - card.offsetWidth) / 2, behavior: "smooth" });
            return next;
          });
          return 0;
        }
        return current + 100 / SIGNATURE_AUTOPLAY_MS;
      });
    }, 100);
    return () => window.clearInterval(timer);
  }, [signatureLive, activeSignatureCardCount]);

  useEffect(() => () => {
    if (signatureAnimationFrameRef.current !== null) window.cancelAnimationFrame(signatureAnimationFrameRef.current);
    if (signatureAnimationTimerRef.current !== null) window.clearTimeout(signatureAnimationTimerRef.current);
  }, []);

  const toggleSignatureCards = () => {
    const rail = signatureRailRef.current;
    if (!rail) return;
    if (signatureAnimationFrameRef.current !== null) window.cancelAnimationFrame(signatureAnimationFrameRef.current);
    if (signatureAnimationTimerRef.current !== null) window.clearTimeout(signatureAnimationTimerRef.current);

    const desktopGrid = window.matchMedia("(min-width: 640px)").matches;
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 500;
    if (desktopGrid) {
      rail.style.height = `${rail.getBoundingClientRect().height}px`;
      rail.style.overflow = "hidden";
      // Commit the current height so the next value can interpolate from it.
      void rail.offsetHeight;
    }

    if (signatureExpanded) {
      setActiveSignatureCard(0);
      setSignatureProgress(0);
      rail.scrollTo({ left: 0 });
      setSignatureExpanded(false);
      if (desktopGrid) {
        const sixthCard = signatureCardRefs.current[5];
        if (sixthCard) rail.style.height = `${sixthCard.offsetTop + sixthCard.offsetHeight}px`;
      }
      signatureAnimationTimerRef.current = window.setTimeout(() => {
        setRenderSignatureExtras(false);
        rail.style.height = "";
        rail.style.overflow = "";
      }, duration);
      return;
    }

    setRenderSignatureExtras(true);
    signatureAnimationFrameRef.current = window.requestAnimationFrame(() => {
      if (desktopGrid) {
        const lastCard = signatureCardRefs.current[signatureCards.length - 1];
        if (lastCard) rail.style.height = `${lastCard.offsetTop + lastCard.offsetHeight}px`;
      }
      setSignatureExpanded(true);
      signatureAnimationTimerRef.current = window.setTimeout(() => {
        rail.style.height = "";
        rail.style.overflow = "";
      }, duration);
    });
  };

  const handleSignatureRailScroll = () => {
    const rail = signatureRailRef.current;
    if (!rail) return;
    const railCenter = rail.getBoundingClientRect().left + rail.clientWidth / 2;
    let closest = activeSignatureCard;
    let distance = Number.POSITIVE_INFINITY;
    signatureCardRefs.current.forEach((card, index) => {
      if (index >= activeSignatureCardCount) return;
      if (!card) return;
      const cardCenter = card.getBoundingClientRect().left + card.offsetWidth / 2;
      const nextDistance = Math.abs(cardCenter - railCenter);
      if (nextDistance < distance) {
        distance = nextDistance;
        closest = index;
      }
    });
    if (closest !== activeSignatureCard) {
      setActiveSignatureCard(closest);
      setSignatureProgress(0);
    }
  };

  function selectCategory(next: string) {
    const nextCategories = selectedCategories.includes(next) ? selectedCategories.filter((category) => category !== next) : [...selectedCategories, next];
    setSelectedCategories(nextCategories);
    setPage(1);
    if (directoryOnly && (currentTab === "lifestyle" || currentTab === "promo")) {
      const url = new URL(window.location.href);
      url.searchParams.delete("category");
      nextCategories.forEach((category) => url.searchParams.append("category", category));
      window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    }
  }

  return (
    <main ref={signatureSectionRef} id="main-content" className="min-h-screen overflow-x-clip bg-pgold-200 text-pbrown-800">
      <section className="relative isolate overflow-x-clip bg-pgold-200 py-8 xl:py-8">
        <div aria-hidden className="absolute inset-0 opacity-40 [background:radial-gradient(ellipse_at_0%_50%,white_0%,transparent_38%),radial-gradient(ellipse_at_100%_18%,white_0%,transparent_36%)]" />
        <div className="relative mx-auto max-w-[1280px] px-4 xl:px-0">
          {directoryOnly ? null : <>
            <p className="text-base font-semibold leading-6">{t("description")}</p>
            <div id="signature-privilege-grid" ref={signatureRailRef} onScroll={handleSignatureRailScroll} onMouseEnter={() => (pausedSignatureRef.current = true)} onMouseLeave={() => (pausedSignatureRef.current = false)} onTouchStart={() => (pausedSignatureRef.current = true)} onTouchEnd={() => (pausedSignatureRef.current = false)} className="hide-scrollbar relative -mx-4 mt-8 flex h-[360px] snap-x snap-mandatory items-center gap-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:mt-6 sm:grid sm:h-auto sm:snap-none sm:overflow-visible sm:px-0 sm:grid-cols-2 xl:grid-cols-3 xl:gap-6 sm:transition-[height] sm:duration-500 sm:ease-in-out motion-reduce:transition-none">
              {visibleSignatureCards.map(({ id, image }, index) => {
                const promo = signaturePromos.find((item) => item.id === id);
                const cardImage = id === "padel-court" ? promo?.cover || `${ASSET_ROOT}/${image}` : image.startsWith("/") ? image : `${ASSET_ROOT}/${image}`;
                return <Link href={`${memberArea ? "/prioritas/member" : "/prioritas"}/privilege/${id}`} ref={(node) => { signatureCardRefs.current[index] = node; }} key={`${id}-${image}-${index}`} aria-hidden={index >= 6 && !signatureExpanded && !mobileSignatureRail} inert={index >= 6 && !signatureExpanded && !mobileSignatureRail} className={`group relative block w-[280px] shrink-0 snap-center overflow-hidden rounded-xl bg-pbrown-800 shadow-prioritas transition-[height,opacity,transform] duration-500 ease-in-out ${activeSignatureCard === index ? "h-[360px]" : "h-[328px]"} ${index >= 6 && !signatureExpanded && !mobileSignatureRail ? "translate-y-4 opacity-0" : "translate-y-0 opacity-100"} sm:h-60 sm:w-auto sm:shrink sm:snap-none`}>
                <img src={cardImage} alt="" className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-pbrown-900/90 via-pbrown-900/20 to-transparent" />
                <div className="absolute left-4 top-4 z-30 xl:hidden">
                  <svg viewBox="0 0 32 32" className={`size-8 -rotate-90 transition-opacity duration-300 ${activeSignatureCard === index ? "opacity-100" : "opacity-0"}`} aria-hidden>
                    <circle cx="16" cy="16" r="16" fill="rgba(0,0,0,0.28)" />
                    <circle cx="16" cy="16" r="14" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                    <circle cx="16" cy="16" r="14" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeDasharray={2 * Math.PI * 14} strokeDashoffset={2 * Math.PI * 14 * (1 - (activeSignatureCard === index ? signatureProgress / 100 : 0))} />
                  </svg>
                </div>
                <div
                  className="glass-panel glass-panel-prioritas absolute inset-x-2 bottom-2 z-10 flex h-[120px] flex-col justify-between rounded-xl p-4 sm:h-auto"
                  style={{ backdropFilter: "blur(16px) saturate(1.25)", WebkitBackdropFilter: "blur(16px) saturate(1.25)", isolation: "isolate" }}
                >
                  <h2 className="min-h-14 text-subtitle text-white">{promo?.title}</h2>
                  <span className={prioritasButtonClassName({ kind: "text", surface: "inverse", size: "large", className: "mt-2 self-start" })}>
                    <span className="prio-button__label">{t("more")}</span>
                    <PrioritasButtonIcon src="/assets/prioritas/privilege/arrow-small.svg" />
                  </span>
                </div>
              </Link>;
              })}
            </div>
            {signatureCards.length > 6 ? <div className="hidden justify-center sm:flex"><button
              type="button"
              aria-controls="signature-privilege-grid"
              aria-expanded={signatureExpanded}
              onClick={toggleSignatureCards}
              className={prioritasButtonClassName({ variant: "secondary", size: "large", className: "mt-6" })}
            >
              <span className="prio-button__label">{t(signatureExpanded ? "showLessSignature" : "showAllSignature")}</span>
              <svg aria-hidden viewBox="0 0 24 24" fill="none" className={`size-5 transition-transform ${signatureExpanded ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button></div> : null}
          </>}

          {directoryOnly && currentTab === "lifestyle" ? <p className="mb-8 text-base font-semibold leading-6">{t("lifestyleDescription")}</p> : null}
          {directoryOnly && currentTab === "event" ? <PrioritasFeaturedBanner
            slides={PRIORITAS_EVENT_FEATURED_BANNER_SLIDES}
            initialIndex={0}
            titles={[heroT("eventPromo.featuredTitles.javaJazz"), heroT("eventPromo.featuredTitles.mercedesAds"), heroT("eventPromo.featuredTitles.theWeeknd"), heroT("eventPromo.featuredTitles.brightspot")]}
            cta={[heroT("eventPromo.featuredCta"), heroT("eventPromo.featuredCtas.mercedesAds"), heroT("eventPromo.featuredCta"), heroT("eventPromo.featuredCta")]}
            backdrops={bannerBackdrops}
            slideHrefs={{
              "java-jazz": "/prioritas/promo/bluebird-javajazz",
              "the-weeknd": "/prioritas/event/program-nabung-konser-the-weeknd-20260618",
              brightspot: "/prioritas/promo/brightspot-city-2026-20260430",
            }}
          /> : null}
          <PrioritasDirectoryPanel
            panelRef={directoryPanelRef}
            desktopPageItems={currentTab === "signature" ? 9 : undefined}
            spacing={directoryOnly && currentTab !== "event" ? "none" : "section"}
            headingId={directoryOnly ? `${currentTab}-directory-title` : "complimentary-title"}
            page={page}
            total={filteredPromos.length}
            onPageChange={setPage}
            emptyMessage={t("empty")}
            header={<>
            {directoryOnly ? <h2 id={`${currentTab}-directory-title`} className="sr-only">{t(`tabs.${currentTab}`)}</h2> : null}
            {directoryOnly ? null : <header className="flex flex-row items-start justify-between gap-3">
              <div><h2 id="complimentary-title" className="text-xl font-semibold">{t("complimentary.title")}</h2><p className="mt-2 text-sm text-neutral-600">{t("complimentary.subtitle")}</p></div>
              <label className="group/compare mt-0.5 flex shrink-0 cursor-pointer items-center gap-2 text-sm leading-5">
                <input type="checkbox" checked={birthdayChecked} onChange={(event) => { setBirthdayChecked(event.target.checked); setPage(1); }} className="peer sr-only" />
                <span className="flex size-6 shrink-0 items-center justify-center p-0.5">
                  <span className={`flex size-5 items-center justify-center rounded-md border text-white transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-pgold-500/40 ${birthdayChecked ? "border-pgold-500 bg-pgold-500" : "border-neutral-600 bg-white group-hover/compare:border-pgold-500"}`}>
                    <svg viewBox="0 0 20 20" fill="none" className={`size-3.5 transition-opacity ${birthdayChecked ? "opacity-100" : "opacity-0"}`} aria-hidden>
                      <path d="m5 10 3 3 7-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </span>
                <span className={birthdayChecked ? "font-semibold text-neutral-800" : "font-normal text-neutral-700"}>{t("complimentary.birthday")}</span>
              </label>
            </header>}
            <PrioritasDirectoryCategories className={directoryOnly ? "mt-0" : "mt-4"}>
                {availableChipCategories.map((key) => <button key={key} type="button" aria-pressed={selectedCategories.includes(key)} onClick={() => selectCategory(key)} className="priosoli-chip priosoli-chip--medium priosoli-chip--xl-large"><span aria-hidden className="priosoli-chip__icon" style={{ maskImage: `url(/assets/prioritas/privilege/categories/${chipIcons[key]}.svg)`, WebkitMaskImage: `url(/assets/prioritas/privilege/categories/${chipIcons[key]}.svg)` }} /><span>{t(`categories.${key}`)}</span></button>)}
            </PrioritasDirectoryCategories>
            <PrioritasDirectoryFilters count={t("showing", { count: filteredPromos.length })}>
              <PrioritasDirectoryDropdown
                id="complimentary-brand-options"
                label={t("searchLabel")}
                value={query}
                options={brandOptions
                  .filter((brand) => brand.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))
                  .map((brand) => ({ value: brand, label: brand }))}
                onChange={(brand) => { setQuery(brand); setPage(1); }}
                widthClassName="xl:w-80"
                size="medium"
                xlSize="large"
                search={{
                  placeholder: t("searchPlaceholder"),
                  onChange: (value) => { setQuery(value); setPage(1); },
                }}
              />
            </PrioritasDirectoryFilters>
            </>}
          >
              {visiblePromos.map((promo) => isPrivilegePromo(promo)
                ? <ContentCard key={promo.id} item={promo} now={now} variant={currentTab === "signature" ? "complimentary" : "lifestyle"} detailHref={memberArea ? `/prioritas/member/${currentTab === "signature" ? "privilege" : "lifestyle-privilege"}/${promo.id}` : undefined} />
                : currentTab === "event" && "dateTile" in promo
                  ? <ContentCard key={promo.id} item={promo as EventPromo} now={now} variant="event" detailHref={memberArea ? `/prioritas/member/event/${promo.id}` : undefined} />
                  : <ContentCard key={promo.id} item={promo} now={now} variant="promo" detailHref={memberArea ? `/prioritas/member/promo/${promo.id}` : undefined} />)}
          </PrioritasDirectoryPanel>
        </div>
      </section>
      {!directoryOnly && currentTab === "signature" ? <BackToTopAction label={t("complimentary.viewList")} shown={showComplimentaryDirectory} onClick={goToComplimentaryDirectory} fitContent direction={directoryBelowViewport ? "down" : "up"} bottomInset="32px" progressiveBackdrop /> : null}
    </main>
  );
}
