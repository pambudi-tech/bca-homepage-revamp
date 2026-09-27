import type { Promo } from "@/components/home/promo-data";

export const EVENT_CATEGORY_KEYS = ["lifestyle", "networking", "arts", "culinary"] as const;

export type EventCategory = (typeof EVENT_CATEGORY_KEYS)[number];

export type EventPromo = Promo & {
  eventCategory: EventCategory;
  dateTile: {
    primary?: string;
    secondary?: string;
    dateParts?: Array<{ primary: string; secondary: string }>;
    expired?: boolean;
  };
};

/**
 * Local Event-directory sample. This intentionally has its own dataset rather
 * than reusing Complimentary/Lifestyle promos, so it can be replaced by the
 * Event CMS endpoint later without changing the directory or card contract.
 */
export const EVENT_PROMO_SAMPLES: EventPromo[] = [
  {
    id: "louis-vuitton-private-shopping",
    title: "Private Shopping Experience — Louis Vuitton Pre-Fall 2026",
    brand: "Louis Vuitton",
    cover: "/assets/promo/card5-cover.webp",
    logo: "/assets/promo/card5-logo.png",
    category: "fashion-shopping",
    eventCategory: "lifestyle",
    startAt: new Date("2026-06-23T00:00:00+07:00"),
    endAt: new Date("2026-06-23T23:59:59+07:00"),
    dateTile: { primary: "23", secondary: "JUN" },
  },
  {
    id: "luxury-river-cruise",
    title: "Experience the World's Best Luxury River Cruise Adventure",
    brand: "Louis Vuitton",
    cover: "/assets/promo/event-banner-1.webp",
    logo: "/assets/promo/card5-logo.png",
    category: "travel",
    eventCategory: "lifestyle",
    startAt: new Date("2026-05-21T00:00:00+07:00"),
    endAt: new Date("2026-05-21T23:59:59+07:00"),
    dateTile: { primary: "21", secondary: "MEI" },
  },
  {
    id: "jade-afternoon-high-tea",
    title: "Afternoon High Tea : Konsultasi Personal & Beragam Hadiah Menarik",
    brand: "Jade Aesthetic Clinic",
    cover: "/assets/prioritas/detail/molton-brown/raw-01.png",
    logo: "/assets/promo/card2-logo.png",
    category: "health-beauty",
    eventCategory: "culinary",
    startAt: new Date("2026-05-13T00:00:00+07:00"),
    endAt: new Date("2026-05-13T23:59:59+07:00"),
    dateTile: { primary: "13", secondary: "MEI" },
  },
  {
    id: "art-jakarta-gardens",
    title: "Art Jakarta Gardens 2026 : Exclusive VIP Access",
    brand: "Art Jakarta",
    cover: "/assets/prioritas/detail/event/art-jakarta-cover.png",
    logo: "/assets/prioritas/detail/event/art-jakarta-logo.png",
    category: "entertainment",
    eventCategory: "arts",
    startAt: new Date("2026-05-05T00:00:00+07:00"),
    endAt: new Date("2026-05-10T23:59:59+07:00"),
    dateTile: { primary: "5–10", secondary: "MEI" },
  },
  {
    id: "seibu-beauty-soiree",
    title: "Indulge in an Exclusive Beauty Experience at the Beauty Soiree",
    brand: "Seibu",
    cover: "/assets/prioritas/detail/molton-brown/raw-03.png",
    logo: "/assets/promo/card7-logo.png",
    category: "health-beauty",
    eventCategory: "lifestyle",
    startAt: new Date("2026-06-23T00:00:00+07:00"),
    endAt: new Date("2026-06-23T23:59:59+07:00"),
    dateTile: { primary: "23", secondary: "JUN" },
  },
  {
    id: "fun-golf-driving",
    title: "Fun Golf Driving Bersama Head of Research BCA Sekuritas",
    brand: "BCA",
    cover: "/assets/promo/card6-cover.webp",
    logo: "/assets/promo/card4-logo.png",
    category: "hobby",
    eventCategory: "lifestyle",
    startAt: new Date("2026-05-05T00:00:00+07:00"),
    endAt: new Date("2026-05-05T23:59:59+07:00"),
    dateTile: { primary: "5", secondary: "MEI" },
  },
  {
    id: "sothebys-art-auction",
    title: "Malam Amal & Lelang Karya Seni untuk Pendidikan Anak Indonesia",
    brand: "Sotheby's",
    cover: "/assets/prioritas/detail/event/sothebys-hero.png",
    logo: "/assets/prioritas/detail/event/sothebys-logo.png",
    category: "entertainment",
    eventCategory: "arts",
    startAt: new Date("2026-05-09T00:00:00+07:00"),
    endAt: new Date("2026-05-10T23:59:59+07:00"),
    dateTile: { primary: "9-10", secondary: "MEI" },
  },
  {
    id: "ican-education-expo",
    title: "ICAN Education International Expo – VIP Access & MAP Voucher Rp200 Ribu",
    brand: "ICAN",
    cover: "/assets/promo-page/categories/hobby.png",
    logo: "/assets/promo/card4-logo.png",
    category: "hobby",
    eventCategory: "networking",
    startAt: new Date("2026-05-30T00:00:00+07:00"),
    endAt: new Date("2026-07-12T23:59:59+07:00"),
    dateTile: { dateParts: [{ primary: "30", secondary: "MEI" }, { primary: "12", secondary: "JUL" }] },
  },
  {
    id: "lino-sons-fan-painting",
    title: "An Incredible and Amazing Fan Painting Experience by Lino & Sons",
    brand: "Lino & Sons",
    cover: "/assets/prioritas/detail/molton-brown/raw-16.png",
    logo: "/assets/promo/card6-logo.png",
    category: "fashion-shopping",
    eventCategory: "arts",
    startAt: new Date("2026-04-01T00:00:00+07:00"),
    endAt: new Date("2026-04-01T23:59:59+07:00"),
    dateTile: { expired: true },
  },
];

export const EVENT_DETAIL_RECOMMENDATION_KEYS = ["christies", "symphony"] as const;
type EventDetailRecommendationKey = (typeof EVENT_DETAIL_RECOMMENDATION_KEYS)[number];
type EventRecommendationLabels = Record<EventDetailRecommendationKey, { title: string; brand: string }>;

export function buildEventDetailRecommendations(labels: EventRecommendationLabels): EventPromo[] {
  return [
    {
      id: "christies-private-viewing",
      ...labels.christies,
      cover: "/assets/prioritas/detail/event/christies-cover.png",
      logo: "/assets/prioritas/detail/event/christies-logo.png",
      category: "entertainment",
      eventCategory: "arts",
      startAt: new Date("2026-09-21T00:00:00+07:00"),
      endAt: new Date("2026-09-21T23:59:59+07:00"),
      dateTile: { primary: "21", secondary: "SEP" },
    },
    {
      id: "symphony-gala",
      ...labels.symphony,
      cover: "/assets/prioritas/detail/event/symphony-cover.png",
      logo: "/assets/prioritas/detail/event/symphony-logo.png",
      category: "entertainment",
      eventCategory: "arts",
      startAt: new Date("2026-08-27T00:00:00+07:00"),
      endAt: new Date("2026-08-27T23:59:59+07:00"),
      dateTile: { primary: "27", secondary: "AGU" },
    },
  ];
}
