export type MegaMenuLink = {
  label: string;
  type?: "article" | "video";
};

export type MegaMenuProduct = {
  title: string;
  description?: string;
};

export type MegaMenuTool = {
  label: string;
  icon: "calculator" | "document" | "gauge" | "reward" | "compare" | "profile" | "help";
};

export type MegaMenuCategory = {
  key: string;
  label: string;
  icon: string;
  /** Fixed sub-nav tab width from the design; omit to size to content. */
  width?: number;
  products: MegaMenuProduct[];
  ctaLabel: string;
  tools: MegaMenuTool[];
  links: MegaMenuLink[];
  editorial: {
    title: string;
    image: string;
    fallbackImage: string;
  };
};

/** Non-text layout data — labels/products/links/editorial titles are translated
    and merged in via `useMegaMenu()` (see `use-megamenu.ts`). Every entry here
    opens a panel, so its nav tab always gets the expand chevron — see
    `NAV_TABS` in `Navbar.tsx`. */
export type MegaMenuStructure = {
  key: string;
  icon: string;
  width?: number;
  productCount: number;
  toolIcons: MegaMenuTool["icon"][];
  linkTypes: (MegaMenuLink["type"] | undefined)[];
  image: string;
};

export const MEGAMENU_STRUCTURE: MegaMenuStructure[] = [
  {
    key: "Simpanan",
    icon: "/assets/megamenu/tabungan.svg",
    width: 126,
    productCount: 5,
    toolIcons: ["calculator", "document"],
    linkTypes: ["video", undefined, undefined, undefined],
    image: "/assets/category/tabungan.webp",
  },
  {
    key: "Pinjaman",
    icon: "/assets/megamenu/pinjaman.svg",
    width: 121,
    productCount: 5,
    toolIcons: ["calculator", "gauge"],
    linkTypes: ["video", undefined, undefined, undefined],
    image: "/assets/category/pinjaman.webp",
  },
  {
    key: "Kartu Kredit",
    icon: "/assets/megamenu/kartu-kredit.svg",
    width: 142,
    productCount: 5,
    toolIcons: ["calculator", "reward"],
    linkTypes: ["video", undefined, undefined, undefined],
    image: "/assets/category/kartu-kredit.webp",
  },
  {
    key: "e-Banking",
    icon: "/assets/megamenu/e-banking.svg",
    width: 128,
    productCount: 5,
    toolIcons: ["document", "compare"],
    linkTypes: ["video", undefined, undefined, undefined],
    image: "/assets/category/ebanking.webp",
  },
  {
    key: "Investasi",
    icon: "/assets/megamenu/investasi.svg",
    width: 126,
    productCount: 4,
    toolIcons: ["calculator", "profile"],
    linkTypes: ["video", undefined, undefined, undefined],
    image: "/assets/category/investasi.webp",
  },
  {
    key: "Asuransi",
    icon: "/assets/megamenu/asuransi.svg",
    width: 126,
    productCount: 1,
    toolIcons: ["calculator", "help"],
    linkTypes: ["video", undefined, undefined, undefined],
    image: "/assets/category/asuransi.webp",
  },
  {
    key: "Transaksi",
    icon: "/assets/megamenu/transaksi.svg",
    productCount: 4,
    toolIcons: ["calculator", "document"],
    linkTypes: ["video", undefined, undefined],
    image: "/assets/category/transaksi.webp",
  },
];
