import { getTranslations, setRequestLocale } from "next-intl/server";
import type { CSSProperties } from "react";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import BackToTop from "@/components/home/BackToTop";
import HeroSection from "@/components/home/HeroSection";
import ScrollCue from "@/components/home/ScrollCue";
import SectionAnchor, { type SectionAnchorItem } from "@/components/home/SectionAnchor";
import SolitairePrivilegeSection from "@/components/solitaire/SolitairePrivilegeSection";
import { SOLITAIRE_EVENT_SLIDES } from "@/components/solitaire/event-slides";
import SolitaireEventPromoSection from "@/components/solitaire/SolitaireEventPromoSection";
import CardSection from "@/components/prioritas/CardSection";
import BankingSolutionSection from "@/components/prioritas/BankingSolutionSection";
import FinancialReportSection from "@/components/prioritas/FinancialReportSection";
import PrioritasContactSection from "@/components/prioritas/PrioritasContactSection";
import { formatKursUpdatedAt, getKursHariIni } from "@/lib/kurs";
import { getImageBackdropColor } from "@/lib/image-color";
import { insightAssets } from "@/components/prioritas/wealth-insight-assets";

const HERO_IMAGE = "/assets/soliprio/solitaire-image.webp";
const SOLITAIRE_LOGO = "/assets/soliprio/solitaire-logo.svg";

