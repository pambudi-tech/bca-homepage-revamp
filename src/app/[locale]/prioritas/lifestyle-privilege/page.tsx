import { setRequestLocale } from "next-intl/server";
import SignaturePrivilegeExperience from "@/components/prioritas/SignaturePrivilegeExperience";
import { getPromos } from "@/lib/promos";

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
  const promos = await getPromos(now);
  const initialCategories = Array.isArray(category) ? category : category ? [category] : [];

  return (
    <SignaturePrivilegeExperience promos={promos} now={now} directoryOnly initialCategories={initialCategories} />
  );
}
