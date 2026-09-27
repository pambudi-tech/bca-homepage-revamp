"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import PromoCard from "@/components/promo/PromoCard";
import { getPromoBadge, getPromoTimestamp, type Promo } from "@/components/home/promo-data";
import Navbar from "@/components/home/Navbar";
import PrioritasEventDateTile from "@/components/prioritas/PrioritasEventDateTile";
import type { EventPromo } from "@/components/prioritas/event-data";
import PrioritasDetailSubnav from "@/components/prioritas/PrioritasDetailSubnav";
import PrioritasPageHeader from "@/components/prioritas/PrioritasPageHeader";
import { useLenis } from "@/components/SmoothScroll";

const ASSET_ROOT = "/assets/prioritas/detail/molton-brown";
type DetailPanel = "detail" | "terms" | "contact" | "location";

type DetailCopy = {
  subNav: { label: string; privilege: string; banking: string; magazine: string };
  breadcrumb: { home: string; category: string; current: string };
  title: string;
  brand?: string;
  detail: { title: string; content: string };
  terms: { title: string; items: string[] };
  contact: { title: string; content: string };
  location: { title: string; content: string };
  recommendations: {
    title: string;
    viewMore: string;
  };
};

type DetailKind = "lifestyle" | "event" | "promo";

function DetailRow({
  title,
  children,
  open,
  onToggle,
}: {
  title: string;
  children: React.ReactNode;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <section className="group relative rounded-xl transition-colors hover:bg-pgold-100 before:absolute before:inset-x-4 before:-top-2 before:border-t before:border-neutral-300 before:content-[''] first:before:hidden">
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-6 rounded-xl bg-transparent p-2 text-left text-lg font-semibold text-neutral-900 transition-colors group-hover:text-pbrown-500 xl:p-4 xl:text-title"
      >
        <span>{title}</span>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-pgold-200">
          <img
            src={`${ASSET_ROOT}/chevron-up.svg`}
            alt=""
            className={`size-6 transition-transform duration-200 ${open ? "-rotate-90" : "rotate-90"}`}
          />
        </span>
      </button>
      <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="px-2 pb-2 text-sm leading-5 text-neutral-700 xl:px-4 xl:pb-4 xl:text-base xl:leading-6">{children}</div>
        </div>
      </div>
    </section>
  );
}

