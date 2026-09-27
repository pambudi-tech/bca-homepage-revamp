import { setRequestLocale } from "next-intl/server";
import SignaturePrivilegeExperience from "@/components/prioritas/SignaturePrivilegeExperience";
import { getPrivilegePromos } from "@/lib/partner-privileges";

export default async function LifestylePrivilegePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string | string[] }>;
}) {
  const { locale } = await params;
  const { category } = await searchParams;
  setRequestLocale(locale);
  const now = new Date();
  const promos = getPrivilegePromos("lifestyle");
  const initialCategories = Array.isArray(category) ? category : category ? [category] : [];

  return (
    <SignaturePrivilegeExperience promos={promos} now={now} directoryOnly initialCategories={initialCategories} />
  );
}
