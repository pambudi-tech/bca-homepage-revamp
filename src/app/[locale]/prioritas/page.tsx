import { getTranslations, setRequestLocale } from "next-intl/server";
import type { CSSProperties } from "react";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import HeroSection from "@/components/home/HeroSection";
import SectionAnchor, { type SectionAnchorItem } from "@/components/home/SectionAnchor";
import ScrollCue from "@/components/home/ScrollCue";
import PrivilegeSection from "@/components/prioritas/PrivilegeSection";
import EventPromoSection from "@/components/prioritas/EventPromoSection";
import CardSection from "@/components/prioritas/CardSection";
import BankingSolutionSection from "@/components/prioritas/BankingSolutionSection";
import MagazineSection from "@/components/prioritas/MagazineSection";
import FinancialReportSection from "@/components/prioritas/FinancialReportSection";
import { getPromos } from "@/lib/promos";
import { getKursHariIni } from "@/lib/kurs";

const HERO_IMAGE = "/assets/prioritas/hero-banner.webp";
const PRIORITAS_LOGO = "/assets/prioritas/logo.svg";

export default async function PrioritasPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("prioritasHero");
  const now = new Date();
  const [promos, kurs] = await Promise.all([getPromos(now), getKursHariIni()]);

  const sectionAnchors: SectionAnchorItem[] = [
    { key: "privilege", target: "#privilege", label: t("sections.privilege") },
    { key: "eventPromo", target: "#event-promo", label: t("sections.eventPromo") },
    { key: "bankingSolution", target: "#banking-solution", label: t("sections.bankingSolution") },
    { key: "magazine", target: "#magazine", label: t("sections.magazine") },
    { key: "financialReport", target: "#financial-report", label: t("sections.financialReport") },
  ];

  return (
    <main id="main-content" className="flex min-h-screen flex-1 flex-col overflow-x-clip bg-pgold-100" style={{ "--shadow-color": "29 55% 16%" } as CSSProperties}>
      <div className="page-stack relative z-10 bg-pgold-100">
      <Navbar variant="prioritas" />
      <HeroSection
          slides={[
            {
              image: HERO_IMAGE,
              alt: t("bannerAlt"),
              title: t("title"),
              cta: {
                label: t("cta"),
                icon: "/assets/cycle1/chevron-right-1.svg",
                variant: "primary",
              },
              brandMark: { src: PRIORITAS_LOGO, alt: t("prioritasLogoAlt") },
            },
          ]}
          mobileStack={<ScrollCue />}
          desktopStack={<ScrollCue />}
      />
      <SectionAnchor
        items={sectionAnchors}
        label={t("sectionNavLabel")}
        variant="prioritas"
      />
      <PrivilegeSection
        copy={{
          eyebrow: t("privilege.eyebrow"),
          heading: t("privilege.heading"),
          cards: [
            { title: t("privilege.cards.lounge.title"), action: t("privilege.cards.lounge.action"), alt: t("privilege.cards.lounge.alt") },
            { title: t("privilege.cards.health.title"), action: t("privilege.cards.health.action"), alt: t("privilege.cards.health.alt") },
            { title: t("privilege.cards.event.title"), action: t("privilege.cards.event.action"), alt: t("privilege.cards.event.alt") },
          ],
          viewMore: t("privilege.viewMore"),
        }}
      />
      <EventPromoSection
        promos={promos}
        now={now}
        copy={{
          eyebrow: t("eventPromo.eyebrow"),
          heading: t("eventPromo.heading"),
          featuredTitles: [
            t("eventPromo.featuredTitles.javaJazz"),
            t("eventPromo.featuredTitles.theWeeknd"),
            t("eventPromo.featuredTitles.brightspot"),
          ],
          featuredCta: t("eventPromo.featuredCta"),
          viewMore: t("eventPromo.viewMore"),
        }}
      />
      <CardSection
        copy={{
          eyebrow: t("card.eyebrow"),
          heading: t("card.heading"),
          description: t("card.description"),
          action: t("card.action"),
          imageAlt: t("card.imageAlt"),
        }}
      />
      <BankingSolutionSection
        kurs={kurs}
        copy={{
          eyebrow: t("bankingSolution.eyebrow"),
          heading: t("bankingSolution.heading"),
          bankingPrivilege: t("bankingSolution.bankingPrivilege"),
          wealthInsight: t("bankingSolution.wealthInsight"),
          kurs: t("bankingSolution.kurs"),
          viewMore: t("bankingSolution.viewMore"),
          action: t("bankingSolution.action"),
          buy: t("bankingSolution.buy"),
          sell: t("bankingSolution.sell"),
          updatedAt: t("bankingSolution.updatedAt"),
          cards: [
            { title: t("bankingSolution.cards.branch.title"), alt: t("bankingSolution.cards.branch.alt"), image: "/assets/prioritas/banking/privilege-branch.png" },
            { title: t("bankingSolution.cards.vehicle.title"), alt: t("bankingSolution.cards.vehicle.alt"), image: "/assets/prioritas/banking/privilege-vehicle.png" },
            { title: t("bankingSolution.cards.transaction.title"), alt: t("bankingSolution.cards.transaction.alt"), image: "/assets/prioritas/banking/privilege-transaction.png" },
            { title: t("bankingSolution.cards.credit.title"), alt: t("bankingSolution.cards.credit.alt"), image: "/assets/prioritas/banking/privilege-credit.png" },
            { title: t("bankingSolution.cards.home.title"), alt: t("bankingSolution.cards.home.alt"), image: "/assets/prioritas/banking/privilege-home.png" },
            { title: t("bankingSolution.cards.deposit.title"), alt: t("bankingSolution.cards.deposit.alt"), image: "/assets/prioritas/banking/privilege-deposit.png" },
          ],
          wealthCards: [
            {
              title: t("bankingSolution.wealthCards.houseView.title"),
              metadata: [
                { icon: "/assets/prioritas/banking/calendar.svg", label: t("bankingSolution.wealthCards.houseView.date") },
                { icon: "/assets/prioritas/banking/youtube.svg", label: t("bankingSolution.wealthCards.houseView.channel") },
              ],
              action: t("bankingSolution.wealthCards.houseView.action"),
              image: "/assets/prioritas/banking/wealth-house-view.png",
              imageAlt: t("bankingSolution.wealthCards.houseView.alt"),
            },
            {
              title: t("bankingSolution.wealthCards.market.title"),
              metadata: [{ icon: "/assets/prioritas/banking/calendar.svg", label: t("bankingSolution.wealthCards.market.date") }],
              action: t("bankingSolution.wealthCards.market.action"),
              actionIcon: "download",
              image: "/assets/prioritas/banking/wealth-market-overview.png",
              imageAlt: t("bankingSolution.wealthCards.market.alt"),
            },
          ],
        }}
      />
      <MagazineSection
        copy={{
          eyebrow: t("magazine.eyebrow"),
          heading: t("magazine.heading"),
          viewMore: t("magazine.viewMore"),
          cards: [
            { title: t("magazine.cards.property.title"), action: t("magazine.cards.property.action"), image: "/assets/prioritas/magazine/magazine-5.png", imageAlt: t("magazine.cards.property.alt") },
            { title: t("magazine.cards.food.title"), action: t("magazine.cards.food.action"), image: "/assets/prioritas/magazine/magazine-2.png", imageAlt: t("magazine.cards.food.alt") },
            { title: t("magazine.cards.chess.title"), action: t("magazine.cards.chess.action"), image: "/assets/prioritas/magazine/magazine-4.png", imageAlt: t("magazine.cards.chess.alt") },
          ],
        }}
      />
      <FinancialReportSection
        copy={{
          eyebrow: t("financialReport.eyebrow"),
          heading: t("financialReport.heading"),
          features: [
            t("financialReport.features.centralized"),
            t("financialReport.features.reporting"),
            t("financialReport.features.updated"),
          ],
          action: t("financialReport.action"),
        }}
      />
      </div>
      <div className="relative z-0 w-full xl:sticky xl:bottom-0">
        <Footer variant="prioritas" />
      </div>
    </main>
  );
}
