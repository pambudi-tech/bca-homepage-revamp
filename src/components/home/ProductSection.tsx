"use client";

import { useState } from "react";

const CATEGORIES = ["Simpanan", "Kartu Kredit", "Pinjaman", "Investasi", "Asuransi"];

export type ProductCard = {
  title: string;
  subtitle: string;
  image: string;
  gradient: string;
};

const PRODUCTS: ProductCard[] = [
  {
    title: "BCA Everyday Card",
    subtitle: "Tiap hari belanja, tiap hari untung.",
    image: "/assets/cycle1/card-bg-1.png",
    gradient: "from-[#005caa] to-transparent",
  },
  {
    title: "BCA Mastercard Black",
    subtitle: "Experience the ultimate privilege",
    image: "/assets/cycle1/card-bg-2.png",
    gradient: "from-black/50 to-transparent",
  },
  {
    title: "BCA American Express Platinum",
    subtitle: "For the finest things in life",
    image: "/assets/cycle1/card-bg-4.png",
    gradient: "from-black/50 to-transparent",
  },
];

export default function ProductSection() {
  const [activeCategory, setActiveCategory] = useState("Kartu Kredit");

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#f4f8fc] to-[#e6f3ff] py-24">
      <div className="relative mx-auto flex w-full max-w-[1280px] gap-10 px-6">
        <aside className="flex w-[240px] shrink-0 flex-col items-start gap-8 py-4 text-[#005caa]">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`text-left text-2xl leading-8 tracking-[-0.48px] transition-opacity ${
                category === activeCategory
                  ? "font-bold text-[32px] leading-10"
                  : "font-semibold opacity-60 hover:opacity-100"
              }`}
            >
              {category}
            </button>
          ))}
        </aside>

        <div className="flex-1">
          <div className="mb-10 flex items-start gap-10">
            <div className="flex w-[240px] shrink-0 items-center gap-2 py-4">
              <p className="text-sm font-semibold uppercase tracking-[2.1px] text-[#00213d]">
                Produk &amp; Layanan
              </p>
            </div>
            <h2 className="max-w-[560px] text-[32px] font-semibold leading-10 tracking-[-0.64px] text-[#00335e]">
              Solusi BCA untuk Setiap Tujuan Keuangan Anda
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-10">
            <div className="flex w-full gap-4">
              {PRODUCTS.map((product, i) => (
                <div
                  key={product.title}
                  className={`group relative h-[400px] overflow-hidden rounded-3xl bg-white transition-all duration-300 ${
                    i === 0 ? "flex-1" : "w-[200px] shrink-0"
                  } hover:shadow-2xl`}
                >
                  <img
                    src={product.image}
                    alt=""
                    className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div
                    className={`absolute inset-x-0 bottom-0 h-60 bg-gradient-to-t ${product.gradient}`}
                  />
                  <div className="absolute inset-x-4 bottom-4 flex flex-col items-start gap-4 overflow-hidden rounded-xl border border-white/75 bg-black/30 px-5 pb-6 pt-5 backdrop-blur-[10px] transition-all duration-300">
                    <div className="flex flex-col items-start gap-3">
                      <p className="text-xl font-semibold tracking-[-0.4px] text-white">
                        {product.title}
                      </p>
                      <p className="max-h-0 overflow-hidden text-base leading-6 text-[#dfe3e7] opacity-0 transition-all duration-300 group-hover:max-h-12 group-hover:opacity-100">
                        {product.subtitle}
                      </p>
                    </div>
                    <button className="flex items-center gap-0.5 text-base font-semibold text-[#f4f8fc]">
                      Pelajari
                      <img
                        src="/assets/cycle1/pelajari-icon.svg"
                        alt=""
                        className="size-5 transition-transform group-hover:translate-x-1"
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button className="flex h-12 items-center justify-center gap-1 rounded-full border border-[#005caa] px-6 transition-colors hover:bg-[#005caa]/5">
              <span className="text-base font-semibold text-[#005caa]">
                Lihat pilihan Kartu Kredit lainnya
              </span>
              <img src="/assets/cycle1/pelajari-icon.svg" alt="" className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
