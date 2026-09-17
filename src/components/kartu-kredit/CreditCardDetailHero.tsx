/* eslint-disable @next/next/no-img-element */

import type { ComparisonCard } from "@/components/kartu-kredit/CreditCardComparison";

export default function CreditCardDetailHero({ card, applyLabel, backLabel, backHref }: { card: ComparisonCard; applyLabel: string; backLabel: string; backHref: string }) {
  return (
    <section className="relative overflow-hidden bg-blue-700 text-white" aria-labelledby="credit-card-detail-title">
      <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-700/95 to-blue-900" />
      <div className="relative mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-4 pb-8 pt-24 xl:grid xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] xl:items-center xl:gap-16 xl:px-20 xl:pb-16 xl:pt-32">
        <a href={backHref} className="absolute left-4 top-8 inline-flex items-center gap-2 text-sm font-semibold text-white/90 transition-opacity hover:opacity-75 xl:left-20">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          {backLabel}
        </a>
        <div className="flex items-center justify-center rounded-2xl bg-white/10 p-6 backdrop-blur-sm xl:p-10">
          <img src={card.image} alt={card.imageAlt} className="w-full max-w-[420px] object-contain" />
        </div>
        <div className="flex flex-col items-start gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-cyan-100">Kartu Kredit BCA</p>
            <h1 id="credit-card-detail-title" className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.02em] xl:text-5xl">{card.title}</h1>
          </div>
          <ul className="flex flex-col gap-3 text-sm leading-5 text-white/90">
            {card.benefits.map((benefit) => <li key={benefit.label} className="flex gap-2"><span aria-hidden>•</span><span>{benefit.label}</span></li>)}
          </ul>
          <div className="flex w-full items-center gap-3 sm:w-auto">
            <a href="https://mybca.bca.co.id/auth/login" target="_blank" rel="noopener noreferrer" className="btn-base btn-primary flex-1 px-6 text-sm sm:flex-none">{applyLabel}</a>
            <button type="button" aria-label="Bagikan kartu" className="flex size-11 shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white transition-colors hover:bg-white/20">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" /></svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
