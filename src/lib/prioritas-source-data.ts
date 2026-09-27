import sourceRows from "@/components/prioritas/prioritas-source-snapshot.json";
import type { Promo, PromoCategory } from "@/components/home/promo-data";
import type { EventCategory, EventPromo } from "@/components/prioritas/event-data";

export type PrioritasSourcePromo = Promo & {
  sourceTerms: string[];
  sourceLocation: string;
  sourceContact: string;
  auditStatus: "clear" | "review";
  auditReason: string;
};

export type PrioritasSourceEvent = EventPromo & PrioritasSourcePromo;

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGU", "SEP", "OKT", "NOV", "DES"];

function atJakartaStart(isoDate: string) {
  return new Date(`${isoDate}T00:00:00+07:00`);
}

function atJakartaEnd(isoDate: string) {
  return new Date(`${isoDate}T23:59:59+07:00`);
}

function dateTile(startDate: string, endDate: string, now: Date): EventPromo["dateTile"] {
  if (atJakartaEnd(endDate).getTime() < now.getTime()) return { expired: true };
  const [, startMonth, startDay] = startDate.split("-").map(Number);
  const [, endMonth, endDay] = endDate.split("-").map(Number);
  if (startMonth !== endMonth) {
    return { dateParts: [
      { primary: String(startDay), secondary: MONTHS[startMonth - 1] },
      { primary: String(endDay), secondary: MONTHS[endMonth - 1] },
    ] };
  }
  return {
    primary: startDay === endDay ? String(startDay) : `${startDay}–${endDay}`,
    secondary: MONTHS[startMonth - 1],
  };
}

function basePromo(row: (typeof sourceRows)[number]): PrioritasSourcePromo {
  return {
    id: row.id,
    title: row.title,
    brand: row.brand,
    cover: row.cover,
    logo: row.logo,
    category: row.category as PromoCategory,
    startAt: atJakartaStart(row.startDate),
    endAt: atJakartaEnd(row.endDate),
    details: row.details || row.summary,
    sourceUrl: row.sourceUrl,
    sourceTerms: row.terms,
    sourceLocation: row.location,
    sourceContact: row.contact,
    auditStatus: row.auditStatus as "clear" | "review",
    auditReason: row.auditReason,
  };
}

/** Audited, bundled 2026-09-27 snapshot from BCA Prioritas. */
export function getPrioritasSourcePromos(): PrioritasSourcePromo[] {
  return sourceRows.filter((row) => row.classification === "Promo").map(basePromo);
}

/** Event periods come from the dated activities, not PromoDate validity. */
export function getPrioritasSourceEvents(now = new Date()): PrioritasSourceEvent[] {
  return sourceRows.filter((row) => row.classification === "Event").map((row) => ({
    ...basePromo(row),
    eventCategory: row.eventCategory as EventCategory,
    dateTile: dateTile(row.startDate, row.endDate, now),
  }));
}
