"use client";

import { useEffect, useRef } from "react";
import { HIGHLIGHT_ARTICLE, NEWS_ARTICLES, NEWS_CATEGORIES } from "./news-data";
import { useLenis } from "@/components/SmoothScroll";

function AdditionalInfo({ date, category, muted = false }: { date: string; category: string; muted?: boolean }) {
  const textClass = muted ? "text-[#8f969e]" : "text-white";
  return (
    <div className={`flex items-center ${muted ? "gap-3 xl:gap-2" : "gap-2 opacity-80"}`}>
      <p className={`whitespace-nowrap text-xs font-semibold uppercase tracking-[1.8px] ${textClass}`}>{date}</p>
      <span className={`size-1 shrink-0 rounded-full ${muted ? "bg-[#8f969e]" : "bg-white"}`} />
      <p
        className={`overflow-hidden text-ellipsis whitespace-nowrap text-xs font-semibold uppercase tracking-[1.8px] ${
          muted ? "text-[#868e96]" : "text-white"
        }`}
      >
        {category}
      </p>
    </div>
  );
}

/** Category selector — h-12/14px text on mobile, h-14/16px text on desktop. */
function CategoryChip({ label, active }: { label: string; active: boolean }) {
  return (
    <button
      className={`flex h-12 shrink-0 items-center whitespace-nowrap rounded-xl border px-[18px] text-sm transition-colors xl:h-14 xl:px-4 xl:text-base ${
        active
          ? "border-[#00b5f0] bg-[#e6f3ff] font-bold text-[#005caa]"
          : "border-[#e9ecef] bg-white font-semibold text-[#495057] hover:bg-[#f4f8fc]"
      }`}
    >
      {label}
    </button>
  );
}

function HighlightArticle() {
  return (
    <button className="group relative block h-[380px] w-full shrink-0 overflow-clip rounded-xl text-left shadow-[0px_1px_2px_0px_rgba(204,204,204,0.14),0px_5px_5px_0px_rgba(204,204,204,0.12),0px_10px_6px_0px_rgba(204,204,204,0.07)] xl:h-[464px] xl:w-[492px]">
      <img
        src={HIGHLIGHT_ARTICLE.image}
        alt=""
        className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[180px] mix-blend-multiply xl:h-[264px]"
        style={{ background: "linear-gradient(to top, #121417 0%, rgba(18,20,23,0) 100%)", opacity: 0.8 }}
      />
      <div className="absolute inset-x-3 bottom-3 flex flex-col items-start gap-6 overflow-clip rounded-[10px] border-2 border-[#cccccc] bg-black/10 px-5 pb-6 pt-5 backdrop-blur-[16px] xl:inset-x-4 xl:bottom-4">
        <p className="w-full text-xl font-semibold leading-7 tracking-[-0.4px] text-white">
          {HIGHLIGHT_ARTICLE.title}
        </p>
        <AdditionalInfo date={HIGHLIGHT_ARTICLE.date} category={HIGHLIGHT_ARTICLE.category} />
      </div>
      <span className="absolute right-5 top-5 flex size-8 items-center justify-center rounded-full bg-black/20">
        <img src="/assets/news/icon-arrow-diagonal.svg" alt="" className="size-4" />
      </span>
    </button>
  );
}

/** Card flips axis: image on top (mobile carousel card) → image on the left (desktop list row). */
function ArticleItem({ article }: { article: (typeof NEWS_ARTICLES)[number] }) {
  return (
    <button className="group flex h-[264px] w-[307px] shrink-0 flex-col overflow-clip rounded-xl border border-[#e9ecef] bg-white text-left shadow-[0px_1px_2px_0px_rgba(204,204,204,0.14),0px_5px_5px_0px_rgba(204,204,204,0.12),0px_10px_6px_0px_rgba(204,204,204,0.07)] xl:h-36 xl:w-full xl:flex-row xl:items-center">
      <div className="h-[120px] w-full shrink-0 overflow-clip bg-white xl:h-full xl:w-[180px]">
        <img
          src={article.image}
          alt=""
          className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between px-5 pb-5 pt-4 xl:h-full">
        <p className="line-clamp-3 w-full text-base font-semibold leading-6 text-[#32373d] transition-colors duration-200 group-hover:text-[#005caa] xl:line-clamp-2 xl:h-14 xl:text-lg xl:leading-[26px]">
          {article.title}
        </p>
        <AdditionalInfo date={article.date} category={article.category} muted />
      </div>
    </button>
  );
}

