"use client";

import { useLayoutEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import PromoCard from "@/components/promo/PromoCard";
import PromoCarousel from "@/components/promo/PromoCarousel";
import { getPromoBadge, getPromoTimestamp, type Promo } from "@/components/home/promo-data";
import Navbar from "@/components/home/Navbar";
import PrioritasEventDateTile from "@/components/prioritas/PrioritasEventDateTile";
import type { EventPromo } from "@/components/prioritas/event-data";
import PrioritasDetailSubnav from "@/components/prioritas/PrioritasDetailSubnav";
import PrioritasPageHeader from "@/components/prioritas/PrioritasPageHeader";
import { useLenis } from "@/components/SmoothScroll";

const ASSET_ROOT = "/assets/prioritas/detail/molton-brown";
type DetailPanel = string;
type CustomDetailSection = { id: string; title: string; content: string };

type DetailCopy = {
  subNav: { label: string; privilege: string; banking: string; magazine: string };
  breadcrumb: { home: string; category: string; current: string };
  title: string;
  brand?: string;
  detail: { title: string; content: string; description?: string };
  terms: { title: string; items: string[] };
  validUntil?: { label: string; value: string };
  contact: { title: string; content: string; items?: string[]; groups?: { intro: string; items: string[] } };
  location: { title: string; content: string };
  recommendations: {
    title: string;
    viewMore: string;
  };
};

type DetailKind = "lifestyle" | "complimentary" | "event" | "promo" | "about";

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

const DOCUMENT_SECTION_HEADINGS = new Set([
  "Deskripsi",
  "Fitur utama",
  "Biaya",
  "Manfaat",
  "Risiko",
  "Persyaratan dan tata cara",
  "Simulasi biaya layanan",
  "Simulasi biaya",
  "Informasi tambahan",
  "Pertanyaan dan pengaduan",
]);

function DocumentLines({ lines }: { lines: string[] }) {
  const blocks: React.ReactNode[] = [];
  let bullets: string[] = [];

  const flushBullets = () => {
    if (bullets.length) {
      blocks.push(<ul key={`list-${blocks.length}`} className="list-disc space-y-1 pl-5">{bullets.map((bullet, index) => <li key={`${index}-${bullet}`}>{bullet}</li>)}</ul>);
      bullets = [];
    }
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("•")) {
      bullets.push(trimmed.slice(1).trim());
      return;
    }
    flushBullets();
    if (trimmed) blocks.push(<p key={`text-${blocks.length}`} className="whitespace-pre-line">{trimmed}</p>);
  });
  flushBullets();

  return <div className="space-y-2">{blocks}</div>;
}

function FormattedDocumentContent({ content }: { content: string }) {
  const sections = content.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);

  return <div className="space-y-5 text-sm leading-6 text-neutral-700 xl:text-base">
    {sections.map((section, index) => {
      const lines = section.split("\n").map((line) => line.trim()).filter(Boolean);
      const heading = lines[0];

      if (index === 0 && lines.every((line) => line.includes(":"))) {
        return <dl key={section} className="grid gap-2 rounded-xl bg-pgold-100/70 p-4 sm:grid-cols-2">
          {lines.map((line) => {
            const separator = line.indexOf(":");
            return <div key={line}>
              <dt className="font-semibold text-pbrown-600">{line.slice(0, separator + 1)}</dt>
              <dd>{line.slice(separator + 1).trim()}</dd>
            </div>;
          })}
        </dl>;
      }

      if (DOCUMENT_SECTION_HEADINGS.has(heading)) {
        return <section key={section} className="space-y-2">
          <h3 className="text-base font-semibold leading-6 text-pbrown-600 xl:text-lg">{heading}</h3>
          <DocumentLines lines={lines.slice(1)} />
        </section>;
      }

      return <DocumentLines key={section} lines={lines} />;
    })}
  </div>;
}

