import { setRequestLocale } from "next-intl/server";
import MemberOverview from "@/components/prioritas/MemberOverview";
import { getPrioritasSourceEvents, getPrioritasSourcePromos } from "@/lib/prioritas-source-data";
import { getMemberSignatureVoucherStatus } from "@/lib/member-signature-voucher";

export const revalidate = 3600;

export default async function PrioritasMemberOverviewPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ voucherStatus?: string | string[] }> }) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  const now = new Date();
  const allEvents = getPrioritasSourceEvents(now);
  const upcomingEvents = allEvents.filter((event) => event.endAt >= now).toSorted((a, b) => a.startAt.getTime() - b.startAt.getTime());
  const events = upcomingEvents.length ? upcomingEvents : allEvents.toSorted((a, b) => b.startAt.getTime() - a.startAt.getTime());

  return <MemberOverview events={events} promos={getPrioritasSourcePromos()} now={now} voucherStatus={getMemberSignatureVoucherStatus(query.voucherStatus)} />;
}
