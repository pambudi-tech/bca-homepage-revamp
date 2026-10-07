import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import BackToTop from "@/components/home/BackToTop";
import PrioritasDetailExperience from "@/components/prioritas/PrioritasDetailExperience";
import { getPrivilegeOffer, getPrivilegePromos, splitPartnerTerms, type PrivilegeSection } from "@/lib/partner-privileges";
import type { MemberSignatureVoucherStatus } from "@/lib/member-signature-voucher";
import { cookies } from "next/headers";
import { getMemberBrandFromSession, MEMBER_SESSION_COOKIE, memberBasePath } from "@/lib/member-auth";

function available(value: string): string {
  const trimmed = value.trim();
  return trimmed === "-" ? "" : trimmed;
}

export default async function PartnerPrivilegeDetailPage({
  locale,
  partnerId,
  section,
  memberArea = false,
  memberVoucherStatus,
  publicBasePath = "/prioritas",
}: {
  locale: string;
  partnerId: string;
  section: PrivilegeSection;
  memberArea?: boolean;
  memberVoucherStatus?: MemberSignatureVoucherStatus;
  publicBasePath?: string;
}) {
  setRequestLocale(locale);
  const offer = getPrivilegeOffer(section, partnerId);
  if (!offer) notFound();

  const detailT = await getTranslations("lifestylePrivilegeDetail");
  const session = (await cookies()).get(MEMBER_SESSION_COOKIE)?.value;
  const memberBrand = getMemberBrandFromSession(session);
  const hasMemberSession = memberArea ? memberBrand !== null : memberBrand === (publicBasePath === "/solitaire" ? "solitaire" : "prioritas");
  const memberPreviewName = hasMemberSession && memberBrand
    ? await (await getTranslations("memberOverview"))(memberBrand === "solitaire" ? "solitairePreviewFullName" : "previewFullName")
    : undefined;
  const memberBase = memberBasePath(memberBrand ?? "prioritas");
  const signatureT = await getTranslations("signaturePrivilege");
  const solitaireT = await getTranslations("solitaireHero");
  const homeLabel = publicBasePath === "/solitaire" || memberArea && memberBrand === "solitaire" ? solitaireT("breadcrumbLabel") : detailT("breadcrumb.home");
  const { partner, benefit, asset, logo } = offer;
  const solitaireOnly = section === "signature" && "solitaireOnly" in benefit && benefit.solitaireOnly === true;
  const promos = getPrivilegePromos(section);
  const current = promos.find((promo) => promo.id === partnerId);
  const remaining = promos.filter((promo) => promo.id !== partnerId);
  const isSignatureModule = section === "signature";
  const recommendations = remaining
    .filter((promo) => isSignatureModule
      ? true
      : promo.privilegeCategory === current?.privilegeCategory)
    .slice(0, 3);
  const contact = available(partner.contact);
  const location = available(partner.address) || available(partner.city);
  const validUntil = available(partner.validUntil)
    .replace(/^s\/d\s*/i, "")
    .replace(/\s+s\/d\s+/i, " – ");

  return (
    <main id="main-content" className={`flex min-h-screen flex-1 flex-col overflow-x-clip ${publicBasePath === "/solitaire" && !memberArea || memberArea && memberBrand === "solitaire" ? "bg-neutral-200" : "bg-pgold-200"}`}>
      <PrioritasDetailExperience
        publicBasePath={publicBasePath}
        memberArea={memberArea}
        memberPreviewName={memberPreviewName}
        memberSessionActive={hasMemberSession}
        memberAirportTransfer={(memberArea || hasMemberSession) && partnerId === "airport-transfer-domestik" ? "domestic" : (memberArea || hasMemberSession) && partnerId === "airport-transfer-internasional" ? "international" : false}
        memberMedicalCheckUp={(memberArea || hasMemberSession) && partnerId === "medical-check-up-internasional"}
        memberVoucherStatus={(memberArea || hasMemberSession) && partnerId === "executive-airport-lounge" ? memberVoucherStatus ?? "available" : undefined}
        kind={section}
        categoryFilter={current?.privilegeCategory}
        heroImage={asset?.heroImage}
        birthdayGift={current?.birthdayGift}
        brandLogo={logo?.logo}
        promos={recommendations}
        now={new Date().toISOString()}
        copy={{
          subNav: {
            label: detailT("subNavLabel"),
            privilege: detailT("subNav.privilege"),
            banking: detailT("subNav.banking"),
            magazine: detailT("subNav.magazine"),
          },
          breadcrumb: {
            home: homeLabel,
            category: section === "signature" ? signatureT("tabs.signature") : section === "complimentary" ? signatureT("complimentary.title") : detailT("breadcrumb.category"),
            current: current ? signatureT(`categories.${current.privilegeCategory}`) : partner.category,
          },
          title: benefit.benefit,
          brand: isSignatureModule ? undefined : partner.name,
          detail: {
            title: detailT("detail.title"),
            description: partner.description,
            content: partner.privilegeDetails,
          },
          terms: { title: detailT("terms.title"), items: splitPartnerTerms(partner.terms) },
          validUntil: validUntil ? { label: detailT("validUntil"), value: validUntil } : undefined,
          contact: { title: detailT("contact.title"), content: contact },
          location: { title: detailT("location.title"), content: location, table: partnerId === "executive-airport-lounge" ? "executiveAirportLounge" : undefined },
          recommendations: {
            title: detailT("recommendations.title"),
            viewMore: detailT("recommendations.viewMore"),
          },
          ...(isSignatureModule || partnerId === "medical-check-up-internasional" ? {
            dynamicModule: solitaireOnly && publicBasePath === "/prioritas" && memberBrand !== "solitaire" ? {
              infoOnly: true as const,
              infoTitle: detailT("dynamicModule.infoTitle"),
              message: detailT("dynamicModule.solitaireOnlyMessage"),
            } : {
              infoOnly: false as const,
              message: detailT(memberPreviewName ? "dynamicModule.memberMessage" : "dynamicModule.message", { benefit: benefit.benefit }),
              actionLabel: detailT(memberPreviewName ? "dynamicModule.memberActionLabel" : "dynamicModule.loginLabel"),
              memberHref: hasMemberSession || memberArea
                ? `${memberBase}/privilege/${encodeURIComponent(partnerId)}`
                : `/member/login?from=${publicBasePath === "/solitaire" ? "solitaire" : "prioritas"}&redirectTo=${encodeURIComponent(`${publicBasePath}/member/privilege/${partnerId}`)}`,
            },
          } : {}),
        }}
      />
      <BackToTop bottomInset="24px" revealAtBottom />
    </main>
  );
}
