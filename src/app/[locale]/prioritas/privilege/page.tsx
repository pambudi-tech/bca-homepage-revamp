import { getTranslations, setRequestLocale } from "next-intl/server";
import Navbar from "@/components/home/Navbar";
import PrioritasDetailSubnav from "@/components/prioritas/PrioritasDetailSubnav";
import SignaturePrivilegeExperience from "@/components/prioritas/SignaturePrivilegeExperience";
import { getPromos } from "@/lib/promos";

export default async function SignaturePrivilegePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("signaturePrivilege");
  const now = new Date();
  const promos = await getPromos(now);
  return <>
    <Navbar variant="prioritas" />
    <PrioritasDetailSubnav
      label={t("subNavLabel")}
      privilege={t("subNav.privilege")}
      banking={t("subNav.banking")}
      magazine={t("subNav.magazine")}
    />
    <SignaturePrivilegeExperience promos={promos} now={now} />
  </>;
}
