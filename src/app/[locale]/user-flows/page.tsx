import type { Metadata } from 'next';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import UserFlows from '@/components/user-flows/UserFlows';
import { createFlowPages } from '@/components/user-flows/flow-pages';
import { getKursDetail } from '@/lib/kurs-detail';
import { findNearby } from '../../../../archive/lokasi-bca/locations';
import { DEFAULT_ORIGIN } from '../../../../archive/lokasi-bca/location-data';

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'userFlows' });
  return { title: t('title'), description: t('subtitle'), robots: { index: false, follow: false } };
}

export default async function UserFlowsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const languageLocale = locale === 'id' ? 'en' : 'id';
  const [kurs, pages, languageMessages] = await Promise.all([getKursDetail(), createFlowPages(locale), getMessages({ locale: languageLocale })]);
  const nearby = findNearby(DEFAULT_ORIGIN.lat, DEFAULT_ORIGIN.lng);
  return <UserFlows previewData={{ ...kurs, pages, languageLocale, languageMessages, locations: { ...nearby, results: nearby.results.slice(0, 3), pins: [] } }} />;
}
