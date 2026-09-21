import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Navbar from "@/components/home/Navbar";
import PrioritasDetailExperience from "@/components/prioritas/PrioritasDetailExperience";
import PrioritasDetailSubnav from "@/components/prioritas/PrioritasDetailSubnav";
import { getPromos } from "@/lib/promos";

type DetailParams = { locale: string; benefitId: string };

export async function generateMetadata({ params }: { params: Promise<DetailParams> }): Promise<Metadata> {
  const { benefitId } = await params;
  if (benefitId !== "molton-brown") return {};
  return {
    title: "Diskon Hand Treatment senilai Rp200 ribu | BCA Prioritas",
    description: "Diskon Molton Brown Hand Treatment senilai Rp200 ribu untuk nasabah BCA Prioritas.",
  };
}

export default async function LifestylePrivilegeDetailPage({ params }: { params: Promise<DetailParams> }) {
  const { locale, benefitId } = await params;
  setRequestLocale(locale);
  if (benefitId !== "molton-brown") notFound();

  const t = await getTranslations("lifestylePrivilegeDetail");
  const now = new Date();
  const promos = await getPromos(now);

  return (
    <main id="main-content" className="flex min-h-screen flex-1 flex-col overflow-x-clip bg-pgold-200">
      <Navbar variant="prioritas" />
      <PrioritasDetailSubnav
        label={t("subNavLabel")}
        privilege={t("subNav.privilege")}
        banking={t("subNav.banking")}
        magazine={t("subNav.magazine")}
      />
      <PrioritasDetailExperience
        promos={promos}
        now={now.toISOString()}
        copy={{
          breadcrumb: { home: t("breadcrumb.home"), category: t("breadcrumb.category"), current: t("breadcrumb.current") },
          title: t("title"),
          brand: t("brand"),
          detail: { title: t("detail.title"), content: t("detail.content") },
          terms: { title: t("terms.title"), items: t.raw("terms.items") as string[] },
          contact: { title: t("contact.title"), content: t("contact.content") },
          location: { title: t("location.title"), content: t("location.content") },
          recommendations: {
            title: t("recommendations.title"),
            viewMore: t("recommendations.viewMore"),
          },
        }}
      />
    </main>
  );
}
