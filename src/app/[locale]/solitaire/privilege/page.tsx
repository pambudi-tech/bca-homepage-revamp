import { setRequestLocale } from "next-intl/server";
import PublicPrivilegePage from "@/components/prioritas/PublicPrivilegePage";
import BackToTop from "@/components/home/BackToTop";

export default async function PublicPrivilegeRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <>
    <PublicPrivilegePage brand="solitaire" />
    <BackToTop bottomInset="24px" />
  </>;
}
