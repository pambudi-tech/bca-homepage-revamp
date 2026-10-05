import { setRequestLocale } from "next-intl/server";
import SignaturePrivilegeExperience from "@/components/prioritas/SignaturePrivilegeExperience";
import { getPrivilegePromos } from "@/lib/partner-privileges";

export default async function SignaturePrivilegePage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ category?: string | string[] }> }) {
  const { locale } = await params;
  const { category } = await searchParams;
  setRequestLocale(locale);
  const now = new Date();
  const promos = getPrivilegePromos("complimentary");
  const signaturePromos = getPrivilegePromos("signature");
  return <SignaturePrivilegeExperience promos={promos} signaturePromos={signaturePromos} now={now} initialCategories={Array.isArray(category) ? category : category ? [category] : []} />;
}