export default function PrioritasDetailExperience({ copy, promos, now, kind = "lifestyle", heroImage, brandLogo, eventDate, heroPromo, categoryFilter = "beauty", showHero = true, showRecommendations = true, customSections, relatedPage }: {
  copy: DetailCopy;
  promos: Promo[];
  now: string;
  kind?: DetailKind;
  heroImage?: string;
  brandLogo?: string;
  eventDate?: EventPromo["dateTile"];
  heroPromo?: Promo;
  categoryFilter?: string;
  showHero?: boolean;
  showRecommendations?: boolean;
  customSections?: CustomDetailSection[];
  relatedPage?: { title: string; href: string; label: string };
}) {
  const promoT = useTranslations("promo");
  const pathname = usePathname();
  const lenis = useLenis();
  const [openPanels, setOpenPanels] = useState<DetailPanel[]>(customSections?.length ? [customSections[0].id] : kind === "about" ? ["detail", "terms", "contact"] : ["detail", "terms"]);
  const toggle = (panel: DetailPanel) => setOpenPanels((current) => current.includes(panel) ? current.filter((item) => item !== panel) : [...current, panel]);
  const brand = copy.brand?.trim();
  const directoryPath = kind === "event" ? "/prioritas/event" : kind === "promo" ? "/prioritas/promo" : kind === "complimentary" ? "/prioritas/privilege" : kind === "about" ? "/prioritas" : "/prioritas/lifestyle-privilege";
  const heroTimestamp = heroPromo ? getPromoTimestamp(heroPromo, new Date(now), getPromoBadge(heroPromo, new Date(now))) : null;
  const heroTimestampLabel = heroTimestamp
    ? promoT(`timestamp.${heroTimestamp.kind}`, { hours: heroTimestamp.kind === "hoursLeft" ? heroTimestamp.hours : 0, date: heroTimestamp.kind === "until" ? heroTimestamp.date : "" })
    : null;

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    lenis?.scrollTo(0, { immediate: true });
  }, [lenis, pathname]);

  return (
    <article className="relative isolate overflow-x-clip bg-pgold-200 text-neutral-900">
      <div className="relative">
        <Navbar variant="prioritas" />
        <PrioritasDetailSubnav
          label={copy.subNav.label}
          privilege={copy.subNav.privilege}
          banking={copy.subNav.banking}
          magazine={copy.subNav.magazine}
          active={kind === "about" ? null : undefined}
        />
        <PrioritasPageHeader
          breadcrumbs={kind === "about" ? [
            { label: copy.breadcrumb.home, href: "/prioritas" },
            { label: copy.breadcrumb.current },
          ] : [
            { label: copy.breadcrumb.home, href: "/prioritas" },
            { label: copy.breadcrumb.category, href: directoryPath },
            { label: copy.breadcrumb.current, href: `${directoryPath}?category=${categoryFilter}` },
          ]}
          title={copy.title}
          subtitle={brand || undefined}
          logo={brand && brandLogo ? { src: brandLogo, alt: brand } : undefined}
          layout="detail"
        />
      </div>

      <section className={`pointer-events-none relative ${brand ? "-mt-5 xl:-mt-16" : "-mt-14 xl:-mt-[6.5rem]"} overflow-x-clip pb-20 xl:pb-28`}>
        <div aria-hidden className={`bg-decoration-wrapper pointer-events-none absolute inset-x-0 -z-10 overflow-hidden ${brand ? "top-5 xl:top-16" : "top-14 xl:top-[6.5rem]"}`}>
          <img src={`${ASSET_ROOT}/raw-01.png`} alt="" className="block h-auto w-full opacity-25" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent via-pgold-200/70 to-pgold-200" />
        </div>
        <div className="pointer-events-none relative z-20 mx-auto w-full max-w-[1280px] px-4 xl:px-0">
          <div className={`grid gap-6 ${showHero ? "xl:grid-cols-[560px_minmax(0,1fr)] xl:gap-6" : "grid-cols-1"}`}>
            {showHero ? <div className="pointer-events-auto relative z-0 aspect-[4/3] w-full self-start overflow-hidden rounded-2xl xl:sticky xl:top-6 xl:h-[480px] xl:aspect-auto">
              {heroImage ? <img src={heroImage} alt={copy.title} className="size-full object-cover" /> : <div className="flex size-full items-center justify-center bg-pgold-200 p-8 text-center text-subtitle text-pbrown-700">{brand ?? copy.title}</div>}
              {eventDate ? <PrioritasEventDateTile date={eventDate} detail /> : null}
              {heroTimestampLabel ? <PrioritasEventDateTile timeLabel={heroTimestampLabel} timeIconSrc="/assets/prioritas/detail/promo/clock.svg" /> : null}
            </div> : null}
            <div className={showHero ? "" : "w-full"}>
              <div
                className="pointer-events-auto -mx-4 flex w-[calc(100%+2rem)] flex-col gap-4 rounded-t-[20px] rounded-b-none bg-white p-2 xl:mx-0 xl:w-full xl:rounded-2xl"
              >
                <div className="flex flex-col gap-4">
                  {customSections?.length ? customSections.map((section) => (
                    <DetailRow key={section.id} title={section.title} open={openPanels.includes(section.id)} onToggle={() => toggle(section.id)}>
                      <FormattedDocumentContent content={section.content} />
                    </DetailRow>
                  )) : <>
                    <DetailRow title={copy.detail.title} open={openPanels.includes("detail")} onToggle={() => toggle("detail")}>
                      {copy.detail.description ? <p className="mb-4">{copy.detail.description}</p> : null}
                      <p className="whitespace-pre-line">{copy.detail.content}</p>
                    </DetailRow>
                    <DetailRow title={copy.terms.title} open={openPanels.includes("terms")} onToggle={() => toggle("terms")}>
                      <ul className="list-disc space-y-1 pl-5">
                        {copy.terms.items.map((item) => <li key={item}>{item}</li>)}
                      </ul>
                      {copy.validUntil ? <p className="mt-4 font-semibold">{copy.validUntil.label}: {copy.validUntil.value}</p> : null}
                    </DetailRow>
                    {copy.contact.content || copy.contact.items?.length || copy.contact.groups ? <DetailRow title={copy.contact.title} open={openPanels.includes("contact")} onToggle={() => toggle("contact")}>
                      {copy.contact.items?.length ? <ul className="list-disc space-y-1 pl-5">{copy.contact.items.map((item) => <li key={item}>{item}</li>)}</ul> : null}
                      {copy.contact.groups ? <div className="mt-4"><p>{copy.contact.groups.intro}</p><ul className="mt-2 list-disc space-y-1 pl-5">{copy.contact.groups.items.map((item) => <li key={item}>{item}</li>)}</ul></div> : null}
                      {!copy.contact.items?.length && !copy.contact.groups ? <p className="whitespace-pre-line">{copy.contact.content}</p> : null}
                    </DetailRow> : null}
                    {copy.location.content ? <DetailRow title={copy.location.title} open={openPanels.includes("location")} onToggle={() => toggle("location")}>
                      <p>{copy.location.content}</p>
                    </DetailRow> : null}
                  </>}
                </div>
              </div>
              {relatedPage ? <section className="pointer-events-auto mt-6 xl:mt-8" aria-labelledby="related-page-title">
                <h2 id="related-page-title" className="mb-3 text-base font-semibold text-pbrown-600 xl:text-lg">{relatedPage.title}</h2>
                <Link href={relatedPage.href} className="group flex items-center justify-between rounded-2xl border border-pbrown-100 bg-white px-5 py-4 text-pbrown-600 transition-colors hover:border-pgold-500">
                  <span className="font-semibold">{relatedPage.label}</span>
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-5 shrink-0 transition-transform group-hover:translate-x-1">
                    <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </section> : null}
            </div>
          </div>

          {showRecommendations ? <section className="pointer-events-auto -mx-4 bg-pgold-200 px-4 pt-10 xl:mx-0 xl:mt-20 xl:bg-transparent xl:px-0 xl:pt-0">
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
            <div className="mt-6 xl:hidden">
              <PromoCarousel promos={promos.slice(0, 3)} now={new Date(now)} loop={false} variant="prioritas" promoPage={kind === "promo"} partnerPrivilege={kind === "lifestyle" || kind === "complimentary"} detail detailHrefBase={directoryPath} showEventDate={kind === "event"} />
            </div>
            <div className="hidden gap-6 xl:mt-8 xl:grid xl:grid-cols-3">
              {promos.slice(0, 3).map((promo) => <PromoCard key={promo.id} promo={promo} now={new Date(now)} reveal={false} variant="prioritas" fill detail promoPage={kind === "promo"} partnerPrivilege={kind === "lifestyle" || kind === "complimentary"} eventDate={kind === "event" && "dateTile" in promo ? (promo as EventPromo).dateTile : undefined} detailHref={`${directoryPath}/${promo.id}`} />)}
            </div>
          </section> : null}
        </div>
      </section>
    </article>
  );
}
