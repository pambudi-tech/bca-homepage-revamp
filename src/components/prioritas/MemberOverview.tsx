import { Link } from "@/i18n/navigation";
import PromoCarousel from "@/components/promo/PromoCarousel";
import ContentCard from "@/components/prioritas/ContentCard";
import PrioritasMemberHeader from "@/components/prioritas/PrioritasMemberHeader";
import { PrioritasButtonIcon, prioritasButtonClassName } from "@/components/prioritas/PrioritasButton";
import type { Promo } from "@/components/home/promo-data";
import type { EventPromo } from "@/components/prioritas/event-data";
import MagazineCard from "@/components/prioritas/MagazineCard";
import magazineIssues from "@/components/prioritas/magazine-issues.json";
import { getTranslations } from "next-intl/server";
import { AIRPORT_LOUNGE_VOUCHER_COUNT, withMemberSignatureVoucherStatus, type MemberSignatureVoucherStatus } from "@/lib/member-signature-voucher";

type Props = {
  events: EventPromo[];
  promos: Promo[];
  now: Date;
  voucherStatus?: MemberSignatureVoucherStatus;
};

function OverviewSectionLink({ href, label, className = "" }: { href: string; label: string; className?: string }) {
  return (
    <div className={className}>
      <Link href={href} className={prioritasButtonClassName({ variant: "secondary", surface: "default", size: "large", className: "w-full" })}>
        <span className="prio-button__label">{label}</span>
        <PrioritasButtonIcon src="/assets/cycle1/pelajari-icon.svg" />
      </Link>
    </div>
  );
}

