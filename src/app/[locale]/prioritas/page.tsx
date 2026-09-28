import { getTranslations, setRequestLocale } from "next-intl/server";
import type { CSSProperties } from "react";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import BackToTop from "@/components/home/BackToTop";
import HeroSection from "@/components/home/HeroSection";
import SectionAnchor, { type SectionAnchorItem } from "@/components/home/SectionAnchor";
import ScrollCue from "@/components/home/ScrollCue";
import PrivilegeSection from "@/components/prioritas/PrivilegeSection";
import EventPromoSection from "@/components/prioritas/EventPromoSection";
import CardSection from "@/components/prioritas/CardSection";
import BankingSolutionSection from "@/components/prioritas/BankingSolutionSection";
import MagazineSection from "@/components/prioritas/MagazineSection";
import FinancialReportSection from "@/components/prioritas/FinancialReportSection";
import PrioritasContactSection from "@/components/prioritas/PrioritasContactSection";
import { getPrioritasSourceEvents } from "@/lib/prioritas-source-data";
import { formatKursUpdatedAt, getKursHariIni } from "@/lib/kurs";
import { getImageBackdropColor } from "@/lib/image-color";
import { insightAssets } from "@/components/prioritas/wealth-insight-assets";

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
  const tWealth = await getTranslations("bankingSolutionIndex");
  const now = new Date();
  const kurs = await getKursHariIni();
  const allEvents = getPrioritasSourceEvents(now);
  const upcomingEvents = allEvents.filter((event) => event.endAt >= now).toSorted((a, b) => a.startAt.getTime() - b.startAt.getTime());
  const events = upcomingEvents.length ? upcomingEvents : allEvents.toSorted((a, b) => b.startAt.getTime() - a.startAt.getTime());
  const kursUpdatedAt = kurs[0]?.updatedAt ?? 0;
  const [latestHouseView, latestWeeklyMarket] = [insightAssets.house[0], insightAssets.market[0]];
  const [houseBackdrop, marketBackdrop] = await Promise.all([
    getImageBackdropColor(latestHouseView.image),
    getImageBackdropColor(latestWeeklyMarket.image),
  ]);

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
              tone: "prioritas",
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
        promos={events}
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
          updatedAt: t("bankingSolution.updatedAt", { date: formatKursUpdatedAt(kursUpdatedAt, locale) }),
          refresh: t("bankingSolution.refresh"),
          previous: t("bankingSolution.previous"),
          next: t("bankingSolution.next"),
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
      <PrioritasContactSection
        copy={{
          heading: t("contact.heading"),
          riplayTitle: t("contact.riplayTitle"),
          download: t("contact.download"),
          contactTitle: t("contact.contactTitle"),
          phone: t("contact.phone"),
        }}
      />
      </div>
      <div className="relative z-0 w-full xl:sticky xl:bottom-0">
        <Footer variant="prioritas" />
      </div>
      <BackToTop bottomInset="24px" />
    </main>
  );
}
