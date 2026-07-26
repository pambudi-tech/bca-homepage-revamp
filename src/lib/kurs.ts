export type KursEntry = {
  code: string;
  flag: string;
  beli: string;
  jual: string;
};

const CURRENCIES: { code: string; flag: string }[] = [
  { code: "USD", flag: "/assets/cycle1/flag-usd.svg" },
  { code: "SGD", flag: "/assets/cycle1/flag-sgd.svg" },
  { code: "CNH", flag: "/assets/cycle1/flag-cnh.svg" },
  { code: "EUR", flag: "/assets/cycle1/flag-eur.svg" },
  { code: "GBP", flag: "/assets/cycle1/flag-gbp.svg" },
];

const RATE_CODE_OVERRIDE: Record<string, string> = { CNH: "CNY" };

const FALLBACK_MID: Record<string, number> = {
  USD: 18005,
  SGD: 13930,
  CNH: 2652,
  EUR: 20557,
  GBP: 24048,
};

function formatIDR(value: number) {
  return value.toLocaleString("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export async function getKursHariIni(): Promise<KursEntry[]> {
  let midRates: Record<string, number> = { ...FALLBACK_MID };

  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      console.error(`[kurs] exchange-rate API returned ${res.status}, using bundled fallback`);
    } else {
      const data: unknown = await res.json();
      const rates =
        data && typeof data === "object" && "rates" in data && typeof data.rates === "object"
          ? (data.rates as Record<string, unknown>)
          : null;
      const idrPerUsd = rates?.IDR;
      if (!rates || !Number.isFinite(idrPerUsd)) {
        console.error("[kurs] unexpected response shape, using bundled fallback");
      } else {
        midRates = Object.fromEntries(
          CURRENCIES.map(({ code }) => {
            const rateCode = RATE_CODE_OVERRIDE[code] ?? code;
            const unitPerUsd = rates[rateCode];
            const mid =
              Number.isFinite(unitPerUsd) && (unitPerUsd as number) !== 0
                ? (idrPerUsd as number) / (unitPerUsd as number)
                : FALLBACK_MID[code];
            return [code, mid];
          })
        );
      }
    }
  } catch (err) {
    console.error("[kurs] exchange-rate fetch failed, using bundled fallback:", err);
    midRates = { ...FALLBACK_MID };
  }

  return CURRENCIES.map(({ code, flag }) => {
    const mid = midRates[code] ?? FALLBACK_MID[code];
    return {
      code,
      flag,
      beli: formatIDR(mid * 0.998),
      jual: formatIDR(mid * 1.002),
    };
  });
}
