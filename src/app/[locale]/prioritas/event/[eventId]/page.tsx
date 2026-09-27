import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import BackToTop from "@/components/home/BackToTop";
import PrioritasDetailExperience from "@/components/prioritas/PrioritasDetailExperience";
import { buildEventDetailRecommendations, EVENT_PROMO_SAMPLES } from "@/components/prioritas/event-data";
import { getPrioritasSourceEvents } from "@/lib/prioritas-source-data";

type EventParams = { locale: string; eventId: string };

export default async function PrioritasEventDetailPage({ params }: { params: Promise<EventParams> }) {
  const { locale, eventId } = await params;
  setRequestLocale(locale);
  const [t, detailT, signatureT] = await Promise.all([
    getTranslations("prioritasContentDetail"),
    getTranslations("lifestylePrivilegeDetail"),
    getTranslations("signaturePrivilege"),
  ]);
  const additionalEvents = buildEventDetailRecommendations({
    christies: { title: t("event.recommendationCards.christies.title"), brand: t("event.recommendationCards.christies.brand") },
    symphony: { title: t("event.recommendationCards.symphony.title"), brand: t("event.recommendationCards.symphony.brand") },
  });
  const legacyEvents = [
    ...EVENT_PROMO_SAMPLES.map((item) => item.id === "sothebys-art-auction" ? { ...item, title: t("event.sothebys.title") } : item),
    ...additionalEvents,
  ];
  const sourceEvents = getPrioritasSourceEvents();
  const events = [...sourceEvents, ...legacyEvents];
  const sourceEvent = sourceEvents.find((item) => item.id === eventId);
  const event = events.find((item) => item.id === eventId);
  if (!event) notFound();

  const isSothebys = eventId === "sothebys-art-auction";
  const title = isSothebys ? t("event.sothebys.title") : event.title;
  const recommendations = isSothebys
    ? [EVENT_PROMO_SAMPLES.find((item) => item.id === "art-jakarta-gardens")!, ...additionalEvents]
    : events.filter((item) => item.id !== eventId && item.eventCategory === event.eventCategory).slice(0, 3);
  const now = new Date();

  return <main id="main-content" className="flex min-h-screen flex-1 flex-col overflow-x-clip bg-pgold-200">
    <PrioritasDetailExperience
      kind="event"
      categoryFilter={event.eventCategory}
      heroImage={event.cover}
      brandLogo={event.logo}
      eventDate={event.dateTile}
      promos={recommendations}
      now={now.toISOString()}
      copy={{
        subNav: {
          label: detailT("subNavLabel"),
          privilege: detailT("subNav.privilege"),
          banking: detailT("subNav.banking"),
          magazine: detailT("subNav.magazine"),
        },
        breadcrumb: {
          home: detailT("breadcrumb.home"),
          category: t("event.breadcrumb"),
          current: signatureT(`eventDirectory.categories.${event.eventCategory}`),
        },
        title,
        brand: event.brand,
        detail: {
          title: detailT("detail.title"),
          content: isSothebys ? t("event.sothebys.detail") : sourceEvent?.details || t("fallback.description", { title }),
        },
        terms: {
          title: detailT("terms.title"),
          items: isSothebys ? t.raw("event.sothebys.terms") as string[] : sourceEvent?.sourceTerms.length ? sourceEvent.sourceTerms : [t("fallback.terms")],
        },
        contact: {
          title: detailT("contact.title"),
          content: isSothebys ? t("event.sothebys.contact") : sourceEvent ? sourceEvent.sourceContact : t("fallback.contact"),
        },
        location: {
          title: detailT("location.title"),
          content: sourceEvent?.sourceLocation || t("fallback.location"),
        },
        recommendations: { title: t("event.recommendations"), viewMore: detailT("recommendations.viewMore") },
      }}
    />
    <BackToTop bottomInset="24px" revealAtBottom />
  </main>;
}
