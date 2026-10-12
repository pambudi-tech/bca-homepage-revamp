import { setRequestLocale } from "next-intl/server";
import PublicPrivilegePage from "@/components/prioritas/PublicPrivilegePage";

export default async function PublicPrivilegeRoute({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ section?: string | string[] }> }) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  return <PublicPrivilegePage brand="prioritas" section={query.section} />;
}
