import { PRODUCT_CATEGORIES, type ProductCategory } from "@/components/home/product-data";

// The columns we select from the Supabase `products` table, embedded under
// their category.
type ProductRow = {
  title: string;
  subtitle: string;
  image: string;
};

type CategoryRow = {
  key: string;
  label: string;
  cta_label: string;
  is_default: boolean;
  products: ProductRow[];
};

export type ProductSectionData = {
  categories: ProductCategory[];
  /** Category key the section opens on. */
  defaultKey: string;
};

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
 * renders empty.
 */
export async function getProductCategories(): Promise<ProductSectionData> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return fallback();

  const query = [
    "select=key,label,cta_label,is_default,products(title,subtitle,image)",
    "is_active=eq.true",
    "order=sort_order.asc",
    // Ordering/filtering the embedded rows needs its own prefixed params.
    "products.is_active=eq.true",
    "products.order=sort_order.asc",
  ].join("&");

  try {
    const res = await fetch(`${url}/rest/v1/product_categories?${query}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      // Re-fetch at most every 5 minutes; edits in Supabase show up after that.
      next: { revalidate: 300 },
    });
    if (!res.ok) return fallback();

    const rows: CategoryRow[] = await res.json();

    // A category with no cards would render an empty row, so drop it here
    // rather than letting it reach the carousel.
    const categories = rows
      .filter((r) => r.products?.length)
      .map((r) => ({
        key: r.key,
        label: r.label,
        ctaLabel: r.cta_label,
        products: r.products.map((p) => ({
          title: p.title,
          subtitle: p.subtitle,
          image: p.image,
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
