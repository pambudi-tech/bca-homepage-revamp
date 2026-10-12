'use client';

import { useTranslations } from 'next-intl';
import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import BrandPageSurface from './BrandPageSurface';
import PrioritasDetailSubnav from './PrioritasDetailSubnav';
import PrioritasPageHeader from './PrioritasPageHeader';
import PrioritasIndexTabs, { type PrioritasIndexTab } from './PrioritasIndexTabs';
import SignaturePrivilegeExperience from './SignaturePrivilegeExperience';
import EventPrivilegeExperience from './EventPrivilegeExperience';
import type { Promo } from '@/components/home/promo-data';
import type { EventPromo } from './event-data';
import type { PrivilegePromo } from '@/lib/partner-privileges';

type Props = {
  brand: 'prioritas' | 'solitaire';
  activeSection: PrioritasIndexTab;
  promos: Promo[];
  signaturePromos: PrivilegePromo[];
  events: EventPromo[];
  bannerBackdrops: Record<string, string>;
  now: string;
  preview?: { query?: string; page?: number; birthday?: boolean; categories?: string[]; directoryOnly?: boolean };
};

/** The same page composition serves the public route and frozen documentation. */
export default function PublicPrivilegeView({ brand, activeSection, promos, signaturePromos, events, bannerBackdrops, now, preview }: Props) {
  const t = useTranslations('signaturePrivilege');
  const brandT = useTranslations('nav.segments');
  const basePath = `/${brand}`;
  return <>
    <div className="relative">
      <Navbar variant={brand} disableHideShow keepTransparentOnScroll={activeSection === 'lifestyle'} />
      <PrioritasDetailSubnav label={t('subNavLabel')} privilege={t('subNav.privilege')} banking={t('subNav.banking')} magazine={t('subNav.magazine')} active="privilege" basePath={basePath} tone={brand} />
      <PrioritasPageHeader breadcrumbs={[
        { label: brandT(brand === 'solitaire' ? 'Solitaire' : 'Prioritas'), href: basePath },
        { label: t('subNav.privilege'), href: `${basePath}/privilege` },
        { label: t(activeSection === 'signature' ? 'publicSignatureTab' : `tabs.${activeSection}`) },
      ]} title={activeSection === 'event' || activeSection === 'promo' ? t('eventPromoTitle') : t('title')} tone={brand} />
    </div>
    <BrandPageSurface tone={brand}>
      <PrioritasIndexTabs activeTab={activeSection} basePath={basePath} tone={brand} />
      {activeSection === 'event' ? <EventPrivilegeExperience key={activeSection} promos={events} bannerBackdrops={bannerBackdrops} publicBasePath={basePath} />
        : <SignaturePrivilegeExperience key={activeSection} promos={promos} signaturePromos={signaturePromos} now={new Date(now)} directoryOnly={preview?.directoryOnly ?? activeSection !== 'signature'} activeTab={activeSection} publicBasePath={basePath} initialCategories={preview?.categories} preview={preview} />}
    </BrandPageSurface>
    <Footer key={activeSection} variant="prioritas" tone={brand} hideMagazineLink={brand === 'solitaire'} />
  </>;
}
