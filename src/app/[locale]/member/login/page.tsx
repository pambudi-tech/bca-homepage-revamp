import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import MemberLoginExperience from "@/components/member/MemberLoginExperience";
import magazineIssues from "@/components/prioritas/magazine-issues.json";
import { isSafeMemberRedirect } from "@/lib/member-auth";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("memberLogin");
  return { title: t("pageTitle") };
}

export default async function MemberLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; magazine?: string; redirectTo?: string }>;
}) {
  const { from, magazine: requestedMagazine, redirectTo: requestedRedirect } = await searchParams;
  const brand = from === "solitaire" ? "solitaire" : "prioritas";
  const magazineSlug = magazineIssues.some((issue) => issue.slug === requestedMagazine)
    ? requestedMagazine
    : undefined;

  const redirectTo = isSafeMemberRedirect(requestedRedirect) ? requestedRedirect : "/prioritas/member/overview";

  return <MemberLoginExperience brand={brand} magazineSlug={magazineSlug} redirectTo={redirectTo} />;
}