export default async function MemberOverview({ events, promos, now, voucherStatus = "available" }: Props) {
  const t = await getTranslations("memberOverview");
  const voucherT = await getTranslations("memberSignatureVoucher");
  const loungeCount = voucherStatus === "exhausted" ? voucherT("exhausted") : voucherStatus === "unlimited" ? voucherT("unlimited") : voucherT("available", { count: AIRPORT_LOUNGE_VOUCHER_COUNT });
  const signature = [
    { key: "lounge", detailId: "executive-airport-lounge", icon: "/assets/prioritas/member-overview/signature-airport.png", title: t("signature.lounge"), count: loungeCount, action: voucherStatus === "penalty" ? voucherT("learn") : t("signature.details"), badge: voucherStatus === "penalty" ? voucherT("penaltyBadge") : undefined },
    { key: "transfer", detailId: "airport-transfer-domestik", icon: "/assets/prioritas/member-overview/signature-airport.png", title: t("signature.transfer"), count: t("signature.four"), action: t("signature.voucher") },
    { key: "padel", detailId: "padel-court", icon: "/assets/prioritas/member-overview/signature-padel.png", title: t("signature.padel"), count: "", action: t("signature.voucher") },
    { key: "medical", detailId: "deteksi-dini-kanker-dan-penyakit-jantung", icon: "/assets/prioritas/member-overview/signature-prodia.png", title: t("signature.medical"), count: t("signature.four"), action: t("signature.voucher") },
  ];
  return (
    <main id="main-content" className="min-h-screen overflow-x-clip bg-pgold-200 text-pbrown-800">
      <div className="relative">
        <PrioritasMemberHeader activeTab="overview" compactTitleTabGap />

        <div className="relative isolate">
          <img aria-hidden src="/assets/prioritas/member-overview/decoration.png" alt="" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-auto w-full object-cover" />
          <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-10 px-4 py-6 xl:px-0">
          <section id="overview-signature" aria-labelledby="overview-signature-title">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <h2 id="overview-signature-title" className="text-title text-pbrown-600 xl:text-heading">{t("signature.title")}</h2>
              <OverviewSectionLink href="/prioritas/member/privilege" label={t("signature.all")} className="hidden xl:flex xl:w-fit" />
            </div>
            <div className="flex flex-col gap-8 xl:block">
              <div className="hide-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 [scrollbar-width:none] xl:mx-0 xl:grid xl:grid-cols-4 xl:gap-5 xl:overflow-visible xl:px-0">
                {signature.map((item) => <article key={item.key} className="flex h-[208px] w-[280px] shrink-0 snap-center flex-col overflow-hidden rounded-xl bg-pbrown-600 shadow-card xl:h-60 xl:w-auto xl:shrink xl:snap-none">
                  <div className="flex h-40 flex-none flex-col rounded-xl bg-white p-4 xl:h-auto xl:min-h-0 xl:flex-1 xl:p-5">
                    <div className="flex items-start justify-between gap-2">
                      <img aria-hidden src={item.icon} alt="" className="h-10 w-auto max-w-[85px] self-start object-contain object-left" />
                      {item.badge ? <span className="rounded-lg bg-voucher-warning px-2 py-1 text-xs font-semibold leading-4 text-voucher-warning-ink">{item.badge}</span> : null}
                    </div>
                    <h3 className="mt-5 text-lg font-semibold leading-6 tracking-[-0.02em] text-neutral-800 xl:text-xl xl:leading-7">{item.title}</h3>
                    {item.count ? <p className="mt-auto text-base font-semibold text-neutral-700">{item.count}</p> : null}
                  </div>
                  <div className="flex h-12 items-center bg-pbrown-600 px-4 xl:px-5">
                    <Link href={item.key === "lounge" ? withMemberSignatureVoucherStatus(`/prioritas/member/privilege/${item.detailId}`, voucherStatus) : `/prioritas/member/privilege/${item.detailId}`} className={prioritasButtonClassName({ kind: "text", surface: "inverse", size: "medium" })}>
                      <span className="prio-button__label">{item.action}</span>
                      <PrioritasButtonIcon src="/assets/cycle1/pelajari-icon.svg" />
                    </Link>
                  </div>
                </article>)}
              </div>
              <OverviewSectionLink href="/prioritas/member/privilege" label={t("signature.all")} className="xl:hidden" />
            </div>
          </section>

          <section id="overview-financial" aria-labelledby="overview-financial-title">
            <h2 id="overview-financial-title" className="mb-6 text-title text-pbrown-600 xl:text-heading">{t("financial.title")}</h2>
            <div className="relative flex min-h-[320px] flex-col overflow-hidden rounded-xl border border-pbrown-100 bg-white md:flex-row">
              <div className="relative z-10 order-2 flex h-[180px] w-full flex-none flex-col items-start justify-between gap-0 p-4 md:order-1 md:h-auto md:w-[42%] md:flex-auto md:justify-center md:gap-10 md:p-10">
                <p className="max-w-[380px] text-xl leading-6 font-semibold tracking-[-0.02em] text-black md:text-[28px] md:leading-8">{t("financial.description")}</p>
                <Link href="/prioritas/member/financial-report" className={prioritasButtonClassName({ variant: "secondary", surface: "default", size: "large", className: "mt-auto w-full xl:w-fit md:mt-0" })}>
                  <span className="prio-button__label">{t("financial.action")}</span>
                  <PrioritasButtonIcon src="/assets/cycle1/pelajari-icon.svg" />
                </Link>
              </div>
              <div className="relative order-1 h-[220px] w-full overflow-hidden md:absolute md:inset-y-0 md:right-0 md:order-2 md:h-full md:w-[61%]">
                <img src="/assets/prioritas/member-overview/financial-report.png" alt="" className="h-full w-full object-cover object-right" />
              </div>
            </div>
          </section>

          <section id="overview-magazine" aria-labelledby="overview-magazine-title">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <h2 id="overview-magazine-title" className="text-title text-pbrown-600 xl:text-heading">{t("magazine.title")}</h2>
              <OverviewSectionLink href="/prioritas/member/e-magazine" label={t("viewAll")} className="hidden md:flex md:w-fit" />
            </div>
            <div className="hide-scrollbar -mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
              {magazineIssues.slice(0, 3).map((issue) => <MagazineCard key={issue.slug} title={issue.title} action={t("magazine.read")} image={issue.image} imageAlt={t("magazine.coverAlt", { title: issue.title })} href={issue.href} className="h-[380px] w-[280px] shrink-0 snap-center shadow-card md:h-[420px] md:w-auto md:shrink md:snap-none xl:h-[532px]" />)}
            </div>
            <OverviewSectionLink href="/prioritas/member/e-magazine" label={t("viewAll")} className="mt-8 md:hidden" />
          </section>

          <section aria-labelledby="overview-event-title">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <h2 id="overview-event-title" className="text-title text-pbrown-600 xl:text-heading">{t("event.title")}</h2>
              <OverviewSectionLink href="/prioritas/member/privilege?section=event" label={t("viewAll")} className="hidden xl:flex xl:w-fit" />
            </div>
            <div className="flex flex-col gap-8 xl:block">
              <div className="xl:hidden">
                <PromoCarousel promos={events.slice(0, 3)} now={now} loop={false} contentCardVariant="event" detailHrefBase="/prioritas/member/event" />
              </div>
              <OverviewSectionLink href="/prioritas/member/privilege?section=event" label={t("viewAll")} className="xl:hidden" />
              <div className="hidden grid-cols-3 gap-6 xl:grid">
              {events.slice(0, 3).map((event) => <ContentCard key={event.id} item={event} now={now} variant="event" detailHref={`/prioritas/member/event/${event.id}`} />)}
              </div>
            </div>
          </section>

          <section aria-labelledby="overview-promo-title">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <h2 id="overview-promo-title" className="text-title text-pbrown-600 xl:text-heading">{t("promo.title")}</h2>
              <OverviewSectionLink href="/prioritas/member/privilege?section=promo" label={t("viewAll")} className="hidden xl:flex xl:w-fit" />
            </div>
            <div className="flex flex-col gap-8 xl:block">
              <div className="xl:hidden">
                <PromoCarousel promos={promos.slice(0, 3)} now={now} loop={false} contentCardVariant="promo" detailHrefBase="/prioritas/member/promo" />
              </div>
              <OverviewSectionLink href="/prioritas/member/privilege?section=promo" label={t("viewAll")} className="xl:hidden" />
              <div className="hidden grid-cols-3 gap-6 xl:grid">
              {promos.slice(0, 3).map((promo) => <ContentCard key={promo.id} item={promo} now={now} variant="promo" detailHref={`/prioritas/member/promo/${promo.id}`} />)}
              </div>
            </div>
          </section>
          </div>
        </div>
      </div>
    </main>
  );
}
