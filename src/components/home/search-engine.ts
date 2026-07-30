// Ranking engine for the search-recommendation dropdown.
//
// Three things a plain substring filter can't do, in order of how much they
// matter here:
//
//   1. RELATED WORDS — "rumah" finds KPR, "nabung" finds Tahapan, "cuan" finds
//      Reksa Dana. Driven by the concept graph in search-synonyms.ts.
//   2. RANKING — with ~60 products, "kartu" matches a dozen records. The best
//      one has to come first, not whichever happens to sit earliest in the array.
//   3. TYPO TOLERANCE — "kredid", "tahapn", "mybca" vs "my bca". One edit of
//      slack on words long enough for it to be unambiguous.
//
// Scoring is tiered so the tiers can't invert: a literal title hit always
// outranks a related-word hit, which always outranks a fuzzy hit. Adding
// synonyms therefore can never demote an exact match.

import { MULTIWORD_TERMS, STOPWORDS, relatedTerms } from "./search-synonyms";

/** Anything rankable: the text fields the engine reads off a record. */
export type Searchable = {
  /** Primary label — weighted highest. */
  title: string;
  /** Supporting copy. Weighted low; it's long, so it matches easily. */
  description?: string;
  /**
   * Hand-written concept keywords ("rumah", "cicilan") for the record. This is
   * where a record opts into intent matching beyond its own wording.
   */
  tags?: string[];
  /** Tie-breaker for equal scores — higher wins. Popular records sit higher. */
  weight?: number;
};

/* ---------------------------------------------------------------------------
 * Normalization
 * ------------------------------------------------------------------------- */

/** Lowercase, strip accents, collapse punctuation to single spaces. */
export function normalize(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function tokenize(input: string): string[] {
  return normalize(input)
    .split(" ")
    .filter((t) => t.length > 0);
}

/**
 * Indonesian affixes, stripped only when the result is still a real word (≥4
 * chars). Turns "menabung"→"nabung", "pembayaran"→"bayar", "pinjaman"→"pinjam",
 * so the concept graph can hold one form instead of six. Deliberately shallow —
 * a full stemmer would mangle product names like "Tapres" or "Sakuku".
 */
const PREFIXES = ["meng", "meny", "mem", "men", "me", "peng", "pem", "pen", "pe", "ber", "ter", "di", "ke"];
const SUFFIXES = ["kannya", "annya", "nya", "kan", "an", "i"];

function stem(token: string): string {
  let word = token;
  for (const suffix of SUFFIXES) {
    if (word.endsWith(suffix) && word.length - suffix.length >= 4) {
      word = word.slice(0, -suffix.length);
      break;
    }
  }
  for (const prefix of PREFIXES) {
    if (word.startsWith(prefix) && word.length - prefix.length >= 4) {
      word = word.slice(prefix.length);
      break;
    }
  }
  return word;
}

/**
 * Whole-word containment. Both sides are already normalized to single-spaced
 * lowercase, so word boundaries are just spaces and string ends.
 *
 * Raw `.includes()` matches inside words, which is wrong far more often than
 * it's right: "cuan" would hit "acuan", "ori" would hit "kategori", "atm" would
 * hit "otomatis". Every phrase-level comparison below goes through this.
 */
function containsPhrase(haystack: string, needle: string): boolean {
  if (!needle || !haystack) return false;
  if (haystack === needle) return true;
  return (
    haystack.startsWith(`${needle} `) ||
    haystack.endsWith(` ${needle}`) ||
    haystack.includes(` ${needle} `)
  );
}

/** Levenshtein capped at `max` — bails out early instead of filling a matrix. */
function withinEditDistance(a: string, b: string, max: number): boolean {
  if (Math.abs(a.length - b.length) > max) return false;
  if (a === b) return true;

  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const value = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
      curr.push(value);
      if (value < rowMin) rowMin = value;
    }
    if (rowMin > max) return false; // no cell in this row can recover
    prev = curr;
  }
  return prev[b.length] <= max;
}

/* ---------------------------------------------------------------------------
 * Query parsing
 * ------------------------------------------------------------------------- */

type ParsedQuery = {
  /** Full normalized query, e.g. "kartu kredit". */
  phrase: string;
  /** Meaningful tokens (stopwords dropped). */
  tokens: string[];
  /** Related terms per token, from the concept graph. */
  related: Set<string>;
};

export function parseQuery(raw: string): ParsedQuery {
  const phrase = normalize(raw);
  const all = tokenize(raw);
  const tokens = all.filter((t) => !STOPWORDS.has(t));
  const related = new Set<string>();

  // Phrase-level concepts first: "kirim uang" is one intent, not two tokens.
  for (const term of MULTIWORD_TERMS) {
    if (phrase.includes(term)) {
      for (const r of relatedTerms(term)) related.add(r);
    }
  }

  for (const token of tokens) {
    for (const r of relatedTerms(token)) related.add(r);
    const stemmed = stem(token);
    if (stemmed !== token) {
      for (const r of relatedTerms(stemmed)) related.add(r);
    }
  }

  // A token that's only a stopword-free rewrite of the whole query shouldn't
  // also count as its own related term.
  for (const token of tokens) related.delete(token);

  return { phrase, tokens: tokens.length > 0 ? tokens : all, related };
}

/* ---------------------------------------------------------------------------
 * Scoring
 * ------------------------------------------------------------------------- */

