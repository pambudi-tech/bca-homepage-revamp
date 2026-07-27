import { setRequestLocale } from "next-intl/server";
import Navbar from "@/components/home/Navbar";

/** Placeholder shell — no real Tentang BCA content yet, just the navbar in
    its "about" variant so the segment-pill/tab-row treatment can be reviewed
    in place before any of the actual page is built. */
export default async function TentangBcaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="flex min-h-screen flex-col bg-blue-100">
      <Navbar variant="about" />
      <div className="h-24" />
    </main>
  );
}
