"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { NEWS_LIST_SIZE, type NewsArticle, type NewsCategory } from "./news-data";
import { useLenis } from "@/components/SmoothScroll";

function AdditionalInfo({ date, category, muted = false }: { date: string; category: string; muted?: boolean }) {
  const textClass = muted ? "text-neutral-600" : "text-white";
  return (
    <div className={`flex items-center ${muted ? "gap-3 xl:gap-2" : "gap-2 opacity-80"}`}>
      <p className={`whitespace-nowrap text-xs font-semibold uppercase tracking-[1.8px] ${textClass}`}>{date}</p>
      <span className={`size-1 shrink-0 rounded-full ${muted ? "bg-neutral-600" : "bg-white"}`} />
      <p
        className={`overflow-hidden text-ellipsis whitespace-nowrap text-xs font-semibold uppercase tracking-[1.8px] ${
          muted ? "text-neutral-600" : "text-white"
        }`}
      >
        {category}
      </p>
    </div>
  );
}

/** Category selector — h-12/14px text on mobile, h-14/16px text on desktop. */
function CategoryChip({ label, active, onSelect }: { label: string; active: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={`flex h-12 shrink-0 items-center whitespace-nowrap rounded-xl border px-[18px] text-sm transition-colors xl:h-14 xl:px-4 xl:text-base ${
        active
          ? "border-cyan-500 bg-cyan-100 font-bold text-blue-500"
          : "border-neutral-300 bg-white font-semibold text-neutral-700 hover:bg-blue-100"
      }`}
    >
      {label}
    </button>
  );
}

