import { Link } from "@/i18n/navigation";
import Navbar from "@/components/home/Navbar";
import PromoCard from "@/components/promo/PromoCard";
import PromoCarousel from "@/components/promo/PromoCarousel";
import PrioritasIndexTabs from "@/components/prioritas/PrioritasIndexTabs";
import type { Promo } from "@/components/home/promo-data";
import MagazineCard from "@/components/prioritas/MagazineCard";
import magazineIssues from "@/components/prioritas/magazine-issues.json";
import { getTranslations } from "next-intl/server";

type Props = {
  events: Promo[];
  promos: Promo[];
  now: Date;
};

function Arrow({ light = false }: { light?: boolean }) {
  return (
    <span
      aria-hidden
      className="size-5 shrink-0"
      style={{
        backgroundColor: light ? "white" : "var(--color-pbrown-600)",
        maskImage: "url(/assets/cycle1/pelajari-icon.svg)",
        WebkitMaskImage: "url(/assets/cycle1/pelajari-icon.svg)",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
        maskSize: "contain",
        WebkitMaskSize: "contain",
      }}
    />
  );
}

function OverviewSectionLink({ href, label, className = "" }: { href: "/prioritas/privilege" | "/prioritas/e-magazine" | "/prioritas/event" | "/prioritas/promo"; label: string; className?: string }) {
  return (
    <Link href={href} className={`btn-base w-full border border-pbrown-600 bg-pgold-100 text-pbrown-600 transition-colors hover:bg-pgold-300 ${className}`}>
      <span className="text-base font-semibold text-pbrown-600">{label}</span>
      <Arrow />
    </Link>
  );
}

