import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import SiteMap from '@/components/site-map/SiteMap';
import { buildSiteMap } from '@/components/site-map/site-map-data';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'siteMap' });
  return { title: t('title'), description: t('subtitle'), robots: { index: false, follow: false } };
}

export default async function SiteMapPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SiteMap nodes={buildSiteMap()} />;
}
