import { redirect } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";

export default async function PrioritasKursRedirect({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect({ href: "/prioritas/banking-solution/kurs", locale: locale as AppLocale });
}
