import snapshot from "@/components/prioritas/partner-privilege-data.json";
import assetSnapshot from "@/components/prioritas/partner-privilege-assets.json";
import logoSnapshot from "@/components/prioritas/partner-privilege-logos.json";
import type { Promo, PromoCategory } from "@/components/home/promo-data";

export type PrivilegeSection = "signature" | "complimentary" | "lifestyle";
export type PrivilegeCategory = "beauty" | "culinary" | "health" | "travel" | "lifestyle" | "education" | "home";
export type PrivilegePromo = Promo & {
  partnerId: string;
  privilegeCategory: PrivilegeCategory;
  birthdayGift: boolean;
  partnerLogoBackground?: "dark";
};

type Partner = (typeof snapshot.partners)[number];
type Complimentary = (typeof snapshot.complimentary)[number];
type Lifestyle = (typeof snapshot.lifestyle)[number];
type Signature = (typeof snapshot.signature)[number];
type Asset = { heroImage: string; sourceUrl: string; siteTitle: string };
type PartnerLogo = { logo: string; sourceUrl: string; originImageUrl: string; background?: "dark" };

const partnersById = new Map(snapshot.partners.map((partner) => [partner.id, partner]));
const assets = assetSnapshot as Record<string, Asset>;
const logos = logoSnapshot as Record<string, PartnerLogo>;
const monthNumbers: Record<string, number> = {
  januari: 0,
  februari: 1,
  maret: 2,
  april: 3,
  mei: 4,
  juni: 5,
  juli: 6,
  agustus: 7,
  september: 8,
  oktober: 9,
  november: 10,
  desember: 11,
};

function getCategory(category: string): { chip: PrivilegeCategory; promo: PromoCategory } {
  switch (category) {
    case "Kecantikan": return { chip: "beauty", promo: "health-beauty" };
    case "F&B": return { chip: "culinary", promo: "fnb" };
    case "Kesehatan": return { chip: "health", promo: "health-beauty" };
    case "Travel": return { chip: "travel", promo: "travel" };
    case "Gaya Hidup": return { chip: "lifestyle", promo: "hobby" };
    case "Pendidikan": return { chip: "education", promo: "hobby" };
    case "Hunian": return { chip: "home", promo: "home-electronics" };
    default: throw new Error(`Unknown partner category: ${category}`);
  }
}

function getEndDate(period: string): Date {
  const match = period.match(/(\d{1,2})\s+(Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)\s+(\d{4})$/i);
  if (!match) return new Date("2100-01-01T00:00:00+07:00");
  const month = monthNumbers[match[2].toLowerCase()];
  return new Date(Date.UTC(Number(match[3]), month, Number(match[1]), 16, 59, 59));
}

function toPromo(
  row: Signature | Complimentary | Lifestyle,
  section: PrivilegeSection,
): PrivilegePromo {
  const partner = partnersById.get(row.partnerId);
  if (!partner) throw new Error(`Missing partner: ${row.partnerId}`);
  const asset = assets[partner.id];
  const logo = logos[partner.id];
  const category = getCategory(partner.category);
  return {
    id: partner.id,
    partnerId: partner.id,
    title: row.benefit,
    brand: partner.name,
    category: category.promo,
    privilegeCategory: category.chip,
    birthdayGift: section === "complimentary" && "kind" in row && row.kind === "Birthday Gift",
    cover: asset?.heroImage ?? "",
    logo: logo?.logo ?? "",
    ...(logo?.background === "dark" ? { partnerLogoBackground: "dark" as const } : {}),
    startAt: new Date(0),
    endAt: getEndDate(partner.validUntil),
  };
}

export function getPrivilegePromos(section: PrivilegeSection): PrivilegePromo[] {
  const rows = section === "signature" ? snapshot.signature : section === "complimentary" ? snapshot.complimentary : snapshot.lifestyle;
  return rows.map((row) => toPromo(row, section));
}

export function getPrivilegeOffer(section: PrivilegeSection, partnerId: string): {
  partner: Partner;
  benefit: Signature | Complimentary | Lifestyle;
  asset?: Asset;
  logo?: PartnerLogo;
} | null {
  const partner = partnersById.get(partnerId);
  const rows = section === "signature" ? snapshot.signature : section === "complimentary" ? snapshot.complimentary : snapshot.lifestyle;
  const benefit = rows
    .find((row) => row.partnerId === partnerId);
  if (!partner || !benefit) return null;
  return { partner, benefit, asset: assets[partnerId], logo: logos[partnerId] };
}

export function splitPartnerTerms(terms: string): string[] {
  return terms.split(/\s*;\s*|\s+\|\s+/).map((item) => item.trim()).filter(Boolean);
}
