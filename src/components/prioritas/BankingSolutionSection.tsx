import { Link } from "@/i18n/navigation";
import type { KursEntry } from "@/lib/kurs";
import KursRatesCarousel from "@/components/prioritas/KursRatesCarousel";
import { PrioritasButtonIcon, prioritasButtonClassName, solitaireButtonClassName } from "@/components/prioritas/PrioritasButton";

export type PrivilegeCard = {
  title: string;
  alt: string;
  image: string;
  href?: string;
  imagePosition?: string;
};

export type WealthCardData = {
  eyebrow: string;
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

function ViewMore({ label, href = "/kartu-kredit", tone = "prioritas" }: { label: string; href?: string; tone?: "prioritas" | "solitaire" }) {
  const isSolitaire = tone === "solitaire";
  const className = (isSolitaire ? solitaireButtonClassName : prioritasButtonClassName)({ variant: isSolitaire ? "secondary" : "primary", surface: isSolitaire ? "default" : "inverse", size: "large", className: "w-full md:w-fit" });
  const content = <><span className="prio-button__label">{label}</span><PrioritasButtonIcon src="/assets/cycle1/pelajari-icon.svg" /></>;

  if (href === "https://www.bca.co.id/id/informasi/kurs") {
    return <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{content}</a>;
  }

  return (
    <Link href={href} className={className}>{content}</Link>
  );
}

export function BankingPrivilegeCard({ card, action, directory = false, tone = "prioritas", previewViewport }: { card: PrivilegeCard; action: string; directory?: boolean; tone?: "prioritas" | "solitaire"; previewViewport?: "mobile" | "desktop" }) {
  const buttonClassName = tone === "solitaire" ? solitaireButtonClassName : prioritasButtonClassName;
  const desktop = previewViewport === "desktop";
  return (
    <article className={`group relative shrink-0 snap-center overflow-hidden rounded-xl ${previewViewport ? desktop ? "h-[300px]" : "h-[360px]" : "h-[360px] md:h-[300px] md:shrink md:snap-none"} ${directory ? "w-full" : previewViewport ? desktop ? "w-full" : "w-[280px]" : "w-[280px] md:w-auto"}`}>
      <img src={card.image} alt={card.alt} loading="lazy" decoding="async" style={card.imagePosition ? { objectPosition: card.imagePosition } : undefined} className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
      <div className={`absolute inset-0 ${tone === "solitaire" ? "bg-[radial-gradient(110%_125%_at_0%_110%,var(--color-neutral-800)_20%,transparent_70%)]" : "bg-[radial-gradient(110%_125%_at_0%_110%,var(--color-pbrown-800)_20%,transparent_70%)]"}`} />
      <h3 className={`absolute text-neutral-100 [text-shadow:0_3px_4px_rgb(0_0_0_/_0.25)] ${previewViewport ? desktop ? "bottom-[88px] left-6 w-[min(301px,calc(100%-3rem))] text-title" : "bottom-20 left-4 w-[min(301px,calc(100%-2rem))] text-subtitle" : "bottom-20 left-4 w-[min(301px,calc(100%-2rem))] text-subtitle md:bottom-[88px] md:left-6 md:w-[min(301px,calc(100%-3rem))] md:text-title"}`}>
        {card.title}
      </h3>
      <Link href={card.href ?? "/kartu-kredit"} aria-label={`${card.title} — ${action}`} className="absolute inset-0 z-10">
        <span aria-hidden="true" className={buttonClassName({ variant: "secondary", surface: "inverse", size: "medium", className: previewViewport ? desktop ? "absolute bottom-6 left-6" : "absolute bottom-4 left-4" : "absolute bottom-4 left-4 md:bottom-6 md:left-6" })}>
          <span className="prio-button__label">{action}</span>
        </span>
      </Link>
    </article>
  );
}

export function WealthCard({ card, tone = "prioritas" }: { card: WealthCardData; tone?: "prioritas" | "solitaire" }) {
  const buttonClassName = tone === "solitaire" ? solitaireButtonClassName : prioritasButtonClassName;
  const isSolitaire = tone === "solitaire";
  return (
    <article className={`group relative h-[360px] overflow-hidden rounded-xl xl:h-[400px] ${isSolitaire ? "border border-neutral-300 shadow-panel" : "shadow-prioritas"}`} style={{ backgroundColor: isSolitaire ? "var(--color-neutral-800)" : card.backdrop ?? "var(--color-pbrown-900)" }}>
      <img src={card.image} alt={card.imageAlt} loading="lazy" decoding="async" className="absolute inset-x-0 top-0 h-3/4 w-full max-w-none object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 top-[45%]" style={{ backgroundImage: `linear-gradient(to bottom, transparent 0%, ${card.backdrop ?? "var(--color-pbrown-900)"} 55%, ${card.backdrop ?? "var(--color-pbrown-900)"} 100%)` }} />
      <div
        className={`glass-panel ${isSolitaire ? "glass-panel-solitaire" : "glass-panel-prioritas"} absolute inset-x-2 bottom-2 flex h-auto flex-col gap-6 overflow-hidden rounded-2xl p-4`}
        style={{ backgroundColor: isSolitaire ? "color-mix(in srgb, var(--color-neutral-800) 30%, transparent)" : undefined, isolation: "isolate" }}
      >
        <div className="flex flex-col gap-4">
          <p className="text-eyebrow uppercase text-neutral-100/80 xl:text-eyebrow-lg">{card.eyebrow}</p>
          <h3 className="text-lg font-semibold leading-[1.3] text-neutral-100 xl:text-xl">{card.title}</h3>
          <div className="flex flex-col gap-4">
            {card.metadata.map((item) => (
              <div className="flex items-center gap-2" key={item.label}>
                <img src={item.icon} alt="" className="size-5" />
                <p className="text-sm font-semibold leading-5 text-neutral-300 xl:text-base">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
        <Link href={card.href ?? "/artikel"} className={buttonClassName({ variant: "secondary", surface: "inverse", size: "medium", className: "relative w-fit" })}>
          {card.actionIcon === "download" ? <img src="/assets/prioritas/banking/download.svg" alt="" className="size-5" /> : null}
          <span className="prio-button__label">{card.action}</span>
        </Link>
      </div>
    </article>
  );
}

export default function BankingSolutionSection({ copy, kurs, tone = "prioritas", publicBasePath = "/prioritas" }: { copy: Copy; kurs: KursEntry[]; tone?: "prioritas" | "solitaire"; publicBasePath?: string }) {
  const isSolitaire = tone === "solitaire";

  return (
    <section id="banking-solution" className={`relative overflow-hidden ${isSolitaire ? "bg-neutral-400 text-neutral-900" : "bg-pbrown-600 text-pgold-100"} py-12 xl:py-20`}>
      {isSolitaire ? (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 mix-blend-lighten opacity-80">
          <img src="/assets/solitaire/banking-solution/background.png" alt="" loading="lazy" decoding="async" className="size-full object-cover object-bottom" />
        </div>
      ) : null}
      {!isSolitaire ? (
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 hidden xl:block">
          <img src="/assets/prioritas/banking-solution/bg-decoration-1.svg" alt="" className="absolute left-1/2 top-0 block w-[153%] max-w-none -translate-x-1/2" />
        </div>
      ) : null}
      <div className="relative z-10 mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-4 md:gap-12 xl:gap-14 xl:px-0">
        <header className="flex flex-col gap-6 xl:flex-row xl:gap-10">
          <p className={`text-eyebrow-lg uppercase ${isSolitaire ? "text-neutral-900" : "text-pgold-300"} md:text-eyebrow xl:w-[180px] xl:shrink-0 xl:py-2 xl:text-eyebrow-xl`}>{copy.eyebrow}</p>
          <h2 className={`text-heading max-w-[560px] ${isSolitaire ? "text-neutral-900" : "text-pgold-100"} xl:text-display`}>{copy.heading}</h2>
        </header>

        <section className="flex flex-col gap-4 md:gap-6">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <h3 className={`text-lg font-semibold ${isSolitaire ? "text-neutral-900" : "text-pgold-100"} xl:text-heading`}>{copy.bankingPrivilege}</h3>
            <div className="hidden md:block"><ViewMore label={copy.viewMore} href={`${publicBasePath}/banking-solution`} tone={tone} /></div>
          </div>
          <div className="hide-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 xl:grid-cols-3">
            {copy.cards.map((card) => <BankingPrivilegeCard key={card.title} card={card} action={copy.action} tone={tone} />)}
          </div>
          <div className="md:hidden"><ViewMore label={copy.viewMore} href={`${publicBasePath}/banking-solution`} tone={tone} /></div>
        </section>

        <section className="flex flex-col gap-4 md:gap-6">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <h3 className={`text-lg font-semibold ${isSolitaire ? "text-neutral-900" : "text-pgold-100"} xl:text-heading`}>{copy.wealthInsight}</h3>
            <div className="hidden md:block"><ViewMore label={copy.viewMore} href={`${publicBasePath}/banking-solution/wealth-insight`} tone={tone} /></div>
          </div>
          <div className="grid gap-4 overflow-hidden rounded-xl xl:grid-cols-2 xl:gap-6">
            {copy.wealthCards.map((card) => <WealthCard key={card.title} card={card} tone={tone} />)}
          </div>
          <div className="md:hidden"><ViewMore label={copy.viewMore} href={`${publicBasePath}/banking-solution/wealth-insight`} tone={tone} /></div>
        </section>

        <section className="flex flex-col gap-4 md:gap-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className={`text-lg font-semibold ${isSolitaire ? "text-neutral-800" : "text-pgold-200"} xl:text-heading`}>{copy.kurs}</h3>
            <div className="hidden md:block"><ViewMore label={copy.viewMore} href={`${publicBasePath}/banking-solution/kurs`} tone={tone} /></div>
          </div>
          <KursRatesCarousel rates={kurs} copy={copy} tone={tone} />
          <div className="md:hidden"><ViewMore label={copy.viewMore} href={`${publicBasePath}/banking-solution/kurs`} tone={tone} /></div>
        </section>
      </div>
    </section>
  );
}
