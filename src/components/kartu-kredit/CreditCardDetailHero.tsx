/* eslint-disable @next/next/no-img-element */

import type { ComparisonCard } from "@/components/kartu-kredit/CreditCardComparison";
import { Link } from "@/i18n/navigation";
import { ApplyInMyBcaLink } from "@/components/ui/MyBcaLinks";

export default function CreditCardDetailHero({ card, imageSrc, subtitle, applyLabel, backLabel, backHref }: { card: ComparisonCard; imageSrc: string; subtitle: string; applyLabel: string; backLabel: string; backHref: string }) {
  return (
    <section className="relative h-[min(640px,calc(90svh-48px))] min-h-[560px] overflow-hidden bg-blue-700 text-white xl:h-[80svh] xl:min-h-0" aria-labelledby="credit-card-detail-title">
      <img src={imageSrc} alt="" aria-hidden className="absolute inset-0 size-full object-cover object-center" />
      <div aria-hidden className="absolute inset-0 bg-neutral-900/50 xl:hidden" />
      <div aria-hidden className="absolute inset-0 hidden bg-gradient-to-r from-neutral-900/80 via-neutral-900/45 to-neutral-900/10 xl:block" />
      <div aria-hidden className="absolute inset-x-0 top-0 hidden h-40 bg-gradient-to-b from-neutral-900/60 to-transparent xl:block" />
      <div className="relative mx-auto flex h-full w-full max-w-[1280px] flex-col px-4 pb-8 pt-24 xl:px-10 xl:pb-16 xl:pt-32">
        <Link href={backHref} className="absolute left-4 top-24 inline-flex items-center gap-2 text-sm font-semibold text-white/90 text-shadow-hero transition-opacity hover:opacity-75 xl:left-10">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          {backLabel}
        </Link>
        <div className="mt-auto flex max-w-[560px] flex-col items-start gap-6 text-shadow-hero xl:mt-0 xl:pt-[88px]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-cyan-100">Kartu Kredit BCA</p>
            <h1 id="credit-card-detail-title" className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.02em] xl:text-5xl">{card.title}</h1>
            <p className="mt-3 max-w-[520px] text-base leading-6 text-white/90 xl:text-lg">{subtitle}</p>
          </div>
          <div className="flex w-full items-center gap-3 sm:w-auto">
            <ApplyInMyBcaLink className="btn-base btn-primary flex-1 px-6 text-sm sm:flex-none">{applyLabel}</ApplyInMyBcaLink>
            <button type="button" aria-label="Bagikan kartu" className="flex size-11 shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white transition-colors hover:bg-white/20">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" /></svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
