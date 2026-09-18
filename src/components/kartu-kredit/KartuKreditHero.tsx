/* eslint-disable @next/next/no-img-element */

import { Link } from "@/i18n/navigation";
import { ApplyInMyBcaLink } from "@/components/ui/MyBcaLinks";

type KartuKreditHeroCopy = {
  eyebrow?: string;
  title: string;
  applyCta: string;
  cardsCta: string;
  supportingText: string;
  imageAlt: string;
  cardsHref?: string;
  backAction?: {
    label: string;
    href: string;
  };
};

export default function KartuKreditHero({
  copy,
  imageSrc,
}: {
  copy: KartuKreditHeroCopy;
  imageSrc: string;
}) {
  return (
    <section
      className="relative h-[min(640px,calc(90svh-48px))] min-h-[560px] overflow-clip bg-blue-700 xl:h-[80svh] xl:min-h-0"
      aria-labelledby="kartu-kredit-title"
    >
      <img
        src={imageSrc}
        alt={copy.imageAlt}
        fetchPriority="high"
        decoding="sync"
        className="absolute inset-0 size-full origin-left scale-[1.08] object-cover object-[58%_center] xl:scale-[1.14] xl:object-center"
      />

      <div
        aria-hidden
        className="absolute inset-0 bg-neutral-900/50 xl:hidden"
      />
      <div
        aria-hidden
        className="absolute inset-0 hidden bg-gradient-to-r from-neutral-900/80 via-neutral-900/45 to-neutral-900/10 xl:block"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 hidden h-40 bg-gradient-to-b from-neutral-900/60 to-transparent xl:block"
      />

      {copy.backAction ? (
        <div className="absolute inset-x-0 top-24 mx-auto w-full max-w-[1280px] px-4 xl:px-10">
          <Link
            href={copy.backAction.href}
            className="inline-flex items-center gap-2 text-sm font-semibold text-white text-shadow-hero transition-opacity hover:opacity-80"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
            {copy.backAction.label}
          </Link>
        </div>
      ) : null}

      <div className="absolute inset-x-0 bottom-8 top-auto mx-auto w-full max-w-[1280px] px-4 xl:bottom-auto xl:top-[220px] xl:px-10">
        <div className="flex max-w-[520px] flex-col items-start gap-7 xl:max-w-[560px]">
          <div className="flex flex-col gap-3 text-white text-shadow-hero">
            {copy.eyebrow ? <p className="text-base font-semibold leading-6 xl:text-lg xl:leading-7">{copy.eyebrow}</p> : null}
            <h1
              id="kartu-kredit-title"
              className="text-[32px] font-semibold leading-10 tracking-[-0.02em] xl:max-w-[480px] xl:text-[36px] xl:leading-[44px]"
            >
              {copy.title}
            </h1>
          </div>

          <div className="flex flex-col items-start gap-4">
            <div className="flex w-full flex-row items-stretch gap-3">
              <ApplyInMyBcaLink
                className="btn-base btn-primary min-w-0 flex-1 px-3 text-sm active:scale-95"
              >
                <span className="text-sm">{copy.applyCta}</span>
              </ApplyInMyBcaLink>
              <a
                href={copy.cardsHref ?? "#pilihan-kartu"}
                className="btn-base min-w-0 flex-1 px-3 text-sm border border-white/40 bg-neutral-900/25 text-white backdrop-blur-lg transition-[background-color,border-color,color,transform] duration-200 active:scale-95 xl:hover:border-white/60 xl:hover:bg-neutral-900/45"
              >
                <span className="text-sm">{copy.cardsCta}</span>
              </a>
            </div>
            <p className="max-w-[520px] text-sm leading-5 text-white/85 text-shadow-hero xl:max-w-none xl:whitespace-nowrap xl:text-base xl:leading-6">
              {copy.supportingText}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
