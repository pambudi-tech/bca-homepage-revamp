import { getTranslations, setRequestLocale } from "next-intl/server";
import Navbar from "@/components/home/Navbar";
import HeroSection from "@/components/home/HeroSection";
import ScrollCue from "@/components/home/ScrollCue";
import SectionAnchor, { type SectionAnchorItem } from "@/components/home/SectionAnchor";
import SolitairePrivilegeSection from "@/components/solitaire/SolitairePrivilegeSection";
import SolitaireEventPromoSection from "@/components/solitaire/SolitaireEventPromoSection";

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
  const sectionAnchors: SectionAnchorItem[] = [
    { key: "privilege", target: "#privilege", label: "Privilege" },
    { key: "eventPromo", target: "#event-promo", label: "Event & Promo" },
    { key: "bankingSolution", target: "#banking-solution", label: "Banking Solution" },
    { key: "magazine", target: "#magazine", label: "e-Magazine" },
    { key: "financialReport", target: "#financial-report", label: "Laporan Finansial" },
  ];

  return (
    <main id="main-content" className="flex min-h-screen flex-1 flex-col overflow-x-clip bg-neutral-900">
      <div className="page-stack relative z-10 bg-neutral-900">
        <Navbar variant="solitaire" />
        <HeroSection
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
          }]}
          mobileStack={<ScrollCue />}
          desktopStack={<ScrollCue />}
        />
        <SectionAnchor
          items={sectionAnchors}
          label="Navigasi halaman BCA Solitaire"
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
            },
            {
              title: tPrioritas("privilege.cards.health.title"),
              action: tPrioritas("privilege.cards.health.action"),
              alt: tPrioritas("privilege.cards.health.alt"),
            },
            {
              title: tPrioritas("privilege.cards.event.title"),
              action: tPrioritas("privilege.cards.event.action"),
              alt: tPrioritas("privilege.cards.event.alt"),
            },
          ]}
          viewMore={t("viewMore")}
        />
        <SolitaireEventPromoSection
          eyebrow={tPrioritas("eventPromo.eyebrow")}
          heading={tPrioritas("eventPromo.heading")}
          viewMore={t("viewMore")}
          slides={[
            {
              image: "/assets/solitaire/event-promo/rolex.png?v=1",
              title: "Rolex Private Preview — The Hour Glass Horology Showcase 2026",
              action: "Reservasi Kehadiran",
              alt: "Rolex watch displayed on a reflective beach at sunrise",
            },
            {
              image: "/assets/solitaire/event-promo/brightspot.png?v=1",
              title: "Brightspot Creative Metropolis",
              action: "Lihat Selengkapnya",
              alt: "Brightspot creative metropolis event illustration",
            },
            {
              image: "/assets/solitaire/event-promo/java-jazz.png?v=1",
              title: "International Java Jazz Festival 2026",
              action: "Lihat Semua Event",
              alt: "International Java Jazz Festival 2026 poster",
            },
            {
              image: "/assets/solitaire/event-promo/rolex.png?v=1",
              title: "Experience the Extraordinary",
              action: "Lihat Selengkapnya",
              alt: "Rolex watch displayed on a reflective beach at sunrise",
            },
            {
              image: "/assets/solitaire/event-promo/brightspot.png?v=1",
              title: "Exclusive Experiences for You",
              action: "Lihat Selengkapnya",
              alt: "Brightspot creative metropolis event illustration",
            },
          ]}
        />
      </div>
    </main>
  );
}
