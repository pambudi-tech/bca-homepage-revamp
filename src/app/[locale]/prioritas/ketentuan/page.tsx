import { setRequestLocale } from "next-intl/server";
import BrandInformationPage, { informationMetadata } from "@/components/prioritas/BrandInformationPage";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return informationMetadata(locale, "prioritas", "terms");
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <BrandInformationPage brand="prioritas" page="terms" />;
}
