"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BankingPrivilegeCard, WealthInsightCard, type PrivilegeCard, type WealthCard } from "@/components/prioritas/BankingSolutionSection";
import { insightAssets } from "@/components/prioritas/wealth-insight-assets";

const root = "/assets/prioritas/banking-solution";
const existing = "/assets/prioritas/banking";
const privilegeAssets = [
  { key: "jcb", image: `${root}/jcb-welcome-bonus.png`, imagePosition: "55% center" },
  { key: "vehicle", image: `${existing}/privilege-vehicle.png` },
  { key: "branch", image: `${existing}/privilege-branch.png` },
  { key: "insurance", image: `${root}/insurance.png` },
  { key: "fees", image: `${root}/special-transaction-fees.png` },
  { key: "transaction", image: `${existing}/privilege-transaction.png` },
  { key: "media", image: `${root}/information-media.jpg` },
  { key: "advisor", image: `${root}/branch-service-advisor.png` },
  { key: "family", image: `${root}/branch-service-family.png` },
  { key: "contact", image: `${root}/contact-center.png` },
  { key: "credit", image: `${existing}/privilege-credit.png` },
  { key: "home", image: `${existing}/privilege-home.png` },
  { key: "motorcycle", image: `${root}/motorcycle-loan.png` },
  { key: "merchant", image: `${root}/merchant-edc.png` },
  { key: "deposit", image: `${existing}/privilege-deposit.png` },
  { key: "forex", image: `${root}/foreign-exchange.png` },
] as const;

const privilegeClusters = [
  { key: "financing", items: ["vehicle", "home", "motorcycle", "insurance"] },
  { key: "cards", items: ["jcb", "credit", "merchant"] },
  { key: "transactions", items: ["fees", "transaction", "forex", "deposit"] },
  { key: "personal", items: ["branch", "advisor", "family", "contact", "media"] },
] as const;

