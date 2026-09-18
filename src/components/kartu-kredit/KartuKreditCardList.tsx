/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import PromoRibbon from "@/components/PromoRibbon";

const MAX_TILT = 10;
const MAX_COMPARE_CARDS = 3;

type BenefitIconKey =
  | "cashback"
  | "fee"
  | "installment"
  | "miles"
  | "reward"
  | "spend"
  | "voucher";

type CreditCardCopy = {
  id: string;
  title: string;
  image: string;
  imageAlt: string;
  category: "travel" | "lifestyle" | "reward";
  badge?: string;
  benefits: { icon: BenefitIconKey; label: string }[];
};

type FilterKey = "all" | CreditCardCopy["category"];
type ComparisonPanelMode = "expanded" | "minimized";
type ComparisonPanelPhase = "hidden" | "entering" | "open";

function BenefitIcon({ type }: { type: BenefitIconKey }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    className: "size-5 shrink-0 text-blue-500",
    "aria-hidden": true,
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (type) {
    case "miles":
      return (
        <svg {...common}>
          <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
        </svg>
      );
    case "spend":
      return (
        <svg {...common}>
          <path d="m2 9 3-3 3 3" />
          <path d="M13 18H7a2 2 0 0 1-2-2V6" />
          <path d="m22 15-3 3-3-3" />
          <path d="M11 6h6a2 2 0 0 1 2 2v10" />
        </svg>
      );
    case "fee":
      return (
        <svg {...common}>
          <path d="M13 16H8" />
          <path d="M14 8H8" />
          <path d="M16 12H8" />
          <path d="M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z" />
        </svg>
      );
    case "voucher":
      return (
        <svg {...common}>
          <path d="M2 9a3 3 0 1 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 1 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
          <path d="M9 9h.01" />
          <path d="m15 9-6 6" />
          <path d="M15 15h.01" />
        </svg>
      );
    case "cashback":
      return (
        <svg {...common}>
          <path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4" />
        </svg>
      );
    case "installment":
      return (
        <svg {...common}>
          <path d="M8 2v3" />
          <path d="M16 2v3" />
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18" />
          <path d="M8 13h.01" />
          <path d="M12 13h.01" />
          <path d="M16 13h.01" />
          <path d="M8 17h.01" />
          <path d="M12 17h.01" />
          <path d="M16 17h.01" />
        </svg>
      );
    case "reward":
    default:
      return (
        <svg {...common}>
          <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
          <path d="M20 2v4" />
          <path d="M22 4h-4" />
          <circle cx="4" cy="20" r="2" />
        </svg>
      );
  }
}