export default function PrioritasDetailExperience({ copy, promos, now, kind = "lifestyle", heroImage = `${ASSET_ROOT}/raw-09.png`, brandLogo = `${ASSET_ROOT}/raw-11.png`, eventDate, heroPromo, categoryFilter = "beauty" }: {
  copy: DetailCopy;
  promos: Promo[];
  now: string;
  kind?: DetailKind;
  heroImage?: string;
  brandLogo?: string;
  eventDate?: EventPromo["dateTile"];
  heroPromo?: Promo;
  categoryFilter?: string;
}) {
  const promoT = useTranslations("promo");
  const pathname = usePathname();
  const lenis = useLenis();
  const [openPanels, setOpenPanels] = useState<DetailPanel[]>(["detail", "terms"]);
  const [sheetPinned, setSheetPinned] = useState(false);
  const [sheetScrolled, setSheetScrolled] = useState(false);
  const [sheetTrackHeight, setSheetTrackHeight] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const sheetContentRef = useRef<HTMLDivElement>(null);
  const toggle = (panel: DetailPanel) => setOpenPanels((current) => current.includes(panel) ? current.filter((item) => item !== panel) : [...current, panel]);
  const brand = copy.brand?.trim();
  const directoryPath = kind === "event" ? "/prioritas/event" : kind === "promo" ? "/prioritas/promo" : "/prioritas/lifestyle-privilege";
  const heroTimestamp = heroPromo ? getPromoTimestamp(heroPromo, new Date(now), getPromoBadge(heroPromo, new Date(now))) : null;
  const heroTimestampLabel = heroTimestamp
    ? promoT(`timestamp.${heroTimestamp.kind}`, { hours: heroTimestamp.kind === "hoursLeft" ? heroTimestamp.hours : 0, date: heroTimestamp.kind === "until" ? heroTimestamp.date : "" })
    : null;

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    lenis?.scrollTo(0, { immediate: true });
  }, [lenis, pathname]);

  useEffect(() => {
    const mobileLayout = window.matchMedia("(max-width: 1279px)");
    let frame = 0;
    const update = () => {
      frame = 0;
      const sheet = sheetRef.current;
      const content = sheetContentRef.current;
      if (!sheet || !content) return;
      setSheetScrolled(mobileLayout.matches && window.scrollY > 8);
      if (!mobileLayout.matches) {
        setSheetPinned(false);
        setSheetTrackHeight(0);
        sheet.scrollTop = 0;
        return;
      }

      const shouldPin = sheet.getBoundingClientRect().top <= 64;
      setSheetPinned((current) => {
        if (current && !shouldPin) sheet.scrollTop = 0;
        return current === shouldPin ? current : shouldPin;
      });
      const nextTrackHeight = content.scrollHeight + 16;
      setSheetTrackHeight((current) => Math.abs(current - nextTrackHeight) < 1 ? current : nextTrackHeight);
    };
    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const contentObserver = new ResizeObserver(scheduleUpdate);

    if (sheetContentRef.current) contentObserver.observe(sheetContentRef.current);
    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    mobileLayout.addEventListener("change", scheduleUpdate);
    return () => {
      window.cancelAnimationFrame(frame);
      contentObserver.disconnect();
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      mobileLayout.removeEventListener("change", scheduleUpdate);
    };
  }, []);

  return (
    <article className="relative isolate overflow-x-clip bg-pgold-200 text-neutral-900">
      <div className="sticky top-0 z-0 xl:relative">
        <Navbar variant="prioritas" staticOnMobile keepTransparentOnScroll />
        <PrioritasDetailSubnav
          label={copy.subNav.label}
          privilege={copy.subNav.privilege}
          banking={copy.subNav.banking}
          magazine={copy.subNav.magazine}
        />
        <PrioritasPageHeader
          breadcrumbs={[
            { label: copy.breadcrumb.home, href: "/prioritas" },
            { label: copy.breadcrumb.category, href: directoryPath },
            { label: copy.breadcrumb.current, href: `${directoryPath}?category=${categoryFilter}` },
          ]}
          title={copy.title}
          subtitle={brand || undefined}
          logo={brand ? { src: brandLogo, alt: brand } : undefined}
          layout="detail"
        />
      </div>

      <section className={`pointer-events-none relative ${brand ? "-mt-5 xl:-mt-16" : "-mt-14 xl:-mt-[6.5rem]"} overflow-x-clip pb-20 xl:pb-28`}>
        <div aria-hidden className={`bg-decoration-wrapper pointer-events-none absolute inset-x-0 -z-10 overflow-hidden ${brand ? "top-5 xl:top-16" : "top-14 xl:top-[6.5rem]"}`}>
          <img src={`${ASSET_ROOT}/raw-01.png`} alt="" className="block h-auto w-full opacity-25" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent via-pgold-200/70 to-pgold-200" />
        </div>
        <div className="pointer-events-none relative z-20 mx-auto w-full max-w-[1280px] px-4 xl:px-0">
          <div className="grid gap-6 xl:grid-cols-[560px_minmax(0,1fr)] xl:gap-6">
            <div className={`pointer-events-auto sticky ${brand ? "top-[340px]" : "top-[304px]"} z-0 w-full self-start aspect-[4/3] overflow-hidden rounded-2xl xl:top-6 xl:h-[480px] xl:aspect-auto`}>
              <img src={heroImage} alt={copy.title} className="size-full object-cover" />
              {eventDate ? <PrioritasEventDateTile date={eventDate} detail /> : null}
              {heroTimestampLabel ? <PrioritasEventDateTile timeLabel={heroTimestampLabel} timeIconSrc="/assets/prioritas/detail/promo/clock.svg" /> : null}
            </div>
            <div
              className="relative min-h-[var(--detail-panel-track-height)] xl:min-h-0"
              style={{ "--detail-panel-track-height": `${sheetTrackHeight}px` } as React.CSSProperties}
            >
              <div
                ref={sheetRef}
                className={`pointer-events-auto sticky top-[calc(4rem+env(safe-area-inset-top))] z-30 -mx-4 flex w-[calc(100%+2rem)] flex-col gap-4 rounded-t-[20px] rounded-b-none bg-white p-2 transition-shadow duration-300 xl:static xl:z-auto xl:mx-0 xl:w-full xl:rounded-2xl xl:p-2 ${sheetScrolled ? "shadow-scroll-top" : ""} ${sheetPinned ? "max-h-[calc(100dvh-4rem-env(safe-area-inset-top))] overflow-y-auto" : ""}`}
              >
                <div ref={sheetContentRef} className="flex flex-col gap-4">
                  <DetailRow title={copy.detail.title} open={openPanels.includes("detail")} onToggle={() => toggle("detail")}>
                    <p>{copy.detail.content}</p>
                  </DetailRow>
                  <DetailRow title={copy.terms.title} open={openPanels.includes("terms")} onToggle={() => toggle("terms")}>
                    <ul className="list-disc space-y-1 pl-5">
                      {copy.terms.items.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </DetailRow>
                  <DetailRow title={copy.contact.title} open={openPanels.includes("contact")} onToggle={() => toggle("contact")}>
                    <p>{copy.contact.content}</p>
                  </DetailRow>
                  <DetailRow title={copy.location.title} open={openPanels.includes("location")} onToggle={() => toggle("location")}>
                    <p>{copy.location.content}</p>
                  </DetailRow>
                </div>
              </div>
            </div>
          </div>

          <section className="pointer-events-auto -mx-4 bg-pgold-200 px-4 pt-10 xl:mx-0 xl:mt-20 xl:bg-transparent xl:px-0 xl:pt-0">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-pbrown-600 xl:text-heading">
                {copy.recommendations.title}
              </h2>
              <Link href={directoryPath} className="hidden items-center gap-1.5 text-base font-semibold leading-6 text-pbrown-600 transition-colors hover:text-pgold-700 xl:inline-flex">
                <span>{copy.recommendations.viewMore}</span>
                <span
                  aria-hidden
                  className="size-5 shrink-0 bg-pbrown-600"
                  style={{
                    maskImage: "url(/assets/prioritas/detail/molton-brown/arrow-right.svg)",
                    WebkitMaskImage: "url(/assets/prioritas/detail/molton-brown/arrow-right.svg)",
                    maskRepeat: "no-repeat",
                    WebkitMaskRepeat: "no-repeat",
                    maskPosition: "center",
                    WebkitMaskPosition: "center",
                    maskSize: "contain",
                    WebkitMaskSize: "contain",
                  }}
                />
              </Link>
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-3 xl:mt-8">
              {promos.slice(0, 3).map((promo) => <PromoCard key={promo.id} promo={promo} now={new Date(now)} reveal={false} variant="prioritas" fill detail promoPage={kind === "promo"} eventDate={kind === "event" && "dateTile" in promo ? (promo as EventPromo).dateTile : undefined} detailHref={kind === "lifestyle" ? undefined : `${directoryPath}/${promo.id}`} />)}
            </div>
          </section>
        </div>
      </section>
    </article>
  );
}
