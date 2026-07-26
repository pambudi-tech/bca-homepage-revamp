"use client";

import { useTranslations } from "next-intl";
import {
  INFO_CATEGORY_META,
  POPULAR_SEARCHES,
  bcaSearchResultUrl,
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

function CarIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 15v-2.2a2 2 0 01.2-.9l1.9-3.8A2 2 0 016.9 7h10.2a2 2 0 011.8 1.1l1.9 3.8a2 2 0 01.2.9V15" />
      <path d="M3 15h18v2.5a1 1 0 01-1 1h-1.5a1 1 0 01-1-1V16h-11v1.5a1 1 0 01-1 1H4a1 1 0 01-1-1z" />
      <path d="M6.5 12.5h1.5M16 12.5h1.5" />
    </svg>
  );
}

function ShieldIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l7 2.8v5.6c0 4-2.9 7.6-7 8.6-4.1-1-7-4.6-7-8.6V5.8z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function CashIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="6" width="19" height="12" rx="2.5" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 10v4M18 10v4" />
    </svg>
  );
}

function QrIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <path d="M14 14h3v3h-3zM18 18h3v3h-3z" strokeLinecap="round" />
    </svg>
  );
}

function TransferIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8.5h14M14.5 5l3.5 3.5-3.5 3.5" />
      <path d="M20 15.5H6M9.5 12L6 15.5 9.5 19" />
    </svg>
  );
}

function LocationIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21c4-4.2 6-7.4 6-10a6 6 0 10-12 0c0 2.6 2 5.8 6 10z" />
      <circle cx="12" cy="11" r="2.4" />
    </svg>
  );
}

function StarIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8-4.2-4.1 5.9-.9z" />
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

function ClockIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

function CloseIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

const PRODUCT_ICONS: Record<ProductIcon, (p: IconProps) => React.ReactElement> = {
  mybca: WalletIcon, // overridden by the logo image below; kept for type completeness
  wallet: WalletIcon,
  card: CardIcon,
  house: HouseIcon,
  car: CarIcon,
  chart: ChartIcon,
  phone: PhoneIcon,
  shield: ShieldIcon,
  cash: CashIcon,
  qr: QrIcon,
  transfer: TransferIcon,
  support: HeadphoneIcon,
  location: LocationIcon,
  star: StarIcon,
};


/* ------------------------------------------------------------------------- */

type Props = {
  recommendations: SearchRecommendations;
  keyword: string;
  recent: string[];
  /** Fills the field with a term (from a popular chip / topic / recent item). */
  onSelectQuery: (term: string) => void;
  onRemoveRecent: (term: string) => void;
  onClearRecent: () => void;
  /** Keeps the input focused when interacting with the panel. */
  onMouseDown?: (e: React.MouseEvent) => void;
  /**
   * Mobile layout: product cards stack as icon-beside-text rows, info rows drop
   * their category badge and wrap, and the two footer links stack. Also caps the
   * panel height so a long result list scrolls inside the card instead of
   * running off a short phone viewport.
   */
  compact?: boolean;
};

