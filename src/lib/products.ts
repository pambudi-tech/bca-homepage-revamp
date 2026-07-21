import { PRODUCT_CATEGORIES, type ProductCategory } from "@/components/home/product-data";
import type { AppLocale } from "@/i18n/routing";

// The columns we select from the Supabase `products` table, embedded under
// their category. `_en`/`_zh` are optional translations (see
// `supabase/product-i18n.sql`) — null until a row has been translated.
type ProductRow = {
  title: string;
  subtitle: string;
  image: string;
  /** Absent on installs that haven't run `supabase/product-featured.sql` yet. */
  is_featured?: boolean;
  title_en?: string | null;
  title_zh?: string | null;
  subtitle_en?: string | null;
  subtitle_zh?: string | null;
};

type CategoryRow = {
  key: string;
  label: string;
  is_default: boolean;
  /** Foto & deskripsi kartu kategori (layout Accordion). Absen pada instalasi
   *  yang belum menjalankan `supabase/product-category-image.sql`. */
  image?: string;
  description?: string;
  label_en?: string | null;
  label_zh?: string | null;
  description_en?: string | null;
  description_zh?: string | null;
  products: ProductRow[];
};

export type ProductSectionData = {
  categories: ProductCategory[];
  /** Category key the section opens on. */
  defaultKey: string;
};

/** Picks the translated value for `locale`, falling back to the Indonesian default. */
function pick(locale: AppLocale, id: string, en?: string | null, zh?: string | null): string {
  return (locale === "en" ? en : locale === "zh" ? zh : null) ?? id;
}

/** Shape the bundled fallback the same way a successful fetch is shaped. */
function fallback(): ProductSectionData {
  return {
    categories: PRODUCT_CATEGORIES,
    defaultKey: "Kartu Kredit",
  };
}

/**
 * Reads the Produk & Layanan categories and their cards from Supabase. Same
 * approach as `banners.ts` and `kurs.ts` — Supabase's auto-generated REST API
 * over plain `fetch`, no extra dependency — with the products embedded in the
 * category row so it stays a single request.
 *
 * Falls back to the bundled PRODUCT_CATEGORIES whenever Supabase isn't
 * configured, the request fails, or the data is unusable, so the section never
 * renders empty. The bundled fallback is Indonesian-only regardless of
 * `locale`, same as `hero-slides.ts` for banners.
 */
export async function getProductCategories(locale: AppLocale): Promise<ProductSectionData> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return fallback();

  const query = (categoryFields: string, productFields: string) =>
    [
      `select=${categoryFields},products(${productFields})`,
      "is_active=eq.true",
      "order=sort_order.asc",
      // Ordering/filtering the embedded rows needs its own prefixed params.
      "products.is_active=eq.true",
      "products.order=sort_order.asc",
    ].join("&");

  const request = (categoryFields: string, productFields: string) =>
    fetch(`${url}/rest/v1/product_categories?${query(categoryFields, productFields)}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      // Re-fetch at most every 5 minutes; edits in Supabase show up after that.
      next: { revalidate: 300 },
    });

  try {
    // (`cta_label` was dropped from `product_categories` — the CTA button text
    // actually comes from i18n messages via `t("ctaLabel")` in
    // `ProductSection.tsx`, so the column was never read anyway.)
    // Both `is_featured` (product-featured.sql), the category `image`/
    // `description` columns (product-category-image.sql), and the `_en`/`_zh`
    // translation columns (product-i18n.sql) landed after the base tables.
    // Selecting a column that doesn't exist is a 400, which would drop the
    // whole section back to bundled data — losing every dashboard edit —
    // until the migration is run. So we ask for the richest shape first and
    // step down one migration at a time, letting the section degrade (sample
    // photos, "first three" featured, Indonesian-only) on its own for
    // whatever's still missing.
    const CAT_FULL =
      "key,label,is_default,image,description,label_en,label_zh,description_en,description_zh";
    const CAT_NO_I18N = "key,label,is_default,image,description";
    const CAT_BASE = "key,label,is_default";
    const PROD_FULL = "title,subtitle,image,is_featured,title_en,title_zh,subtitle_en,subtitle_zh";
    const PROD_NO_I18N = "title,subtitle,image,is_featured";
    const PROD_BASE = "title,subtitle,image";

    let res = await request(CAT_FULL, PROD_FULL);
    if (!res.ok) res = await request(CAT_NO_I18N, PROD_NO_I18N);
    if (!res.ok) res = await request(CAT_BASE, PROD_FULL);
    if (!res.ok) res = await request(CAT_BASE, PROD_BASE);
    if (!res.ok) return fallback();

    const rows: CategoryRow[] = await res.json();

    // A category with no cards would render an empty row, so drop it here
    // rather than letting it reach the carousel.
    const categories = rows
      .filter((r) => r.products?.length)
      .map((r) => ({
        key: r.key,
        label: pick(locale, r.label, r.label_en, r.label_zh),
        image: r.image ?? undefined,
        description: r.description
          ? pick(locale, r.description, r.description_en, r.description_zh)
          : undefined,
        products: r.products.map((p) => ({
          title: pick(locale, p.title, p.title_en, p.title_zh),
          subtitle: pick(locale, p.subtitle, p.subtitle_en, p.subtitle_zh),
          image: p.image,
          featured: p.is_featured,
        })),
      }));
    if (!categories.length) return fallback();

    const flagged = rows.find((r) => r.is_default && r.products?.length);
    return {
      categories,
      defaultKey: flagged?.key ?? categories[0].key,
    };
  } catch {
    return fallback();
  }
}
