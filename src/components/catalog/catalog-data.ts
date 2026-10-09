export type CatalogGroup = "controls" | "cards" | "navigation" | "display" | "feedback";
export type CatalogPreview = "button" | "dropdown" | "chips" | "tabs" | "field" | "card" | "date" | "pagination" | "accordion" | "banner" | "carousel" | "rates" | "search" | "header" | "generic";

export type CatalogItem = {
  id: string;
  group: CatalogGroup;
  preview: CatalogPreview;
  source: string;
  image?: string;
  brand?: "both" | "prioritas" | "solitaire" | "shared";
};

export const catalogItems: CatalogItem[] = [
  { id: "button", group: "controls", preview: "button", source: "src/components/prioritas/PrioritasButton.tsx", brand: "both" },
  { id: "dropdown", group: "controls", preview: "dropdown", source: "src/components/prioritas/PrioritasDirectoryDropdown.tsx", brand: "both" },
  { id: "category-chip", group: "controls", preview: "chips", source: "src/components/prioritas/CategoryChip.tsx", brand: "both" },
  { id: "tab", group: "controls", preview: "tabs", source: "src/components/ui/Tab.tsx", brand: "both" },
  { id: "text-field", group: "controls", preview: "field", source: "src/components/ui/TextField.tsx", brand: "shared" },
  { id: "content-card", group: "cards", preview: "card", source: "src/components/prioritas/ContentCard.tsx", image: "/assets/soliprio/prioritas-lounge.webp", brand: "both" },
  { id: "privilege-card", group: "cards", preview: "card", source: "src/components/prioritas/SignatureDirectoryCard.tsx", image: "/assets/prioritas/privilege/lounge.webp", brand: "both" },
  { id: "banking-privilege-card", group: "cards", preview: "card", source: "src/components/prioritas/BankingSolutionSection.tsx", image: "/assets/soliprio/prioritas-image.webp", brand: "both" },
  { id: "wealth-insight-card", group: "cards", preview: "card", source: "src/components/prioritas/BankingSolutionSection.tsx", image: "/assets/prioritas/privilege/hospital.webp", brand: "both" },
  { id: "magazine-card", group: "cards", preview: "card", source: "src/components/prioritas/MagazineCard.tsx", image: "/assets/soliprio/prioritas-event.webp", brand: "both" },
  { id: "pagination", group: "navigation", preview: "pagination", source: "src/components/prioritas/PrioritasDirectory.tsx", brand: "both" },
  { id: "directory-panel", group: "display", preview: "generic", source: "src/components/prioritas/PrioritasDirectory.tsx", brand: "both" },
  { id: "detail-accordion", group: "controls", preview: "accordion", source: "src/components/prioritas/PrioritasDetailExperience.tsx", brand: "both" },
  { id: "hero", group: "display", preview: "banner", source: "src/components/home/HeroSection.tsx", image: "/assets/soliprio/prioritas-image.webp", brand: "both" },
  { id: "navbar", group: "navigation", preview: "header", source: "src/components/home/Navbar.tsx", brand: "both" },
  { id: "section-nav", group: "navigation", preview: "tabs", source: "src/components/home/SectionAnchor.tsx", brand: "both" },
  { id: "privilege-feature", group: "cards", preview: "card", source: "src/components/prioritas/PrivilegeSection.tsx", image: "/assets/prioritas/privilege/lounge.webp" },
  { id: "privilege-accordion", group: "cards", preview: "accordion", source: "src/components/solitaire/SolitairePrivilegeSection.tsx", image: "/assets/solitaire/privilege/lounge-source.png", brand: "solitaire" },
  { id: "featured-event", group: "display", preview: "banner", source: "src/components/prioritas/PrioritasFeaturedBanner.tsx", image: "/assets/soliprio/prioritas-event.webp", brand: "both" },
  { id: "event-overlap", group: "display", preview: "carousel", source: "src/components/solitaire/SolitaireEventPromoDesktopSlider.tsx", image: "/assets/solitaire/privilege/event-source.png", brand: "solitaire" },
  { id: "kurs-carousel", group: "display", preview: "rates", source: "src/components/prioritas/KursRatesCarousel.tsx", brand: "both" },
  { id: "floating-action", group: "navigation", preview: "button", source: "src/components/home/BackToTop.tsx", brand: "both" },
  { id: "alert-feedback", group: "feedback", preview: "generic", source: "src/components/member/LoginAlert.tsx", brand: "shared" },
  { id: "search-overlay", group: "navigation", preview: "search", source: "src/components/home/SearchOverlay.tsx", brand: "both" },
  { id: "contact-footer", group: "display", preview: "generic", source: "src/components/prioritas/PrioritasContactSection.tsx", brand: "both" },
  { id: "page-header", group: "navigation", preview: "header", source: "src/components/prioritas/PrioritasPageHeader.tsx", brand: "both" },
];

export const catalogUsage: Record<string, string> = {
  button: "#event-promo", dropdown: "/privilege", "category-chip": "/privilege", tab: "/privilege",
  "text-field": "/member/login", "content-card": "/event", "privilege-card": "/privilege",
  "banking-privilege-card": "#banking-solution", "wealth-insight-card": "#banking-solution",
  "magazine-card": "/e-magazine", pagination: "/event", "directory-panel": "/event",
  "detail-accordion": "/privilege/executive-airport-lounge", "privilege-feature": "#privilege", "privilege-accordion": "#privilege",
  "featured-event": "#event-promo", "event-overlap": "#event-promo", "kurs-carousel": "#banking-solution",
  "alert-feedback": "/member/login", "contact-footer": "", "page-header": "/event",
};