export default function SearchRecommendation({
  recommendations,
  keyword,
  recent,
  onSelectQuery,
  onRemoveRecent,
  onClearRecent,
  onMouseDown,
  compact = false,
}: Props) {
  const t = useTranslations("search");
  const { products, information } = recommendations;
  const isEmpty = keyword.trim() === "";
  const hasResults = products.length > 0 || information.length > 0;
  const seeAllUrl = bcaSearchResultUrl(keyword || "");

  return (
    <div
      onMouseDown={onMouseDown}
      className={`rounded-xl border border-neutral-300 bg-white shadow-[0px_10px_6px_rgba(204,204,204,0.07),0px_5px_5px_rgba(204,204,204,0.12),0px_1px_2px_rgba(204,204,204,0.14)] ${
        compact ? "max-h-[70dvh] overflow-y-auto overscroll-contain" : "overflow-hidden"
      }`}
    >
      {isEmpty ? (
        <div className={`flex flex-col gap-6 ${compact ? "p-3.5" : "p-6"}`}>
          {recent.length > 0 && (
            <section className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-base font-bold text-neutral-800">{t("recentSearches")}</p>
                <button
                  type="button"
                  onClick={onClearRecent}
                  className="text-sm font-semibold text-blue-500 hover:underline"
                >
                  {t("clearAll")}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recent.map((term) => (
                  <span
                    key={term}
                    className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 py-1.5 pl-3.5 pr-2 transition-colors hover:border-blue-500 hover:bg-blue-100"
                  >
                    <button
                      type="button"
                      onClick={() => onSelectQuery(term)}
                      className="flex items-center gap-2 text-sm font-semibold text-neutral-800"
                    >
                      <ClockIcon className="size-4 text-neutral-600" />
                      {term}
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveRecent(term)}
                      aria-label={t("removeTerm", { term })}
                      className="flex size-4 items-center justify-center rounded-full text-neutral-600 hover:text-neutral-800"
                    >
                      <CloseIcon className="size-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </section>
          )}

          <section className="flex flex-col gap-3">
            <p className={`font-bold text-neutral-800 ${compact ? "text-sm" : "text-base"}`}>{t("popularSearches")}</p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SEARCHES.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => onSelectQuery(term)}
                  className="inline-flex items-center rounded-full border border-neutral-300 px-3.5 py-1.5 text-sm font-semibold text-neutral-800 transition-colors hover:border-blue-500 hover:bg-blue-100 hover:text-blue-500"
                >
                  {term}
                </button>
              ))}
            </div>
          </section>
        </div>
      ) : hasResults ? (
        <div className={`flex flex-col ${compact ? "gap-5 p-3" : "gap-8 p-6"}`}>
          {products.length > 0 && (
            <section className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className={`font-bold text-neutral-800 ${compact ? "text-sm" : "text-base"}`}>{t("relatedProducts")}</p>
                <a
                  href={seeAllUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-0.5 text-sm font-semibold text-blue-500 hover:underline"
                >
                  {t("viewAll")}
                  <ArrowDiagonalIcon className="size-5" />
                </a>
              </div>
              {/* Desktop lays the cards out as three equal columns; mobile
                  scrolls them horizontally as fixed 200px cards, bleeding to
                  the panel edges so the overflow reads as a carousel. */}
              <div
                className={`flex ${
                  compact
                    ? "hide-scrollbar -mx-3 gap-2 overflow-x-auto px-3 [scrollbar-width:none]"
                    : "gap-3"
                }`}
              >
                {products.map((product) => {
                  const Icon = PRODUCT_ICONS[product.icon];
                  return (
                    <a
                      key={product.id}
                      href={product.href}
                      className={`group flex rounded-xl border border-neutral-300 transition-colors hover:border-cyan-500 hover:bg-cyan-100 ${
                        compact
                          ? "w-[200px] shrink-0 flex-col gap-3 p-3"
                          : "flex-1 flex-col gap-4 px-4 pt-4 pb-5"
                      }`}
                    >
                      {product.icon === "mybca" ? (
                        <img
                          src="/assets/quick-action/mybca-logo.svg"
                          alt=""
                          className={`shrink-0 ${compact ? "size-8" : "size-10"}`}
                        />
                      ) : (
                        <span
                          className={`flex shrink-0 items-center justify-center bg-cyan-100 text-blue-500 ${
                            compact ? "size-8 rounded-lg" : "size-10 rounded-xl"
                          }`}
                        >
                          <Icon className={compact ? "size-5" : "size-6"} />
                        </span>
                      )}
                      <div className={`flex min-w-0 flex-col ${compact ? "gap-1" : "gap-1.5"}`}>
                        <p
                          className={`font-semibold text-neutral-800 group-hover:text-blue-500 ${
                            compact ? "text-sm" : "truncate text-base"
                          }`}
                        >
                          {product.title}
                        </p>
                        <p
                          className={`leading-normal text-neutral-700 ${
                            compact ? "text-xs" : "text-sm"
                          }`}
                        >
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
              <p className={`font-bold text-neutral-800 ${compact ? "text-sm" : "text-base"}`}>{t("relatedInfo")}</p>
              <ul className="flex flex-col">
                {information.slice(0, 3).map((info) => {
                  const meta = INFO_CATEGORY_META[info.category];
                  return (
                    <li key={info.id}>
                      <a
                        href={info.href}
                        className="group flex items-center gap-8 rounded-xl px-3 py-3 transition-colors duration-200 hover:bg-cyan-100"
                      >
                        {/* Mobile has no room for the badge, so the title wraps
                            across the full row instead of truncating. */}
                        <span
                          className={`min-w-0 flex-1 text-sm font-semibold text-neutral-800 transition-colors duration-200 group-hover:text-blue-500 ${
                            compact ? "" : "truncate"
                          }`}
                        >
                          {info.title}
                        </span>
                        {!compact && (
                          <span
                            className="flex h-6 shrink-0 items-center rounded-lg px-3 text-sm font-semibold"
                            style={{ backgroundColor: meta.bg, color: meta.text }}
                          >
                            {meta.label}
                          </span>
                        )}
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
          <p className="text-sm font-semibold text-neutral-800">
            {t("noResultsFor", { keyword })}
          </p>
          <p className="mt-1 text-sm text-neutral-700">
            {t("noResultsHint")}
          </p>
        </div>
      )}

      {/* Desktop puts the two links side by side split by a vertical rule;
          mobile stacks them, so the divider becomes the top border of the
          second row and the help label breaks onto two lines. */}
      <div
        className={`flex border-t border-neutral-300 ${
          compact ? "flex-col" : "items-center justify-between"
        }`}
      >
        {!isEmpty && hasResults && (
          <a
            href={seeAllUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex flex-1 items-center gap-3 text-sm font-semibold text-blue-500 transition-colors hover:bg-blue-100 ${
              compact ? "p-3.5" : "p-5"
            }`}
          >
            <SearchIcon className="size-6 shrink-0" />
            {t("viewAllResults")}
          </a>
        )}
        {(isEmpty || !hasResults) && (
          <a
            href="https://www.bca.co.id/id/bantuan/pusat-informasi"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex flex-1 items-center gap-3 transition-colors hover:bg-blue-100 ${
              compact ? "p-3.5" : "p-5"
            }`}
          >
            <HeadphoneIcon className="size-6 shrink-0 text-neutral-800" />
            <span className={`flex gap-1 ${compact ? "flex-col items-start" : "items-center"}`}>
              <span className="text-sm font-semibold text-neutral-800">{t("needHelp")}</span>
              <span className="flex items-center gap-0.5 text-sm font-semibold text-blue-500">
                {t("visitHelpCenter")}
                <ArrowDiagonalIcon className="size-5 shrink-0" />
              </span>
            </span>
          </a>
        )}
      </div>
    </div>
  );
}
