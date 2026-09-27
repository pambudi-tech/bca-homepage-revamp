import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import MemberLoginExperience from "@/components/member/MemberLoginExperience";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("memberLogin");
  return { title: t("pageTitle") };
}

export default async function MemberLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  const brand = from === "solitaire" ? "solitaire" : "prioritas";

  return <MemberLoginExperience brand={brand} />;
}
