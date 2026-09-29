export type MemberSignatureVoucherStatus = "available" | "unlimited" | "penalty" | "exhausted";

export const AIRPORT_LOUNGE_VOUCHER_COUNT = 50;

export function getMemberSignatureVoucherStatus(value: string | string[] | undefined): MemberSignatureVoucherStatus {
  const status = Array.isArray(value) ? value[0] : value;
  if (status === "unlimited" || status === "penalty" || status === "exhausted") return status;
  return "available";
}

export function withMemberSignatureVoucherStatus(path: string, status: MemberSignatureVoucherStatus): string {
  return status === "available" ? path : `${path}?voucherStatus=${status}`;
}
