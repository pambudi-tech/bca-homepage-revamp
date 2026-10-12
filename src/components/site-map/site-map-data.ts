import { getSiteOrigin } from './site-map-origins';
import { privilegeDetailBase } from "@/lib/privilege-paths";
import { getPrivilegePromos } from '@/lib/partner-privileges';
import { getPrioritasSourceEvents, getPrioritasSourcePromos } from '@/lib/prioritas-source-data';
import { bankingPrivilegeItems } from '@/components/prioritas/banking-privilege-data';
import type { MapArea, NodeKind, SiteNode } from './site-map-types';

// Route families, rather than every partner/content record. Sample destinations
// come from the same bundled registries used by the detail routes.
export function buildSiteMap(): SiteNode[] {
  const signature = getPrivilegePromos('signature')[0].id;
  const complimentary = getPrivilegePromos('complimentary')[0].id;
  const lifestyle = getPrivilegePromos('lifestyle')[0].id;
  const banking = bankingPrivilegeItems[0].id;
  const event = getPrioritasSourceEvents()[0].id;
  const promo = getPrioritasSourcePromos()[0].id;

  return (['prioritas', 'solitaire'] as const).flatMap(brand => {
    const base = `/${brand}`;
    const member = `${base}/member`;
    const node = (area: MapArea, label: string, kind: NodeKind, path: string, options: Partial<Pick<SiteNode, 'href' | 'note' | 'children'>> = {}): SiteNode => ({
      id: `${brand}-${area}-${label}`, brand, area, label, kind, path, href: path, origin: getSiteOrigin(label), ...options,
    });
    const detail = (area: MapArea, label: string, path: string, sample: string, note?: SiteNode['note']) => node(area, label, 'detail', path, { href: sample, note });

    const publicHome = node('public', 'home', 'home', base, { children: [
      node('public', 'privilege', 'directory', `${base}/privilege`, { children: [
        node('public', 'signatureTab', 'tab', `${base}/privilege?section=signature`, { children: [
          detail('public', 'signatureDetail', `${privilegeDetailBase(base, 'signature')}/[benefitId]`, `${privilegeDetailBase(base, 'signature')}/${signature}`),
          detail('public', 'complimentaryDetail', `${privilegeDetailBase(base, 'complimentary')}/[benefitId]`, `${privilegeDetailBase(base, 'complimentary')}/${complimentary}`),
        ] }),
        node('public', 'lifestyle', 'tab', `${base}/privilege?section=lifestyle`, { children: [
          detail('public', 'lifestyleDetail', `${base}/lifestyle-privilege/[benefitId]`, `${base}/lifestyle-privilege/${lifestyle}`),
        ] }),
        node('public', 'event', 'tab', `${base}/privilege?section=event`, { children: [
          detail('public', 'eventDetail', `${base}/event/[eventId]`, `${base}/event/${event}`),
        ] }),
        node('public', 'promo', 'tab', `${base}/privilege?section=promo`, { children: [
          detail('public', 'promoDetail', `${base}/promo/[promoId]`, `${base}/promo/${promo}`),
        ] }),
      ] }),
      node('public', 'banking', 'directory', `${base}/banking-solution`, { children: [
        node('public', 'bankingTab', 'tab', `${base}/banking-solution?section=privilege`, { children: [
          detail('public', 'bankingDetail', `${base}/banking-solution/privilege/[benefitId]`, `${base}/banking-solution/privilege/${banking}`),
        ] }),
        node('public', 'wealth', 'tab', `${base}/banking-solution?section=wealth`, { note: 'wealth' }),
        node('public', 'kurs', 'information', `${base}/banking-solution/kurs`),
      ] }),
      node('public', 'magazine', 'directory', `${base}/e-magazine`, { note: 'magazine' }),
      node('public', 'about', 'information', `${base}/tentang-kami`),
      node('public', 'locations', 'directory', `${base}/temukan-kami`),
      node('public', 'riplay', 'information', `${base}/riplay`),
      node('public', 'terms', 'information', `${base}/ketentuan`),
      node('public', 'privacy', 'information', `${base}/kebijakan-privasi`),
      node('public', 'contact', 'information', `${base}/hubungi-kami`),
    ] });

    const memberHome = node('member', 'overview', 'home', `${member}/overview`, { children: [
      node('member', 'privilege', 'directory', `${member}/privilege`, { children: [
        node('member', 'signatureTab', 'tab', `${member}/privilege?section=signature`, { children: [
          detail('member', 'signatureDetail', `${member}/privilege/[benefitId]`, `${member}/privilege/${signature}`, 'voucher'),
          detail('member', 'complimentaryDetail', `${member}/privilege/[benefitId]`, `${member}/privilege/${complimentary}`),
        ] }),
        node('member', 'lifestyle', 'tab', `${member}/privilege?section=lifestyle`, { children: [
          detail('member', 'lifestyleDetail', `${member}/lifestyle-privilege/[benefitId]`, `${member}/lifestyle-privilege/${lifestyle}`),
        ] }),
        node('member', 'event', 'tab', `${member}/privilege?section=event`, { children: [
          detail('member', 'eventDetail', `${member}/event/[eventId]`, `${member}/event/${event}`),
        ] }),
        node('member', 'promo', 'tab', `${member}/privilege?section=promo`, { children: [
          detail('member', 'promoDetail', `${member}/promo/[promoId]`, `${member}/promo/${promo}`),
        ] }),
      ] }),
      node('member', 'banking', 'directory', `${member}/banking-solution`, { children: [
        node('member', 'bankingTab', 'tab', `${member}/banking-solution?section=privilege`, { children: [
          detail('member', 'bankingDetail', `${member}/banking-solution/privilege/[benefitId]`, `${member}/banking-solution/privilege/${banking}`),
        ] }),
        node('member', 'wealth', 'tab', `${member}/banking-solution?section=wealth`, { note: 'wealth' }),
        node('member', 'kurs', 'information', `${member}/banking-solution/kurs`),
      ] }),
      node('member', 'magazine', 'directory', `${member}/e-magazine`, { note: 'magazine' }),
      node('member', 'financial', 'information', `${member}/financial-report`, { note: 'otp', children: [
        node('member', 'portfolio', 'tab', `${member}/financial-report`, { note: 'otp' }),
        node('member', 'tax', 'tab', `${member}/financial-report?report=tax`),
      ] }),
    ] });
    return [publicHome, node('member', 'login', 'login', `/member/login?from=${brand}`, { note: 'login' }), memberHome];
  });
}
