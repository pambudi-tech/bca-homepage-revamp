import { useTranslations } from "next-intl";
import { MEGAMENU_STRUCTURE, type MegaMenuCategory } from "./megamenu-data";
import { PRODUCT_CATEGORIES, type ProductCategory } from "./product-data";
import type { MegaMenuContent } from "@/lib/megamenu";

type MegaMenuText = {
  label: string;
  products: string[];
  ctaLabel: string;
  tools: string[];
  links: { label: string; type?: "article" | "video" }[];
  editorialTitle: string;
};

type CreditCardRoute = { id: string; title: string };

function normalizeProductTitle(title: string) {
  return title.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

/** Merges the static layout data (`MEGAMENU_STRUCTURE`) with the active
    locale's translated copy, keyed by category key. When `productCategories`
    (from Supabase via `getProductCategories`, same source as `ProductSection`)
    has a category matching the key, its featured products replace the
    hardcoded translation list — the panel hugs however many featured
    products that category has (falling back to all of them if none are
    flagged) instead of a fixed count. Same for `megamenuContent` (from
    Supabase via `getMegaMenuContent`): its links/editorial replace the
    hardcoded translation whenever that category has rows. */
export function useMegaMenu(
  productCategories?: ProductCategory[],
  megamenuContent?: MegaMenuContent,
): MegaMenuCategory[] {
  const t = useTranslations("megamenu");
  const tSearch = useTranslations("search");
  const tCards = useTranslations("creditCardDetail.cardList");
  const creditCardRoutes = new Map(
    (tCards.raw("cards") as CreditCardRoute[]).map((card) => [normalizeProductTitle(card.title), `/kartu-kredit/${card.id}`]),
  );

  return MEGAMENU_STRUCTURE.map((structure) => {
    const text = t.raw(structure.key) as MegaMenuText;
    const liveCategory = productCategories?.find((c) => c.key === structure.key);
    const bundledCategory = PRODUCT_CATEGORIES.find((c) => c.key === structure.key);
    const sourceCategory = liveCategory ?? bundledCategory;
    const liveProducts = liveCategory
      ? [
          ...liveCategory.products.filter((product) => product.featured),
          ...liveCategory.products.filter((product) => !product.featured),
        ]
      : [];
    const liveLinks = megamenuContent?.linksByKey[structure.key];
    const liveEditorial = megamenuContent?.editorialByKey[structure.key];
    const toMenuProduct = (title: string, description?: string) => ({
      title,
      description,
      href: creditCardRoutes.get(normalizeProductTitle(title)),
    });

    return {
      key: structure.key,
      label: text.label,
      icon: structure.icon,
      width: structure.width,
      // The restored desktop layout shows individual products in the middle
      // column and reserves its final row for the "view all" CTA. Keep that
      // CTA separate rather than treating it as a fifth product.
      products: sourceCategory
          ? (liveCategory ? liveProducts : sourceCategory.products)
            .slice(0, 5)
            .map((product) => toMenuProduct(product.title, product.subtitle))
        : text.products.slice(0, -1).slice(0, 5).map((title) => toMenuProduct(title)),
      ctaLabel: `${tSearch("viewAll")} ${text.label}`,
      tools: text.tools.map((label, index) => ({
        label,
        icon: structure.toolIcons[index] ?? "document",
      })),
      links: liveLinks?.length ? liveLinks : text.links,
      editorial: {
        ...(liveEditorial ?? {
          title: text.editorialTitle,
          image: liveCategory?.image || structure.image,
        }),
        fallbackImage: structure.image,
      },
    };
  });
}
