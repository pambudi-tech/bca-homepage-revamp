import { getPrivilegePromos } from "@/lib/partner-privileges";
import { rankBySearchScored } from "./search-engine";
import type { ProductRec, SearchRecommendations, SearchSegment } from "./search-data";

const SIGNATURE_KEYS = ["lounge", "transfer", "medical"] as const;
const BANKING_KEYS = ["jcb", "vehicle", "branch", "insurance", "fees", "transaction", "media", "advisor", "family", "contact", "credit", "home", "motorcycle", "merchant", "deposit", "forex"] as const;

export const PRIOSOLI_POPULAR_SEARCHES = [
  { id: "airportLounge", keyword: "Airport Lounge" },
  { id: "airportTransfer", keyword: "Airport Transfer" },
  { id: "bankingPrivilege", keyword: "Banking Privilege" },
  { id: "wealthInsight", keyword: "Wealth Insight" },
  { id: "safeDeposit", keyword: "Safe Deposit Box" },
] as const;
export const SOLITAIRE_POPULAR_SEARCHES = [
  { id: "airportLounge", keyword: "Airport Lounge" },
  { id: "healthPrivilege", keyword: "Pemeriksaan Kesehatan" },
  { id: "exclusivePrivilege", keyword: "Privilege Eksklusif" },
] as const;

type Copy = {
  signature: Record<(typeof SIGNATURE_KEYS)[number], { title: string }>;
  banking: Record<(typeof BANKING_KEYS)[number], string>;
  signatureLabel: string;
  bankingLabel: string;
  wealthLabel: string;
  homePrivilege: { lounge: string; health: string; event: string };
};

function hrefFor(locale: string, path: string): string {
  return `${locale === "id" ? "" : `/${locale}`}${path}`;
}

export function getPriosoliSearchRecommendations(
  keyword: string,
  segment: Extract<SearchSegment, "Prioritas" | "Solitaire">,
  locale: string,
  copy: Copy,
): SearchRecommendations {
  const isPrioritas = segment === "Prioritas";
  const privilegeHref = isPrioritas ? "/prioritas/privilege" : "/solitaire#privilege";
  const bankingHref = isPrioritas ? "/prioritas/banking-solution" : "/solitaire#banking-solution";
  const homePrivilegeItems: ProductRec[] = (["lounge", "health", "event"] as const).map((key) => ({
    id: `${segment}-home-privilege-${key}`,
    title: copy.homePrivilege[key],
    description: copy.signatureLabel,
    href: hrefFor(locale, privilegeHref),
    icon: "star" as const,
    tags: ["privilege", segment, "eksklusif"],
  }));
  const items: ProductRec[] = isPrioritas ? [
    ...homePrivilegeItems,
    ...SIGNATURE_KEYS.map((key) => ({
      id: `${segment}-signature-${key}`,
      title: copy.signature[key].title,
      description: copy.signatureLabel,
      href: hrefFor(locale, privilegeHref),
      icon: "star" as const,
      tags: ["privilege", "signature privilege", segment],
    })),
    ...BANKING_KEYS.map((key) => ({
      id: `${segment}-banking-${key}`,
      title: copy.banking[key],
      description: copy.bankingLabel,
      href: hrefFor(locale, bankingHref),
      icon: "wallet" as const,
      tags: ["banking solution", "banking privilege", segment],
    })),
    {
      id: `${segment}-wealth-insight`,
      title: copy.wealthLabel,
      description: copy.bankingLabel,
      href: hrefFor(locale, isPrioritas ? "/prioritas/banking-solution/wealth-insight" : bankingHref),
      icon: "chart",
      tags: ["wealth", "investasi", "banking solution", segment],
    },
  ] : homePrivilegeItems;

  if (isPrioritas) {
    for (const section of ["signature", "complimentary", "lifestyle"] as const) {
      for (const offer of getPrivilegePromos(section)) {
        items.push({
          id: `Prioritas-${section}-${offer.id}`,
          title: `${offer.brand} — ${offer.title}`,
          description: copy.signatureLabel,
          href: hrefFor(locale, `/prioritas/${section === "lifestyle" ? "lifestyle-privilege" : "privilege"}/${offer.id}`),
          icon: "star",
          tags: [offer.brand, offer.title, offer.privilegeCategory, "privilege", segment],
        });
      }
    }
  }

  const results = keyword.trim()
    ? rankBySearchScored(items, keyword.trim(), 7).map(({ item }) => item)
    : items.slice(0, 3);

  return {
    products: results.slice(0, 3),
    information: results.slice(3).map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      href: item.href,
      category: "produk-layanan" as const,
    })),
    program: [],
    order: ["products", "information", "program"],
  };
}