function ArrowRight({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
      className={`size-5 shrink-0 ${className}`}
    >
      <path
        d="M9.29272 3.45947C9.68319 3.069 10.3162 3.06911 10.7068 3.45947L16.5408 9.29248C16.9312 9.6829 16.931 10.316 16.5408 10.7065L10.7068 16.5405C10.3162 16.9307 9.68314 16.9309 9.29272 16.5405C8.90231 16.1501 8.90253 15.517 9.29272 15.1265L13.4197 10.9995H4.16675C3.61446 10.9995 3.16675 10.5518 3.16675 9.99951C3.16692 9.44738 3.61457 8.99951 4.16675 8.99951H13.4197L9.29272 4.87354C8.90242 4.48305 8.90242 3.84996 9.29272 3.45947Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ChevronIcon({ direction }: { direction: "up" | "down" }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className={`size-5 transition-transform duration-300 ${direction === "up" ? "rotate-180" : ""}`}
      aria-hidden
    >
      <path d="M5 7.5 10 12.5l5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden>
      <path d="m5.5 5.5 9 9M14.5 5.5l-9 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-5" aria-hidden>
      <path d="M10 4.5v11M4.5 10h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CompareCheckbox({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className={`group/compare flex min-w-0 items-center gap-2 text-sm leading-5 ${disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer"}`}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />
      <span className="flex size-6 shrink-0 items-center justify-center p-0.5">
        <span
          className={`flex size-5 items-center justify-center rounded-md border text-white transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-cyan-500/40 ${
            checked
              ? "border-cyan-500 bg-cyan-500"
              : disabled
                ? "border-neutral-500 bg-neutral-200"
                : "border-neutral-600 bg-white group-hover/compare:border-cyan-500"
          }`}
        >
          <svg viewBox="0 0 20 20" fill="none" className={`size-3.5 transition-opacity ${checked ? "opacity-100" : "opacity-0"}`} aria-hidden>
            <path d="m5 10 3 3 7-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </span>
      <span className={`min-w-0 ${checked ? "font-semibold text-neutral-800" : "font-normal text-neutral-700"}`}>
        {label}
      </span>
    </label>
  );
}

function CreditCardTile({
  card,
  compareLabel,
  detailLabel,
  applyLabel,
  previewLabel,
  checked,
  compareDisabled,
  onCompareChange,
  onPreview,
}: {
  card: CreditCardCopy;
  compareLabel: string;
  detailLabel: string;
  applyLabel: string;
  previewLabel: string;
  checked: boolean;
  compareDisabled: boolean;
  onCompareChange: (checked: boolean) => void;
  onPreview: () => void;
}) {
  const cardRef = useRef<HTMLElement>(null);
  const artRef = useRef<HTMLDivElement>(null);
  const rect = useRef<DOMRect | null>(null);

  const handleMove = (event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse") return;
    const card = cardRef.current;
    const art = artRef.current;
    if (!card || !art) return;

    rect.current ??= card.getBoundingClientRect();
    const box = rect.current;
    const x = (event.clientX - box.left) / box.width;
    const y = (event.clientY - box.top) / box.height;

    art.style.setProperty("--mx", `${(x * 100).toFixed(2)}%`);
    art.style.setProperty("--my", `${(y * 100).toFixed(2)}%`);
    art.style.setProperty("--rx", `${((0.5 - y) * 2 * MAX_TILT).toFixed(2)}deg`);
    art.style.setProperty("--ry", `${((x - 0.5) * 2 * MAX_TILT).toFixed(2)}deg`);
    art.style.setProperty("--lift", "-6px");
  };

  const handleLeave = () => {
    const art = artRef.current;
    if (!art) return;
    rect.current = null;
    art.style.setProperty("--rx", "0deg");
    art.style.setProperty("--ry", "0deg");
    art.style.setProperty("--lift", "0px");
  };

  return (
    <article
      ref={cardRef}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={`group/card relative flex h-full flex-col justify-between rounded-2xl border p-4 shadow-card transition-[background-color,border-color,box-shadow] duration-300 hover:shadow-panel xl:p-5 ${
        card.badge ? "min-h-[368px] xl:min-h-[488px]" : "min-h-[320px] xl:min-h-[440px]"
      } ${
        checked
          ? "border-cyan-500 bg-neutral-100"
          : "border-neutral-300 bg-white hover:border-cyan-500"
      }`}
    >
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center gap-4 xl:block">
            <div className="credit-art-stage relative h-[70px] w-[110px] shrink-0 xl:h-[126px] xl:w-[200px]">
              <div ref={artRef} className="credit-art-shell relative size-full">
                <button
                  type="button"
                  onClick={onPreview}
                  aria-label={previewLabel}
                  className="relative block size-full cursor-zoom-in xl:cursor-default"
                >
                  <img
                    src={card.image}
                    alt={card.imageAlt}
                    loading="lazy"
                    decoding="async"
                    className="size-full object-contain object-left"
                  />
                  <span
                    aria-hidden
                    className="credit-art-glare pointer-events-none absolute inset-0 rounded-lg transition-opacity group-hover/card:opacity-100"
                  />
                  <span className="absolute bottom-1 left-1 flex size-6 items-center justify-center rounded-full bg-white/90 text-blue-500 shadow-card" aria-hidden>
                    <svg viewBox="0 0 20 20" fill="none" className="size-4">
                      <circle cx="8.25" cy="8.25" r="4.75" stroke="currentColor" strokeWidth="1.6" />
                      <path d="m11.75 11.75 3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </span>
                </button>
              </div>
          </div>

            <div className="min-w-0 flex-1">
              <h3 className={`text-base font-bold leading-6 transition-colors group-hover/card:text-blue-500 xl:w-[240px] ${checked ? "text-blue-500" : "text-neutral-800"}`}>
                {card.title}
              </h3>
            </div>
          </div>

          {card.badge && <PromoRibbon badgeKey="popular" label={card.badge} side="left" flow />}

          <div className="flex flex-col gap-4">
            <ul className="flex flex-col gap-3">
              {card.benefits.map((benefit) => (
                <li key={benefit.label} className="flex items-center gap-2 text-sm leading-5 text-neutral-700">
                  <BenefitIcon type={benefit.icon} />
                  <span>{benefit.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <CompareCheckbox
              label={compareLabel}
              checked={checked}
              disabled={compareDisabled}
              onChange={onCompareChange}
            />
            <Link href={`/kartu-kredit/${card.id}`} className="flex shrink-0 items-center gap-0.5 text-sm font-semibold leading-5 text-blue-500">
              {detailLabel}
              <ArrowRight />
            </Link>
          </div>
          <a
            href="https://mybca.bca.co.id/auth/login"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-base btn-primary h-10 w-full text-sm"
          >
            {applyLabel}
          </a>
        </div>
      </article>
  );
}

function ComparisonThumb({ card, stacked = false, index = 0 }: { card: CreditCardCopy; stacked?: boolean; index?: number }) {
  return (
    <span
      className={`flex h-10 w-16 shrink-0 items-center justify-center ${stacked ? "-ml-10 first:ml-0" : ""}`}
      style={stacked ? { zIndex: 10 - index } : undefined}
    >
      <img
        src={card.image}
        alt=""
        loading="lazy"
        decoding="async"
        className={`h-10 w-auto max-w-none object-contain transition-transform duration-300 ease-[var(--ease-entrance)] ${stacked ? "drop-shadow-sm" : "group-hover/comparison-card:-translate-y-1.5"}`}
      />
    </span>
  );
}

function SelectedComparisonSlot({
  card,
  removeLabel,
  onRemove,
}: {
  card: CreditCardCopy;
  removeLabel: string;
  onRemove: () => void;
}) {
  return (
    <div className="group/comparison-card flex min-w-0 flex-1 items-center justify-center rounded-xl border border-neutral-300 bg-neutral-100 px-2 py-2 xl:justify-start xl:gap-3 xl:px-3">
      <ComparisonThumb card={card} />
      <p className="hidden min-w-0 flex-1 text-sm font-semibold leading-5 text-neutral-800 xl:line-clamp-2">
        {card.title}
      </p>
      <button
        type="button"
        onClick={onRemove}
        aria-label={removeLabel}
        className="ml-1 flex size-7 shrink-0 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-300 hover:text-neutral-800 xl:ml-0"
      >
        <CloseIcon />
      </button>
    </div>
  );
}

function EmptyComparisonSlot({ label }: { label: string }) {
  return (
    <div className="flex min-w-0 flex-1 items-center justify-center rounded-xl border border-dashed border-neutral-400 bg-white/55 px-2 py-2 text-neutral-600 xl:justify-start xl:gap-3 xl:px-3">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-neutral-100 xl:size-12">
        <PlusIcon />
      </span>
      <span className="hidden text-sm font-semibold leading-5 xl:inline">{label}</span>
    </div>
  );
}

function ComparisonPanel({
  cards,
  mode,
  phase,
  onModeChange,
  onRemove,
  onClear,
  onInteract,
  onCompare,
}: {
  cards: CreditCardCopy[];
  mode: ComparisonPanelMode;
  phase: ComparisonPanelPhase;
  onModeChange: (mode: ComparisonPanelMode) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onInteract: () => void;
  onCompare: () => void;
}) {
  const t = useTranslations("creditCardDetail.cardList.comparisonPanel");
  const count = cards.length;
  const isExpanded = mode === "expanded";
  const isEntering = phase === "entering";
  const canCompare = count >= 2;
  const statusLabel =
    count === MAX_COMPARE_CARDS
      ? t("maxSelected", { max: MAX_COMPARE_CARDS })
      : t("count", { count, max: MAX_COMPARE_CARDS });
  const expandedCtaLabel = count === 1 ? t("selectOneMore") : t("compareCards", { count });
  const minimizedCtaLabel = count === 1 ? t("selectOneMoreCta") : t("compare");

  return (
    <aside
      aria-live="polite"
      onPointerDown={onInteract}
      onFocus={onInteract}
      onClick={(event) => {
        if ((event.target as HTMLElement).closest("[data-comparison-cta]")) return;
        if (!isExpanded) onModeChange("expanded");
      }}
      className={`credit-comparison-panel fixed left-1/2 z-[55] w-[calc(100vw-24px)] -translate-x-1/2 transition-[width,max-width,bottom,transform,opacity] duration-300 ease-[var(--ease-entrance)] ${
        isExpanded
          ? "max-w-[560px] xl:max-w-[1040px]"
          : "max-w-[560px] cursor-pointer"
      } ${isEntering ? "opacity-0 translate-y-6" : "opacity-100 translate-y-0"}`}
    >
      <div
        data-mode={mode}
        data-phase={phase}
        className={`overflow-hidden rounded-2xl border border-neutral-300 bg-white shadow-panel transition-[min-height,padding] duration-300 ease-[var(--ease-entrance)] ${
          isExpanded
            ? "min-h-[172px] p-4 xl:min-h-[136px] xl:p-5"
            : "min-h-[64px] px-3 py-2 xl:min-h-[64px] xl:px-4"
        }`}
      >
        {isExpanded ? (
          <div className="credit-comparison-content flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-bold leading-6 text-neutral-800 xl:text-lg">
                    {t("title")}
                  </h3>
                  <p className="hidden text-sm font-semibold leading-5 text-blue-500 sm:block xl:hidden">
                    {t("countMobile", { count, max: MAX_COMPARE_CARDS })}
                  </p>
                </div>
                <p className="mt-1 text-sm leading-5 text-neutral-700 xl:mt-0.5">
                  <span className="hidden xl:inline">{statusLabel}</span>
                  <span className="xl:hidden">{count === MAX_COMPARE_CARDS ? t("maxSelected", { max: MAX_COMPARE_CARDS }) : t("countMobile", { count, max: MAX_COMPARE_CARDS })}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => onModeChange("minimized")}
                aria-expanded
                aria-label={t("minimizeAria")}
                className="flex h-9 shrink-0 items-center gap-1 rounded-full px-2 text-sm font-semibold leading-5 text-blue-500 transition-colors hover:bg-blue-100 xl:px-3"
              >
                <span className="hidden xl:inline">{t("minimize")}</span>
                <ChevronIcon direction="down" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 xl:gap-3">
              {cards.map((card) => (
                <SelectedComparisonSlot
                  key={card.id}
                  card={card}
                  removeLabel={t("removeAria", { title: card.title })}
                  onRemove={() => onRemove(card.id)}
                />
              ))}
              {Array.from({ length: MAX_COMPARE_CARDS - count }).map((_, index) => (
                <EmptyComparisonSlot key={`empty-${index}`} label={t("chooseCard")} />
              ))}
            </div>

            <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
              <button
                type="button"
                onClick={onClear}
                className="hidden text-sm font-semibold leading-5 text-blue-500 transition-colors hover:text-[var(--color-primary-hover)] xl:inline-flex"
              >
                {t("clearAll")}
              </button>
              <button
                type="button"
                disabled={!canCompare}
                onClick={onCompare}
                className="btn-base btn-primary h-11 w-full text-sm font-semibold disabled:cursor-not-allowed disabled:bg-neutral-400 disabled:text-neutral-700 xl:h-10 xl:w-auto"
              >
                {expandedCtaLabel}
                {canCompare ? <ArrowRight className="text-neutral-100" /> : null}
              </button>
            </div>
          </div>
        ) : (
          <div className="credit-comparison-content flex min-h-12 items-center gap-3">
            <div className="flex shrink-0">
              {cards.map((card, index) => (
                <ComparisonThumb key={card.id} card={card} stacked index={index} />
              ))}
            </div>
            <p className="min-w-0 flex-1 truncate text-sm font-semibold leading-5 text-neutral-800 xl:text-base">
              <span className="hidden sm:inline">{t("selected", { count })}</span>
              <span className="sm:hidden">{t("selectedShort", { count })}</span>
            </p>
            <button
              type="button"
              data-comparison-cta
              onClick={(event) => {
                event.stopPropagation();
                onCompare();
              }}
              disabled={!canCompare}
              className="btn-base btn-primary h-10 shrink-0 px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:bg-neutral-400 disabled:text-neutral-700 xl:px-5"
            >
              {minimizedCtaLabel}
            </button>
            <button
              type="button"
              onClick={() => onModeChange("expanded")}
              aria-expanded={false}
              aria-label={t("expandAria")}
              className="flex size-10 shrink-0 items-center justify-center rounded-full text-blue-500 transition-colors hover:bg-blue-100"
            >
              <ChevronIcon direction="up" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

export default function KartuKreditCardList() {
  const t = useTranslations("creditCardDetail.cardList");
  const router = useRouter();
  const cards = t.raw("cards") as CreditCardCopy[];
  const filters = t.raw("filters") as { key: FilterKey; label: string }[];
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [showAllCards, setShowAllCards] = useState(false);
  const [previewCard, setPreviewCard] = useState<CreditCardCopy | null>(null);
  const [compared, setCompared] = useState<Set<string>>(() => new Set());
  const [comparisonMode, setComparisonMode] = useState<ComparisonPanelMode>("expanded");
  const [comparisonPhase, setComparisonPhase] = useState<ComparisonPanelPhase>("hidden");
  const [panelCards, setPanelCards] = useState<CreditCardCopy[]>([]);
  const [idleKey, setIdleKey] = useState(0);
  const enterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!previewCard) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPreviewCard(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [previewCard]);

  const visibleCards = useMemo(
    () => cards.filter((card) => activeFilter === "all" || card.category === activeFilter),
    [activeFilter, cards]
  );
  const displayedCards = showAllCards ? visibleCards : visibleCards.slice(0, 3);
  const comparedCards = useMemo(
    () => cards.filter((card) => compared.has(card.id)),
    [cards, compared]
  );

  useEffect(() => {
    if (comparisonPhase !== "entering") return;
    enterTimerRef.current = setTimeout(() => {
      setComparisonPhase("open");
    }, 20);
    return () => {
      if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
    };
  }, [comparisonPhase]);

  useEffect(() => {
    if (comparisonPhase !== "open" || comparedCards.length === 0 || comparisonMode !== "expanded") return;
    const initialScrollY = window.scrollY;
    const onScroll = () => {
      if (Math.abs(window.scrollY - initialScrollY) >= 160) {
        setComparisonMode("minimized");
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [comparisonPhase, comparedCards.length, comparisonMode]);

  useEffect(() => {
    if (comparisonPhase !== "open" || comparedCards.length === 0 || comparisonMode !== "minimized") return;

    const restartIdleTimer = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => setComparisonMode("expanded"), 5000);
    };

    restartIdleTimer();
    window.addEventListener("scroll", restartIdleTimer, { passive: true });
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      window.removeEventListener("scroll", restartIdleTimer);
    };
  }, [comparisonPhase, comparedCards.length, comparisonMode, idleKey]);

  useEffect(() => {
    return () => {
      if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  const beginEntering = (nextCards: CreditCardCopy[]) => {
    setPanelCards(nextCards);
    setComparisonMode("expanded");
    setComparisonPhase("entering");
  };

  const hidePanel = () => {
    if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    setComparisonPhase("hidden");
    setPanelCards([]);
    setComparisonMode("expanded");
  };

  const setComparedCard = (id: string, checked: boolean) => {
    const next = new Set(compared);
    if (checked) {
      if (next.size >= MAX_COMPARE_CARDS && !next.has(id)) return;
      next.add(id);
    } else {
      next.delete(id);
    }

    if (next.size === compared.size && next.has(id) === compared.has(id)) return;

    const nextCards = cards.filter((card) => next.has(card.id));
    if (next.size === 0) {
      hidePanel();
    } else if (compared.size === 0 || comparisonPhase === "hidden") {
      beginEntering(nextCards);
    } else {
      setPanelCards(nextCards);
      if (checked && comparisonMode === "minimized") setComparisonMode("expanded");
    }

    setCompared(next);
    setIdleKey((value) => value + 1);
  };

  const clearCompared = () => {
    if (compared.size === 0) return;
    hidePanel();
    setCompared(new Set());
    setIdleKey((value) => value + 1);
  };

  const openComparison = () => {
    if (comparedCards.length < 2) return;
    router.push(`/kartu-kredit/bandingkan?cards=${comparedCards.map((card) => card.id).join(",")}`);
  };

  return (
    <section
      id="pilihan-kartu"
      className="relative isolate overflow-hidden bg-gradient-to-b from-blue-100 to-cyan-100 pb-16 pt-8 xl:py-20"
      aria-labelledby="pilihan-kartu-title"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <img
          src="/assets/product/bg-clove-a.svg"
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute -left-[520px] top-20 hidden h-[1520px] w-[1110px] opacity-70 xl:block"
        />
        <img
          src="/assets/product/bg-clove-b.svg"
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute -right-[460px] top-[360px] h-[1160px] w-[1110px] opacity-70"
        />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[560px] flex-col gap-10 px-4 xl:w-[1280px] xl:max-w-none xl:px-0">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center py-4 xl:w-60">
              <p className="text-eyebrow uppercase text-blue-500 xl:text-eyebrow-lg">
                {t("eyebrow")}
              </p>
            </div>
            <h2 id="pilihan-kartu-title" className="text-heading text-blue-700 xl:w-[560px] xl:text-display">
              {t("heading")}
            </h2>
          </div>

          <div className="hide-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] xl:mx-0 xl:flex-wrap xl:justify-end xl:overflow-visible xl:px-0 xl:pb-0">
            {filters.map((filter) => {
              const active = activeFilter === filter.key;
              return (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => {
                    setActiveFilter(filter.key);
                    setShowAllCards(false);
                  }}
                  className={`flex h-12 shrink-0 items-center whitespace-nowrap rounded-xl border px-[18px] text-sm transition-colors xl:h-14 xl:px-4 xl:text-base ${
                    active
                      ? "border-cyan-500 bg-cyan-100 font-bold text-blue-500"
                      : "border-neutral-300 bg-white font-semibold text-neutral-700 hover:border-cyan-500 hover:bg-cyan-100 hover:text-blue-500"
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {displayedCards.map((card) => (
            <CreditCardTile
              key={card.id}
              card={card}
              compareLabel={t("compare")}
              detailLabel={t("detail")}
              applyLabel={t("apply")}
              previewLabel={t("previewAria", { title: card.title })}
              onPreview={() => setPreviewCard(card)}
              checked={compared.has(card.id)}
              compareDisabled={!compared.has(card.id) && compared.size >= MAX_COMPARE_CARDS}
              onCompareChange={(checked) => setComparedCard(card.id, checked)}
            />
          ))}
        </div>

        {visibleCards.length > 3 ? (
          <button
            type="button"
            onClick={() => setShowAllCards((current) => !current)}
            aria-expanded={showAllCards}
            className="mx-auto flex min-h-11 items-center justify-center gap-1 px-3 text-sm font-semibold text-blue-500 transition-colors hover:text-[var(--color-primary-hover)] active:translate-y-px"
          >
            <span>{showAllCards ? t("showLess") : t("showMore", { count: visibleCards.length - 3 })}</span>
            <ChevronIcon direction={showAllCards ? "up" : "down"} />
          </button>
        ) : null}
      </div>

      {previewCard && typeof document !== "undefined"
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label={previewCard.title}
              tabIndex={-1}
              autoFocus
              onClick={() => setPreviewCard(null)}
              className="fixed inset-0 z-[70] flex items-center justify-center bg-neutral-900/80 p-6 backdrop-blur-sm"
            >
              <button
                type="button"
                onClick={() => setPreviewCard(null)}
                aria-label={t("closePreview")}
                className="absolute right-5 top-5 flex size-11 items-center justify-center rounded-full bg-white text-neutral-800 shadow-panel"
              >
                <CloseIcon />
              </button>
              <img
                src={previewCard.image}
                alt={previewCard.imageAlt}
                onClick={(event) => event.stopPropagation()}
                className="max-h-[70vh] w-full max-w-[min(82vw,460px)] object-contain"
              />
            </div>,
            document.body
          )
        : null}

      {typeof document !== "undefined" && comparisonPhase !== "hidden"
        ? createPortal(
            <ComparisonPanel
              cards={panelCards}
              mode={comparisonMode}
              phase={comparisonPhase}
              onModeChange={setComparisonMode}
              onRemove={(id) => setComparedCard(id, false)}
              onClear={clearCompared}
              onInteract={() => setIdleKey((value) => value + 1)}
              onCompare={openComparison}
            />,
            document.body
          )
        : null}
    </section>
  );
}
