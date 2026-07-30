"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { FAQ_CATEGORIES } from "./faq-data";

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}

function AccordionRow({
  question,
  answer,
  open,
  onToggle,
  glass,
}: {
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
  glass?: boolean;
}) {
  return (
    <div
      className={`group w-full shrink-0 rounded-xl transition-colors ${
        glass
          ? open
            ? "bg-white/15"
            : "hover:bg-white/10"
          : open
            ? "bg-neutral-100"
            : "hover:bg-cyan-100"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center gap-8 p-4 text-left"
      >
        <span
          className={`flex-1 text-base leading-6 transition-[color,opacity] ${
            glass
              ? open
                ? "font-bold text-white opacity-100"
                : "font-semibold text-neutral-100 opacity-75 group-hover:opacity-100"
              : open
                ? "font-bold text-blue-700"
                : "font-semibold text-neutral-800"
          }`}
        >
          {question}
        </span>
        <PlusIcon
          className={`size-6 shrink-0 transition-[transform,color] duration-300 ${
            open
              ? `rotate-45 ${glass ? "text-white" : "text-blue-700"}`
              : glass
                ? "text-cyan-300"
                : "text-blue-500"
          }`}
        />
      </button>
      {/* Height animates via the CSS grid 0fr → 1fr trick — no JS measurement,
          and the row stays in the DOM (rather than conditionally rendered) so
          the transition has something to animate between. */}
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className={`px-4 pb-4 text-base leading-[1.5] ${glass ? "text-neutral-100" : "text-neutral-800"}`}>
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

type FaqSectionProps = {
  /** "solid" (default) matches the Figma spec — an opaque white panel.
   *  "glass" is an alternate treatment: a frosted panel over the photo,
   *  with the tab list and CTA filled darker (80% black) than the question
   *  list (50% black) so the list reads as the lighter, more open area. */
  variant?: "solid" | "glass";
};

export default function FaqSection({ variant: initialVariant = "solid" }: FaqSectionProps) {
  const t = useTranslations("faq");
  const [variant, setVariant] = useState(initialVariant);
  const glass = variant === "glass";
  const [activeKey, setActiveKey] = useState(FAQ_CATEGORIES[0].key);
  const [openIndex, setOpenIndex] = useState(-1);
  const active = FAQ_CATEGORIES.find((c) => c.key === activeKey) ?? FAQ_CATEGORIES[0];
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());
  const tabListRef = useRef<HTMLDivElement>(null);

  // Drives the scroll shadows below the tab list and above the CTA footer —
  // they should only show while the accordion list actually has more content
  // hidden past that edge, not just because the list happens to scroll.
  const [showTopShadow, setShowTopShadow] = useState(false);
  const [showBottomShadow, setShowBottomShadow] = useState(false);
  const accordionRef = useRef<HTMLDivElement | null>(null);

  const updateScrollShadows = (el: HTMLDivElement | null) => {
    if (!el) return;
    setShowTopShadow(el.scrollTop > 1);
    setShowBottomShadow(el.scrollTop + el.clientHeight < el.scrollHeight - 1);
  };

  // Opening/closing a row changes scrollHeight via the animated grid-rows
  // trick, not a scroll event, so re-check once that 300ms transition has
  // settled — otherwise a row opened past the visible area never gets a
  // bottom shadow until the user happens to scroll.
  useEffect(() => {
    const id = setTimeout(() => updateScrollShadows(accordionRef.current), 320);
    return () => clearTimeout(id);
  }, [openIndex]);

  // Same 16px gutter as the tab list's own `px-4` — so a snapped-to tab keeps
  // breathing room from the edge instead of sitting flush against it.
  const TAB_SNAP_PADDING = 16;

  const selectTab = (key: string) => {
    setActiveKey(key);
    setOpenIndex(-1);

    const list = tabListRef.current;
    const tab = tabRefs.current.get(key);
    if (!list || !tab) return;

    const tabLeft = tab.offsetLeft;
    const tabRight = tabLeft + tab.offsetWidth;
    const viewLeft = list.scrollLeft;
    const viewRight = viewLeft + list.clientWidth;

    let target: number | null = null;
    if (tabLeft - TAB_SNAP_PADDING < viewLeft) {
      target = tabLeft - TAB_SNAP_PADDING;
    } else if (tabRight + TAB_SNAP_PADDING > viewRight) {
      target = tabRight + TAB_SNAP_PADDING - list.clientWidth;
    }
    if (target !== null) {
      list.scrollTo({ left: target, behavior: "smooth" });
    }
  };

  const cardBody = (
    <>
      {/* Tab list — 80% fill on the glass variant. Gains a downward shadow
          once the accordion below has been scrolled away from its top, so
          the tab list reads as sitting above the (now partially hidden)
          content rather than just a static header. */}
      <div
        ref={tabListRef}
        className={`hide-scrollbar relative z-10 flex items-center gap-4 overflow-x-auto border-b px-4 pt-2 [scrollbar-width:none] transition-shadow duration-200 xl:gap-4 xl:px-6 ${
          glass ? "border-white/20 bg-black/60 backdrop-blur-md" : "border-neutral-300 bg-white"
        } ${showTopShadow ? "shadow-[0_4px_8px_-2px_rgba(0,0,0,0.15)]" : ""}`}
      >
        {FAQ_CATEGORIES.map((cat) => {
          const isActive = cat.key === active.key;
          return (
            <button
              key={cat.key}
              ref={(el) => {
                if (el) tabRefs.current.set(cat.key, el);
                else tabRefs.current.delete(cat.key);
              }}
              type="button"
              onClick={() => selectTab(cat.key)}
              aria-pressed={isActive}
              className="flex h-14 shrink-0 flex-1 flex-col items-start"
            >
              <span
                className={`flex w-full flex-1 items-center justify-center whitespace-nowrap px-3 text-base ${
                  glass
                    ? isActive
                      ? "font-bold text-white"
                      : "font-semibold text-neutral-100"
                    : isActive
                      ? "font-bold text-neutral-800"
                      : "font-semibold text-neutral-700"
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
          same pattern as MobileMenu's internal scroller. 50% fill on the
          glass variant, lighter than the tab list and CTA. */}
      <div
        key={active.key}
        ref={(el) => {
          accordionRef.current = el;
          updateScrollShadows(el);
        }}
        onScroll={(e) => updateScrollShadows(e.currentTarget)}
        data-lenis-prevent
        className={`content-fade-in flex h-[360px] flex-col gap-1 overflow-y-auto px-2 py-2 ${
          glass ? "scrollbar-glass bg-black/50 backdrop-blur-md" : "bg-white"
        }`}
      >
        {active.items.map((item, i) => (
          <AccordionRow
            key={`${active.key}-${i}`}
            question={item.question}
            answer={item.answer}
            open={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
            glass={glass}
          />
        ))}
      </div>

      {/* Footer CTA — 80% fill on the glass variant, matching the tab list.
          Gains an upward shadow while the accordion above still has more
          content below the fold, so it reads as sitting on top of that
          hidden content instead of just a static footer. */}
      <div
        className={`relative z-10 flex flex-col items-center justify-center gap-4 border-t px-6 py-6 transition-shadow duration-200 xl:flex-row xl:justify-between xl:py-0 xl:h-24 ${
          glass ? "border-white/20 bg-black/60 backdrop-blur-md" : "border-neutral-300"
        } ${showBottomShadow ? "shadow-[0_-4px_8px_-2px_rgba(0,0,0,0.15)]" : ""}`}
      >
        <p
          className={`text-center text-base font-semibold xl:w-[200px] xl:text-left ${
            glass ? "text-neutral-100" : "text-neutral-800"
          }`}
        >
          {t("notFound")}
        </p>
        <a
          href="https://www.bca.co.id/id/bantuan/pusat-informasi"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex h-12 shrink-0 items-center justify-center gap-1 rounded-full border px-6 transition-colors duration-200 ${
            glass
              ? "border-white text-white hover:bg-white/10"
              : "border-blue-500 hover:bg-blue-100"
          }`}
        >
          <span className={`text-base font-semibold ${glass ? "text-white" : "text-blue-500"}`}>{t("cta")}</span>
          <img loading="lazy" decoding="async"
            src={glass ? "/assets/navbar/icon-arrow-white.svg" : "/assets/navbar/icon-arrow-blue.svg"}
            alt=""
            className="size-5"
          />
        </a>
      </div>
    </>
  );

  const desktopCard = (
    <div
      data-reveal
      className={`relative w-full max-w-[560px] overflow-clip rounded-3xl ${
        glass
          ? "hero-search isolate"
          : "bg-white shadow-[0px_1px_2px_0px_rgba(204,204,204,0.14),0px_5px_5px_0px_rgba(204,204,204,0.12),0px_10px_6px_0px_rgba(204,204,204,0.07)]"
      }`}
    >
      {cardBody}
    </div>
  );

  const mobileCard = (
    <div
      data-reveal
      className={`relative w-full overflow-clip rounded-t-3xl ${glass ? "hero-search isolate" : "bg-white"}`}
    >
      {cardBody}
    </div>
  );

  return (
    <section id="faq-section" className="relative">
      {/* Dev-only switcher between the "solid" (Figma spec) and "glass"
          panel treatments — hidden for now so only "Solid" shows; the
          setVariant plumbing stays in place to bring it back later. */}

      {/* ===== Desktop (>= xl): bg photo + dark overlay behind a floating card,
           fixed 640px section — matches the Figma spec. Heading lives over the
           photo, bottom-left, instead of inside the panel — styled like the
           hero search prompt. ===== */}
      <div className="relative hidden h-[640px] items-center overflow-clip xl:flex">
        {/* Fills the section's own 640px height exactly — no separate fixed
            height to fight with, so nothing gets clipped off the bottom. */}
        <img loading="lazy" decoding="async"
          src="/assets/faq-bg.webp"
          alt=""
          aria-hidden
          className="absolute inset-0 size-full object-cover"
        />
        {/* Darkens the right half of the backdrop so the white card reads
            clearly against the photo behind it — CSS only, per design spec.
            Opaque at the card edge, fading to fully transparent toward the photo. */}
        <div
          aria-hidden
          className="absolute inset-y-0 right-0 w-1/2"
          style={{ background: "linear-gradient(to left, rgba(0,0,0,0.6), rgba(0,0,0,0))" }}
        />

        {/* One 1280px row, heading column and card as plain flex siblings
            pushed to opposite edges — since the row itself is centered on
            screen, the column's left margin mirrors the card's right margin
            exactly. `items-stretch` sizes the column to the card's own
            height, so `justify-between` inside it lands the eyebrow flush
            with the card's top and the heading flush with its bottom. */}
        <div className="relative z-10 mx-auto flex w-[1280px] items-stretch justify-between px-8">
          <div className="flex flex-col justify-between py-6">
            <div className="flex items-center py-4 xl:w-auto xl:shrink-0">
              <p className="text-sm font-semibold uppercase leading-[14px] tracking-[2.1px] text-white opacity-75 [text-shadow:0px_2px_4px_rgba(0,0,0,0.15)]">
                FREQUENLY ASKED QUESTION
              </p>
            </div>
            <p className="-mt-6 w-[260px] text-[32px] font-semibold leading-9 tracking-[-0.64px] text-white [text-shadow:0px_2px_4px_rgba(0,0,0,0.15)]">
              {t("heading")}
            </p>
          </div>
          {desktopCard}
        </div>
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
          {/* Eyebrow + heading now live over the photo instead of inside a
              blue wrapper — left-aligned, matching the desktop treatment.
              Heading sits 24px above where the card starts overlapping the
              photo (the card's -mt-[112px] pull-up + this 24px gap). */}
          <div className="absolute left-4 top-2 flex items-center py-4">
            <p className="text-xs font-semibold uppercase leading-3 tracking-[1.8px] text-white opacity-75 [text-shadow:0px_2px_4px_rgba(0,0,0,0.15)]">
              FREQUENLY ASKED QUESTION
            </p>
          </div>
          {/* Darkens behind the heading so the white text stays legible —
              same gradient treatment as the desktop version, just flipped
              to fade upward from the bottom edge instead of from the right. */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-[160px] w-full"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0))" }}
          />
          {/* Progressive blur on top of the darken layer. `backdrop-filter`
              can't be given a gradient blur amount directly, so this fakes a
              smooth 0 -> 8px ramp by stacking several bands, each blurred a
              little more and masked to a thinner strip near the bottom. */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[160px] w-full">
            <div
              className="absolute inset-0 backdrop-blur-[1px]"
              style={{ maskImage: "linear-gradient(to top, black 0%, black 20%, transparent 40%)" }}
            />
            <div
              className="absolute inset-0 backdrop-blur-[2px]"
              style={{ maskImage: "linear-gradient(to top, black 0%, black 15%, transparent 30%)" }}
            />
            <div
              className="absolute inset-0 backdrop-blur-[4px]"
              style={{ maskImage: "linear-gradient(to top, black 0%, black 10%, transparent 20%)" }}
            />
            <div
              className="absolute inset-0 backdrop-blur-[6px]"
              style={{ maskImage: "linear-gradient(to top, black 0%, black 5%, transparent 10%)" }}
            />
            <div
              className="absolute inset-0 backdrop-blur-[8px]"
              style={{ maskImage: "linear-gradient(to top, black 0%, transparent 5%)" }}
            />
          </div>
          <p className="absolute bottom-12 left-4 right-4 text-2xl font-semibold leading-8 tracking-[-0.48px] text-white [text-shadow:0px_2px_4px_rgba(0,0,0,0.15)]">
            {t("heading")}
          </p>
        </div>
        <div className="relative z-10 -mt-6 w-full">{mobileCard}</div>
      </div>
    </section>
  );
}
