import { Suspense } from 'react';
import PublicBankingSolutionView from './PublicBankingSolutionView';
import PublicBankingSolutionRouter from './PublicBankingSolutionRouter';
import { insightAssets } from './wealth-insight-assets';
import { getImageBackdropColor } from '@/lib/image-color';

export default async function PublicBankingSolutionPage({ brand, section }: { brand: 'prioritas' | 'solitaire'; section?: string | string[] }) {
  const cards = [...insightAssets.house, ...insightAssets.market];
  const backdrops = Object.fromEntries(await Promise.all(cards.map(async ({ key, image }) => [key, await getImageBackdropColor(image)] as const)));
  const activeSection = section === 'wealth' ? 'wealth' : 'privilege';
  if (section !== undefined) return <PublicBankingSolutionView brand={brand} activeSection={activeSection} backdrops={backdrops} />;
  return <Suspense fallback={<PublicBankingSolutionView brand={brand} activeSection="privilege" backdrops={backdrops} />}>
    <PublicBankingSolutionRouter brand={brand} backdrops={backdrops} />
  </Suspense>;
}
