import { useTranslations } from "next-intl";
import { MEGAMENU_STRUCTURE, type MegaMenuCategory } from "./megamenu-data";

type MegaMenuText = {
  label: string;
  products: string[];
  ctaLabel: string;
  links: { label: string; type?: "article" | "video" }[];
  editorialTitle: string;
};

/** Merges the static layout data (`MEGAMENU_STRUCTURE`) with the active
    locale's translated copy, keyed by category key. */
export function useMegaMenu(): MegaMenuCategory[] {
  const t = useTranslations("megamenu");

  return MEGAMENU_STRUCTURE.map((structure) => {
    const text = t.raw(structure.key) as MegaMenuText;
    return {
      key: structure.key,
      label: text.label,
      width: structure.width,
      chevron: structure.chevron,
      products: text.products,
      ctaLabel: text.ctaLabel,
      links: text.links,
      editorial: {
        title: text.editorialTitle,
        image: structure.image,
      },
    };
  });
}
