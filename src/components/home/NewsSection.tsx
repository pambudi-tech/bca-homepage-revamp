"use client";

import { useEffect, useRef } from "react";
import { HIGHLIGHT_ARTICLE, NEWS_ARTICLES, NEWS_CATEGORIES } from "./news-data";
import { useLenis } from "@/components/SmoothScroll";

function AdditionalInfo({ date, category, muted = false }: { date: string; category: string; muted?: boolean }) {
  const textClass = muted ? "text-[#8f969e]" : "text-white";
  return (
    <div className={`flex items-center gap-2 ${muted ? "" : "opacity-80"}`}>
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

function HighlightArticle() {
  return (
    <button className="group relative h-[464px] w-[492px] shrink-0 overflow-clip rounded-xl text-left shadow-[0px_1px_2px_0px_rgba(204,204,204,0.14),0px_5px_5px_0px_rgba(204,204,204,0.12),0px_10px_6px_0px_rgba(204,204,204,0.07)]">
      <img
        src={HIGHLIGHT_ARTICLE.image}
        alt=""
        className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[264px] mix-blend-multiply"
        style={{ background: "linear-gradient(to top, #121417 0%, rgba(18,20,23,0) 100%)", opacity: 0.8 }}
      />
      <div className="absolute inset-x-4 bottom-4 flex flex-col items-start gap-6 overflow-clip rounded-[10px] border-2 border-[#cccccc] bg-black/10 px-5 pb-6 pt-5 backdrop-blur-[16px]">
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

function ArticleItem({ article }: { article: (typeof NEWS_ARTICLES)[number] }) {
  return (
    <button className="group flex h-36 w-full items-center overflow-clip rounded-xl border border-[#e9ecef] bg-white text-left shadow-[0px_1px_2px_0px_rgba(204,204,204,0.14),0px_5px_5px_0px_rgba(204,204,204,0.12),0px_10px_6px_0px_rgba(204,204,204,0.07)]">
      <div className="h-full w-[180px] shrink-0 overflow-clip bg-white">
        <img
          src={article.image}
          alt=""
          className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
      </div>
      <div className="flex h-full min-w-0 flex-1 flex-col justify-between px-5 pb-5 pt-4">
        <p className="line-clamp-2 h-14 w-full text-lg font-semibold leading-[26px] text-[#32373d] transition-colors duration-200 group-hover:text-[#005caa]">
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
    <section className="relative overflow-clip bg-[#f4f8fc] py-24">
      <div
        ref={parallaxRef}
        className="pointer-events-none absolute inset-0 z-0 overflow-visible"
      >
        <img
          src="/assets/news/news-clove-pattern.svg"
          alt=""
          aria-hidden
          className="absolute left-1/2 top-[-46px] h-[1858px] w-[1755px] max-w-none -translate-x-[calc(50%+412.5px)] opacity-30"
        />
      </div>

      <div className="relative z-10 mx-auto w-[1280px]">
        <div className="flex gap-10">
          <div className="flex w-60 shrink-0 items-center py-4">
            <p className="text-sm font-semibold uppercase leading-[14px] tracking-[2.1px] text-[#005caa]">
              Kabar &amp; Wawasan
            </p>
          </div>
          <h2 className="w-[560px] text-[32px] font-semibold leading-10 tracking-[-0.64px] text-[#00335e]">
            Update Seputar BCA
          </h2>
        </div>

        <div className="mt-10 flex gap-26">
          <div className="flex h-[464px] w-44 shrink-0 flex-col items-start justify-between pb-4">
            <div className="flex flex-col items-start gap-3">
              {NEWS_CATEGORIES.map((cat, i) => (
                <button
                  key={cat}
                  className={`flex h-14 items-center rounded-xl border px-4 text-base transition-colors ${
                    i === 0
                      ? "border-[#00b5f0] bg-[#e6f3ff] font-bold text-[#005caa]"
                      : "border-[#e9ecef] bg-white font-semibold text-[#495057] hover:bg-[#f4f8fc]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-0.5 text-base font-semibold text-[#005caa] transition-transform hover:translate-x-0.5">
              Lihat Lebih Banyak
              <img src="/assets/navbar/icon-arrow-blue.svg" alt="" className="size-5" />
            </button>
          </div>

          <div className="flex flex-1 gap-4">
            <HighlightArticle />
            <div className="flex flex-1 flex-col gap-4">
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