import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import BackToTop from "@/components/home/BackToTop";
import PrioritasDetailExperience from "@/components/prioritas/PrioritasDetailExperience";
import { getPrivilegeOffer, getPrivilegePromos, splitPartnerTerms, type PrivilegeSection } from "@/lib/partner-privileges";
import type { MemberSignatureVoucherStatus } from "@/lib/member-signature-voucher";
import { cookies } from "next/headers";
import { MEMBER_SESSION_COOKIE, MEMBER_SESSION_VALUE } from "@/lib/member-auth";

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
}: {
  locale: string;
  partnerId: string;
  section: PrivilegeSection;
  memberArea?: boolean;
  memberVoucherStatus?: MemberSignatureVoucherStatus;
}) {
  setRequestLocale(locale);
  const offer = getPrivilegeOffer(section, partnerId);
  if (!offer) notFound();

  const detailT = await getTranslations("lifestylePrivilegeDetail");
  const session = (await cookies()).get(MEMBER_SESSION_COOKIE)?.value;
  const memberPreviewName = session === MEMBER_SESSION_VALUE
    ? await (await getTranslations("memberOverview"))("previewFullName")
    : undefined;
  const hasMemberSession = session === MEMBER_SESSION_VALUE;
  const signatureT = await getTranslations("signaturePrivilege");
  const { partner, benefit, asset, logo } = offer;
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
    <main id="main-content" className="flex min-h-screen flex-1 flex-col overflow-x-clip bg-pgold-200">
      <PrioritasDetailExperience
        memberArea={memberArea}
        memberPreviewName={memberPreviewName}
        memberSessionActive={hasMemberSession}
        memberAirportTransfer={(memberArea || hasMemberSession) && partnerId === "airport-transfer-domestik" ? "domestic" : (memberArea || hasMemberSession) && partnerId === "airport-transfer-internasional" ? "international" : false}
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
            home: detailT("breadcrumb.home"),
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
          ...(isSignatureModule ? {
            dynamicModule: {
              message: detailT(memberPreviewName ? "dynamicModule.memberMessage" : "dynamicModule.message", { benefit: benefit.benefit }),
              actionLabel: detailT(memberPreviewName ? "dynamicModule.memberActionLabel" : "dynamicModule.loginLabel"),
              memberHref: `/prioritas/member/privilege/${encodeURIComponent(partnerId)}`,
            },
          } : {}),
        }}
      />
      <BackToTop bottomInset="24px" revealAtBottom />
    </main>
  );
}
