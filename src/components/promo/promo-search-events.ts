import type { PromoCategory } from "@/components/home/promo-data";

export const PROMO_SEARCH_EVENT = "bca:promo-search-change";

export type PromoSearchEventDetail = {
  query: string;
  category: PromoCategory | "all";
};

export function announcePromoSearch(detail: PromoSearchEventDetail) {
  window.dispatchEvent(new CustomEvent<PromoSearchEventDetail>(PROMO_SEARCH_EVENT, { detail }));
}