function BankingPrivilegeCluster({ heading, items, action, previousLabel, nextLabel }: {
  heading: string;
  items: Array<{ key: string; card: PrivilegeCard }>;
  action: string;
  previousLabel: string;
  nextLabel: string;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState({ previous: false, next: false });

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const update = () => setCanScroll({
      previous: rail.scrollLeft > 1,
      next: rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 1,
    });
    update();
    rail.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(rail);
    return () => {
      rail.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);

  const move = (direction: -1 | 1) => {
    const rail = railRef.current;
    const card = rail?.firstElementChild as HTMLElement | null;
    if (!rail || !card) return;
    const gap = parseFloat(getComputedStyle(rail).columnGap) || 0;
    rail.scrollBy({
      left: direction * (card.getBoundingClientRect().width + gap),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  };

  return <section aria-label={heading} className="min-w-0">
    <div className="flex items-center justify-between gap-4">
      <h2 className="text-subtitle text-neutral-800 xl:text-title">{heading}</h2>
      <div className={`hidden items-center gap-2 sm:flex ${canScroll.previous || canScroll.next ? "" : "sm:hidden"}`}>
        <button type="button" onClick={() => move(-1)} disabled={!canScroll.previous} aria-label={previousLabel} className="flex size-10 items-center justify-center rounded-full border border-pbrown-200 bg-pgold-100 transition-colors hover:bg-pgold-300 disabled:opacity-40">
          <span aria-hidden="true" className="size-5 rotate-180 bg-pbrown-600 [mask-image:url('/assets/prioritas/detail/molton-brown/chevron-right.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]" />
        </button>
        <button type="button" onClick={() => move(1)} disabled={!canScroll.next} aria-label={nextLabel} className="flex size-10 items-center justify-center rounded-full border border-pbrown-200 bg-pgold-100 transition-colors hover:bg-pgold-300 disabled:opacity-40">
          <span aria-hidden="true" className="size-5 bg-pbrown-600 [mask-image:url('/assets/prioritas/detail/molton-brown/chevron-right.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]" />
        </button>
      </div>
    </div>
    <div ref={railRef} className="hide-scrollbar -mx-4 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:gap-6 sm:px-0 xl:mx-[calc((1280px-100vw)/2)] xl:px-[calc((100vw-1280px)/2)] xl:[scroll-padding-inline:calc((100vw-1280px)/2)]">
      {items.map(({ key, card }) => <div key={key} className="w-[280px] shrink-0 snap-center sm:w-[410px] xl:snap-start"><BankingPrivilegeCard card={card} action={action} directory /></div>)}
    </div>
  </section>;
}

function WealthGroup({ group, backdrops }: { group: "house" | "market"; backdrops: Record<string, string> }) {
  const t = useTranslations("bankingSolutionIndex");
  const railRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState({ previous: false, next: false });
  const cards: WealthCard[] = insightAssets[group].map(({ key, image, actionIcon }) => ({
    title: t(`insight.${key}.title`),
    image,
    imageAlt: t(`insight.${key}.alt`),
    action: t("downloadAction"),
    actionIcon: actionIcon === "download" ? "download" : undefined,
    backdrop: backdrops[key],
    href: group === "house"
      ? "https://prioritas.bca.co.id/en/Wealth-Management/Market-Insight/House-View-Report"
      : "https://prioritas.bca.co.id/en/Wealth-Management/Market-Insight/Weekly-Market-Overview",
    metadata: [
      { icon: `${existing}/calendar.svg`, label: t(`insight.${key}.date`) },
    ],
  }));

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const update = () => setCanScroll({
      previous: rail.scrollLeft > 1,
      next: rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 1,
    });
    update();
    rail.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(rail);
    return () => {
      rail.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);

  const move = (direction: -1 | 1) => {
    const rail = railRef.current;
    const card = rail?.firstElementChild as HTMLElement | null;
    if (!rail || !card) return;
    const gap = parseFloat(getComputedStyle(rail).columnGap) || 0;
    rail.scrollBy({
      left: direction * (card.getBoundingClientRect().width + gap),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  };

  return <section aria-labelledby={`wealth-${group}`} className="relative">
    <div className="flex items-center justify-between gap-4">
      <h2 id={`wealth-${group}`} className="text-subtitle text-neutral-800 xl:text-title">{t(`groups.${group}`)}</h2>
      <div className={`hidden items-center gap-2 sm:flex ${canScroll.previous || canScroll.next ? "" : "sm:hidden"}`}>
        <button type="button" onClick={() => move(-1)} disabled={!canScroll.previous} aria-label={t("previousCards", { cluster: t(`groups.${group}`) })} className="flex size-10 items-center justify-center rounded-full border border-pbrown-200 bg-pgold-100 transition-colors hover:bg-pgold-300 disabled:opacity-40">
          <span aria-hidden="true" className="size-5 rotate-180 bg-pbrown-600 [mask-image:url('/assets/prioritas/detail/molton-brown/chevron-right.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]" />
        </button>
        <button type="button" onClick={() => move(1)} disabled={!canScroll.next} aria-label={t("nextCards", { cluster: t(`groups.${group}`) })} className="flex size-10 items-center justify-center rounded-full border border-pbrown-200 bg-pgold-100 transition-colors hover:bg-pgold-300 disabled:opacity-40">
          <span aria-hidden="true" className="size-5 bg-pbrown-600 [mask-image:url('/assets/prioritas/detail/molton-brown/chevron-right.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]" />
        </button>
      </div>
    </div>
    <div ref={railRef} className="hide-scrollbar -mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:gap-6 sm:px-0 xl:mx-[calc((1280px-100vw)/2)] xl:px-[calc((100vw-1280px)/2)] xl:[scroll-padding-inline:calc((100vw-1280px)/2)]">
      {cards.map((card) => <div key={card.title} className="w-[280px] shrink-0 snap-center sm:w-[410px] xl:snap-start">
        <div className="sm:hidden"><WealthInsightCard card={card} mobileDirectory /></div>
        <div className="hidden sm:block"><WealthInsightCard card={card} mobileDirectory /></div>
      </div>)}
    </div>
  </section>;
}

export default function BankingSolutionIndexExperience({ activeTab, backdrops = {} }: { activeTab: "privilege" | "wealth"; backdrops?: Record<string, string> }) {
  const t = useTranslations("bankingSolutionIndex");

  return <main className="relative overflow-hidden bg-pgold-200">
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(ellipse_at_0%_50%,white_0%,transparent_38%),radial-gradient(ellipse_at_100%_18%,white_0%,transparent_36%)]" />
    <div className="relative mx-auto w-full max-w-[1280px] px-4 py-10 xl:px-0">
      {activeTab === "privilege" ? <div className="flex flex-col gap-10 xl:gap-14">
        {privilegeClusters.map((cluster) => {
          const heading = t(`clusters.${cluster.key}`);
          const items = cluster.items.map((key) => {
            const asset = privilegeAssets.find((item) => item.key === key);
            if (!asset) throw new Error(`Unknown Banking Privilege card: ${key}`);
            return {
              key,
              card: {
                title: t(`privilege.${key}`),
                alt: t(`privilege.${key}`),
                image: asset.image,
                imagePosition: "imagePosition" in asset ? asset.imagePosition : undefined,
                href: "https://prioritas.bca.co.id/id/Privilege/BCA-Privilege",
              },
            };
          });
          return <BankingPrivilegeCluster
            key={cluster.key}
            heading={heading}
            items={items}
            action={t("more")}
            previousLabel={t("previousCards", { cluster: heading })}
            nextLabel={t("nextCards", { cluster: heading })}
          />;
        })}
      </div> : <div className="flex flex-col gap-10">
        <WealthGroup group="house" backdrops={backdrops} />
        <WealthGroup group="market" backdrops={backdrops} />
      </div>}
    </div>
  </main>;
}
