"use client";

import { useLayoutEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import ContentCard from "@/components/prioritas/ContentCard";
import SignaturePrivilegeCard from "@/components/prioritas/SignaturePrivilegeCard";
import ExecutiveAirportLoungeTable from "@/components/prioritas/ExecutiveAirportLoungeTable";
import PromoRibbon from "@/components/PromoRibbon";
import PromoCarousel from "@/components/promo/PromoCarousel";
import { getPromoBadge, getPromoTimestamp, type Promo } from "@/components/home/promo-data";
import Navbar from "@/components/home/Navbar";
import PrioritasEventDateTile from "@/components/prioritas/PrioritasEventDateTile";
import type { EventPromo } from "@/components/prioritas/event-data";
import type { PrivilegePromo } from "@/lib/partner-privileges";
import PrioritasDetailSubnav from "@/components/prioritas/PrioritasDetailSubnav";
import PrioritasPageHeader from "@/components/prioritas/PrioritasPageHeader";
import PrioritasIndexTabs from "@/components/prioritas/PrioritasIndexTabs";
import { BankingPrivilegeCard, type PrivilegeCard } from "@/components/prioritas/BankingSolutionSection";
import MemberSignatureVoucherModule from "@/components/prioritas/MemberSignatureVoucherModule";
import MemberAirportTransferModule from "@/components/prioritas/MemberAirportTransferModule";
import { withMemberSignatureVoucherStatus, type MemberSignatureVoucherStatus } from "@/lib/member-signature-voucher";
import { prioritasButtonClassName } from "@/components/prioritas/PrioritasButton";
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
  location: { title: string; content: string; table?: "executiveAirportLounge" };
  recommendations: {
    title: string;
    viewMore: string;
  };
  dynamicModule?: { message: string; actionLabel: string; memberHref: string };
};

type DetailKind = "signature" | "lifestyle" | "complimentary" | "event" | "promo" | "about" | "banking";

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
  "Privilege",
  "Special Price",
  "Additional Benefit",
  "Informasi Acara",
  "Informasi Penting",
  "Syarat dan Ketentuan",
  "Syarat & Ketentuan",
  "Program Fresh Fund",
  "Periode Program",
  "Special Activity",
  "Activity",
  "Cashback",
  "Complimentary Treatment",
  "Pembicara",
]);

const DOCUMENT_LIST_HEADINGS = new Set([
  "Privilege",
  "Special Price",
  "Additional Benefit",
  "Periode Program",
  "Special Activity",
  "Activity",
  "Cashback",
  "Complimentary Treatment",
  "Pembicara",
  "Program Fresh Fund",
]);

const DOCUMENT_PARAGRAPH_HEADINGS = new Set([
  "Informasi Acara",
  "Informasi Penting",
  "Syarat dan Ketentuan",
  "Syarat & Ketentuan",
]);

const DOCUMENT_FIELD_LABELS = new Set([
  "Hari/Tanggal",
  "Hari dan Tanggal",
  "Tanggal",
  "Hari",
  "Waktu",
  "Pukul",
  "Lokasi",
  "Venue",
  "Periode",
  "Periode penawaran",
  "Periode program",
  "Usia Peserta",
  "Drop-Off Point",
  "RSVP",
  "WA",
  "Website",
  "Dresscode",
  "Dress Code",
  "Catatan",
  "Additional Benefit",
]);

const IMPORTANT_TERM_VALUE = /(?:[≥≤>]\s*)?Rp\s?[\d.,]+(?:\s?(?:ribu|juta|miliar))?|\d{1,2}\s+(?:Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Agu|Okt|Des)\s+\d{4}(?:\s*[–-]\s*\d{1,2}\s+(?:Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Agu|Okt|Des)\s+\d{4})?|(?:[≥≤>]\s*)?\d+(?:[.,]\d+)?\s?(?:%|x|menit|jam|hari|bulan|tahun|orang|voucher)\b/gi;

