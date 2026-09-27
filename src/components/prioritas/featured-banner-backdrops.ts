import { FEATURED_BANNER_SLIDES } from "@/components/prioritas/featured-banner-data";
import { getImageBackdropColor } from "@/lib/image-color";

export async function getFeaturedBannerBackdrops(): Promise<Record<string, string>> {
  return Object.fromEntries(await Promise.all(
    FEATURED_BANNER_SLIDES.map(async ({ id, image }) => [id, await getImageBackdropColor(image)] as const)
  ));
}
