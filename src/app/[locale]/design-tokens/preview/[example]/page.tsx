import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import PrioritasPage from '@/app/[locale]/prioritas/page';
import PublicPrivilegePage from '@/components/prioritas/PublicPrivilegePage';
import PartnerPrivilegeDetailPage from '@/components/prioritas/PartnerPrivilegeDetailPage';
import { FrozenPagePreview } from '@/components/design-tokens/BreakpointPreview';
import { breakpointExamples } from '@/components/design-tokens/breakpoint-examples';
import { routing } from '@/i18n/routing';

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap(locale => breakpointExamples.map(example => ({ locale, example })));
}

export default async function BreakpointExamplePage({ params }: { params: Promise<{ locale: string; example: string }> }) {
  const { locale, example } = await params;
  setRequestLocale(locale);
  if (!breakpointExamples.some(value => value === example)) notFound();
  return <FrozenPagePreview>
    {example === 'homepage' ? <PrioritasPage params={Promise.resolve({ locale })} />
      : example === 'index' ? <PublicPrivilegePage brand="prioritas" />
        : <PartnerPrivilegeDetailPage locale={locale} partnerId="executive-airport-lounge" section="signature" />}
  </FrozenPagePreview>;
}