const SCORE = {
  titleExact: 120,
  titlePrefix: 70,
  titlePhrase: 50,
  tagPhrase: 34,
  descPhrase: 22,
  titleToken: 14,
  // An exact hit on a curated tag beats a partial hit on a title word: someone
  // typing "mobil" wants KKB (tagged "mobil"), not BCA mobile (title prefix).
  tagToken: 12,
  titleTokenPrefix: 8,
  descToken: 4,
  relatedTitle: 6,
  relatedTag: 4,
  relatedDesc: 2,
  fuzzy: 3,
} as const;

/** Minimum share of query tokens a record must account for to be shown. */
const COVERAGE_THRESHOLD = 0.5;

function scoreOne(item: Searchable, query: ParsedQuery): number {
  const title = normalize(item.title);
  const description = normalize(item.description ?? "");
  const tags = (item.tags ?? []).map(normalize);
  const titleTokens = title.split(" ");
  const descTokens = new Set(description.split(" "));

  let score = 0;

  // --- Phrase tier: the whole query as one string ------------------------
  // Strongest field only, never the sum. Title, tags and description are three
  // views of the same evidence ("this record is about X"); adding them up lets a
  // record that merely *mentions* "kartu" everywhere outrank the record that IS
  // Kartu Kredit BCA, because 50+34+22 beats a 70-point title-prefix hit.
  if (query.phrase) {
    let phraseScore = 0;
    if (title === query.phrase) phraseScore = SCORE.titleExact;
    else if (title.startsWith(`${query.phrase} `)) phraseScore = SCORE.titlePrefix;
    else if (containsPhrase(title, query.phrase)) phraseScore = SCORE.titlePhrase;

    if (tags.some((t) => containsPhrase(t, query.phrase))) {
      phraseScore = Math.max(phraseScore, SCORE.tagPhrase);
    }
    if (containsPhrase(description, query.phrase)) {
      phraseScore = Math.max(phraseScore, SCORE.descPhrase);
    }
    score += phraseScore;
  }

  // --- Token tier: each query word independently -------------------------
  let matchedTokens = 0;
  for (const token of query.tokens) {
    const stemmed = stem(token);
    let hit = false;

    if (titleTokens.includes(token)) {
      score += SCORE.titleToken;
      hit = true;
    } else if (titleTokens.some((t) => t.startsWith(token) || t.startsWith(stemmed))) {
      score += SCORE.titleTokenPrefix;
      hit = true;
    }

    if (tags.includes(token) || tags.includes(stemmed)) {
      score += SCORE.tagToken;
      hit = true;
    } else if (tags.some((t) => containsPhrase(t, token))) {
      // Token appears as a word inside a multi-word tag ("mobil" in "mobil bekas").
      score += SCORE.tagToken / 2;
      hit = true;
    }

    if (descTokens.has(token) || descTokens.has(stemmed)) {
      score += SCORE.descToken;
      hit = true;
    }

    // Typo fallback — only for words long enough that one edit isn't ambiguous.
    if (!hit && token.length >= 5) {
      const near =
        titleTokens.some((t) => t.length >= 4 && withinEditDistance(t, token, 1)) ||
        tags.some((t) => t.length >= 4 && withinEditDistance(t, token, 1));
      if (near) {
        score += SCORE.fuzzy;
        hit = true;
      }
    }

    if (hit) matchedTokens++;
  }

  // --- Related tier: concept-graph expansions ----------------------------
  // Scored per hit but capped, so a record with 20 overlapping tags can't
  // out-earn a record whose title literally matches.
  let relatedScore = 0;
  for (const term of query.related) {
    if (containsPhrase(title, term)) relatedScore += SCORE.relatedTitle;
    else if (tags.includes(term)) relatedScore += SCORE.relatedTag;
    else if (containsPhrase(description, term)) relatedScore += SCORE.relatedDesc;
  }
  const relatedHit = relatedScore > 0;
  score += Math.min(relatedScore, SCORE.titlePhrase - 1);

  // A record still has to explain enough of the query. Without this, one shared
  // concept word would surface records that clearly aren't what was asked for.
  const coverage = query.tokens.length === 0 ? 1 : matchedTokens / query.tokens.length;
  if (coverage < COVERAGE_THRESHOLD && !relatedHit) return 0;
  if (matchedTokens === 0 && !relatedHit) return 0;

  return score + (item.weight ?? 0);
}

/**
 * Ranks `items` against `keyword`, best first, dropping non-matches, and
 * keeps each item's score alongside it. Used when the caller needs to compare
 * how strong one group's best match is against another group's (e.g. deciding
 * whether "Promo Terkait" should outrank "Produk Terkait" for a given query).
 *
 * Ties break on the record's own `weight`, then on original array order — so
 * equally-relevant records stay in the curated order the dataset declares.
 */
export function rankBySearchScored<T extends Searchable>(
  items: T[],
  keyword: string,
  limit?: number,
): { item: T; score: number }[] {
  const query = parseQuery(keyword);
  if (!query.phrase) {
    const base = limit != null ? items.slice(0, limit) : items;
    return base.map((item) => ({ item, score: 0 }));
  }

  const scored = items
    .map((item, index) => ({ item, index, score: scoreOne(item, query) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index);

  const limited = limit != null ? scored.slice(0, limit) : scored;
  return limited.map(({ item, score }) => ({ item, score }));
}

/**
 * Ranks `items` against `keyword`, best first, dropping non-matches.
 *
 * Ties break on the record's own `weight`, then on original array order — so
 * equally-relevant records stay in the curated order the dataset declares.
 */
export function rankBySearch<T extends Searchable>(items: T[], keyword: string, limit?: number): T[] {
  return rankBySearchScored(items, keyword, limit).map((entry) => entry.item);
}
