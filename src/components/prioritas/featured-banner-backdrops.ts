import { FEATURED_BANNER_SLIDES, type FeaturedBannerSlide } from "@/components/prioritas/featured-banner-data";
import { getImageBackdropColor } from "@/lib/image-color";

export async function getFeaturedBannerBackdrops(slides: readonly FeaturedBannerSlide[] = FEATURED_BANNER_SLIDES): Promise<Record<string, string>> {
  return Object.fromEntries(await Promise.all(
    slides.map(async ({ id, image }) => [id, await getImageBackdropColor(image)] as const)
  ));
}
