"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import PromoCard from "@/components/promo/PromoCard";
import type { Promo } from "@/components/home/promo-data";

const ASSET_ROOT = "/assets/prioritas/detail/molton-brown";
type DetailPanel = "detail" | "terms" | "contact" | "location";

type DetailCopy = {
  breadcrumb: { home: string; category: string; current: string };
  title: string;
  brand: string;
  detail: { title: string; content: string };
  terms: { title: string; items: string[] };
  contact: { title: string; content: string };
  location: { title: string; content: string };
  recommendations: {
    title: string;
    viewMore: string;
  };
};

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
    <section className="border-t border-neutral-300 first:border-t-0">
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-6 pb-4 pt-8 text-left text-title text-neutral-900"
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
          <div className="pb-8 text-lg leading-[26px] text-neutral-700">{children}</div>
        </div>
      </div>
    </section>
  );
}

export default function PrioritasDetailExperience({ copy, promos, now }: { copy: DetailCopy; promos: Promo[]; now: string }) {
  const [openPanels, setOpenPanels] = useState<DetailPanel[]>(["detail", "terms"]);
  const toggle = (panel: DetailPanel) => setOpenPanels((current) => current.includes(panel) ? current.filter((item) => item !== panel) : [...current, panel]);

  return (
    <article className="relative isolate overflow-x-clip bg-pgold-200 pb-20 text-neutral-900 xl:pb-28">
      <div aria-hidden className="bg-decoration-wrapper pointer-events-none absolute inset-x-0 top-[400px] z-0 opacity-70">
        <img src={`${ASSET_ROOT}/raw-01.png`} alt="" className="block h-auto w-full" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent via-pgold-200/70 to-pgold-200" />
      </div>
      <header className="relative z-10 h-[400px] overflow-hidden bg-pbrown-600 text-pgold-100">
        <img
          src="/assets/prioritas/card/prio-glow.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -right-[390px] -top-[320px] h-[960px] w-auto max-w-none opacity-80 xl:-right-[120px]"
        />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-pbrown-600 to-transparent" />
      </header>

      <div className="relative z-10 mx-auto -mt-[400px] max-w-[1280px] px-4 xl:px-0">
        <div className="pt-[140px]">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm font-semibold leading-6 text-pgold-100/85">
            <Link href="/prioritas">{copy.breadcrumb.home}</Link>
            <img src={`${ASSET_ROOT}/chevron-right.svg`} alt="" className="size-5" />
            <Link href="/prioritas">{copy.breadcrumb.category}</Link>
            <img src={`${ASSET_ROOT}/chevron-right.svg`} alt="" className="size-5" />
            <span aria-current="page">{copy.breadcrumb.current}</span>
          </nav>
          <div className="mt-6 flex items-end justify-between gap-8">
            <div>
              <h1 className="max-w-[560px] text-display text-pgold-100">{copy.title}</h1>
              <p className="mt-3 text-base font-semibold leading-6 text-pgold-200">{copy.brand}</p>
            </div>
            <span className="hidden size-30 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-3 shadow-card xl:flex">
              <img src={`${ASSET_ROOT}/raw-11.png`} alt={copy.brand} className="size-full object-contain" />
            </span>
          </div>
        </div>

        <div className="mt-10 grid gap-6 xl:grid-cols-[560px_minmax(0,680px)] xl:gap-10">
          <div className="self-start h-[320px] overflow-hidden rounded-2xl xl:sticky xl:top-6 xl:h-[480px]">
            <img src={`${ASSET_ROOT}/raw-09.png`} alt={copy.title} className="size-full object-cover" />
          </div>
          <div className="rounded-2xl bg-white px-6 shadow-card xl:px-8">
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

        <section className="mt-20 xl:mt-20">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-heading text-pbrown-600">{copy.recommendations.title}</h2>
            <Link href="/prioritas" className="hidden items-center gap-1.5 text-base font-semibold leading-6 text-pbrown-600 transition-colors hover:text-pgold-700 xl:inline-flex">
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
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {promos.slice(0, 3).map((promo) => <PromoCard key={promo.id} promo={promo} now={new Date(now)} reveal={false} variant="prioritas" fill detail />)}
          </div>
        </section>
      </div>
    </article>
  );
}
