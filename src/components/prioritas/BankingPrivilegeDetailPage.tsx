import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import BackToTop from "@/components/home/BackToTop";
import PrioritasDetailExperience from "@/components/prioritas/PrioritasDetailExperience";
import { bankingPrivilegeItems, getBankingPrivilegeItem } from "@/components/prioritas/banking-privilege-data";
import { getMemberBrandFromSession, MEMBER_SESSION_COOKIE, memberBasePath } from "@/lib/member-auth";

export default async function BankingPrivilegeDetailPage({ locale, benefitId, memberArea = false, publicBasePath = "/prioritas" }: { locale: string; benefitId: string; memberArea?: boolean; publicBasePath?: string }) {
  setRequestLocale(locale);
  const item = getBankingPrivilegeItem(benefitId);
  if (!item) notFound();

  const [detailT, indexT, memberT, navT, solitaireT] = await Promise.all([
    getTranslations("bankingPrivilegeDetail"),
    getTranslations("bankingSolutionIndex"),
    getTranslations("memberOverview"),
    getTranslations("signaturePrivilege"),
    getTranslations("solitaireHero"),
  ]);
  const session = (await cookies()).get(MEMBER_SESSION_COOKIE)?.value;
  const memberBrand = getMemberBrandFromSession(session);
  const memberBase = memberBasePath(memberBrand ?? "prioritas");
  const homeLabel = publicBasePath === "/solitaire" || memberArea && memberBrand === "solitaire" ? solitaireT("breadcrumbLabel") : "Prioritas";
  const title = indexT(`privilege.${item.key}`);
  const sectionTitle = detailT("detailTitle");
  const contactTitle = detailT("contactTitle");
  const summary = detailT(`items.${item.id}`);
  const recommendationCards = bankingPrivilegeItems
    .filter((recommendation) => recommendation.id !== item.id)
    .slice(0, 3)
    .map((recommendation) => ({
      title: indexT(`privilege.${recommendation.key}`),
      alt: indexT(`privilege.${recommendation.key}`),
      image: recommendation.image,
      href: `${memberArea ? memberBase : publicBasePath}/banking-solution/privilege/${recommendation.id}`,
    }));

  return <main id="main-content" className={`flex min-h-screen flex-1 flex-col overflow-x-clip ${publicBasePath === "/solitaire" && !memberArea || memberArea && memberBrand === "solitaire" ? "bg-neutral-200" : "bg-pgold-200"}`}>
    <PrioritasDetailExperience
      memberArea={memberArea}
      publicBasePath={publicBasePath}
      memberPreviewName={memberBrand && (memberArea || memberBrand === (publicBasePath === "/solitaire" ? "solitaire" : "prioritas")) ? memberT(memberBrand === "solitaire" ? "solitairePreviewFullName" : "previewFullName") : undefined}
      kind="banking"
      heroImage={item.image}
      promos={[]}
      now={new Date().toISOString()}
      bankingRecommendations={recommendationCards}
      bankingRecommendationAction={indexT("more")}
      customSections={[
        { id: "detail", title: sectionTitle, content: summary },
        { id: "contact", title: contactTitle, content: detailT("contact") },
      ]}
      copy={{
        subNav: {
          label: navT("subNavLabel"),
          privilege: navT("subNav.privilege"),
          banking: navT("subNav.banking"),
          magazine: navT("subNav.magazine"),
        },
        breadcrumb: { home: homeLabel, category: indexT("breadcrumb"), current: title },
        title,
        detail: { title: sectionTitle, content: summary },
        terms: { title: contactTitle, items: [detailT("contact")] },
        contact: { title: contactTitle, content: detailT("contact") },
        location: { title: contactTitle, content: "" },
        recommendations: { title: detailT("recommendations"), viewMore: detailT("back") },
      }}
    />
    <BackToTop bottomInset="24px" revealAtBottom />
  </main>;
}
