import { FAQ_CATEGORIES, type FaqCategory } from "@/components/home/faq-data";
import type { AppLocale } from "@/i18n/routing";

// The columns we select from the Supabase `faq_categories` table, embedded
// under their items. `_en`/`_zh` are optional translations — null until a
// row has been translated, same convention as `products.ts`.
type FaqItemRow = {
  question: string;
  answer: string;
  question_en?: string | null;
  question_zh?: string | null;
  answer_en?: string | null;
  answer_zh?: string | null;
};

type FaqCategoryRow = {
  key: string;
  label: string;
  label_en?: string | null;
  label_zh?: string | null;
  faq_items: FaqItemRow[];
};

/** Picks the translated value for `locale`, falling back to the Indonesian default. */
function pick(locale: AppLocale, id: string, en?: string | null, zh?: string | null): string {
  return (locale === "en" ? en : locale === "zh" ? zh : null) ?? id;
}

/**
 * Reads the FAQ categories and their questions from Supabase. Same approach
 * as `products.ts` and `news.ts` — Supabase's auto-generated REST API over
 * plain `fetch`, with the items embedded in the category row so it stays a
 * single request.
 *
 * Falls back to the bundled FAQ_CATEGORIES whenever Supabase isn't
 * configured, the request fails, or the data is unusable, so the section
 * never renders empty. The bundled fallback is Indonesian-only regardless of
 * `locale`, same as `hero-slides.ts` for banners.
 */
export async function getFaqCategories(locale: AppLocale): Promise<FaqCategory[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return FAQ_CATEGORIES;

  const query = (categoryFields: string, itemFields: string) =>
    [
      `select=${categoryFields},faq_items(${itemFields})`,
      "is_active=eq.true",
      "order=sort_order.asc",
      // Ordering/filtering the embedded rows needs its own prefixed params.
      "faq_items.is_active=eq.true",
      "faq_items.order=sort_order.asc",
    ].join("&");

  const request = (categoryFields: string, itemFields: string) =>
    fetch(`${url}/rest/v1/faq_categories?${query(categoryFields, itemFields)}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      // Re-fetch at most every 5 minutes; edits in Supabase show up after that.
      next: { revalidate: 300 },
    });

  try {
    // Ask for the i18n columns first and step down if the migration adding
    // them hasn't been run yet, same staged-degrade approach as products.ts —
    // otherwise a missing column 400s the whole request back to bundled data.
    const CAT_FULL = "key,label,label_en,label_zh";
    const CAT_BASE = "key,label";
    const ITEM_FULL = "question,answer,question_en,question_zh,answer_en,answer_zh";
    const ITEM_BASE = "question,answer";

    let res = await request(CAT_FULL, ITEM_FULL);
    if (!res.ok) res = await request(CAT_BASE, ITEM_FULL);
    if (!res.ok) res = await request(CAT_FULL, ITEM_BASE);
    if (!res.ok) res = await request(CAT_BASE, ITEM_BASE);
    if (!res.ok) {
      console.error(`[faq] Supabase returned ${res.status} on every fallback query, using bundled fallback`);
      return FAQ_CATEGORIES;
    }

    const data: unknown = await res.json();
    if (!Array.isArray(data)) {
      console.error("[faq] unexpected response shape, using bundled fallback");
      return FAQ_CATEGORIES;
    }
    const rows = data as FaqCategoryRow[];

    // A category with no questions would render an empty tab, so drop it
    // here rather than letting it reach the section.
    const categories = rows
      .filter((r) => r.faq_items?.length)
      .map((r) => ({
        key: r.key,
        label: pick(locale, r.label, r.label_en, r.label_zh),
        items: r.faq_items.map((i) => ({
          question: pick(locale, i.question, i.question_en, i.question_zh),
          answer: pick(locale, i.answer, i.answer_en, i.answer_zh),
        })),
      }));

    if (!categories.length) {
      console.error("[faq] no usable rows after filtering, using bundled fallback");
      return FAQ_CATEGORIES;
    }
    return categories;
  } catch (err) {
    console.error("[faq] Supabase fetch failed, using bundled fallback:", err);
    return FAQ_CATEGORIES;
  }
}
