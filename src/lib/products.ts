import { PRODUCT_CATEGORIES, type ProductCategory } from "@/components/home/product-data";

// The columns we select from the Supabase `products` table, embedded under
// their category.
type ProductRow = {
  title: string;
  subtitle: string;
  image: string;
  /** Absent on installs that haven't run `supabase/product-featured.sql` yet. */
  is_featured?: boolean;
};

type CategoryRow = {
  key: string;
  label: string;
  cta_label: string;
  is_default: boolean;
  /** Foto & deskripsi kartu kategori (layout Accordion). Absen pada instalasi
   *  yang belum menjalankan `supabase/product-category-image.sql`. */
  image?: string;
  description?: string;
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
    // Both `is_featured` (product-featured.sql) and the category `image`/
    // `description` columns (product-category-image.sql) landed after the base
    // tables. Selecting a column that doesn't exist is a 400, which would drop
    // the whole section back to bundled data — losing every dashboard edit —
    // until the migration is run. So we ask for the richest shape first and
    // step down one migration at a time, letting the section degrade (sample
    // photos, "first three" featured) on its own for whatever's still missing.
    const CAT_FULL = "key,label,cta_label,is_default,image,description";
    const CAT_BASE = "key,label,cta_label,is_default";
    const PROD_FULL = "title,subtitle,image,is_featured";
    const PROD_BASE = "title,subtitle,image";

    let res = await request(CAT_FULL, PROD_FULL);
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
        label: r.label,
        ctaLabel: r.cta_label,
        image: r.image ?? undefined,
        description: r.description ?? undefined,
        products: r.products.map((p) => ({
          title: p.title,
          subtitle: p.subtitle,
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
