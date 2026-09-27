import type { Promo } from "@/components/home/promo-data";

const ASSET_ROOT = "/assets/prioritas/detail/promo";

export const PRIORITAS_PROMO_SAMPLE_KEYS = ["porsche", "mercedes", "landRover", "audi"] as const;
export type PrioritasPromoSampleKey = (typeof PRIORITAS_PROMO_SAMPLE_KEYS)[number];

export const PRIORITAS_PROMO_SAMPLE_META: Record<PrioritasPromoSampleKey, Pick<Promo, "id" | "cover" | "logo" | "category">> = {
  porsche: { id: "porsche-test-drive", cover: `${ASSET_ROOT}/porsche-hero.png`, logo: `${ASSET_ROOT}/porsche-logo.png`, category: "hobby" },
  mercedes: { id: "mercedes-test-drive", cover: `${ASSET_ROOT}/mercedes-cover.png`, logo: `${ASSET_ROOT}/mercedes-logo.png`, category: "hobby" },
  landRover: { id: "land-rover-test-drive", cover: `${ASSET_ROOT}/land-rover-cover.png`, logo: `${ASSET_ROOT}/land-rover-logo.png`, category: "hobby" },
  audi: { id: "audi-test-drive", cover: `${ASSET_ROOT}/audi-cover.png`, logo: `${ASSET_ROOT}/audi-logo.png`, category: "hobby" },
};

type SampleLabels = Record<PrioritasPromoSampleKey, { title: string; brand: string }>;

export function buildPrioritasPromoSamples(labels: SampleLabels): Promo[] {
  return PRIORITAS_PROMO_SAMPLE_KEYS.map((key) => ({
    ...PRIORITAS_PROMO_SAMPLE_META[key],
    ...labels[key],
    startAt: new Date("2026-01-01T00:00:00+07:00"),
    endAt: new Date("2026-09-15T23:59:59+07:00"),
  }));
}
