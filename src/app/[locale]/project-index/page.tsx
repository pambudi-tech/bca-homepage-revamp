import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import ProjectIndex from '@/components/docs/ProjectIndex';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'projectIndex' });
  return { title: t('pageTitle'), description: t('subtitle'), robots: { index: false, follow: false } };
}

export default async function ProjectIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ProjectIndex />;
}
