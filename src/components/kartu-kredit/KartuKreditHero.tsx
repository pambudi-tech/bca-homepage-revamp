/* eslint-disable @next/next/no-img-element */

type KartuKreditHeroCopy = {
  eyebrow: string;
  title: string;
  applyCta: string;
  cardsCta: string;
  scrollCue: string;
  imageAlt: string;
};

export default function KartuKreditHero({ copy }: { copy: KartuKreditHeroCopy }) {
  return (
    <section className="relative h-[620px] overflow-clip bg-blue-500" aria-labelledby="kartu-kredit-title">
      <img
        src="/assets/kartu-kredit/kartu-kredit-hero.webp"
        alt={copy.imageAlt}
        fetchPriority="high"
        decoding="sync"
        className="absolute inset-0 size-full object-cover object-[62%_center] xl:object-center"
      />

      <div
        aria-hidden
        className="absolute inset-0 bg-neutral-900/45 xl:hidden"
      />
      <div
        aria-hidden
        className="absolute inset-y-0 left-0 hidden w-2/3 bg-gradient-to-r from-neutral-900/75 via-neutral-900/45 to-transparent xl:block"
      />
      <div
        aria-hidden
        className="absolute left-0 right-0 top-0 hidden h-[160px] bg-gradient-to-b from-neutral-900/70 to-transparent xl:block"
      />

      <div className="absolute inset-x-0 top-[178px] px-4 xl:left-1/2 xl:right-auto xl:top-[232px] xl:w-[1280px] xl:-translate-x-1/2 xl:px-0">
        <div className="flex max-w-[420px] flex-col items-start gap-8">
          <div className="flex flex-col gap-4 text-white text-shadow-hero">
            <p className="text-base font-semibold leading-6 xl:text-lg xl:leading-7">
              {copy.eyebrow}
            </p>
            <h1
              id="kartu-kredit-title"
              className="text-[30px] font-semibold leading-[38px] tracking-normal xl:text-[36px] xl:leading-[44px]"
            >
              {copy.title}
            </h1>
          </div>

          <div className="flex flex-col items-start gap-3 sm:flex-row">
            <a
              href="https://mybca.bca.co.id/auth/login"
              target="_blank"
              rel="noopener noreferrer"
              className="group/credit-cta flex h-12 items-center justify-center gap-1 rounded-full bg-white px-8 text-base font-semibold text-blue-500 transition-[background-color,box-shadow,transform] duration-300 active:scale-95 xl:hover:bg-blue-500 xl:hover:text-white xl:hover:shadow-[0_0_22px_-6px_rgba(125,211,252,0.75)]"
            >
              <span className="whitespace-nowrap">{copy.applyCta}</span>
              <img
                src="/assets/navbar/icon-arrow-blue.svg"
                alt=""
                className="size-5 transition-[filter] duration-300 xl:group-hover/credit-cta:brightness-0 xl:group-hover/credit-cta:invert"
              />
            </a>
            <a
              href="#pilihan-kartu"
              className="flex h-12 items-center justify-center rounded-full bg-neutral-900/25 px-8 text-base font-semibold text-white backdrop-blur-[8px] transition-[background-color,transform] duration-300 active:scale-95 xl:hover:bg-neutral-900/40"
            >
              <span className="whitespace-nowrap">{copy.cardsCta}</span>
            </a>
          </div>
        </div>
      </div>

      <a
        href="#pilihan-kartu"
        className="absolute bottom-7 left-4 flex items-center gap-4 px-2 py-2 text-sm font-semibold text-white opacity-80 transition-opacity hover:opacity-100 xl:left-1/2 xl:w-[1280px] xl:-translate-x-1/2 xl:text-base"
      >
        <span className="flex h-9 w-6 shrink-0 items-start justify-center rounded-full border-2 border-white/50 pt-1.5">
          <span className="animate-scroll-cue-dot size-1.5 rounded-full bg-white" />
        </span>
        <span>{copy.scrollCue}</span>
      </a>
    </section>
  );
}
