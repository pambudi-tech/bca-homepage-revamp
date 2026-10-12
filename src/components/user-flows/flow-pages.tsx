import PrioritasPage from '@/app/[locale]/prioritas/page';
import SolitairePage from '@/app/[locale]/solitaire/page';
import MemberOverview from '@/components/prioritas/MemberOverview';
import { buildPartnerPrivilegeDetail } from '@/components/prioritas/PartnerPrivilegeDetailPage';
import { getPrioritasSourceEvents } from '@/lib/prioritas-source-data';
import { getPrivilegePromos } from '@/lib/partner-privileges';
import type { FlowBrand } from './flow-data';
import type { ReactNode } from 'react';
import type { PartnerDetailViewData } from '@/components/prioritas/PartnerPrivilegeDetailView';
import BankingPrivilegeDetailPage from '@/components/prioritas/BankingPrivilegeDetailPage';
import BrandInformationPage from '@/components/prioritas/BrandInformationPage';
import BrandContactPage from '@/components/prioritas/BrandContactPage';
import PrioritasMemberHeader from '@/components/prioritas/PrioritasMemberHeader';
import { getTranslations } from 'next-intl/server';
import HeroSection from '@/components/home/HeroSection';
import Navbar from '@/components/home/Navbar';
import Home from '@/app/[locale]/page';
import PublicBankingSolutionPage from '@/components/prioritas/PublicBankingSolutionPage';

export type FlowPageSnapshots = Record<FlowBrand, { home: ReactNode; individualHome: ReactNode; languageHome: ReactNode; overview: ReactNode; banking: ReactNode; wealth: ReactNode; bankingDetail: ReactNode; documents: ReactNode; contact: ReactNode; contactDisclosure: ReactNode; magazineHeader: ReactNode; detail: PartnerDetailViewData; restricted: PartnerDetailViewData; memberDetail: PartnerDetailViewData; transfer: PartnerDetailViewData; medical: PartnerDetailViewData }>;

// The locale outcome uses the owning homepage hero and navigation with copy in
// the selected target language. It never changes the documentation's locale.
async function languageHome(brand: FlowBrand, locale: string) {
  const t = await getTranslations({ locale, namespace: brand === 'prioritas' ? 'prioritasHero' : 'solitaireHero' });
  return <div className="relative"><Navbar variant={brand} /><HeroSection brandedHomepage slides={[{
    image: brand === 'prioritas' ? '/assets/prioritas/hero-banner.webp' : '/assets/soliprio/solitaire-image.webp',
    alt: t('bannerAlt'), title: t('title'),
    cta: { label: t('cta'), icon: '/assets/cycle1/chevron-right-1.svg', variant: 'primary', tone: brand },
    brandMark: { src: brand === 'prioritas' ? '/assets/prioritas/logo.svg' : '/assets/soliprio/solitaire-logo.svg', alt: t(brand === 'prioritas' ? 'prioritasLogoAlt' : 'solitaireLogoAlt') },
  }]} /></div>;
}

// Render the real owning page components on the server. This keeps their layout,
// assets and data in sync with the routes without mounting an iframe or invoking auth.
export async function createFlowPages(locale: string): Promise<FlowPageSnapshots> {
  const individualHome = await Home({ params: Promise.resolve({ locale }) });
  const entries = await Promise.all((['prioritas', 'solitaire'] as const).map(async brand => {
    const [home, translatedHome, overview, detail, restricted, memberDetail, transfer, medical, bankingDetail, documents, contact, contactDisclosure, magazineHeader, banking, wealth] = await Promise.all([
      (brand === 'prioritas' ? PrioritasPage : SolitairePage)({ params: Promise.resolve({ locale }) }),
      languageHome(brand, locale === 'id' ? 'en' : 'id'),
      MemberOverview({ events: getPrioritasSourceEvents(), promos: getPrivilegePromos('lifestyle'), now: new Date(), previewBrand: brand }),
      buildPartnerPrivilegeDetail({ locale, section: 'signature', partnerId: 'executive-airport-lounge', publicBasePath: `/${brand}`, preview: { brand } }),
      buildPartnerPrivilegeDetail({ locale, section: 'signature', partnerId: 'medical-check-up-internasional', publicBasePath: `/${brand}`, preview: { brand } }),
      buildPartnerPrivilegeDetail({ locale, section: 'signature', partnerId: 'executive-airport-lounge', memberArea: true, publicBasePath: `/${brand}`, preview: { brand, member: true } }),
      buildPartnerPrivilegeDetail({ locale, section: 'signature', partnerId: 'airport-transfer-domestik', memberArea: true, publicBasePath: `/${brand}`, preview: { brand, member: true } }),
      buildPartnerPrivilegeDetail({ locale, section: 'signature', partnerId: 'medical-check-up-internasional', memberArea: true, publicBasePath: `/${brand}`, preview: { brand, member: true } }),
      BankingPrivilegeDetailPage({ locale, benefitId: 'kkb', publicBasePath: `/${brand}`, preview: { brand } }),
      BrandInformationPage({ brand, page: 'terms', preview: true }),
      BrandContactPage({ brand }),
      BrandContactPage({ brand, previewDisclosure: true }),
      PrioritasMemberHeader({ activeTab: 'magazine', title: (await getTranslations({ locale, namespace: 'magazineIndex' }))('title'), previewBrand: brand }),
      PublicBankingSolutionPage({ brand }),
      PublicBankingSolutionPage({ brand, section: 'wealth' }),
    ]);
    return [brand, { home, individualHome, languageHome: translatedHome, overview, detail, restricted, memberDetail, transfer, medical, banking, wealth, bankingDetail, documents, contact, contactDisclosure, magazineHeader }] as const;
  }));
  return Object.fromEntries(entries) as FlowPageSnapshots;
}
