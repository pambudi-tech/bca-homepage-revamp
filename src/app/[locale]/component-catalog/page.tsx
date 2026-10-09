import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getImageBackdropColor } from "@/lib/image-color";
import { insightAssets } from "@/components/prioritas/wealth-insight-assets";
import ComponentCatalog from "@/components/catalog/ComponentCatalog";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "componentCatalog" });
  return { title: t("title"), description: t("subtitle"), robots: { index: false, follow: false } };
}

export default async function ComponentCatalogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const wealthBackdrops = Object.fromEntries(await Promise.all(
    [insightAssets.house[0], insightAssets.market[0]].map(async asset => [asset.key, await getImageBackdropColor(asset.image)])
  ));
  return <ComponentCatalog wealthBackdrops={wealthBackdrops} />;
}
