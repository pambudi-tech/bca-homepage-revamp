import { setRequestLocale } from "next-intl/server";
import SignaturePrivilegeExperience from "@/components/prioritas/SignaturePrivilegeExperience";
import { getPromos } from "@/lib/promos";

export default async function SignaturePrivilegePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const now = new Date();
  const promos = await getPromos(now);
  return <SignaturePrivilegeExperience promos={promos} now={now} />;
}