function HighlightArticle({ article }: { article: NewsArticle }) {
  return (
    <a
      data-reveal
      href={article.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block h-[380px] w-full shrink-0 overflow-clip rounded-xl text-left shadow-[0px_1px_2px_0px_rgba(204,204,204,0.14),0px_5px_5px_0px_rgba(204,204,204,0.12),0px_10px_6px_0px_rgba(204,204,204,0.07)] xl:h-[464px] xl:w-[492px]">
      <img loading="lazy" decoding="async"
        src={article.image}
        alt=""
        className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[180px] mix-blend-multiply xl:h-[264px]"
        style={{ background: "linear-gradient(to top, #121417 0%, rgba(18,20,23,0) 100%)", opacity: 0.8 }}
      />
      {/* Same glass treatment as the product cards: `.hero-search` gradient
          top-border over a reactive blurred fill, rather than a flat grey
          stroke. `isolation` keeps the backdrop sampling the photo behind it. */}
      <div
        className="hero-search absolute inset-x-2 bottom-2 flex flex-col items-start gap-6 overflow-clip rounded-[10px] px-5 pb-6 pt-5"
        style={{
          backgroundColor: "rgba(0,0,0,0.3)",
          backdropFilter: "blur(16px) saturate(1.25)",
          WebkitBackdropFilter: "blur(16px) saturate(1.25)",
          isolation: "isolate",
        }}
      >
        <p className="w-full text-lg font-semibold leading-[26px] tracking-[-0.4px] text-white [text-shadow:0px_2px_4px_rgba(0,0,0,0.15)] xl:text-xl xl:leading-7">
          {article.title}
        </p>
        <AdditionalInfo date={article.date} category={article.category} />
      </div>
      <span className="absolute right-5 top-5 flex size-8 items-center justify-center rounded-full bg-black/20">
        <img loading="lazy" decoding="async" src="/assets/news/icon-arrow-diagonal.svg" alt="" className="size-4" />
      </span>
    </a>
  );
}

/** Card flips axis: image on top (mobile carousel card) → image on the left (desktop list row). */
function ArticleItem({ article }: { article: NewsArticle }) {
  return (
    <a
      data-reveal
      href={article.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-[264px] w-[307px] shrink-0 flex-col overflow-clip rounded-xl border border-neutral-300 bg-white text-left shadow-[0px_1px_2px_0px_rgba(204,204,204,0.14),0px_5px_5px_0px_rgba(204,204,204,0.12),0px_10px_6px_0px_rgba(204,204,204,0.07)] xl:h-36 xl:w-full xl:flex-row xl:items-center">
      <div className="h-[120px] w-full shrink-0 overflow-clip bg-white xl:h-full xl:w-[180px]">
        <img loading="lazy" decoding="async"
          src={article.image}
          alt=""
          className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between px-5 pb-5 pt-4 xl:h-full">
        <p className="line-clamp-3 w-full text-base font-semibold leading-6 text-neutral-800 transition-colors duration-200 group-hover:text-blue-500 xl:line-clamp-2 xl:h-14 xl:text-lg xl:leading-[26px]">
          {article.title}
        </p>
        <AdditionalInfo date={article.date} category={article.category} muted />
      </div>
    </a>
  );
}

export default function NewsSection({ categories }: { categories: NewsCategory[] }) {
  const t = useTranslations("news");
  const [activeKey, setActiveKey] = useState(categories[0].key);
  const active = categories.find((c) => c.key === activeKey) ?? categories[0];

  const parallaxRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const PARALLAX_SPEED = 0.3;

  useEffect(() => {
    if (!lenis) return;

    // `scrollHeight` forces a layout reflow, so it's cached here and only
    // refreshed on resize — reading it on every Lenis scroll tick was
    // jamming the main thread the smooth-scroll rAF loop depends on.
    let docHeight = document.documentElement.scrollHeight;
    const measure = () => {
      docHeight = document.documentElement.scrollHeight;
    };
    measure();
    window.addEventListener("resize", measure);

    const handleScroll = () => {
      if (!parallaxRef.current) return;
      const scrollBottom = window.innerHeight + window.scrollY;
      const distanceToBottom = Math.max(0, docHeight - scrollBottom);

      parallaxRef.current.style.transform = `translate3d(0, ${distanceToBottom * PARALLAX_SPEED}px, 0)`;
    };

    lenis.on("scroll", handleScroll);
    handleScroll();

    return () => {
      lenis.off("scroll", handleScroll);
      window.removeEventListener("resize", measure);
    };
  }, [lenis]);

  return (
    <section className="relative overflow-clip bg-blue-100 py-10 xl:py-24">
      <div
        ref={parallaxRef}
        className="pointer-events-none absolute inset-0 z-0 overflow-visible"
      >
        <img loading="lazy" decoding="async"
          src="/assets/news/news-clove-pattern.svg"
          alt=""
          aria-hidden
          className="absolute left-1/2 top-[-61px] h-[2117px] w-[2149px] max-w-none -translate-x-[calc(50%+1612px)] opacity-30 xl:top-[-46px] xl:h-[1858px] xl:w-[1755px] xl:-translate-x-[calc(50%+412.5px)]"
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[560px] px-4 xl:w-[1280px] xl:max-w-none xl:px-0">
        {/* Heading — stacked on mobile, eyebrow column + h2 side by side on desktop. */}
        <div data-reveal-group className="flex flex-col xl:flex-row xl:gap-10">
          <div className="flex items-center py-4 xl:w-60 xl:shrink-0">
            <p data-reveal className="text-xs font-semibold uppercase leading-3 tracking-[1.8px] text-blue-500 xl:text-sm xl:leading-[14px] xl:tracking-[2.1px]">
              {t("eyebrow")}
            </p>
          </div>
          <h2 data-reveal="blur-up" className="text-2xl font-semibold leading-8 tracking-[-0.48px] text-blue-700 xl:w-[560px] xl:text-[32px] xl:leading-10 xl:tracking-[-0.64px]">
            {t("heading")}
          </h2>
        </div>

        {/* Mobile category chips — horizontal scroller, full-bleeding out of the
            padded column. Revealed as one row (the container, not each chip) so
            the chips' own transition-colors utilities are never overridden. */}
        <div data-reveal className="hide-scrollbar -mx-4 mt-6 flex gap-3 overflow-x-auto px-4 [scrollbar-width:none] xl:hidden">
          {categories.map((cat) => (
            <CategoryChip
              key={cat.key}
              label={cat.label}
              active={cat.key === active.key}
              onSelect={() => setActiveKey(cat.key)}
            />
          ))}
        </div>

        <div data-reveal-group className="mt-6 xl:mt-10 xl:flex xl:gap-26">
          {/* Desktop-only sidebar — mobile surfaces the categories as the chip row above. */}
          <div data-reveal className="hidden h-[464px] w-44 shrink-0 flex-col items-start justify-between pb-4 xl:flex">
            <div className="flex flex-col items-start gap-3">
              {categories.map((cat) => (
                <CategoryChip
                  key={cat.key}
                  label={cat.label}
                  active={cat.key === active.key}
                  onSelect={() => setActiveKey(cat.key)}
                />
              ))}
            </div>
            <a
              href={`https://www.bca.co.id/id/informasi/${active.key}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-0.5 text-base font-semibold text-blue-500 transition-transform hover:translate-x-0.5"
            >
              {t("seeMore")}
              <img loading="lazy" decoding="async" src="/assets/navbar/icon-arrow-blue.svg" alt="" className="size-5" />
            </a>
          </div>

          <div className="xl:flex xl:flex-1 xl:gap-4">
            <HighlightArticle article={active.highlight} />
            {/* Article cards — horizontal carousel on mobile, stacked list on desktop. */}
            <div className="hide-scrollbar -mx-4 mt-8 flex gap-4 overflow-x-auto px-4 [scrollbar-width:none] xl:mx-0 xl:mt-0 xl:flex-1 xl:flex-col xl:overflow-visible xl:px-0">
              {/* Keyed by slot, not by article: `data-reveal` is wired up once on
                  mount by ScrollReveal, so a remount on tab switch would hand
                  back fresh nodes that nothing ever reveals — stuck at opacity
                  0. Reusing the same three nodes keeps them revealed and just
                  swaps their contents. Safe here because the cards hold no
                  internal state. */}
              {active.articles.slice(0, NEWS_LIST_SIZE).map((article, i) => (
                <ArticleItem key={i} article={article} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
