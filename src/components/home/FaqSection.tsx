"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { FAQ_CATEGORIES } from "./faq-data";

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}

function MinusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M5 12h14" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}

function AccordionRow({
  question,
  answer,
  open,
  onToggle,
}: {
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`w-full shrink-0 rounded-xl transition-colors ${
        open ? "bg-neutral-100" : "hover:bg-neutral-100"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center gap-4 p-4 text-left"
      >
        <span
          className={`flex-1 text-base leading-6 ${
            open ? "font-bold text-blue-700" : "font-semibold text-neutral-800"
          }`}
        >
          {question}
        </span>
        {open ? (
          <MinusIcon className="size-6 shrink-0 text-blue-700" />
        ) : (
          <PlusIcon className="size-6 shrink-0 text-blue-500" />
        )}
      </button>
      {open && <p className="px-4 pb-4 text-base leading-[1.5] text-neutral-800">{answer}</p>}
    </div>
  );
}

export default function FaqSection() {
  const t = useTranslations("faq");
  const [activeKey, setActiveKey] = useState(FAQ_CATEGORIES[0].key);
  const [openIndex, setOpenIndex] = useState(-1);
  const active = FAQ_CATEGORIES.find((c) => c.key === activeKey) ?? FAQ_CATEGORIES[0];

  const selectTab = (key: string) => {
    setActiveKey(key);
    setOpenIndex(-1);
  };

  const card = (
    <div data-reveal className="w-full max-w-[640px] overflow-clip rounded-3xl bg-white shadow-[0px_1px_2px_0px_rgba(204,204,204,0.14),0px_5px_5px_0px_rgba(204,204,204,0.12),0px_10px_6px_0px_rgba(204,204,204,0.07)]">
      {/* Header */}
      <div className="bg-blue-500 px-6 py-6 xl:px-8 xl:py-6">
        <p className="w-80 text-2xl font-semibold leading-8 tracking-[-0.48px] text-white">
          {t("heading")}
        </p>
      </div>

      {/* Tab list */}
      <div className="hide-scrollbar flex items-center gap-4 overflow-x-auto border-b border-neutral-300 bg-white px-4 pt-2 [scrollbar-width:none] xl:gap-4 xl:px-6">
        {FAQ_CATEGORIES.map((cat) => {
          const isActive = cat.key === active.key;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => selectTab(cat.key)}
              aria-pressed={isActive}
              className="flex h-14 shrink-0 flex-1 flex-col items-start"
            >
              <span
                className={`flex w-full flex-1 items-center justify-center whitespace-nowrap px-3 text-base ${
                  isActive ? "font-bold text-neutral-800" : "font-semibold text-neutral-700"
                }`}
              >
                {cat.label}
              </span>
              <span className={`h-1 w-full shrink-0 rounded-t-xl ${isActive ? "bg-cyan-500" : "bg-transparent"}`} />
            </button>
          );
        })}
      </div>

      {/* Accordion list — fixed height so more than 3 questions scroll internally.
          `data-lenis-prevent` keeps Lenis from hijacking wheel/touch input here,
          same pattern as MobileMenu's internal scroller. */}
      <div
        data-lenis-prevent
        className="flex h-[320px] flex-col gap-1 overflow-y-auto bg-white px-2 py-2 xl:h-[240px] xl:px-4"
      >
        {active.items.map((item, i) => (
          <AccordionRow
            key={`${active.key}-${i}`}
            question={item.question}
            answer={item.answer}
            open={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
          />
        ))}
      </div>

      {/* Footer CTA */}
      <div className="flex flex-col items-center justify-center gap-4 border-t border-neutral-300 px-6 py-6 xl:flex-row xl:justify-between xl:py-0 xl:h-24">
        <p className="text-center text-base font-semibold text-neutral-800 xl:text-left">{t("notFound")}</p>
        <a
          href="https://www.bca.co.id/id/bantuan/pusat-informasi"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 shrink-0 items-center justify-center gap-1 rounded-full border border-blue-500 px-6 transition-colors duration-200 hover:bg-blue-100"
        >
          <span className="text-base font-semibold text-blue-500">{t("cta")}</span>
          <img loading="lazy" decoding="async" src="/assets/navbar/icon-arrow-blue.svg" alt="" className="size-5" />
        </a>
      </div>
    </div>
  );

  return (
    <section id="faq-section" className="relative">
      {/* ===== Desktop (>= xl): bg photo + dark overlay behind a floating card,
           fixed 640px section — matches the Figma spec. ===== */}
      <div className="relative hidden h-[640px] items-center overflow-clip xl:flex">
        <img loading="lazy" decoding="async"
          src="/assets/faq-bg.webp"
          alt=""
          aria-hidden
          className="absolute inset-x-0 top-0 h-[720px] w-full object-cover"
        />
        {/* Darkens the right half of the backdrop so the white card reads
            clearly against the photo behind it — CSS only, per design spec.
            Opaque at the card edge, fading to fully transparent toward the photo. */}
        <div
          aria-hidden
          className="absolute inset-y-0 right-0 w-1/2"
          style={{ background: "linear-gradient(to left, rgba(0,0,0,0.8), rgba(0,0,0,0))" }}
        />

        <div className="relative z-10 mx-auto flex w-[1280px] justify-end">{card}</div>
      </div>

      {/* ===== Mobile (< xl): bg photo as a cover banner on top, card panel
           pulled up to overlap its bottom edge — same trick as MyBcaSection's
           mobile layout, the photo sits behind the panel rather than just
           stacked above it. ===== */}
      <div className="relative xl:hidden">
        <div className="relative w-full overflow-clip">
          <img loading="lazy" decoding="async"
            src="/assets/faq-bg.webp"
            alt=""
            aria-hidden
            className="h-[480px] w-full object-cover object-[calc(50%+160px)_top]"
          />
        </div>
        <div className="relative z-10 -mt-[120px] mx-auto w-full max-w-[560px] px-4 pb-8">{card}</div>
      </div>
    </section>
  );
}
