import { getTranslations, setRequestLocale } from "next-intl/server";
import MemberSectionTabs from "@/components/prioritas/MemberSectionTabs";
import PrioritasMemberHeader from "@/components/prioritas/PrioritasMemberHeader";
import KursDetailExperience from "@/components/prioritas/KursDetailExperience";
import { getKursDetail } from "@/lib/kurs-detail";
import { cookies } from "next/headers";
import { getMemberBrandFromSession, MEMBER_SESSION_COOKIE, memberBasePath } from "@/lib/member-auth";

export default async function PrioritasMemberKursPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, bankingT, data] = await Promise.all([getTranslations("prioritasKurs"), getTranslations("bankingSolutionIndex"), getKursDetail()]);
  const memberBase = memberBasePath(getMemberBrandFromSession((await cookies()).get(MEMBER_SESSION_COOKIE)?.value) ?? "prioritas");
  const updatedAt = new Intl.DateTimeFormat(locale, {
    day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
    hour12: false, timeZone: "Asia/Jakarta",
  }).format(new Date(data.updatedAt));

  return <>
    <PrioritasMemberHeader activeTab="banking" title={t("title")} compactTitleTabGap>
      <MemberSectionTabs
        ariaLabel={bankingT("tabLabel")}
        activeSection="kurs"
        tabs={[
          { id: "privilege", label: bankingT("tabs.privilege"), href: `${memberBase}/banking-solution?section=privilege` },
          { id: "wealth", label: bankingT("tabs.wealth"), href: `${memberBase}/banking-solution?section=wealth` },
          { id: "kurs", label: bankingT("tabs.kurs"), href: `${memberBase}/banking-solution/kurs` },
        ]}
      />
    </PrioritasMemberHeader>
    <KursDetailExperience tone={memberBase.startsWith("/solitaire") ? "solitaire" : "prioritas"} rates={data.rates} updatedAt={updatedAt} copy={{
      ratesHeading: t("ratesHeading"), updatedAt: t("updatedAt"), refresh: t("refresh"), currency: t("currency"), buy: t("buy"), sell: t("sell"),
      converter: t("converter"), conversionEstimate: t("conversionEstimate"), amount: t("amount"), from: t("from"), to: t("to"), swapCurrencies: t("swapCurrencies"), viewConverter: t("viewConverter"), note: t("note"), tellerNote: t("tellerNote"),
    }} />
  </>;
}