export default function NewsSection() {
  const parallaxRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const PARALLAX_SPEED = 0.3;

  useEffect(() => {
    if (!lenis) return;

    const handleScroll = () => {
      if (!parallaxRef.current) return;
      const scrollBottom = window.innerHeight + window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const distanceToBottom = Math.max(0, docHeight - scrollBottom);

      parallaxRef.current.style.transform = `translate3d(0, ${distanceToBottom * PARALLAX_SPEED}px, 0)`;
    };

    lenis.on("scroll", handleScroll);
    handleScroll();

    return () => {
      lenis.off("scroll", handleScroll);
    };
  }, [lenis]);

  return (
    <section className="relative overflow-clip bg-[#f4f8fc] py-10 xl:py-24">
      <div
        ref={parallaxRef}
        className="pointer-events-none absolute inset-0 z-0 overflow-visible"
      >
        <img
          src="/assets/news/news-clove-pattern.svg"
          alt=""
          aria-hidden
          className="absolute left-1/2 top-[-61px] h-[2117px] w-[2149px] max-w-none -translate-x-[calc(50%+1612px)] opacity-30 xl:top-[-46px] xl:h-[1858px] xl:w-[1755px] xl:-translate-x-[calc(50%+412.5px)]"
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[560px] px-4 xl:w-[1280px] xl:max-w-none xl:px-0">
        {/* Heading — stacked on mobile, eyebrow column + h2 side by side on desktop. */}
        <div className="flex flex-col xl:flex-row xl:gap-10">
          <div className="flex items-center py-4 xl:w-60 xl:shrink-0">
            <p className="text-xs font-semibold uppercase leading-3 tracking-[1.8px] text-[#005caa] xl:text-sm xl:leading-[14px] xl:tracking-[2.1px]">
              Kabar &amp; Wawasan
            </p>
          </div>
          <h2 className="text-2xl font-semibold leading-8 tracking-[-0.48px] text-[#00335e] xl:w-[560px] xl:text-[32px] xl:leading-10 xl:tracking-[-0.64px]">
            Update Seputar BCA
          </h2>
        </div>

        {/* Mobile category chips — horizontal scroller, full-bleeding out of the padded column. */}
        <div className="hide-scrollbar -mx-4 mt-6 flex gap-3 overflow-x-auto px-4 [scrollbar-width:none] xl:hidden">
          {NEWS_CATEGORIES.map((cat, i) => (
            <CategoryChip key={cat} label={cat} active={i === 0} />
          ))}
        </div>

        <div className="mt-6 xl:mt-10 xl:flex xl:gap-26">
          {/* Desktop-only sidebar — mobile surfaces the categories as the chip row above. */}
          <div className="hidden h-[464px] w-44 shrink-0 flex-col items-start justify-between pb-4 xl:flex">
            <div className="flex flex-col items-start gap-3">
              {NEWS_CATEGORIES.map((cat, i) => (
                <CategoryChip key={cat} label={cat} active={i === 0} />
              ))}
            </div>
            <button className="flex items-center gap-0.5 text-base font-semibold text-[#005caa] transition-transform hover:translate-x-0.5">
              Lihat Lebih Banyak
              <img src="/assets/navbar/icon-arrow-blue.svg" alt="" className="size-5" />
            </button>
          </div>

          <div className="xl:flex xl:flex-1 xl:gap-4">
            <HighlightArticle />
            {/* Article cards — horizontal carousel on mobile, stacked list on desktop. */}
            <div className="hide-scrollbar -mx-4 mt-8 flex gap-4 overflow-x-auto px-4 [scrollbar-width:none] xl:mx-0 xl:mt-0 xl:flex-1 xl:flex-col xl:overflow-visible xl:px-0">
              {NEWS_ARTICLES.map((article) => (
                <ArticleItem key={article.title} article={article} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
