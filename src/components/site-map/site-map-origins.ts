import type { SiteOrigin } from './site-map-types';

// Migration decisions supplied by the project owner. Links are existing category
// pages, not inferred one-to-one detail URLs. Both revamp brands share this origin.
const base = 'https://prioritas.bca.co.id';
const sources = {
  home: { label: 'home', href: `${base}/` },
  login: { label: 'login', href: `${base}/en/Login` },
  magazine: { label: 'magazine', href: `${base}/en/E-Magazine` },
  financial: { label: 'financial', href: `${base}/en/laporan-finansial/` },
  partner: { label: 'partner', href: `${base}/en/Privilege/Partner-Privilege` },
  banking: { label: 'banking', href: `${base}/en/Privilege/BCA-Privilege` },
  promo: { label: 'promo', href: `${base}/en/Privilege/Promo` },
  updates: { label: 'updates', href: `${base}/en/Wealth-Management/Wealth-Updates` },
  house: { label: 'house', href: `${base}/en/Wealth-Management/Market-Insight/House-View-Report` },
  weekly: { label: 'weekly', href: `${base}/en/Wealth-Management/Market-Insight/Weekly-Market-Overview` },
  kurs: { label: 'kurs', href: `${base}/en/Kurs-Detail` },
  locations: { label: 'locations', href: `${base}/en/Temukan-Kami` },
  about: { label: 'about', href: `${base}/en/Tentang-Kami` },
  riplay: { label: 'riplay', href: `${base}/en/Riplay` },
  terms: { label: 'terms', href: `${base}/en/Ketentuan` },
  privacy: { label: 'privacy', href: `${base}/en/Kebijakan-Privasi` },
  contact: { label: 'contact', href: `${base}/en/Hubungi-Kami` },
};
const partner: SiteOrigin = { status: 'split', note: 'partner', previousName: 'Partner Privilege', sources: [sources.partner] };
const banking: SiteOrigin = { status: 'renamed', note: 'banking', previousName: 'BCA Privilege', sources: [sources.banking] };
const promo: SiteOrigin = { status: 'combined', note: 'promo', sources: [sources.promo, sources.updates] };
const origins: Record<string, SiteOrigin> = {
  home: { status: 'retained', note: 'home', sources: [sources.home] },
  overview: { status: 'newPage', note: 'overview', sources: [] },
  financial: { status: 'moved', note: 'financial', previousName: 'Laporan Finansial', sources: [sources.financial] },
  portfolio: { status: 'moved', note: 'financialTab', sources: [sources.financial] },
  tax: { status: 'moved', note: 'financialTab', sources: [sources.financial] },
  login: { status: 'retained', note: 'login', sources: [sources.login] },
  magazine: { status: 'renamed', note: 'magazine', previousName: 'Majalah Prioritas', sources: [sources.magazine] },
  privilege: { status: 'combined', note: 'privilege', sources: [sources.partner, sources.promo, sources.updates] },
  signatureTab: partner,
  signatureDetail: { ...partner, note: 'signature' },
  complimentaryDetail: { ...partner, note: 'complimentary' },
  lifestyle: { ...partner, note: 'lifestyle' },
  lifestyleDetail: { ...partner, note: 'lifestyle' },
  event: { status: 'split', note: 'event', previousName: 'Promo', sources: [sources.promo] },
  eventDetail: { status: 'split', note: 'event', previousName: 'Promo', sources: [sources.promo] },
  promo,
  promoDetail: promo,
  banking: { status: 'new', note: 'bankingHub', sources: [sources.banking, sources.house, sources.weekly, sources.kurs] },
  bankingTab: banking,
  bankingDetail: banking,
  wealth: { status: 'renamed', note: 'wealth', previousName: 'Market Insight', sources: [sources.house, sources.weekly] },
  kurs: { status: 'moved', note: 'kurs', sources: [sources.kurs] },
  about: { status: 'moved', note: 'footer', sources: [sources.about] },
  locations: { status: 'moved', note: 'footer', sources: [sources.locations] },
  riplay: { status: 'moved', note: 'footer', sources: [sources.riplay] },
  terms: { status: 'moved', note: 'footer', sources: [sources.terms] },
  privacy: { status: 'moved', note: 'footer', sources: [sources.privacy] },
  contact: { status: 'moved', note: 'footer', sources: [sources.contact] },
};

export function getSiteOrigin(label: string): SiteOrigin | undefined {
  return origins[label];
}

