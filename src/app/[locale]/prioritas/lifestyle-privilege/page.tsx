import { setRequestLocale } from "next-intl/server";
import SignaturePrivilegeExperience from "@/components/prioritas/SignaturePrivilegeExperience";
import { getPrivilegePromos } from "@/lib/partner-privileges";

export default async function LifestylePrivilegePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const now = new Date();
  const promos = getPrivilegePromos("lifestyle");

  return (
    <SignaturePrivilegeExperience promos={promos} now={now} directoryOnly />
  );
}
