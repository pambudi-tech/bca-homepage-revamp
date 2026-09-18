/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import SectionAnchor from "@/components/home/SectionAnchor";
import { NAVBAR_VISIBILITY_EVENT } from "@/components/home/Navbar";
import { splitComparisonSections, type ComparisonGroup, type ComparisonSection, type ComparisonTab } from "@/components/kartu-kredit/comparison-utils";

type Benefit = { icon: string; label: string };
type CardClusterKey = "bca-card" | "visa" | "mastercard" | "jcb" | "unionpay" | "american-express";

const comparisonValuePattern = /(Rp\.?\s?[\d.,]+(?:\s?(?:juta|Juta|jt|rb|ribu))?|\b\d[\d.,]*%?)/g;

function highlightComparisonValues(text: string) {
  return text.split(comparisonValuePattern).map((part, index) => {
    if (!part || !/\d/.test(part)) return part;
    return <strong key={`${part}-${index}`} className="font-bold text-neutral-800">{part}</strong>;
  });
}

export type ComparisonCard = {
  id: string;
  title: string;
  image: string;
  imageAlt: string;
  benefits: Benefit[];
  comparison?: ComparisonSection[];
};

function getCardCluster(card: ComparisonCard): CardClusterKey {
  if (["everyday-card", "card-platinum"].includes(card.id)) return "bca-card";
  if (["krisflyer-signature", "krisflyer-infinite", "pps-club-infinite", "visa-batman", "visa-black"].includes(card.id)) return "visa";
  if (["tiket-mastercard", "mastercard-black", "blibli-mastercard", "mastercard-globe", "mastercard-world"].includes(card.id)) return "mastercard";
  if (card.id === "jcb-black") return "jcb";
  if (card.id === "unionpay") return "unionpay";
  if (card.id === "american-express-platinum") return "american-express";
  return "mastercard";
}

export default function CreditCardComparison({ cards, availableCards }: { cards: ComparisonCard[]; availableCards: ComparisonCard[] }) {
  const t = useTranslations("creditCardDetail.cardList.comparisonView");
  const [navbarHidden, setNavbarHidden] = useState(false);
  const [selectedCards, setSelectedCards] = useState(cards);

  useEffect(() => {
    const syncNavbar = (event: Event) => setNavbarHidden((event as CustomEvent<boolean>).detail);
    window.addEventListener(NAVBAR_VISIBILITY_EVENT, syncNavbar);
    return () => window.removeEventListener(NAVBAR_VISIBILITY_EVENT, syncNavbar);
  }, []);

  const fallbackSections = splitComparisonSections(t.raw("sections") as ComparisonSection[]);
  const sections = splitComparisonSections(selectedCards[0]?.comparison ?? fallbackSections);

  const navItems = sections.map((section) => ({
    key: section.key,
    target: `#comparison-${section.key}`,
    label: t(`tabs.${section.key}`),
  }));

  return (
    <section id="comparison-content" className="bg-blue-100 pb-0">
      <ComparisonCardSelector cards={selectedCards} />
      <div className={`sticky z-30 transition-[top] duration-300 ${navbarHidden ? "top-0" : "top-16 xl:top-[72px]"}`}>
        <ComparisonCardControls
          cards={selectedCards}
          availableCards={availableCards}
          applyLabel={t("apply")}
          onCardChange={(index, id) => {
            const nextCard = availableCards.find((card) => card.id === id);
            if (!nextCard) return;
            setSelectedCards((current) => current.map((card, cardIndex) => cardIndex === index ? nextCard : card));
          }}
        />
        <SectionAnchor label={t("navigationLabel")} items={navItems} />
      </div>
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-0 px-0 pt-0">
        {sections.map((section) => (
          <ComparisonTableSection
            key={section.key}
            tab={section.key}
            cards={selectedCards}
            groups={section.groups}
            title={t(`tabs.${section.key}`)}
          />
        ))}
      </div>
    </section>
  );
}

