import { NEWS_CATEGORY_SEEDS, type NewsCategory } from "@/components/home/news-data";
import type { AppLocale } from "@/i18n/routing";

// The columns we select from the Supabase `news` table, embedded under their
// channel. `_en`/`_zh` are optional translations — null until a row has been
// translated, same convention as `products.ts`/`faq.ts`.
type ArticleRow = {
  title: string;
  title_en?: string | null;
  title_zh?: string | null;
  image: string;
  published_at: string;
  category: string;
  category_en?: string | null;
  category_zh?: string | null;
  href: string;
  is_highlight: boolean;
};

type ChannelRow = {
  key: string;
  label: string;
  label_en?: string | null;
  label_zh?: string | null;
  news: ArticleRow[];
};

/** Picks the translated value for `locale`, falling back to the Indonesian default. */
function pick(locale: AppLocale, id: string, en?: string | null, zh?: string | null): string {
  return (locale === "en" ? en : locale === "zh" ? zh : null) ?? id;
}

/** "2026-07-15" → "15 Jul 2026" — the format the cards render. */
const DATE_FORMAT = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : DATE_FORMAT.format(d);
}

/**
 * Reads the Kabar & Wawasan channels (News & Feature, EdukaTips, #AwasModus)
 * and their articles from Supabase. Same approach as `products.ts` — Supabase's
 * auto-generated REST API over plain `fetch`, with the articles embedded in the
 * channel row so it stays a single request.
 *
 * Falls back to the bundled seeds whenever Supabase isn't configured, the
 * request fails, or the data is unusable, so the section never renders empty.
 */
export async function getNewsCategories(locale: AppLocale): Promise<NewsCategory[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NEWS_CATEGORY_SEEDS;

  const query = (channelFields: string, articleFields: string) =>
    [
      `select=${channelFields},news(${articleFields})`,
      "is_active=eq.true",
      "order=sort_order.asc",
      // Ordering/filtering the embedded rows needs its own prefixed params.
      "news.is_active=eq.true",
      // Highlight dulu, lalu terbaru — supaya artikel yang di-pin tetap ikut
      // terbawa walau tanggalnya jatuh di luar 8 teratas.
      "news.order=is_highlight.desc,published_at.desc",
      // The section renders one highlight plus a short list; 8 is what the
      // source channels surface and leaves room for "Lihat Lebih Banyak".
      "news.limit=8",
    ].join("&");

  const request = (channelFields: string, articleFields: string) =>
    fetch(`${url}/rest/v1/news_channels?${query(channelFields, articleFields)}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      // Re-fetch at most every 5 minutes; edits in Supabase show up after that.
      next: { revalidate: 300 },
    });

  try {
    // Ask for the i18n columns first and step down if the migration adding
    // them hasn't been run yet, same staged-degrade approach as products.ts —
    // otherwise a missing column 400s the whole request back to bundled data.
    const CHANNEL_FULL = "key,label,label_en,label_zh";
    const CHANNEL_BASE = "key,label";
    const ARTICLE_FULL = "title,title_en,title_zh,image,published_at,category,category_en,category_zh,href,is_highlight";
    const ARTICLE_BASE = "title,image,published_at,category,href,is_highlight";

    let res = await request(CHANNEL_FULL, ARTICLE_FULL);
    if (!res.ok) res = await request(CHANNEL_BASE, ARTICLE_FULL);
    if (!res.ok) res = await request(CHANNEL_FULL, ARTICLE_BASE);
    if (!res.ok) res = await request(CHANNEL_BASE, ARTICLE_BASE);
    if (!res.ok) {
      console.error(`[news] Supabase returned ${res.status} on every fallback query, using bundled fallback`);
      return NEWS_CATEGORY_SEEDS;
    }

    const data: unknown = await res.json();
    if (!Array.isArray(data)) {
      console.error("[news] unexpected response shape, using bundled fallback");
      return NEWS_CATEGORY_SEEDS;
    }
    const rows = data as ChannelRow[];

    // A channel with no articles would render an empty tab, so drop it here
    // rather than letting it reach the section.
    const categories = rows
      .filter((r) => r.news?.length)
      .map((r) => {
        const items = r.news.map((a) => ({
          title: pick(locale, a.title, a.title_en, a.title_zh),
          image: a.image,
          date: formatDate(a.published_at),
          category: pick(locale, a.category, a.category_en, a.category_zh),
          href: a.href,
        }));
        // Ordering di atas sudah menaruh baris yang di-pin di indeks 0; kalau
        // kanal ini tidak punya pin, indeks 0 adalah artikel terbaru.
        return {
          key: r.key,
          label: pick(locale, r.label, r.label_en, r.label_zh),
          highlight: items[0],
          articles: items.slice(1),
        };
      });

    if (!categories.length) {
      console.error("[news] no usable rows after filtering, using bundled fallback");
      return NEWS_CATEGORY_SEEDS;
    }
    return categories;
  } catch (err) {
    console.error("[news] Supabase fetch failed, using bundled fallback:", err);
    return NEWS_CATEGORY_SEEDS;
  }
}
