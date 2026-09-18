/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import TextField from "@/components/ui/TextField";
import { ApplyInMyBcaLink } from "@/components/ui/MyBcaLinks";

const AMOUNT_OPTIONS = [500_000, 1_000_000, 5_000_000, 7_000_000, 10_000_000];

type MileageCard = {
  id: string;
  title: string;
  image: string;
  imageAlt: string;
  rate: number;
};

const formatRupiah = (value: number) => `Rp${value.toLocaleString("id-ID")}`;
const formatAmountChip = (value: number) => value >= 1_000_000 ? `Rp${value / 1_000_000}jt` : `Rp${value / 1_000}rb`;

export default function KrisflyerMileageSection({ cards, initialCardId }: { cards: MileageCard[]; initialCardId: string }) {
  const t = useTranslations("creditCardDetail.detailPage.mileageSimulator");
  const [amount, setAmount] = useState(1_000_000);
  const [selectedCardId, setSelectedCardId] = useState(initialCardId);
  const selectedCard = cards.find((card) => card.id === selectedCardId) ?? cards[0];
  const cardRefs = useRef(new Map<string, HTMLButtonElement>());
  const cardListRef = useRef<HTMLDivElement>(null);
  const result = useMemo(() => Math.floor(amount / (selectedCard?.rate ?? 13_500)), [amount, selectedCard]);
  const progress = Math.min((result / 5_000) * 100, 100);

  const selectCard = (cardId: string) => {
    setSelectedCardId(cardId);
    const list = cardListRef.current;
    const card = cardRefs.current.get(cardId);
    if (!list || !card) return;

    const centeredTarget = card.offsetLeft - (list.clientWidth - card.offsetWidth) / 2;
    const maxScroll = list.scrollWidth - list.clientWidth;
    const target = Math.max(0, Math.min(centeredTarget, maxScroll));
    list.scrollTo({ left: target, behavior: "smooth" });
  };

  return (
    <section id="simulasi-mileage" className="scroll-mt-[110px] bg-neutral-100 px-4 py-14 xl:px-10 xl:py-20" aria-labelledby="simulasi-mileage-title">
      <div className="mx-auto w-full max-w-[1280px]">
        <div className="max-w-[560px]">
          <p className="text-eyebrow uppercase text-blue-500 xl:text-eyebrow-lg">{t("eyebrow")}</p>
          <h2 id="simulasi-mileage-title" className="mt-4 text-heading text-blue-700 xl:text-display">{t("heading")}</h2>
          <p className="mt-4 max-w-[640px] text-base leading-6 text-neutral-700">{t("description")}</p>
        </div>

        <div className="mt-8 max-w-[560px]">
          <div ref={cardListRef} className="hide-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-pl-4 px-4 pb-1 xl:mx-0 xl:px-0" aria-label={t("cardSelectionLabel")}>
            {cards.map((card) => (
              <button key={card.id} type="button" ref={(element) => { if (element) cardRefs.current.set(card.id, element); else cardRefs.current.delete(card.id); }} onClick={() => selectCard(card.id)} aria-pressed={selectedCard.id === card.id} className={`flex w-[240px] min-w-[240px] max-w-[240px] shrink-0 snap-center flex-col items-start gap-3 rounded-xl border px-3 py-3 text-left transition-colors ${selectedCard.id === card.id ? "border-cyan-500 bg-cyan-100" : "border-neutral-300 bg-neutral-100 hover:border-cyan-500 hover:bg-cyan-100"}`}>
                <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-white p-1">
                  <img src={card.image} alt={card.imageAlt} className="size-full object-contain" />
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-semibold leading-5 ${selectedCard.id === card.id ? "text-blue-500" : "text-neutral-800"}`}>{card.title}</p>
                  <p className="mt-2 text-xs text-neutral-700">{t("mileageRate", { amount: formatRupiah(card.rate) })}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6">
            <TextField
              id="krisflyer-mileage-amount"
              label={t("transactionAmount")}
              type="number"
              min="0"
              step="50000"
              value={amount}
              onChange={(event) => setAmount(Number(event.target.value) || 0)}
              leadingIcon={<span className="text-base text-neutral-700">IDR</span>}
              aria-label={t("transactionAmount")}
              className="!text-base font-bold text-blue-500"
            />
          </div>

          <div className="hide-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1" role="group" aria-label={t("amountOptionsLabel")}>
            {AMOUNT_OPTIONS.map((option) => (
              <button key={option} type="button" onClick={() => setAmount(option)} aria-pressed={amount === option} className={`shrink-0 rounded-xl border px-4 py-2 text-sm transition-colors ${amount === option ? "border-cyan-500 bg-cyan-100 font-semibold text-blue-500" : "border-neutral-400 bg-transparent text-neutral-700 hover:border-cyan-500 hover:bg-cyan-100"}`}>
                {formatAmountChip(option)}
              </button>
            ))}
          </div>

          <div className="mt-5 rounded-2xl bg-blue-500 p-5 text-white sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/80">{t("resultLabel")}</p>
            <div className="mt-3 flex items-end gap-2">
              <strong className="text-4xl font-bold leading-none sm:text-5xl">{result.toLocaleString("id-ID")}</strong>
              <span className="pb-1 text-sm text-white/90">{t("miles")}</span>
            </div>
            <p className="mt-1 text-xs text-white/70">{t("calculation", { amount: formatRupiah(amount) })}</p>
            <div className="mt-5 border-t border-white/20 pt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/70">{t("equivalentLabel")}</p>
              <p className="mt-2 text-sm font-semibold">{t("equivalent", { progress: progress.toFixed(1) })}</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-cyan-400" style={{ width: `${Math.max(progress, 2)}%` }} /></div>
            </div>
            <ApplyInMyBcaLink className="btn-base btn-primary mt-6 w-full justify-center bg-white font-semibold text-blue-500 hover:bg-cyan-100">{t("apply")}</ApplyInMyBcaLink>
          </div>
        </div>
      </div>
    </section>
  );
}
