import { Link } from "@/i18n/navigation";
import type { KursEntry } from "@/lib/kurs";
import KursRatesCarousel from "@/components/prioritas/KursRatesCarousel";

export type PrivilegeCard = {
  title: string;
  alt: string;
  image: string;
  href?: string;
  imagePosition?: string;
};

export type WealthCard = {
  title: string;
  metadata: { icon: string; label: string }[];
  action: string;
  image: string;
  imageAlt: string;
  actionIcon?: "download";
  href?: string;
  imageCrop?: { height: string; top: string };
  backdrop?: string;
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
  refresh: string;
  previous: string;
  next: string;
  cards: PrivilegeCard[];
  wealthCards: WealthCard[];
};

function ViewMore({ label, href = "/kartu-kredit" }: { label: string; href?: string }) {
  return (
    <Link href={href} className="btn-base w-full border border-pbrown-600 bg-pgold-100 text-pbrown-600 transition-colors hover:bg-pgold-300 md:w-fit">
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

export function BankingPrivilegeCard({ card, action, directory = false }: { card: PrivilegeCard; action: string; directory?: boolean }) {
  return (
    <article className={`group relative h-[360px] shrink-0 snap-center overflow-hidden rounded-xl md:h-[300px] md:shrink md:snap-none ${directory ? "w-full" : "w-[280px] md:w-auto"}`}>
      <img src={card.image} alt={card.alt} loading="lazy" decoding="async" style={card.imagePosition ? { objectPosition: card.imagePosition } : undefined} className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
      <div className="absolute inset-0 bg-[radial-gradient(110%_125%_at_0%_110%,var(--color-pbrown-800)_20%,transparent_70%)]" />
      <h3 className="absolute bottom-20 left-4 w-[min(301px,calc(100%-2rem))] text-subtitle text-neutral-100 [text-shadow:0_3px_4px_rgb(0_0_0_/_0.25)] md:bottom-[88px] md:left-6 md:w-[min(301px,calc(100%-3rem))] md:text-title">
        {card.title}
      </h3>
      <Link href={card.href ?? "/kartu-kredit"} className="absolute bottom-4 left-4 flex h-10 items-center justify-center rounded-full border border-pbrown-200 bg-pbrown-600/25 px-5 text-sm font-semibold leading-[14px] text-pgold-100 backdrop-blur-sm transition-colors hover:bg-pbrown-900/30 md:bottom-6 md:left-6">
        {action}
      </Link>
    </article>
  );
}

export function WealthInsightCard({ card, directory = false, mobileDirectory = false }: { card: WealthCard; directory?: boolean; mobileDirectory?: boolean }) {
  return (
    <article className={`group relative overflow-hidden rounded-xl ${directory ? "h-[400px] shadow-prioritas" : mobileDirectory ? "h-[360px]" : "h-[320px] xl:h-[560px]"}`} style={{ backgroundColor: card.backdrop ?? "var(--color-pbrown-900)" }}>
      <img src={card.image} alt={card.imageAlt} loading="lazy" decoding="async" style={directory && card.imageCrop ? { height: card.imageCrop.height, top: card.imageCrop.top } : undefined} className={`absolute left-0 w-full max-w-none transition-transform duration-700 ease-out group-hover:scale-[1.03] ${directory && card.imageCrop ? "" : directory ? "inset-0 size-full object-cover" : `inset-x-0 top-0 h-3/4 object-cover ${mobileDirectory ? "" : "xl:inset-0 xl:size-full"}`}`} />
      {!directory ? <div aria-hidden="true" className={`pointer-events-none absolute inset-x-0 bottom-0 top-[45%] ${mobileDirectory ? "" : "xl:hidden"}`} style={{ backgroundImage: `linear-gradient(to bottom, transparent 0%, ${card.backdrop ?? "var(--color-pbrown-900)"} 55%, ${card.backdrop ?? "var(--color-pbrown-900)"} 100%)` }} /> : null}
      {directory ? <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2" style={{ backgroundImage: `linear-gradient(to bottom, transparent 0%, ${card.backdrop ?? "var(--color-pbrown-900)"} 100%)` }} /> : null}
      <div
        className={directory ? "absolute inset-x-2 bottom-2 min-h-[176px] rounded-lg bg-pbrown-900/65 p-5 text-white backdrop-blur-xl" : mobileDirectory ? "glass-panel glass-panel-prioritas absolute inset-x-2 bottom-2 flex h-auto flex-col gap-6 overflow-hidden rounded-2xl p-4" : "glass-panel glass-panel-prioritas absolute inset-x-2 bottom-2 flex h-auto flex-col gap-6 overflow-hidden rounded-2xl p-4 xl:inset-x-6 xl:bottom-6 xl:block xl:h-[320px] xl:p-0"}
        style={directory ? undefined : { backdropFilter: "blur(16px) saturate(1.25)", WebkitBackdropFilter: "blur(16px) saturate(1.25)", isolation: "isolate" }}
      >
        <div className={directory ? "flex flex-col gap-3" : mobileDirectory ? "flex flex-col gap-4" : "flex flex-col gap-4 xl:absolute xl:inset-x-[31px] xl:top-[23px] xl:gap-6"}>
          <h3 className={directory ? "text-base font-semibold leading-6 text-neutral-100 xl:text-lg xl:leading-[26px]" : mobileDirectory ? "text-base font-semibold leading-[1.3] text-neutral-100" : "text-base font-semibold leading-[1.3] text-neutral-100 xl:text-[24px] xl:tracking-[-0.48px]"}>{card.title}</h3>
          <div className={directory ? "flex flex-col gap-1" : "flex flex-col gap-4"}>
            {card.metadata.map((item) => (
              <div className={directory || mobileDirectory ? "flex items-center gap-2" : "flex items-center gap-4"} key={item.label}>
                <img src={item.icon} alt="" className={directory ? "size-4" : "size-5"} />
                <p className={directory ? "text-xs font-medium leading-5 text-neutral-100" : mobileDirectory ? "text-sm font-semibold leading-5 text-neutral-300" : "text-sm font-semibold leading-5 text-neutral-300 xl:text-base"}>{item.label}</p>
              </div>
            ))}
          </div>
        </div>
        <Link href={card.href ?? "/artikel"} className={directory ? "mt-6 flex h-10 w-fit items-center justify-center gap-1 rounded-full border border-neutral-100 px-4 text-sm font-semibold leading-5 text-pgold-100 transition-colors hover:bg-pbrown-900/40" : mobileDirectory ? "relative flex h-10 w-fit items-center justify-center gap-1 rounded-full border border-neutral-100 px-6 text-sm font-semibold leading-5 text-pgold-100 transition-colors hover:bg-pbrown-900/40" : "relative flex h-10 w-fit items-center justify-center gap-1 rounded-full border border-neutral-100 px-6 text-sm font-semibold leading-5 text-pgold-100 transition-colors hover:bg-pbrown-900/40 xl:absolute xl:bottom-[31px] xl:left-[31px] xl:h-12 xl:text-base xl:leading-4"}>
          {!directory && card.actionIcon === "download" ? <img src="/assets/prioritas/banking/download.svg" alt="" className="size-5" /> : null}
          {card.action}
          {directory && card.actionIcon === "download" ? <img src="/assets/prioritas/banking/download.svg" alt="" className="size-4" /> : null}
          {directory && card.actionIcon !== "download" ? <img src="/assets/prioritas/card/arrow-right.svg" alt="" className="size-4" /> : null}
        </Link>
      </div>
    </article>
  );
}

export default function BankingSolutionSection({ copy, kurs }: { copy: Copy; kurs: KursEntry[] }) {
  return (
    <section id="banking-solution" className="relative overflow-hidden bg-pbrown-600 py-12 text-pgold-100 xl:py-20">
      <div className="relative mx-auto flex w-full max-w-[1280px] flex-col gap-12 px-4 xl:gap-14 xl:px-0">
        <header className="flex flex-col gap-6 xl:flex-row xl:gap-10">
          <p className="text-eyebrow uppercase text-pgold-300 xl:w-[180px] xl:shrink-0 xl:py-2 xl:text-eyebrow-lg">{copy.eyebrow}</p>
          <h2 className="text-heading max-w-[560px] text-pgold-100 xl:text-display">{copy.heading}</h2>
        </header>

        <section className="flex flex-col gap-8">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <h3 className="text-lg font-semibold text-pgold-100 xl:text-heading">{copy.bankingPrivilege}</h3>
            <div className="hidden md:block"><ViewMore label={copy.viewMore} href="/prioritas/banking-solution" /></div>
          </div>
          <div className="hide-scrollbar -mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 xl:grid-cols-3">
            {copy.cards.map((card) => <BankingPrivilegeCard key={card.title} card={card} action={copy.action} />)}
          </div>
          <div className="md:hidden"><ViewMore label={copy.viewMore} href="/prioritas/banking-solution" /></div>
        </section>

        <section className="flex flex-col gap-8">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <h3 className="text-lg font-semibold text-pgold-100 xl:text-heading">{copy.wealthInsight}</h3>
            <div className="hidden md:block"><ViewMore label={copy.viewMore} href="/prioritas/banking-solution/wealth-insight" /></div>
          </div>
          <div className="grid overflow-hidden rounded-xl xl:grid-cols-2">
            {copy.wealthCards.map((card) => <WealthInsightCard key={card.title} card={card} />)}
          </div>
          <div className="md:hidden"><ViewMore label={copy.viewMore} href="/prioritas/banking-solution/wealth-insight" /></div>
        </section>

        <section className="flex flex-col gap-8">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-pgold-200 xl:text-heading">{copy.kurs}</h3>
            <div className="hidden md:block"><ViewMore label={copy.viewMore} /></div>
          </div>
          <KursRatesCarousel rates={kurs} copy={copy} />
          <div className="md:hidden"><ViewMore label={copy.viewMore} /></div>
        </section>
      </div>
    </section>
  );
}
