import { NEWS_CATEGORY_SEEDS, type NewsCategory } from "@/components/home/news-data";

// The columns we select from the Supabase `news` table, embedded under their
// channel.
type ArticleRow = {
  title: string;
  image: string;
  published_at: string;
  category: string;
  href: string;
  is_highlight: boolean;
};

type ChannelRow = {
  key: string;
  label: string;
  news: ArticleRow[];
};

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
export async function getNewsCategories(): Promise<NewsCategory[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NEWS_CATEGORY_SEEDS;

  const query = [
    "select=key,label,news(title,image,published_at,category,href,is_highlight)",
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

  try {
    const res = await fetch(`${url}/rest/v1/news_channels?${query}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      // Re-fetch at most every 5 minutes; edits in Supabase show up after that.
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      console.error(`[news] Supabase returned ${res.status}, using bundled fallback`);
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
          title: a.title,
          image: a.image,
          date: formatDate(a.published_at),
          category: a.category,
          href: a.href,
        }));
        // Ordering di atas sudah menaruh baris yang di-pin di indeks 0; kalau
        // kanal ini tidak punya pin, indeks 0 adalah artikel terbaru.
        return {
          key: r.key,
          label: r.label,
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
