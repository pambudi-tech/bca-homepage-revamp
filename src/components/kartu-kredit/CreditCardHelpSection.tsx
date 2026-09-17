"use client";

import { useTranslations } from "next-intl";
import FaqSection from "@/components/home/FaqSection";
import type { FaqCategory } from "@/components/home/faq-data";

export default function CreditCardHelpSection() {
  const t = useTranslations("creditCardDetail.help");
  const category = t.raw("category") as FaqCategory;

  return (
    <FaqSection
      variant="solid"
      sectionId="bantuan"
      standardHeading={{ eyebrow: t("eyebrow"), heading: t("heading") }}
      categories={[category]}
      footer={{
        prompt: t("notFound"),
        actions: [
          {
            label: t("edukatipsCta"),
            href: "https://www.bca.co.id/id/informasi/edukatips/c/kartu-kredit",
            appearance: "primary",
          },
          {
            label: t("haloBcaCta"),
            href: "https://www.bca.co.id/id/Individu/layanan/Customer-Service/HaloBCA",
            appearance: "outline",
            haloBrand: true,
          },
        ],
      }}
    />
  );
}
