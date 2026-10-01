import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import KursDetailExperience from "@/components/prioritas/KursDetailExperience";
import { getKursDetail } from "@/lib/kurs-detail";

type PageParams = { locale: string };

export async function generateMetadata({ params }: { params: Promise<PageParams> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "prioritasKurs" });
  return { title: `${t("title")} | BCA Prioritas`, description: t("subtitle") };
}

export default async function BankingSolutionKursPage({ params }: { params: Promise<PageParams> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, data] = await Promise.all([
    getTranslations("prioritasKurs"),
    getKursDetail(),
  ]);
  const updatedAt = new Intl.DateTimeFormat(locale, {
    day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
    hour12: false, timeZone: "Asia/Jakarta",
  }).format(new Date(data.updatedAt));

  return <KursDetailExperience rates={data.rates} updatedAt={updatedAt} copy={{
    ratesHeading: t("ratesHeading"), updatedAt: t("updatedAt"), refresh: t("refresh"), currency: t("currency"), buy: t("buy"), sell: t("sell"),
    converter: t("converter"), conversionEstimate: t("conversionEstimate"), amount: t("amount"), from: t("from"), to: t("to"), swapCurrencies: t("swapCurrencies"), viewConverter: t("viewConverter"), note: t("note"), tellerNote: t("tellerNote"),
  }} />;
}