function ImportantTermText({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(IMPORTANT_TERM_VALUE)) {
    const index = match.index ?? 0;
    if (index > lastIndex) parts.push(text.slice(lastIndex, index));
    parts.push(<strong key={`${index}-${match[0]}`} className="font-semibold">{match[0]}</strong>);
    lastIndex = index + match[0].length;
  }

  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

function LabeledText({ text }: { text: string }) {
  const label = text.match(/^([^:]{1,48}:)\s+(.+)$/);
  if (!label) return <ImportantTermText text={text} />;
  return <><strong className="font-semibold">{label[1]}</strong> <ImportantTermText text={label[2]} /></>;
}

function DocumentLines({ lines }: { lines: string[] }) {
  const blocks: React.ReactNode[] = [];
  let bullets: string[] = [];
  let paragraphs: string[] = [];
  let fields: Array<{ label: string; value: string }> = [];
  let listMode = false;
  let pendingFieldLabel: string | null = null;

  const flushBullets = () => {
    if (bullets.length) {
      blocks.push(<ul key={`list-${blocks.length}`} className="list-disc space-y-2 pl-5">{bullets.map((bullet, index) => <li key={`${index}-${bullet}`}><LabeledText text={bullet} /></li>)}</ul>);
      bullets = [];
    }
  };

  const flushParagraphs = () => {
    if (paragraphs.length) {
      blocks.push(<p key={`text-${blocks.length}`} className="whitespace-pre-line">{paragraphs.join(" ")}</p>);
      paragraphs = [];
    }
  };

  const flushFields = () => {
    if (fields.length) {
      blocks.push(<dl key={`fields-${blocks.length}`} className="grid gap-x-4 gap-y-2 sm:grid-cols-[minmax(8rem,0.32fr)_1fr]">
        {fields.map(({ label, value }, index) => <div key={`${label}-${index}`} className="contents">
          <dt className="font-semibold text-pbrown-600">{label}</dt>
          <dd>{value}</dd>
        </div>)}
      </dl>);
      fields = [];
    }
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    const heading = trimmed.replace(/:\s*$/, "");
    if (DOCUMENT_SECTION_HEADINGS.has(heading) || (trimmed.endsWith(":") && heading.length <= 64)) {
      flushBullets();
      flushParagraphs();
      flushFields();
      blocks.push(<h4 key={`heading-${blocks.length}`} className="font-semibold text-pbrown-600">{heading}</h4>);
      listMode = DOCUMENT_LIST_HEADINGS.has(heading)
        || (trimmed.endsWith(":") && !DOCUMENT_FIELD_LABELS.has(heading) && !DOCUMENT_PARAGRAPH_HEADINGS.has(heading));
      return;
    }
    if (pendingFieldLabel) {
      flushBullets();
      flushParagraphs();
      fields.push({ label: pendingFieldLabel, value: trimmed });
      pendingFieldLabel = null;
      return;
    }
    if (DOCUMENT_FIELD_LABELS.has(trimmed)) {
      flushBullets();
      flushParagraphs();
      flushFields();
      pendingFieldLabel = trimmed;
      return;
    }
    if (trimmed.startsWith("•")) {
      flushParagraphs();
      flushFields();
      bullets.push(trimmed.slice(1).trim());
      return;
    }
    const semicolonItems = trimmed.split(/\s*;\s*/).filter(Boolean);
    if (semicolonItems.length > 1) {
      flushParagraphs();
      flushFields();
      bullets.push(...semicolonItems);
      return;
    }
    const field = trimmed.match(/^([^:]{1,48}):\s*(.+)$/);
    if (field && DOCUMENT_FIELD_LABELS.has(field[1].trim())) {
      flushBullets();
      flushParagraphs();
      fields.push({ label: field[1].trim(), value: field[2].trim() });
      return;
    }
    if (listMode) {
      flushFields();
      bullets.push(trimmed);
      return;
    }
    flushBullets();
    flushFields();
    const pipeItems = trimmed.split(/\s+\|\s+/).map((item) => item.trim()).filter(Boolean);
    if (pipeItems.length > 1) {
      blocks.push(<ul key={`pipe-${blocks.length}`} className="list-disc space-y-2 pl-5">{pipeItems.map((item, index) => <li key={`${index}-${item}`}><LabeledText text={item} /></li>)}</ul>);
      return;
    }
    const fleetDetails = trimmed.match(/^(.*?)\s+Armada:\s*(.+)$/);
    if (fleetDetails) {
      flushParagraphs();
      if (fleetDetails[1]) blocks.push(<p key={`text-${blocks.length}`} className="whitespace-pre-line">{fleetDetails[1]}</p>);
      blocks.push(<section key={`armada-${blocks.length}`} className="space-y-1">
        <h4 className="font-semibold text-pbrown-600">Armada</h4>
        <ul className="list-disc space-y-1 pl-5">{fleetDetails[2].split(/\s+atau\s+/i).map((vehicle, index) => <li key={`${index}-${vehicle}`}>{vehicle.replace(/[.]$/, "")}</li>)}</ul>
      </section>);
    } else if (trimmed) {
      paragraphs.push(trimmed);
    }
  });
  flushBullets();
  flushParagraphs();
  if (pendingFieldLabel) paragraphs.push(`${pendingFieldLabel}:`);
  flushFields();
  flushParagraphs();

  return <div className="space-y-3">{blocks}</div>;
}

