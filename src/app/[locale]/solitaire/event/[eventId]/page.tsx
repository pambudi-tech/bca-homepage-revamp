import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import BackToTop from "@/components/home/BackToTop";
import PrioritasDetailExperience from "@/components/prioritas/PrioritasDetailExperience";
import { getPrioritasSourceEvents } from "@/lib/prioritas-source-data";

type EventParams = { locale: string; eventId: string };

export default async function SolitaireEventDetailPage({ params }: { params: Promise<EventParams> }) {
  const { locale, eventId } = await params;
  setRequestLocale(locale);
  const [t, detailT, signatureT, solitaireT] = await Promise.all([
    getTranslations("prioritasContentDetail"),
    getTranslations("lifestylePrivilegeDetail"),
    getTranslations("signaturePrivilege"),
    getTranslations("solitaireHero"),
  ]);
  const events = getPrioritasSourceEvents();
  const event = events.find((item) => item.id === eventId);
  if (!event) notFound();
  const recommendations = events.filter((item) => item.id !== eventId && item.eventCategory === event.eventCategory).slice(0, 3);

  return <main id="main-content" className="flex min-h-screen flex-1 flex-col overflow-x-clip bg-neutral-200">
    <PrioritasDetailExperience
      publicBasePath="/solitaire"
      kind="event"
      categoryFilter={event.eventCategory}
      heroImage={event.cover}
      brandLogo={event.logo}
      eventDate={event.dateTile}
      promos={recommendations}
      now={new Date().toISOString()}
      copy={{
        subNav: {
          label: detailT("subNavLabel"),
          privilege: detailT("subNav.privilege"),
          banking: detailT("subNav.banking"),
          magazine: detailT("subNav.magazine"),
        },
        breadcrumb: {
          home: solitaireT("breadcrumbLabel"),
          category: t("event.breadcrumb"),
          current: signatureT(`eventDirectory.categories.${event.eventCategory}`),
        },
        title: event.title,
        brand: event.brand,
        detail: {
          title: detailT("detail.title"),
          content: event.details || t("fallback.description", { title: event.title }),
        },
        terms: {
          title: detailT("terms.title"),
          items: event.sourceTerms.length ? event.sourceTerms : [t("fallback.terms")],
        },
        contact: { title: detailT("contact.title"), content: event.sourceContact || t("fallback.contact") },
        location: { title: detailT("location.title"), content: event.sourceLocation || t("fallback.location") },
        recommendations: { title: t("event.recommendations"), viewMore: detailT("recommendations.viewMore") },
      }}
    />
    <BackToTop bottomInset="24px" revealAtBottom />
  </main>;
}