function ComparisonCardSelector({ cards }: { cards: ComparisonCard[] }) {
  const t = useTranslations("creditCardDetail.cardList.comparisonView");
  return (
    <section id="comparison-cards" className="bg-white" aria-label={t("selectedCards")}>
      <div className="mx-auto flex w-full max-w-[1280px] gap-4 overflow-x-auto px-4 pb-0 pt-4 [scrollbar-width:none] xl:gap-4 xl:pb-0 xl:pt-4">
        {cards.map((card) => (
          <article key={card.id} className="flex min-w-[176px] flex-1 flex-col gap-2 xl:min-w-0">
            <div className="flex aspect-[1.6] items-center justify-center rounded-xl bg-neutral-50">
              <img src={card.image} alt={card.imageAlt} className="size-full object-contain" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ComparisonCardControls({
  cards,
  availableCards,
  applyLabel,
  onCardChange,
}: {
  cards: ComparisonCard[];
  availableCards: ComparisonCard[];
  applyLabel: string;
  onCardChange: (index: number, id: string) => void;
}) {
  const t = useTranslations("creditCardDetail.cardList.comparisonView");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [menuTop, setMenuTop] = useState(0);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    if (openIndex === null) return;
    const updateMenuPosition = () => {
      const button = buttonRefs.current[openIndex];
      if (button) setMenuTop(button.getBoundingClientRect().bottom + 4);
    };
    updateMenuPosition();
    window.addEventListener("scroll", updateMenuPosition, true);
    window.addEventListener("resize", updateMenuPosition);
    return () => {
      window.removeEventListener("scroll", updateMenuPosition, true);
      window.removeEventListener("resize", updateMenuPosition);
    };
  }, [openIndex]);

  return (
    <div className={`relative border-b border-neutral-200 bg-white shadow-card ${openIndex === null ? "z-30" : "z-40"}`}>
      <div className={`mx-auto flex w-full max-w-[1280px] gap-4 px-4 pb-4 pt-4 [scrollbar-width:none] xl:gap-4 xl:px-4 xl:pb-4 xl:pt-4 ${openIndex === null ? "overflow-x-auto" : "overflow-visible"}`}>
        {cards.map((card, index) => (
          <article key={card.id} className="flex min-w-[176px] flex-1 flex-col gap-3">
            <div className="relative">
              <button
                type="button"
                aria-label={`Pilih kartu ${index + 1}`}
                aria-haspopup="listbox"
                aria-expanded={openIndex === index}
                ref={(element) => {
                  buttonRefs.current[index] = element;
                }}
                onClick={(event) => {
                  const nextIndex = openIndex === index ? null : index;
                  if (nextIndex !== null) setMenuTop(event.currentTarget.getBoundingClientRect().bottom + 4);
                  setOpenIndex(nextIndex);
                }}
                className="flex h-14 w-full items-center justify-between gap-2 rounded-xl border border-neutral-300 bg-neutral-200 px-2 text-left text-sm font-semibold leading-5 text-neutral-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 xl:px-3"
              >
                <span className="line-clamp-2 min-w-0">{card.title}</span>
                <img src="/assets/kartu-kredit/chevron-down.svg" alt="" className={`size-6 shrink-0 transition-transform ${openIndex === index ? "rotate-180" : ""}`} />
              </button>
              {openIndex === index ? (
                <div role="listbox" aria-label={`Pilihan kartu ${index + 1}`} data-lenis-prevent style={{ top: menuTop }} className="fixed inset-x-4 z-[60] max-h-64 overflow-y-auto overscroll-contain rounded-xl border border-neutral-300 bg-white p-1 shadow-card">
                  {(["bca-card", "visa", "mastercard", "jcb", "unionpay", "american-express"] as CardClusterKey[]).map((cluster) => {
                    const clusterCards = availableCards.filter((option) => getCardCluster(option) === cluster);
                    if (!clusterCards.length) return null;
                    return (
                      <div key={cluster}>
                        <p className="px-3 pb-1 pt-2 text-xs font-bold text-neutral-500">{t(`cardClusters.${cluster}`)}</p>
                        {clusterCards.map((option) => {
                          const isDisabled = cards.some((selected, selectedIndex) => selectedIndex !== index && selected.id === option.id);
                          return (
                            <button
                              key={option.id}
                              type="button"
                              role="option"
                              aria-selected={card.id === option.id}
                              disabled={isDisabled}
                              onClick={() => {
                                onCardChange(index, option.id);
                                setOpenIndex(null);
                              }}
                              className="block w-full rounded-lg px-3 py-2 text-left text-sm leading-5 text-neutral-700 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <span className="line-clamp-2">{option.title}</span>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
            <a href="https://mybca.bca.co.id/auth/login" target="_blank" rel="noopener noreferrer" className="btn-base btn-primary h-10 w-full text-sm font-semibold">
              {applyLabel}
            </a>
          </article>
        ))}
      </div>
    </div>
  );
}

function ComparisonTableSection({
  tab,
  cards,
  groups,
  title,
}: {
  tab: ComparisonTab;
  cards: ComparisonCard[];
  groups: ComparisonGroup[];
  title: string;
}) {
  return (
    <section id={`comparison-${tab}`} className="scroll-mt-[190px] overflow-hidden bg-white" aria-labelledby={`comparison-${tab}-title`}>
      <h2 id={`comparison-${tab}-title`} className="bg-blue-100 px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-blue-500 xl:px-6 xl:py-4 xl:text-sm">{title}</h2>
      <div className="overflow-x-auto px-0 py-0">
        <table className="w-full min-w-0 table-fixed border-collapse text-left text-sm">
          {groups.map((group, groupIndex) => (
            <tbody key={group.title || "main"}>
              {group.title ? (
                <tr>
                  <th colSpan={cards.length} className="bg-blue-100 px-4 py-3 text-left text-xs font-semibold text-blue-700">{group.title}</th>
                </tr>
              ) : null}
              {group.points.map((point, pointIndex) => (
                <tr key={`${group.title}-${point.label}-${pointIndex}`} className="align-top">
                  {cards.map((card) => {
                    const cardSection = splitComparisonSections(card.comparison ?? []).find((section) => section.key === tab);
                    const cardGroup = cardSection?.groups[groupIndex];
                    const cardPoint = cardGroup?.points[pointIndex] ?? point;
                    return (
                    <td key={`${point.label}-${card.id}`} className="break-words px-4 py-3 leading-5 text-neutral-700">
                      <div className="flex flex-col gap-1.5">
                        <strong className="font-bold text-neutral-900">{cardPoint.label}</strong>
                        {cardPoint.description ? <span>{highlightComparisonValues(cardPoint.description)}</span> : null}
                        {cardPoint.bullets ? <ul className="list-disc space-y-1 pl-4">{cardPoint.bullets.map((bullet) => <li key={bullet}>{highlightComparisonValues(bullet)}</li>)}</ul> : null}
                      </div>
                    </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
    </section>
  );
}
