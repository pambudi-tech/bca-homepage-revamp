import type { Metadata } from "next";
import PartnerPrivilegeDetailPage from "@/components/prioritas/PartnerPrivilegeDetailPage";
import { getPrivilegeOffer } from "@/lib/partner-privileges";
import { getMemberSignatureVoucherStatus } from "@/lib/member-signature-voucher";

type DetailParams = { locale: string; benefitId: string };

export async function generateMetadata({ params }: { params: Promise<DetailParams> }): Promise<Metadata> {
  const { benefitId } = await params;
  const offer = getPrivilegeOffer("signature", benefitId) ?? getPrivilegeOffer("complimentary", benefitId);
  if (!offer) return {};
  return { title: `${offer.benefit.benefit} | BCA Prioritas`, description: offer.partner.description };
}

export default async function MemberPrivilegeDetailPage({ params, searchParams }: { params: Promise<DetailParams>; searchParams: Promise<{ voucherStatus?: string | string[] }> }) {
  const [{ locale, benefitId }, query] = await Promise.all([params, searchParams]);
  const section = getPrivilegeOffer("signature", benefitId) ? "signature" : "complimentary";
  return <PartnerPrivilegeDetailPage locale={locale} partnerId={benefitId} section={section} memberArea memberVoucherStatus={getMemberSignatureVoucherStatus(query.voucherStatus)} />;
}
