import { useTranslations } from "next-intl";
import { MEGAMENU_STRUCTURE, type MegaMenuCategory } from "./megamenu-data";
import type { ProductCategory } from "./product-data";

type MegaMenuText = {
  label: string;
  products: string[];
  ctaLabel: string;
  links: { label: string; type?: "article" | "video" }[];
  editorialTitle: string;
};

/** Merges the static layout data (`MEGAMENU_STRUCTURE`) with the active
    locale's translated copy, keyed by category key. When `productCategories`
    (from Supabase via `getProductCategories`, same source as `ProductSection`)
    has a category matching the key, its featured products replace the
    hardcoded translation list — the panel hugs however many featured
    products that category has (falling back to all of them if none are
    flagged) instead of a fixed count. */
export function useMegaMenu(productCategories?: ProductCategory[]): MegaMenuCategory[] {
  const t = useTranslations("megamenu");
  const tSearch = useTranslations("search");

  return MEGAMENU_STRUCTURE.map((structure) => {
    const text = t.raw(structure.key) as MegaMenuText;
    const liveCategory = productCategories?.find((c) => c.key === structure.key);
    const liveProducts = liveCategory
      ? liveCategory.products.filter((p) => p.featured)
      : [];
    return {
      key: structure.key,
      label: text.label,
      width: structure.width,
      chevron: structure.chevron,
      // The translation-based lists already end with their own "Lihat Semua
      // X" row; the live Supabase list doesn't have one, so it's appended
      // here to match.
      products: liveCategory
        ? [
            ...(liveProducts.length ? liveProducts : liveCategory.products).map((p) => p.title),
            `${tSearch("viewAll")} ${text.label}`,
          ]
        : text.products,
      ctaLabel: text.ctaLabel,
      links: text.links,
      editorial: {
        title: text.editorialTitle,
        image: structure.image,
      },
    };
  });
}