export default async function SolitairePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("solitaireHero");
  const tPrioritas = await getTranslations("prioritasHero");
  const tWealth = await getTranslations("bankingSolutionIndex");
  const kurs = await getKursHariIni();
  const kursUpdatedAt = kurs[0]?.updatedAt ?? 0;
  const [latestHouseView, latestWeeklyMarket] = [insightAssets.house[0], insightAssets.market[0]];
  const [houseBackdrop, marketBackdrop] = await Promise.all([
    getImageBackdropColor(latestHouseView.image),
    getImageBackdropColor(latestWeeklyMarket.image),
  ]);
  const sectionAnchors: SectionAnchorItem[] = [
    { key: "privilege", target: "#privilege", label: tPrioritas("sections.privilege") },
    { key: "eventPromo", target: "#event-promo", label: tPrioritas("sections.eventPromo") },
    { key: "bankingSolution", target: "#banking-solution", label: tPrioritas("sections.bankingSolution") },
    { key: "financialReport", target: "#financial-report", label: tPrioritas("sections.financialReport") },
  ];

  return (
    <main id="main-content" className="flex min-h-screen flex-1 flex-col overflow-x-clip bg-neutral-900" style={{ "--shadow-color": "29 55% 16%" } as CSSProperties}>
      <div className="page-stack relative z-10 bg-neutral-900">
        <Navbar variant="solitaire" />
        <HeroSection
          brandedHomepage
          slides={[{
            image: HERO_IMAGE,
            alt: t("bannerAlt"),
            title: t("title"),
            cta: {
              label: t("cta"),
              icon: "/assets/cycle1/chevron-right-1.svg",
              variant: "primary",
              tone: "solitaire",
            },
            brandMark: { src: SOLITAIRE_LOGO, alt: t("solitaireLogoAlt") },
          }, {
            image: "/assets/cycle1/hero-banner.webp",
            alt: tPrioritas("campaigns.weekndAlt"),
            title: tPrioritas("campaigns.weekndTitle"),
            cta: {
              label: tPrioritas("campaigns.weekndCta"),
              icon: "/assets/cycle1/download-icon.svg",
              variant: "secondary",
              tone: "solitaire",
            },
          }, {
            image: "/assets/cycle1/hero-banner-jrf.webp",
            alt: tPrioritas("campaigns.jrfAlt"),
            title: tPrioritas("campaigns.jrfTitle"),
            cta: {
              label: tPrioritas("campaigns.jrfCta"),
              icon: "/assets/cycle1/download-icon.svg",
              variant: "secondary",
              tone: "solitaire",
            },
          }]}
          mobileStack={<ScrollCue />}
          desktopStack={<ScrollCue />}
        />
        <SectionAnchor
          items={sectionAnchors}
          label={tPrioritas("sectionNavLabel")}
          variant="solitaire"
        />
        <SolitairePrivilegeSection
          eyebrow={tPrioritas("privilege.eyebrow")}
          heading={tPrioritas("privilege.heading")}
          cards={[
            {
              title: tPrioritas("privilege.cards.lounge.title"),
              action: tPrioritas("privilege.cards.lounge.action"),
              alt: tPrioritas("privilege.cards.lounge.alt"),
              href: "/solitaire/privilege/executive-airport-lounge",
            },
            {
              title: tPrioritas("privilege.cards.health.title"),
              action: tPrioritas("privilege.cards.health.action"),
              alt: tPrioritas("privilege.cards.health.alt"),
              href: "/solitaire/privilege/medical-check-up-internasional",
            },
            {
              title: tPrioritas("privilege.cards.event.title"),
              action: tPrioritas("privilege.cards.event.action"),
              alt: tPrioritas("privilege.cards.event.alt"),
              href: "/solitaire/event",
            },
          ]}
          viewMore={t("viewMore")}
        />
        <SolitaireEventPromoSection
          eyebrow={tPrioritas("eventPromo.eyebrow")}
          heading={tPrioritas("eventPromo.heading")}
          viewMore={t("viewMore")}
          slides={SOLITAIRE_EVENT_SLIDES}
        />
        <CardSection
          imageSrc="/assets/solitaire/solitaire-card.webp"
          tone="solitaire"
          copy={{
            eyebrow: tPrioritas("card.eyebrow"),
            heading: tPrioritas("card.heading"),
            description: tPrioritas("card.description"),
            action: tPrioritas("card.action"),
            imageAlt: tPrioritas("card.imageAlt"),
          }}
        />
        <BankingSolutionSection
          tone="solitaire"
          publicBasePath="/solitaire"
          kurs={kurs}
          copy={{
            eyebrow: tPrioritas("bankingSolution.eyebrow"),
            heading: tPrioritas("bankingSolution.heading"),
            bankingPrivilege: tPrioritas("bankingSolution.bankingPrivilege"),
            wealthInsight: tPrioritas("bankingSolution.wealthInsight"),
            kurs: tPrioritas("bankingSolution.kurs"),
            viewMore: tPrioritas("bankingSolution.viewMore"),
            action: tPrioritas("bankingSolution.action"),
            buy: tPrioritas("bankingSolution.buy"),
            sell: tPrioritas("bankingSolution.sell"),
            updatedAt: tPrioritas("bankingSolution.updatedAt", { date: formatKursUpdatedAt(kursUpdatedAt, locale) }),
            refresh: tPrioritas("bankingSolution.refresh"),
            previous: tPrioritas("bankingSolution.previous"),
            next: tPrioritas("bankingSolution.next"),
            cards: [
              { title: tPrioritas("bankingSolution.cards.branch.title"), alt: tPrioritas("bankingSolution.cards.branch.alt"), image: "/assets/prioritas/banking/privilege-branch.png", href: "/solitaire/banking-solution/privilege/layanan-cabang" },
              { title: tPrioritas("bankingSolution.cards.vehicle.title"), alt: tPrioritas("bankingSolution.cards.vehicle.alt"), image: "/assets/prioritas/banking/privilege-vehicle.png", href: "/solitaire/banking-solution/privilege/kkb" },
              { title: tPrioritas("bankingSolution.cards.transaction.title"), alt: tPrioritas("bankingSolution.cards.transaction.alt"), image: "/assets/prioritas/banking/privilege-transaction.png", href: "/solitaire/banking-solution/privilege/fitur-transaksi" },
              { title: tPrioritas("bankingSolution.cards.credit.title"), alt: tPrioritas("bankingSolution.cards.credit.alt"), image: "/assets/prioritas/banking/privilege-credit.png", href: "/solitaire/banking-solution/privilege/kartu-kredit" },
              { title: tPrioritas("bankingSolution.cards.home.title"), alt: tPrioritas("bankingSolution.cards.home.alt"), image: "/assets/prioritas/banking/privilege-home.png", href: "/solitaire/banking-solution/privilege/kpr" },
              { title: tPrioritas("bankingSolution.cards.deposit.title"), alt: tPrioritas("bankingSolution.cards.deposit.alt"), image: "/assets/prioritas/banking/privilege-deposit.png", href: "/solitaire/banking-solution/privilege/safe-deposit-box" },
            ],
            wealthCards: [
              {
                eyebrow: tWealth("groups.house"),
                title: tWealth(`insight.${latestHouseView.key}.title`),
                metadata: [{ icon: "/assets/prioritas/banking/calendar.svg", label: tWealth(`insight.${latestHouseView.key}.date`) }],
                action: tWealth("downloadAction"),
                actionIcon: latestHouseView.actionIcon,
                image: latestHouseView.image,
                imageAlt: tWealth(`insight.${latestHouseView.key}.alt`),
                backdrop: houseBackdrop,
                href: "https://prioritas.bca.co.id/en/Wealth-Management/Market-Insight/House-View-Report",
              },
              {
                eyebrow: tWealth("groups.market"),
                title: tWealth(`insight.${latestWeeklyMarket.key}.title`),
                metadata: [{ icon: "/assets/prioritas/banking/calendar.svg", label: tWealth(`insight.${latestWeeklyMarket.key}.date`) }],
                action: tWealth("downloadAction"),
                actionIcon: latestWeeklyMarket.actionIcon,
                image: latestWeeklyMarket.image,
                imageAlt: tWealth(`insight.${latestWeeklyMarket.key}.alt`),
                backdrop: marketBackdrop,
                href: "https://prioritas.bca.co.id/en/Wealth-Management/Market-Insight/Weekly-Market-Overview",
              },
            ],
          }}
        />
        <FinancialReportSection
          tone="solitaire"
          copy={{
            eyebrow: tPrioritas("financialReport.eyebrow"),
            heading: tPrioritas("financialReport.heading"),
            features: [
              tPrioritas("financialReport.features.centralized"),
              tPrioritas("financialReport.features.reporting"),
              tPrioritas("financialReport.features.updated"),
            ],
            action: tPrioritas("financialReport.action"),
          }}
        />
        <PrioritasContactSection
          tone="solitaire"
          copy={{
            heading: tPrioritas("contact.heading"),
            riplayTitle: tPrioritas("contact.riplayTitle"),
            download: tPrioritas("contact.download"),
            contactTitle: tPrioritas("contact.contactTitle"),
            phone: tPrioritas("contact.phone"),
          }}
        />
      </div>
      <div className="relative z-0 w-full xl:sticky xl:bottom-0">
        <Footer variant="prioritas" tone="solitaire" hideMagazineLink />
      </div>
      <BackToTop bottomInset="24px" />
    </main>
  );
}
