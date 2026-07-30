export type MegaMenuLink = {
  label: string;
  type?: "article" | "video";
};

export type MegaMenuCategory = {
  key: string;
  label: string;
  /** Fixed sub-nav tab width from the design; omit to size to content. */
  width?: number;
  products: string[];
  ctaLabel: string;
  links: MegaMenuLink[];
  editorial: {
    title: string;
    image: string;
  };
};

/** Non-text layout data — labels/products/links/editorial titles are translated
    and merged in via `useMegaMenu()` (see `use-megamenu.ts`). Every entry here
    opens a panel, so its nav tab always gets the expand chevron — see
    `NAV_TABS` in `Navbar.tsx`. */
export type MegaMenuStructure = {
  key: string;
  width?: number;
  productCount: number;
  linkTypes: (MegaMenuLink["type"] | undefined)[];
  image: string;
};

export const MEGAMENU_STRUCTURE: MegaMenuStructure[] = [
  {
    key: "Simpanan",
    width: 126,
    productCount: 5,
    linkTypes: ["video", undefined, undefined, undefined],
    image: "/assets/category/simpanan.webp",
  },
  {
    key: "Kartu Kredit",
    width: 142,
    productCount: 5,
    linkTypes: ["video", undefined, undefined, undefined],
    image: "/assets/category/kartu-kredit.webp",
  },
  {
    key: "Pinjaman",
    width: 121,
    productCount: 5,
    linkTypes: ["video", undefined, undefined, undefined],
    image: "/assets/category/pinjaman.webp",
  },
  {
    key: "e-Banking",
    width: 128,
    productCount: 5,
    linkTypes: ["video", undefined, undefined, undefined],
    // No dedicated e-Banking asset yet — reuses Simpanan's for now.
    image: "/assets/category/simpanan.webp",
  },
  {
    key: "Wealth Management",
    width: 200,
    productCount: 5,
    linkTypes: ["video", undefined, undefined, undefined],
    // Asuransi's asset, since Investasi + Asuransi merged into this category.
    image: "/assets/category/asuransi.webp",
  },
  {
    key: "Transaksi",
    productCount: 4,
    linkTypes: ["video", undefined, undefined],
    // No dedicated Transaksi asset yet — reuses Simpanan's for now.
    image: "/assets/category/simpanan.webp",
  },
];