function FormattedDocumentContent({ content }: { content: string }) {
  const sections = content.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);

  return <div className="space-y-5 text-sm leading-6 text-neutral-700 xl:text-base">
    {sections.map((section, index) => {
      const lines = section.split("\n").map((line) => line.trim()).filter(Boolean);
      const heading = lines[0];

      const isMetadataBlock = index === 0
        && lines.length > 1
        && lines.every((line) => /^[^:]{1,32}:\s*\S/.test(line));

      if (isMetadataBlock) {
        return <dl key={section} className="grid min-w-0 grid-cols-1 gap-3 rounded-xl bg-pgold-100/70 p-4">
          {lines.map((line) => {
            const separator = line.indexOf(":");
            return <div key={line}>
              <dt className="font-semibold text-pbrown-600">{line.slice(0, separator + 1)}</dt>
              <dd>{line.slice(separator + 1).trim()}</dd>
            </div>;
          })}
        </dl>;
      }

      if (DOCUMENT_SECTION_HEADINGS.has(heading) || (lines.length > 1 && heading.length <= 72 && lines.slice(1).every((line) => line.startsWith("•")))) {
        return <section key={section} className="space-y-2">
          <h3 className="text-base font-semibold leading-6 text-pbrown-600 xl:text-lg">{heading}</h3>
          <DocumentLines lines={lines.slice(1)} />
        </section>;
      }

      return <DocumentLines key={section} lines={lines} />;
    })}
  </div>;
}

