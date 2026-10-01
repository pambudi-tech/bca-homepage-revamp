import { Link } from "@/i18n/navigation";
import type { KursEntry } from "@/lib/kurs";
import KursRatesCarousel from "@/components/prioritas/KursRatesCarousel";
import { PrioritasButtonIcon, prioritasButtonClassName } from "@/components/prioritas/PrioritasButton";

export type PrivilegeCard = {
  title: string;
  alt: string;
  image: string;
  href?: string;
  imagePosition?: string;
};

export type WealthCardData = {
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
  wealthCards: WealthCardData[];
};

function ViewMore({ label, href = "/kartu-kredit" }: { label: string; href?: string }) {
  const className = prioritasButtonClassName({ surface: "inverse", size: "large", className: "w-full md:w-fit" });
  const content = <><span className="prio-button__label">{label}</span><PrioritasButtonIcon src="/assets/cycle1/pelajari-icon.svg" /></>;

  if (href === "https://www.bca.co.id/id/informasi/kurs") {
    return <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{content}</a>;
  }

  return (
    <Link href={href} className={className}>{content}</Link>
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
      <Link href={card.href ?? "/kartu-kredit"} aria-label={`${card.title} — ${action}`} className="absolute inset-0 z-10">
        <span aria-hidden="true" className={prioritasButtonClassName({ variant: "secondary", surface: "inverse", size: "medium", className: "absolute bottom-4 left-4 md:bottom-6 md:left-6" })}>
          <span className="prio-button__label">{action}</span>
        </span>
      </Link>
    </article>
  );
}

export function WealthCard({ card }: { card: WealthCardData }) {
  return (
    <article className="group relative h-[360px] overflow-hidden rounded-xl shadow-prioritas" style={{ backgroundColor: card.backdrop ?? "var(--color-pbrown-900)" }}>
      <img src={card.image} alt={card.imageAlt} loading="lazy" decoding="async" className="absolute inset-x-0 top-0 h-3/4 w-full max-w-none object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 top-[45%]" style={{ backgroundImage: `linear-gradient(to bottom, transparent 0%, ${card.backdrop ?? "var(--color-pbrown-900)"} 55%, ${card.backdrop ?? "var(--color-pbrown-900)"} 100%)` }} />
      <div
        className="glass-panel glass-panel-prioritas absolute inset-x-2 bottom-2 flex h-auto flex-col gap-6 overflow-hidden rounded-2xl p-4"
        style={{ backdropFilter: "blur(16px) saturate(1.25)", WebkitBackdropFilter: "blur(16px) saturate(1.25)", isolation: "isolate" }}
      >
        <div className="flex flex-col gap-4">
          <h3 className="text-base font-semibold leading-[1.3] text-neutral-100">{card.title}</h3>
          <div className="flex flex-col gap-4">
            {card.metadata.map((item) => (
              <div className="flex items-center gap-2" key={item.label}>
                <img src={item.icon} alt="" className="size-5" />
                <p className="text-sm font-semibold leading-5 text-neutral-300">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
        <Link href={card.href ?? "/artikel"} className={prioritasButtonClassName({ variant: "secondary", surface: "inverse", size: "medium", className: "relative w-fit" })}>
          {card.actionIcon === "download" ? <img src="/assets/prioritas/banking/download.svg" alt="" className="size-5" /> : null}
          <span className="prio-button__label">{card.action}</span>
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

        <section className="flex flex-col gap-6">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <h3 className="text-lg font-semibold text-pgold-100 xl:text-heading">{copy.bankingPrivilege}</h3>
            <div className="hidden md:block"><ViewMore label={copy.viewMore} href="/prioritas/banking-solution" /></div>
          </div>
          <div className="hide-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 xl:grid-cols-3">
            {copy.cards.map((card) => <BankingPrivilegeCard key={card.title} card={card} action={copy.action} />)}
          </div>
          <div className="md:hidden"><ViewMore label={copy.viewMore} href="/prioritas/banking-solution" /></div>
        </section>

        <section className="flex flex-col gap-6">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <h3 className="text-lg font-semibold text-pgold-100 xl:text-heading">{copy.wealthInsight}</h3>
            <div className="hidden md:block"><ViewMore label={copy.viewMore} href="/prioritas/banking-solution/wealth-insight" /></div>
          </div>
          <div className="grid gap-4 overflow-hidden rounded-xl xl:grid-cols-2 xl:gap-6">
            {copy.wealthCards.map((card) => <WealthCard key={card.title} card={card} />)}
          </div>
          <div className="md:hidden"><ViewMore label={copy.viewMore} href="/prioritas/banking-solution/wealth-insight" /></div>
        </section>

        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-pgold-200 xl:text-heading">{copy.kurs}</h3>
            <div className="hidden md:block"><ViewMore label={copy.viewMore} href="/prioritas/banking-solution/kurs" /></div>
          </div>
          <KursRatesCarousel rates={kurs} copy={copy} />
          <div className="md:hidden"><ViewMore label={copy.viewMore} href="/prioritas/banking-solution/kurs" /></div>
        </section>
      </div>
    </section>
  );
}
