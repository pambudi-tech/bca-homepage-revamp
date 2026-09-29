export type FeaturedBannerSlide = {
  id: string;
  image: string;
  alt: string;
  brandLogo?: string;
  isAd?: boolean;
};

export const FEATURED_BANNER_SLIDES = [
  { id: "java-jazz", image: "/assets/promo/event-banner-1.webp", alt: "myBCA International Java Jazz Festival" },
  { id: "the-weeknd", image: "/assets/promo/event-banner-2.webp", alt: "After Hours Til Dawn Tour - The Weeknd" },
  { id: "brightspot", image: "/assets/promo/event-banner-3.webp", alt: "Brightspot Market" },
] as const satisfies readonly FeaturedBannerSlide[];

export const MERCEDES_AD_SLIDE: FeaturedBannerSlide = {
  id: "mercedes-glc-ad",
  image: "/assets/prioritas/ads/mercedes-background.png",
  alt: "Mercedes-Benz GLC 300",
  brandLogo: "/assets/prioritas/ads/mercedes-logo.png",
  isAd: true,
};

export const PRIORITAS_EVENT_FEATURED_BANNER_SLIDES: readonly FeaturedBannerSlide[] = [
  FEATURED_BANNER_SLIDES[0],
  MERCEDES_AD_SLIDE,
  FEATURED_BANNER_SLIDES[1],
  FEATURED_BANNER_SLIDES[2],
];
