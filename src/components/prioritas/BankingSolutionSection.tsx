import { Link } from "@/i18n/navigation";
import type { KursEntry } from "@/lib/kurs";

type PrivilegeCard = {
  title: string;
  alt: string;
  image: string;
};

type WealthCard = {
  title: string;
  metadata: { icon: string; label: string }[];
  action: string;
  image: string;
  imageAlt: string;
  actionIcon?: "download";
};

type Copy = {
  eyebrow: string;
  heading: string;
  bankingPrivilege: string;
  wealthInsight: string;
  kurs: string;
  viewMore: string;
  action: string;
  buy: string;
  sell: string;
  updatedAt: string;
  cards: PrivilegeCard[];
  wealthCards: WealthCard[];
};

function ViewMore({ label }: { label: string }) {
  return (
    <Link href="/kartu-kredit" className="btn-base w-full border border-pbrown-600 bg-pgold-100 text-pbrown-600 transition-colors hover:bg-pgold-300 md:w-fit">
      <span className="text-base font-semibold text-pbrown-600">{label}</span>
      <span
        aria-hidden
        className="size-5 shrink-0 bg-pbrown-600"
        style={{
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
    </Link>
  );
}

function BankingPrivilegeCard({ card, action }: { card: PrivilegeCard; action: string }) {
  return (
    <article className="relative h-[360px] w-[280px] shrink-0 snap-center overflow-hidden rounded-xl md:h-[300px] md:w-auto md:shrink md:snap-none">
      <img src={card.image} alt={card.alt} loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-[radial-gradient(110%_125%_at_0%_110%,var(--color-pbrown-800)_20%,transparent_70%)]" />
      <h3 className="absolute bottom-[88px] left-4 w-[min(301px,calc(100%-2rem))] text-[18px] font-semibold leading-[1.3] text-neutral-100 [text-shadow:0_3px_4px_rgb(0_0_0_/_0.25)] md:left-6 md:w-[min(301px,calc(100%-3rem))]">
        {card.title}
      </h3>
      <Link href="/kartu-kredit" className="absolute bottom-4 left-4 flex h-10 items-center justify-center rounded-full border border-pbrown-200 bg-pbrown-600/25 px-5 text-sm font-semibold leading-[14px] text-pgold-100 backdrop-blur-sm transition-colors hover:bg-pbrown-900/30 md:bottom-6 md:left-6">
        {action}
      </Link>
    </article>
  );
}

function WealthInsightCard({ card }: { card: WealthCard }) {
  return (
    <article className="relative h-[320px] overflow-hidden xl:h-[560px]">
      <img src={card.image} alt={card.imageAlt} loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
      <div
        className="glass-panel glass-panel-prioritas absolute inset-x-2 bottom-2 h-[240px] overflow-hidden rounded-2xl xl:inset-x-6 xl:bottom-6 xl:h-[320px]"
        style={{ backdropFilter: "blur(16px) saturate(1.25)", WebkitBackdropFilter: "blur(16px) saturate(1.25)", isolation: "isolate" }}
      >
        <div className="absolute inset-x-4 top-4 flex flex-col gap-4 xl:inset-x-[31px] xl:top-[23px] xl:gap-6">
          <h3 className="text-base font-semibold leading-[1.3] text-neutral-100 xl:text-[24px] xl:tracking-[-0.48px]">{card.title}</h3>
          <div className="flex flex-col gap-4">
            {card.metadata.map((item) => (
              <div className="flex items-center gap-4" key={item.label}>
                <img src={item.icon} alt="" className="size-5 xl:size-6" />
                <p className="text-sm font-semibold leading-5 text-neutral-300 xl:text-lg xl:leading-[27px]">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
        <Link href="/artikel" className="absolute bottom-4 left-4 flex h-10 items-center justify-center gap-1 rounded-full border border-pbrown-200 px-6 text-sm font-semibold leading-5 text-pgold-100 transition-colors hover:bg-pbrown-900/40 xl:bottom-[31px] xl:left-[31px] xl:h-12 xl:text-base xl:leading-4">
          {card.actionIcon === "download" ? <img src="/assets/prioritas/banking/download.svg" alt="" className="size-5" /> : null}
          {card.action}
        </Link>
      </div>
    </article>
  );
}

export default function BankingSolutionSection({ copy, kurs }: { copy: Copy; kurs: KursEntry[] }) {
  const visibleRates = kurs.slice(0, 3);

  return (
    <section id="banking-solution" className="relative overflow-hidden bg-pbrown-600 py-16 text-pgold-100 xl:py-20">
      <div className="relative mx-auto flex w-full max-w-[1280px] flex-col gap-14 px-4 xl:gap-20 xl:px-0">
        <header className="flex flex-col gap-4 xl:flex-row xl:gap-10">
          <p className="text-eyebrow uppercase text-pgold-300 xl:w-[180px] xl:shrink-0 xl:py-2 xl:text-eyebrow-lg">{copy.eyebrow}</p>
          <h2 className="text-heading max-w-[560px] text-pgold-100 xl:text-display">{copy.heading}</h2>
        </header>

        <section className="flex flex-col gap-6">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <h3 className="text-title text-pgold-100">{copy.bankingPrivilege}</h3>
            <div className="hidden md:block"><ViewMore label={copy.viewMore} /></div>
          </div>
          <div className="hide-scrollbar -mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 xl:grid-cols-3">
            {copy.cards.map((card) => <BankingPrivilegeCard key={card.title} card={card} action={copy.action} />)}
          </div>
          <div className="md:hidden"><ViewMore label={copy.viewMore} /></div>
        </section>

        <section className="flex flex-col gap-6">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <h3 className="text-title text-pgold-100">{copy.wealthInsight}</h3>
            <div className="hidden md:block"><ViewMore label={copy.viewMore} /></div>
          </div>
          <div className="grid overflow-hidden rounded-xl xl:grid-cols-2">
            {copy.wealthCards.map((card) => <WealthInsightCard key={card.title} card={card} />)}
          </div>
          <div className="md:hidden"><ViewMore label={copy.viewMore} /></div>
        </section>

        <section className="flex flex-col gap-6">
          <div className="flex min-h-14 items-center justify-between gap-4">
            <h3 className="text-heading text-pgold-200">{copy.kurs}</h3>
            <div className="hidden md:block"><ViewMore label={copy.viewMore} /></div>
          </div>
          <div className="grid overflow-hidden rounded-xl border border-pbrown-200/25 bg-pbrown-100/10 md:grid-cols-3">
            {visibleRates.map((rate, index) => (
              <article key={rate.code} className={`flex flex-row items-center gap-8 px-4 py-4 xl:flex-col xl:items-stretch xl:gap-8 xl:px-8 xl:py-6 ${index < visibleRates.length - 1 ? "border-b border-pbrown-200/25 md:border-b-0 md:border-r" : ""}`}>
                <div className="flex items-center gap-3 xl:gap-5">
                  <img src={rate.flag} alt={rate.code} className="size-10" />
                  <h4 className="text-lg font-semibold leading-[26px] text-pgold-200 xl:text-[28px] xl:leading-8 xl:tracking-[-0.56px]">{rate.code}</h4>
                </div>
                <div className="flex flex-1 items-center justify-between gap-2">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold leading-5 text-pbrown-200 xl:text-lg xl:leading-[26px]">{copy.buy}</p>
                    <p className="text-base font-semibold leading-6 text-pgold-200 xl:text-xl xl:leading-7 xl:tracking-[-0.4px]">{rate.beli}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold leading-5 text-pbrown-200 xl:text-lg xl:leading-[26px]">{copy.sell}</p>
                    <p className="text-base font-semibold leading-6 text-pgold-200 xl:text-xl xl:leading-7 xl:tracking-[-0.4px]">{rate.jual}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <p className="flex items-center justify-start gap-2 text-left text-xs leading-4 text-pbrown-200 xl:justify-center xl:text-center xl:text-base xl:leading-6">
            {copy.updatedAt}
            <img src="/assets/prioritas/banking/refresh.svg" alt="" className="size-5" />
          </p>
          <div className="md:hidden"><ViewMore label={copy.viewMore} /></div>
        </section>
      </div>
    </section>
  );
}
