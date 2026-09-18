"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Promo } from "@/components/home/promo-data";
import { Link } from "@/i18n/navigation";
import PromoCard from "./PromoCard";
import { DownloadMyBcaLink } from "@/components/ui/MyBcaLinks";

const PRODUCT_ICONS: Partial<Record<string, string>> = {
  myBCA: "https://www.bca.co.id/-/media/Feature/Iconography/BLUE/PNG/64/mybca.jpg",
  "BCA mobile": "https://is1-ssl.mzstatic.com/image/thumb/Purple116/v4/f8/b4/f4/f8b4f489-c339-d57e-ac10-796ecb9ecc05/AppIcon-0-0-1x_U007emarketing-0-0-0-5-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/1200x630wa.png",
  QRIS: "https://upload.wikimedia.org/wikipedia/commons/e/e1/QRIS_logo.svg",
  Sakuku: "https://www.bca.co.id/-/media/Feature/Banner/Mobile-Banner/apps-bca/sakuku-low-res.jpg?v=1",
};

function Chevron({ open }: { open: boolean }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={`size-6 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className="size-5 shrink-0">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ProductPill({ product }: { product: string }) {
  const icon = PRODUCT_ICONS[product];

  return (
    <li className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-blue-500">
      {icon ? (
        <span aria-hidden className="flex size-5 shrink-0 items-center justify-center overflow-hidden rounded bg-white">
          <img src={icon} alt="" className={`size-full object-contain ${product === "Sakuku" ? "object-cover" : ""}`} />
        </span>
      ) : (
        <span aria-hidden className="flex size-5 shrink-0 items-center justify-center rounded bg-blue-500 text-[7px] font-bold leading-none text-white">BCA</span>
      )}
      <span className="whitespace-nowrap">{product}</span>
    </li>
  );
}

export default function PromoDetailExperience({ promo, relatedPromos, now }: { promo: Promo; relatedPromos: Promo[]; now: Date }) {
  const t = useTranslations("promoPage.detail");
  const [openPanel, setOpenPanel] = useState<"terms" | "location" | null>(null);
  const period = new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" }).format(promo.endAt);
  const products = promo.eligibleProducts?.length ? promo.eligibleProducts : [t("defaultProduct")];

  const toggle = (panel: "terms" | "location") => setOpenPanel((current) => current === panel ? null : panel);

  return (
    <>
      <article className="bg-neutral-100 pb-24 xl:pb-16">
        <div className="mx-auto max-w-[1200px] xl:grid xl:grid-cols-[minmax(0,1.08fr)_minmax(380px,0.92fr)] xl:items-stretch xl:overflow-hidden xl:rounded-b-[32px] xl:bg-white xl:shadow-card">
          <div className="relative h-[360px] overflow-hidden bg-blue-100 xl:h-auto xl:min-h-[600px]">
            <img src={promo.cover} alt="" className="absolute inset-0 size-full object-cover" />
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent xl:hidden" />
            <div
              aria-hidden
              className="pointer-events-none absolute left-0 right-0 top-0 h-[160px]"
              style={{ background: "linear-gradient(to bottom, rgba(15,15,15,0.8) 0%, rgba(15,15,15,0) 100%)" }}
            />
            <Link
              href="/promo"
              className="absolute left-4 top-[72px] inline-flex items-center gap-2 text-sm font-semibold text-white/90 text-shadow-hero transition-opacity hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white xl:left-8"
            >
              <svg aria-hidden viewBox="0 0 24 24" fill="none" className="size-5">
                <path d="m14.5 6-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t("backToPromos")}
            </Link>
            <div
              className="hero-search absolute inset-x-0 bottom-0 flex flex-col items-start gap-3 px-4 pb-5 pt-4 text-white"
              style={{
                backgroundColor: "rgba(0,0,0,0.3)",
                backdropFilter: "blur(16px) saturate(1.25)",
                WebkitBackdropFilter: "blur(16px) saturate(1.25)",
                isolation: "isolate",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/30 bg-white shadow-card">
                  <img src={promo.logo} alt="" className="size-8 rounded object-cover" />
                </div>
                <p className="text-sm font-semibold leading-5 text-white text-shadow-hero">{promo.brand}</p>
              </div>
              <h1 className="text-title text-white text-shadow-hero xl:text-heading">{promo.title}</h1>
            </div>
          </div>

          <div className="bg-white px-4 pb-8 pt-6 sm:px-6 xl:flex xl:flex-col xl:justify-center xl:px-10 xl:py-12">
            <p className="flex items-center gap-1.5 text-sm font-medium text-neutral-800"><ClockIcon />{t("until", { date: period })}</p>
            <div className="mt-5 border-t border-neutral-300 pt-5 xl:mt-7 xl:pt-7">
              <h2 className="text-sm font-bold text-neutral-800">{t("eligibleTitle")}</h2>
              <ul data-lenis-prevent className="hide-scrollbar mt-3 flex gap-4 overflow-x-auto pb-1 [scrollbar-width:none]">
                {products.map((product) => <ProductPill key={product} product={product} />)}
              </ul>
            </div>

            <div className="mt-5 border-y border-neutral-300 xl:mt-7">
              <section>
                <button type="button" aria-expanded={openPanel === "terms"} onClick={() => toggle("terms")} className="flex w-full items-center justify-between py-4 text-left text-sm font-bold text-neutral-800">
                  {t("termsTitle")}<Chevron open={openPanel === "terms"} />
                </button>
                {openPanel === "terms" && <p className="border-t border-neutral-300 pb-4 pt-3 text-sm leading-6 text-neutral-700">{promo.details || t("termsFallback")}</p>}
              </section>
              <section className="border-t border-neutral-300">
                <button type="button" aria-expanded={openPanel === "location"} onClick={() => toggle("location")} className="flex w-full items-center justify-between py-4 text-left text-sm font-bold text-neutral-800">
                  {t("locationTitle")}<Chevron open={openPanel === "location"} />
                </button>
                {openPanel === "location" && <p className="border-t border-neutral-300 pb-4 pt-3 text-sm leading-6 text-neutral-700">{t("locationContent")}</p>}
              </section>
            </div>
          </div>
        </div>

        <section className="bg-blue-100 px-4 py-7 xl:mt-10 xl:bg-transparent xl:py-0">
          <div className="mx-auto max-w-[1200px]">
            <h2 className="text-title text-blue-700">{t("relatedTitle")}</h2>
            <div data-lenis-prevent className="hide-scrollbar -mb-3 -mx-4 mt-1 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-pl-4 px-4 py-3 [scrollbar-width:none] xl:mx-0 xl:mt-4 xl:grid xl:grid-cols-3 xl:overflow-visible xl:px-0 xl:py-0">
              {relatedPromos.map((relatedPromo) => (
                <div key={relatedPromo.id} className="w-[200px] shrink-0 snap-start xl:w-auto">
                  <PromoCard promo={relatedPromo} now={now} reveal={false} compact />
                </div>
              ))}
            </div>
          </div>
        </section>
      </article>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-neutral-300 bg-white/95 px-4 py-3 backdrop-blur xl:hidden">
        <DownloadMyBcaLink className="btn-base btn-primary w-full">{t("downloadCta")}</DownloadMyBcaLink>
      </div>
    </>
  );
}
