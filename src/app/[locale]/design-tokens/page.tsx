import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import DesignTokens from '@/components/design-tokens/DesignTokens';
import { getDesignTokens } from '@/components/design-tokens/token-data';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'designTokens' });
  return { title: t('title'), description: t('subtitle'), robots: { index: false, follow: false } };
}

export default async function DesignTokensPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <DesignTokens data={await getDesignTokens()} />;
}
