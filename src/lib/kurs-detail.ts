export type KursDetailEntry = {
  code: string;
  flag: string;
  buy: number;
  sell: number;
};

const CURRENCIES = [
  ["USD", "united states"], ["SGD", "singapore"], ["EUR", "euro"], ["AUD", "australia"],
  ["DKK", "denmark"], ["SEK", "sweden"], ["CAD", "canada"], ["CHF", "switzerland"],
  ["NZD", "new zealand"], ["GBP", "united kingdom"], ["HKD", "hong kong"], ["JPY", "japan"],
  ["SAR", "Saudi Arabia"], ["CNY", "china"], ["MYR", "malaysia"], ["THB", "thailand"],
] as const;

export function getKursFlagPath(flagAssetName: string): string {
  return `/assets/prioritas/kurs/flags/Flag=${encodeURIComponent(flagAssetName)}.svg`;
}

// Bundled e-Rate-shaped fallback values keep the page useful when the feed is unavailable.
const FALLBACK_MID: Record<string, number> = {
  USD: 17850, SGD: 13965, EUR: 20224, AUD: 12439, DKK: 2705,
  SEK: 1785, CAD: 12570, CHF: 21388, NZD: 10063, GBP: 23606,
  HKD: 2275, JPY: 113.6, SAR: 4753, CNY: 2662, MYR: 4373, THB: 531.5,
};

export async function getKursDetail(): Promise<{ rates: KursDetailEntry[]; updatedAt: number }> {
  let midRates = { ...FALLBACK_MID };
  let updatedAt = Date.now();

  try {
    const response = await fetch("https://open.er-api.com/v6/latest/USD", { next: { revalidate: 3600 } });
    if (!response.ok) throw new Error(`Exchange-rate feed returned ${response.status}`);
    const data: unknown = await response.json();
    if (!data || typeof data !== "object" || !("rates" in data) || !data.rates || typeof data.rates !== "object") {
      throw new Error("Exchange-rate feed had an unexpected response shape");
    }
    const rates = data.rates as Record<string, unknown>;
    const idrPerUsd = rates.IDR;
    if (typeof idrPerUsd !== "number" || !Number.isFinite(idrPerUsd)) throw new Error("IDR rate was missing");
    const timestamp = "time_last_update_unix" in data ? data.time_last_update_unix : null;
    if (typeof timestamp === "number" && Number.isFinite(timestamp)) updatedAt = timestamp * 1000;
    midRates = Object.fromEntries(CURRENCIES.map(([code]) => {
      const unitsPerUsd = rates[code];
      const mid = typeof unitsPerUsd === "number" && Number.isFinite(unitsPerUsd) && unitsPerUsd > 0
        ? idrPerUsd / unitsPerUsd
        : FALLBACK_MID[code];
      return [code, mid];
    }));
  } catch (error) {
    console.error("[kurs-detail] exchange-rate fetch failed, using bundled fallback:", error);
  }

  return {
    updatedAt,
    rates: CURRENCIES.map(([code, flagAssetName]) => ({
      code,
      flag: getKursFlagPath(flagAssetName),
      buy: (midRates[code] ?? FALLBACK_MID[code]) * 0.998,
      sell: (midRates[code] ?? FALLBACK_MID[code]) * 1.002,
    })),
  };
}
