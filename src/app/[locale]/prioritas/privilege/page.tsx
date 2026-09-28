import { setRequestLocale } from "next-intl/server";
import SignaturePrivilegeExperience from "@/components/prioritas/SignaturePrivilegeExperience";
import { getPrivilegePromos } from "@/lib/partner-privileges";

export default async function SignaturePrivilegePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const now = new Date();
  const promos = getPrivilegePromos("complimentary");
  const signaturePromos = getPrivilegePromos("signature");
  return <SignaturePrivilegeExperience promos={promos} signaturePromos={signaturePromos} now={now} />;
}
