"use client";

import {
  INFO_CATEGORY_META,
  bcaSearchResultUrl,
  type InfoCategory,
  type ProductIcon,
  type SearchRecommendations,
} from "./search-data";

/* ---------------------------------------------------------------------------
 * Inline icons (vuesax-linear style). Kept inline so the dropdown has no
 * external asset dependencies — stroke color is inherited via currentColor.
 * ------------------------------------------------------------------------- */

type IconProps = { className?: string };

function WalletIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 8.5C3 6.5 4.2 5.5 6 5.5h11c1.8 0 3 1 3 3v7c0 2-1.2 3-3 3H6c-1.8 0-3-1-3-3z" />
      <path d="M20 12.5h-3a1.5 1.5 0 000 3h3" strokeLinecap="round" />
      <path d="M6.5 9h6" strokeLinecap="round" />
    </svg>
  );
}

function CardIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2.5" y="5.5" width="19" height="13" rx="2.5" />
      <path d="M2.5 9.5h19" />
      <path d="M6.5 14.5h4" strokeLinecap="round" />
    </svg>
  );
}

function HouseIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M4 10.5L12 4l8 6.5" strokeLinecap="round" />
      <path d="M5.5 9.5V19a1 1 0 001 1h11a1 1 0 001-1V9.5" />
      <path d="M9.5 20v-5a1 1 0 011-1h3a1 1 0 011 1v5" />
    </svg>
  );
}

function ChartIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4v14a1 1 0 001 1h15" />
      <path d="M7.5 14.5l3.5-4 3 2.5 4.5-5.5" />
    </svg>
  );
}

function PhoneIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" />
      <path d="M10.5 18.5h3" strokeLinecap="round" />
    </svg>
  );
}

function CategoryIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="7.5" height="7.5" rx="2" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" />
    </svg>
  );
}

function DocumentIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5.5 4.5a2 2 0 012-2h6l5 5v10a2 2 0 01-2 2h-9a2 2 0 01-2-2z" />
      <path d="M13 2.5V7a1 1 0 001 1h4.5" />
      <path d="M9 13h6M9 16.5h4" />
    </svg>
  );
}

function DiscountIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5a2.5 2.5 0 012.5-2.5l3-.02a3 3 0 002.1-.86l2.1-2.1a2.5 2.5 0 013.54 0l.02.02a3 3 0 002.12.88H21v.5a3 3 0 00.88 2.12l.02.02a2.5 2.5 0 010 3.54l-2.1 2.1a3 3 0 00-.86 2.1L19 20.5" transform="scale(0.82) translate(2.4 -0.5)" />
      <circle cx="9" cy="9" r="1.4" />
      <circle cx="15" cy="15" r="1.4" />
      <path d="M15 9l-6 6" />
    </svg>
  );
}

function SearchIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.2-3.2" strokeLinecap="round" />
    </svg>
  );
}

function HeadphoneIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 13v-1a8 8 0 0116 0v1" />
      <path d="M4 13a2 2 0 012-2h1v6H6a2 2 0 01-2-2zM20 13a2 2 0 00-2-2h-1v6h1a2 2 0 002-2z" />
      <path d="M18 17v.5a3.5 3.5 0 01-3.5 3.5H12" />
    </svg>
  );
}

function ArrowDiagonalIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 13.5l7-7" />
      <path d="M7.5 6.5h6v6" />
    </svg>
  );
}

const PRODUCT_ICONS: Record<ProductIcon, (p: IconProps) => React.ReactElement> = {
  mybca: WalletIcon, // overridden by the logo image below; kept for type completeness
  wallet: WalletIcon,
  card: CardIcon,
  house: HouseIcon,
  chart: ChartIcon,
  phone: PhoneIcon,
};

const INFO_ICONS: Record<InfoCategory, (p: IconProps) => React.ReactElement> = {
  "produk-layanan": CategoryIcon,
  artikel: DocumentIcon,
  promo: DiscountIcon,
};

/* ------------------------------------------------------------------------- */

type Props = {
  recommendations: SearchRecommendations;
  keyword: string;
  /** Keeps the input focused when interacting with the panel. */
  onMouseDown?: (e: React.MouseEvent) => void;
};

