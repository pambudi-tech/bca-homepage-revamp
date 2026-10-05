import { setRequestLocale } from "next-intl/server";
import BankingSolutionIndexExperience from "@/components/prioritas/BankingSolutionIndexExperience";
import { insightAssets } from "@/components/prioritas/wealth-insight-assets";
import { getImageBackdropColor } from "@/lib/image-color";

export default async function SolitaireWealthInsightPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const cards = [...insightAssets.house, ...insightAssets.market];
  const backdrops = Object.fromEntries(await Promise.all(
    cards.map(async ({ key, image }) => [key, await getImageBackdropColor(image)] as const)
  ));
  return <BankingSolutionIndexExperience activeTab="wealth" backdrops={backdrops} publicBasePath="/solitaire" />;
}