export default function PrioritasDetailExperience({ copy, promos, now, kind = "lifestyle", heroImage, birthdayGift = false, brandLogo, eventDate, heroPromo, categoryFilter = "beauty", showHero = true, showRecommendations = true, customSections, relatedPage, bankingRecommendations = [], bankingRecommendationAction = "", memberArea = false, memberPreviewName, memberVoucherStatus, memberAirportTransfer = false }: {
  copy: DetailCopy;
  promos: Promo[];
  now: string;
  kind?: DetailKind;
  heroImage?: string;
  birthdayGift?: boolean;
  brandLogo?: string;
  eventDate?: EventPromo["dateTile"];
  heroPromo?: Promo;
  categoryFilter?: string;
  showHero?: boolean;
  showRecommendations?: boolean;
  customSections?: CustomDetailSection[];
  relatedPage?: { title: string; href: string; label: string };
  bankingRecommendations?: PrivilegeCard[];
  bankingRecommendationAction?: string;
  memberArea?: boolean;
  memberPreviewName?: string;
  memberVoucherStatus?: MemberSignatureVoucherStatus;
  memberAirportTransfer?: "domestic" | "international" | false;
}) {
  const promoT = useTranslations("promo");
  const privilegeT = useTranslations("signaturePrivilege");
  const memberT = useTranslations("memberOverview");
  const pathname = usePathname();
  const lenis = useLenis();
  const [openPanels, setOpenPanels] = useState<DetailPanel[]>(customSections?.length ? [customSections[0].id] : kind === "about" ? ["detail", "terms", "contact"] : ["detail", "terms"]);
  const toggle = (panel: DetailPanel) => setOpenPanels((current) => current.includes(panel) ? current.filter((item) => item !== panel) : [...current, panel]);
  const brand = copy.brand?.trim();
  const detailBase = memberArea ? "/prioritas/member" : "/prioritas";
  const directoryPath = kind === "event" ? `${detailBase}/event` : kind === "promo" ? `${detailBase}/promo` : kind === "complimentary" || kind === "signature" ? `${detailBase}/privilege` : kind === "about" ? "/prioritas" : kind === "banking" ? `${detailBase}/banking-solution` : `${detailBase}/lifestyle-privilege`;
  const listingPath = memberArea
    ? kind === "banking" ? "/prioritas/member/banking-solution" : `/prioritas/member/privilege${kind === "lifestyle" || kind === "event" || kind === "promo" ? `?section=${kind}` : ""}`
    : directoryPath;
  const memberOverviewPath = memberVoucherStatus
    ? withMemberSignatureVoucherStatus("/prioritas/member/overview", memberVoucherStatus)
    : "/prioritas/member/overview";
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
        {memberArea ? <>
          <div className="relative bg-pgold-100">
            <div className="absolute inset-x-0 top-0 h-[calc(7rem+env(safe-area-inset-top))] bg-pbrown-600 xl:h-[120px]" />
            <Navbar variant="prioritas" disableHideShow memberPreviewName={memberT("previewFullName")} />
            <div className="h-[calc(7rem+env(safe-area-inset-top))] xl:h-[120px]" />
          </div>
          <PrioritasIndexTabs activeTab="privilege" surface="overview" />
        </> : <>
        <Navbar variant="prioritas" memberPreviewName={memberPreviewName} />
        <PrioritasDetailSubnav
          label={copy.subNav.label}
          privilege={copy.subNav.privilege}
          banking={copy.subNav.banking}
          magazine={copy.subNav.magazine}
          active={kind === "about" ? null : kind === "banking" ? "banking" : undefined}
        />
        </>}
        <PrioritasPageHeader
          breadcrumbs={kind === "about" ? [
            { label: copy.breadcrumb.home, href: memberArea ? memberOverviewPath : "/prioritas" },
            { label: copy.breadcrumb.current },
          ] : kind === "signature" ? [
            { label: copy.breadcrumb.home, href: memberArea ? memberOverviewPath : "/prioritas" },
            { label: copy.breadcrumb.category, href: listingPath },
          ] : kind === "banking" ? [
            { label: copy.breadcrumb.home, href: memberArea ? memberOverviewPath : "/prioritas" },
            { label: copy.breadcrumb.category, href: directoryPath },
            { label: copy.breadcrumb.current },
          ] : [
            { label: copy.breadcrumb.home, href: memberArea ? memberOverviewPath : "/prioritas" },
            { label: copy.breadcrumb.category, href: listingPath },
            { label: copy.breadcrumb.current, href: memberArea ? listingPath : `${directoryPath}?category=${categoryFilter}` },
          ]}
          title={copy.title}
          subtitle={brand || undefined}
          logo={brand && brandLogo ? { src: brandLogo, alt: brand } : undefined}
          layout="detail"
          memberArea={memberArea}
        />
      </div>

      <section className={`pointer-events-none relative ${brand ? "-mt-5 xl:-mt-16" : "-mt-14 xl:-mt-[6.5rem]"} overflow-x-clip pb-20 xl:pb-28`}>
        <div aria-hidden className={`bg-decoration-wrapper pointer-events-none absolute inset-x-0 -z-10 overflow-hidden ${brand ? "top-5 xl:top-16" : "top-14 xl:top-[6.5rem]"}`}>
          <img src={`${ASSET_ROOT}/raw-01.png`} alt="" className="block h-auto w-full opacity-25" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent via-pgold-200/70 to-pgold-200" />
        </div>
        <div className="pointer-events-none relative z-20 mx-auto w-full max-w-[1280px] px-4 xl:px-0">
          <div className={`grid gap-6 ${showHero ? "xl:grid-cols-2 xl:gap-6" : "grid-cols-1"}`}>
            {showHero ? <div className="pointer-events-auto relative z-0 aspect-[4/3] w-full self-start rounded-2xl xl:sticky xl:top-6 xl:h-[480px] xl:aspect-auto">
              <div className="relative size-full overflow-hidden rounded-2xl">
                {heroImage ? <img src={heroImage} alt={copy.title} className="size-full object-cover" /> : <div className="flex size-full items-center justify-center bg-pgold-200 p-8 text-center text-subtitle text-pbrown-700">{brand ?? copy.title}</div>}
                {eventDate ? <PrioritasEventDateTile date={eventDate} detail /> : null}
                {heroTimestampLabel ? <PrioritasEventDateTile timeLabel={heroTimestampLabel} timeIconSrc="/assets/prioritas/detail/promo/clock.svg" /> : null}
              </div>
              {kind === "complimentary" && birthdayGift ? <PromoRibbon badgeKey="popular" label={privilegeT("complimentary.birthday")} placement="hero" /> : null}
            </div> : null}
            <div className={showHero ? "" : "w-full"}>
              {memberAirportTransfer ? <MemberAirportTransferModule variant={memberAirportTransfer} /> : memberArea && memberVoucherStatus ? <MemberSignatureVoucherModule status={memberVoucherStatus} /> : null}
              {copy.dynamicModule && !memberArea ? <div className="pointer-events-auto relative z-0 -mx-4 mb-0 w-[calc(100%+2rem)] flex flex-col gap-4 rounded-2xl bg-gradient-to-b from-white to-pgold-300 p-5 pb-10 text-sm leading-5 text-neutral-700 shadow-panel-gold sm:mx-0 sm:mb-6 sm:w-auto sm:flex-row sm:items-center sm:justify-between sm:pb-5 xl:px-6">
                <p className="text-sm leading-5 text-pbrown-600 xl:text-base xl:leading-6">{copy.dynamicModule.message}</p>
                <Link href={copy.dynamicModule.memberHref} className={prioritasButtonClassName({ size: "medium", className: "w-full self-stretch xl:w-auto xl:self-auto prio-button--xl-large" })}>{copy.dynamicModule.actionLabel}</Link>
              </div> : null}
              <div
                className={`pointer-events-auto relative z-10 -mx-4 flex w-[calc(100%+2rem)] flex-col gap-4 rounded-t-[20px] rounded-b-none bg-white p-2 xl:mx-0 xl:w-full xl:rounded-2xl ${copy.dynamicModule ? "-mt-5 xl:mt-0" : memberAirportTransfer || memberVoucherStatus ? "-mt-5 xl:mt-0" : "mt-4 xl:mt-0"} ${copy.dynamicModule || memberAirportTransfer || memberVoucherStatus ? "shadow-panel-footer" : ""}`}
              >
                <div className="flex flex-col gap-4">
                  {customSections?.length ? customSections.map((section) => (
                    <DetailRow key={section.id} title={section.title} open={openPanels.includes(section.id)} onToggle={() => toggle(section.id)}>
                      <FormattedDocumentContent content={section.content} />
                    </DetailRow>
                  )) : <>
                    <DetailRow title={copy.detail.title} open={openPanels.includes("detail")} onToggle={() => toggle("detail")}>
                      {copy.detail.description ? <div className="mb-4"><FormattedDocumentContent content={copy.detail.description} /></div> : null}
                      <FormattedDocumentContent content={copy.detail.content} />
                    </DetailRow>
                    <DetailRow title={copy.terms.title} open={openPanels.includes("terms")} onToggle={() => toggle("terms")}>
                      <ul className="list-disc space-y-1 pl-5">
                        {copy.terms.items.map((item) => <li key={item}><ImportantTermText text={item} /></li>)}
                      </ul>
                      {copy.validUntil ? <p className="mt-4 font-semibold">{copy.validUntil.label}: {copy.validUntil.value}</p> : null}
                    </DetailRow>
                    {copy.contact.content || copy.contact.items?.length || copy.contact.groups ? <DetailRow title={copy.contact.title} open={openPanels.includes("contact")} onToggle={() => toggle("contact")}>
                      {copy.contact.items?.length ? <ul className="list-disc space-y-1 pl-5">{copy.contact.items.map((item) => <li key={item}>{item}</li>)}</ul> : null}
                      {copy.contact.groups ? <div className="mt-4"><p>{copy.contact.groups.intro}</p><ul className="mt-2 list-disc space-y-1 pl-5">{copy.contact.groups.items.map((item) => <li key={item}>{item}</li>)}</ul></div> : null}
                      {!copy.contact.items?.length && !copy.contact.groups ? <FormattedDocumentContent content={copy.contact.content} /> : null}
                    </DetailRow> : null}
                    {copy.location.content || copy.location.table ? <DetailRow title={copy.location.title} open={openPanels.includes("location")} onToggle={() => toggle("location")}>
                      {copy.location.table === "executiveAirportLounge" ? <ExecutiveAirportLoungeTable /> : <FormattedDocumentContent content={copy.location.content} />}
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
              <h2 className="text-subtitle font-semibold text-pbrown-600 xl:text-heading">
                {copy.recommendations.title}
              </h2>
              <Link href={listingPath} className="hidden items-center gap-1.5 text-base font-semibold leading-6 text-pbrown-600 transition-colors hover:text-pgold-700 xl:inline-flex">
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
            {kind === "banking" ? <div className="hide-scrollbar -mx-4 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 xl:grid-cols-3">
              {bankingRecommendations.map((card) => <div key={card.href} className="w-[280px] shrink-0 snap-center md:w-auto md:shrink"><BankingPrivilegeCard card={card} action={bankingRecommendationAction} /></div>)}
            </div> : <div className="mt-6 xl:hidden">
              <PromoCarousel promos={promos.slice(0, 3)} now={new Date(now)} loop={false} variant="prioritas" promoPage={kind === "promo"} partnerPrivilege={kind === "lifestyle" || kind === "complimentary" || kind === "signature"} detail detailHrefBase={directoryPath} showEventDate={kind === "event"} contentCardVariant={kind === "signature" ? "signature" : kind === "complimentary" ? "complimentary" : kind === "lifestyle" || kind === "event" || kind === "promo" ? kind : undefined} />
            </div>}
            {kind !== "banking" ? <div className="hidden gap-6 xl:mt-8 xl:grid xl:grid-cols-3">
              {promos.slice(0, 3).map((promo) => kind === "signature" && "birthdayGift" in promo
                ? <SignaturePrivilegeCard key={promo.id} promo={promo as PrivilegePromo} href={`${directoryPath}/${promo.id}`} />
                : kind === "complimentary" && "birthdayGift" in promo
                  ? <ContentCard key={promo.id} item={promo as PrivilegePromo} now={new Date(now)} variant="complimentary" detailHref={`${directoryPath}/${promo.id}`} />
                : kind === "lifestyle" && "birthdayGift" in promo
                  ? <ContentCard key={promo.id} item={promo as PrivilegePromo} now={new Date(now)} variant="lifestyle" detailHref={`${directoryPath}/${promo.id}`} />
                  : kind === "event" && "dateTile" in promo
                    ? <ContentCard key={promo.id} item={promo as EventPromo} now={new Date(now)} variant="event" detailHref={`${directoryPath}/${promo.id}`} />
                    : kind === "promo" ? <ContentCard key={promo.id} item={promo} now={new Date(now)} variant="promo" detailHref={`${directoryPath}/${promo.id}`} /> : null)}
            </div> : null}
          </section> : null}
        </div>
      </section>
    </article>
  );
}