export default function SearchRecommendation({ recommendations, keyword, onMouseDown }: Props) {
  const { products, information } = recommendations;
  const hasResults = products.length > 0 || information.length > 0;
  const seeAllUrl = bcaSearchResultUrl(keyword || "");

  return (
    <div
      onMouseDown={onMouseDown}
      className="overflow-hidden rounded-xl border border-[#e9ecef] bg-white shadow-[0px_10px_6px_rgba(204,204,204,0.07),0px_5px_5px_rgba(204,204,204,0.12),0px_1px_2px_rgba(204,204,204,0.14)]"
    >
      {hasResults ? (
        <div className="flex flex-col gap-8 p-6">
          {products.length > 0 && (
            <section className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-base font-bold text-[#26292c]">Produk Terkait</p>
                <a
                  href={seeAllUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-0.5 text-sm font-semibold text-[#005caa] hover:underline"
                >
                  Lihat Semua
                  <ArrowDiagonalIcon className="size-5" />
                </a>
              </div>
              <div className="flex gap-3">
                {products.map((product) => {
                  const Icon = PRODUCT_ICONS[product.icon];
                  return (
                    <a
                      key={product.id}
                      href={product.href}
                      className="group flex flex-1 flex-col gap-4 rounded-xl border border-[#e9ecef] px-4 pt-4 pb-5 transition-colors hover:border-[#005caa] hover:bg-[#f4f8fc]"
                    >
                      {product.icon === "mybca" ? (
                        <img src="/assets/quick-action/mybca-logo.svg" alt="" className="size-10" />
                      ) : (
                        <span className="flex size-10 items-center justify-center rounded-xl bg-[#e6f3ff] text-[#005caa]">
                          <Icon className="size-6" />
                        </span>
                      )}
                      <div className="flex flex-col gap-1.5">
                        <p className="truncate text-base font-semibold text-[#26292c]">
                          {product.title}
                        </p>
                        <p className="text-sm leading-normal text-[#495057]">
                          {product.description}
                        </p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </section>
          )}

          {information.length > 0 && (
            <section className="flex flex-col gap-3">
              <p className="text-base font-bold text-[#26292c]">Informasi Terkait</p>
              <ul className="flex flex-col">
                {information.map((info) => {
                  const meta = INFO_CATEGORY_META[info.category];
                  const Icon = INFO_ICONS[info.category];
                  return (
                    <li key={info.id}>
                      <a
                        href={info.href}
                        className="group flex items-center gap-8 rounded-lg py-2 transition-colors"
                      >
                        <span className="flex min-w-0 flex-1 items-center gap-3">
                          <span className="flex size-8 shrink-0 items-center justify-center text-[#26292c]">
                            <Icon className="size-6" />
                          </span>
                          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[#26292c] group-hover:text-[#005caa]">
                            {info.title}
                          </span>
                        </span>
                        <span
                          className="flex h-6 shrink-0 items-center rounded-lg px-3 text-sm font-semibold"
                          style={{ backgroundColor: meta.bg, color: meta.text }}
                        >
                          {meta.label}
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>
      ) : (
        <div className="px-6 py-8 text-center">
          <p className="text-sm font-semibold text-[#26292c]">
            Tidak ada hasil untuk &ldquo;{keyword}&rdquo;
          </p>
          <p className="mt-1 text-sm text-[#495057]">
            Coba kata kunci lain atau lihat semua hasil di bawah.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-[#e9ecef]">
        <a
          href={seeAllUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center gap-3 p-5 text-sm font-semibold text-[#005caa] transition-colors hover:bg-[#f4f8fc]"
        >
          <SearchIcon className="size-6" />
          Lihat semua hasil
        </a>
        <a
          href="https://www.bca.co.id/id/bantuan/pusat-informasi"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center gap-3 border-l border-[#e9ecef] p-5 transition-colors hover:bg-[#f4f8fc]"
        >
          <HeadphoneIcon className="size-6 text-[#26292c]" />
          <span className="flex items-center gap-1">
            <span className="text-sm font-semibold text-[#26292c]">Butuh bantuan?</span>
            <span className="flex items-center gap-0.5 text-sm font-semibold text-[#005caa]">
              Kunjungi Pusat Bantuan
              <ArrowDiagonalIcon className="size-5" />
            </span>
          </span>
        </a>
      </div>
    </div>
  );
}
