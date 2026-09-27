import { setRequestLocale } from "next-intl/server";
import MagazineIndexExperience from "@/components/prioritas/MagazineIndexExperience";

export default async function MagazineIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <MagazineIndexExperience />;
}
