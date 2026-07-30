import type { AppLocale } from "@/i18n/routing";

// Columns from the Supabase `megamenu_links` / `megamenu_editorial` tables
// (see `supabase/megamenu-content.sql`).
type LinkRow = {
  category_key: string;
  label: string;
  type: "article" | "video" | null;
  label_en?: string | null;
  label_zh?: string | null;
};

type EditorialRow = {
  category_key: string;
  title: string;
  image: string;
  title_en?: string | null;
  title_zh?: string | null;
};

export type MegaMenuLinkContent = { label: string; type?: "article" | "video" };
export type MegaMenuEditorialContent = { title: string; image: string };

export type MegaMenuContent = {
  linksByKey: Record<string, MegaMenuLinkContent[]>;
  editorialByKey: Record<string, MegaMenuEditorialContent>;
};

function pick(locale: AppLocale, id: string, en?: string | null, zh?: string | null): string {
  return (locale === "en" ? en : locale === "zh" ? zh : null) ?? id;
}

const EMPTY: MegaMenuContent = { linksByKey: {}, editorialByKey: {} };

/**
 * Reads the megamenu article/video links and the editorial (marketing) card
 * per category from Supabase. Mirrors `getProductCategories` in
 * `products.ts`: same anon-key REST fetch, same graceful degrade.
 *
 * Returns empty maps (not a throw) whenever Supabase isn't configured, the
 * request fails, or the tables don't exist yet — `useMegaMenu()` falls back
 * to the bundled i18n copy for any key missing from these maps, so the panel
 * never renders empty.
 */
export async function getMegaMenuContent(locale: AppLocale): Promise<MegaMenuContent> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return EMPTY;

  const headers = { apikey: key, Authorization: `Bearer ${key}` };
  // Re-fetch at most every 5 minutes; edits in Supabase show up after that.
  const next = { revalidate: 300 };

  try {
    const [linksRes, editorialRes] = await Promise.all([
      fetch(
        `${url}/rest/v1/megamenu_links?select=category_key,label,type,label_en,label_zh&is_active=eq.true&order=sort_order.asc`,
        { headers, next },
      ),
      fetch(`${url}/rest/v1/megamenu_editorial?select=category_key,title,image,title_en,title_zh`, {
        headers,
        next,
      }),
    ]);

    if (!linksRes.ok || !editorialRes.ok) {
      console.error(
        `[megamenu] Supabase returned ${linksRes.status}/${editorialRes.status}, falling back to bundled copy`,
      );
      return EMPTY;
    }

    const linkRows = (await linksRes.json()) as unknown;
    const editorialRows = (await editorialRes.json()) as unknown;
    if (!Array.isArray(linkRows) || !Array.isArray(editorialRows)) {
      console.error("[megamenu] unexpected response shape, falling back to bundled copy");
      return EMPTY;
    }

    const linksByKey: Record<string, MegaMenuLinkContent[]> = {};
    for (const row of linkRows as LinkRow[]) {
      const list = (linksByKey[row.category_key] ??= []);
      list.push({
        label: pick(locale, row.label, row.label_en, row.label_zh),
        type: row.type ?? undefined,
      });
    }

    const editorialByKey: Record<string, MegaMenuEditorialContent> = {};
    for (const row of editorialRows as EditorialRow[]) {
      editorialByKey[row.category_key] = {
        title: pick(locale, row.title, row.title_en, row.title_zh),
        image: row.image,
      };
    }

    return { linksByKey, editorialByKey };
  } catch (err) {
    console.error("[megamenu] Supabase fetch failed, falling back to bundled copy:", err);
    return EMPTY;
  }
}
