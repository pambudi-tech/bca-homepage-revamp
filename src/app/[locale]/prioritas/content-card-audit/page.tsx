import { getTranslations, setRequestLocale } from "next-intl/server";
import ContentCard, { type ContentCardVariant } from "@/components/prioritas/ContentCard";
import { getPrivilegePromos } from "@/lib/partner-privileges";
import { getPrioritasSourceEvents, getPrioritasSourcePromos } from "@/lib/prioritas-source-data";

export default async function ContentCardLibraryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contentCardAudit");
  const now = new Date();
  const complimentary = getPrivilegePromos("complimentary");
  const lifestyle = getPrivilegePromos("lifestyle");
  const events = getPrioritasSourceEvents(now);
  const promos = getPrioritasSourcePromos();

  const cards = [
    { variant: "complimentary", card: <ContentCard variant="complimentary" item={complimentary.find((item) => item.cover && item.logo && !item.birthdayGift) ?? complimentary[0]} now={now} /> },
    { variant: "lifestyle", card: <ContentCard variant="lifestyle" item={lifestyle.find((item) => item.cover && item.logo) ?? lifestyle[0]} now={now} /> },
    { variant: "event", card: <ContentCard variant="event" item={events.find((item) => item.cover && !item.dateTile.expired) ?? events[0]} now={now} /> },
    { variant: "promo", card: <ContentCard variant="promo" item={promos.find((item) => item.cover && item.logo) ?? promos[0]} now={now} /> },
  ] as const;

  return (
    <main id="main-content" className="min-h-screen bg-pgold-100 px-4 py-10 text-pbrown-800 xl:py-16">
      <div className="mx-auto max-w-[1280px]">
        <header className="mb-8 xl:mb-12">
          <p className="text-eyebrow uppercase text-pbrown-600">{t("component")}</p>
          <h1 className="mt-2 text-display">{t("title")}</h1>
          <p className="mt-4 max-w-[640px] text-base leading-6 text-pbrown-700">{t("description")}</p>
        </header>
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {cards.map(({ variant, card }) => (
            <section key={variant} aria-label={t(variant as ContentCardVariant)}>
              <h2 className="mb-4 text-subtitle">{t(variant as ContentCardVariant)}</h2>
              {card}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