export default async function MemberOverview({ events, promos, now }: Props) {
  const t = await getTranslations("memberOverview");
  const signature = [
    { key: "lounge", icon: "/assets/prioritas/member-overview/signature-airport.png", title: t("signature.lounge"), count: t("signature.fifty"), action: t("signature.details") },
    { key: "transfer", icon: "/assets/prioritas/member-overview/signature-airport.png", title: t("signature.transfer"), count: t("signature.four"), action: t("signature.voucher") },
    { key: "padel", icon: "/assets/prioritas/member-overview/signature-padel.png", title: t("signature.padel"), count: "", action: t("signature.voucher") },
    { key: "medical", icon: "/assets/prioritas/member-overview/signature-prodia.png", title: t("signature.medical"), count: t("signature.four"), action: t("signature.voucher") },
  ];



  return (
    <main id="main-content" className="min-h-screen overflow-x-clip bg-pgold-200 text-pbrown-800">
      <div className="relative">
        <div className="relative bg-pgold-100">
          <div className="absolute inset-x-0 top-0 h-[calc(7rem+env(safe-area-inset-top))] bg-pbrown-600 xl:h-[120px]" />
          <Navbar variant="prioritas" disableHideShow memberPreviewName={t("previewFullName")} />
          <div className="h-[calc(7rem+env(safe-area-inset-top))] xl:h-[120px]" />
        </div>
        <PrioritasIndexTabs activeTab="overview" surface="overview" />
        <div className="bg-pgold-100">
          <header id="overview-start" className="mx-auto flex h-[160px] w-full max-w-[1280px] flex-col justify-start px-4 pt-4 pb-3 xl:h-auto xl:px-0 xl:pb-10 xl:pt-6">
            <Link href="/prioritas" className="mb-4 inline-flex w-fit items-center gap-2 text-sm leading-5 font-semibold text-pbrown-600 transition-colors hover:text-pbrown-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-pbrown-600 xl:mb-9">
              <span aria-hidden className="size-5 shrink-0 bg-pbrown-600" style={{ maskImage: "url(/assets/member-login/arrow-left.svg)", WebkitMaskImage: "url(/assets/member-login/arrow-left.svg)", maskRepeat: "no-repeat", WebkitMaskRepeat: "no-repeat", maskPosition: "center", WebkitMaskPosition: "center", maskSize: "contain", WebkitMaskSize: "contain" }} />
              <span>{t("back")}</span>
            </Link>
            <h1 className="text-2xl font-semibold leading-8 tracking-[-0.02em] text-pbrown-800 xl:text-[40px] xl:leading-12">{t("welcome", { name: t("previewFirstName") })}</h1>
            <p className="mt-2 text-sm font-semibold text-pbrown-300 xl:mt-4">{t("lastLogin")}</p>
          </header>
        </div>

        <div className="relative isolate">
          <img aria-hidden src="/assets/prioritas/member-overview/decoration.png" alt="" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-auto w-full object-cover" />
          <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-10 px-4 py-6 xl:px-0">
          <section id="overview-signature" aria-labelledby="overview-signature-title">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <h2 id="overview-signature-title" className="text-2xl font-semibold tracking-[-0.02em] text-pbrown-600">{t("signature.title")}</h2>
              <OverviewSectionLink href="/prioritas/privilege" label={t("signature.all")} className="hidden xl:flex xl:w-fit" />
            </div>
            <div className="flex flex-col gap-8 xl:block">
              <div className="hide-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 [scrollbar-width:none] xl:mx-0 xl:grid xl:grid-cols-4 xl:gap-5 xl:overflow-visible xl:px-0">
              {signature.map((item) => (
                <article key={item.key} className="flex h-60 w-[280px] shrink-0 snap-center flex-col overflow-hidden rounded-xl bg-pbrown-600 shadow-card xl:w-auto xl:shrink xl:snap-none">
                  <div className="flex min-h-0 flex-1 flex-col rounded-xl bg-white p-5">
                    <img aria-hidden src={item.icon} alt="" className="h-10 w-auto max-w-[85px] self-start object-contain object-left" />
                    <h3 className="mt-5 text-xl font-semibold leading-7 tracking-[-0.02em] text-neutral-800">{item.title}</h3>
                    {item.count ? <p className="mt-auto text-base font-semibold text-neutral-700">{item.count}</p> : null}
                  </div>
                  <Link href="/prioritas/privilege" className="flex h-12 items-center gap-1 px-5 text-sm font-semibold text-white hover:underline">{item.action}<Arrow light /></Link>
                </article>
              ))}
              </div>
              <OverviewSectionLink href="/prioritas/privilege" label={t("signature.all")} className="xl:hidden" />
            </div>
          </section>

          <section id="overview-financial" aria-labelledby="overview-financial-title">
            <h2 id="overview-financial-title" className="mb-6 text-2xl font-semibold tracking-[-0.02em] text-pbrown-600">{t("financial.title")}</h2>
            <div className="relative flex min-h-[320px] flex-col overflow-hidden rounded-xl border border-pbrown-100 bg-white md:flex-row">
              <div className="relative z-10 order-2 flex w-full flex-col items-start justify-center gap-6 p-6 md:order-1 md:w-[42%] md:gap-10 md:p-10">
                <p className="max-w-[380px] text-xl leading-6 font-semibold tracking-[-0.02em] text-black md:text-[28px] md:leading-8">{t("financial.description")}</p>
                <Link href="/artikel" className="btn-base w-full border border-pbrown-600 bg-pgold-100 text-pbrown-600 transition-colors hover:bg-pgold-300 xl:w-fit">
                  <span className="px-0.5 text-base font-semibold">{t("financial.action")}</span>
                  <Arrow />
                </Link>
              </div>
              <img src="/assets/prioritas/member-overview/financial-report.png" alt="" className="order-1 h-[220px] w-full object-cover object-left md:order-2 md:absolute md:inset-y-0 md:right-0 md:h-full md:w-[61%]" />
            </div>
          </section>

          <section id="overview-magazine" aria-labelledby="overview-magazine-title">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <h2 id="overview-magazine-title" className="text-2xl font-semibold tracking-[-0.02em] text-pbrown-600">{t("magazine.title")}</h2>
              <OverviewSectionLink href="/prioritas/e-magazine" label={t("viewAll")} className="hidden md:flex md:w-fit" />
            </div>
            <div className="hide-scrollbar -mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
              {magazineIssues.slice(0, 3).map((issue) => <MagazineCard key={issue.slug} title={issue.title} action={t("magazine.read")} image={issue.image} imageAlt={t("magazine.coverAlt", { title: issue.title })} href={issue.href} className="h-[380px] w-[280px] shrink-0 snap-center shadow-card md:h-[420px] md:w-auto md:shrink md:snap-none xl:h-[532px]" />)}
            </div>
            <OverviewSectionLink href="/prioritas/e-magazine" label={t("viewAll")} className="mt-8 md:hidden" />
          </section>

          <section aria-labelledby="overview-event-title">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <h2 id="overview-event-title" className="text-2xl font-semibold tracking-[-0.02em] text-pbrown-600">{t("event.title")}</h2>
              <OverviewSectionLink href="/prioritas/event" label={t("viewAll")} className="hidden xl:flex xl:w-fit" />
            </div>
            <div className="flex flex-col gap-8 xl:block">
              <div className="xl:hidden">
                <PromoCarousel promos={events.slice(0, 3)} now={now} loop={false} variant="prioritas" detail promoPage={false} detailHrefBase="/prioritas/event" showEventDate />
              </div>
              <OverviewSectionLink href="/prioritas/event" label={t("viewAll")} className="xl:hidden" />
              <div className="hidden grid-cols-3 gap-6 xl:grid">
              {events.slice(0, 3).map((event) => <PromoCard key={event.id} promo={event} now={now} reveal={false} variant="prioritas" fill detail detailHref={`/prioritas/event/${event.id}`} eventDate={"dateTile" in event ? event.dateTile as React.ComponentProps<typeof PromoCard>["eventDate"] : undefined} />)}
              </div>
            </div>
          </section>

          <section aria-labelledby="overview-promo-title">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <h2 id="overview-promo-title" className="text-2xl font-semibold tracking-[-0.02em] text-pbrown-600">{t("promo.title")}</h2>
              <OverviewSectionLink href="/prioritas/promo" label={t("viewAll")} className="hidden xl:flex xl:w-fit" />
            </div>
            <div className="flex flex-col gap-8 xl:block">
              <div className="xl:hidden">
                <PromoCarousel promos={promos.slice(0, 3)} now={now} loop={false} variant="prioritas" promoPage detail detailHrefBase="/prioritas/promo" />
              </div>
              <OverviewSectionLink href="/prioritas/promo" label={t("viewAll")} className="xl:hidden" />
              <div className="hidden grid-cols-3 gap-6 xl:grid">
              {promos.slice(0, 3).map((promo) => <PromoCard key={promo.id} promo={promo} now={now} reveal={false} variant="prioritas" promoPage fill detail detailHref={`/prioritas/promo/${promo.id}`} />)}
              </div>
            </div>
          </section>
          </div>
        </div>
      </div>
    </main>
  );
}
