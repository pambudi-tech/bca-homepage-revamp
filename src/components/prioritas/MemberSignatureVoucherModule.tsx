"use client";

import { useTranslations } from "next-intl";
import { AIRPORT_LOUNGE_VOUCHER_COUNT, type MemberSignatureVoucherStatus } from "@/lib/member-signature-voucher";

export default function MemberSignatureVoucherModule({ status, solitaire = false }: { status: MemberSignatureVoucherStatus; solitaire?: boolean }) {
  const t = useTranslations("memberSignatureVoucher");
  const exhausted = status === "exhausted";
  const badgeLabel = exhausted ? t("exhausted") : status === "unlimited" ? t("unlimited") : t("available", { count: AIRPORT_LOUNGE_VOUCHER_COUNT });

  return (
    <section aria-label={t("title")} className={`pointer-events-auto relative z-0 -mx-4 mb-0 w-[calc(100%+2rem)] rounded-t-[20px] rounded-b-none bg-white p-4 pb-9 shadow-none ${solitaire ? "border border-neutral-300" : ""} xl:mx-0 xl:mb-5 xl:w-full xl:rounded-xl xl:p-6 xl:shadow-card`}>
      <div className="flex flex-nowrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-neutral-900 xl:text-xl">{t("title")}</h2>
        <span className={`inline-flex min-h-10 items-center rounded-xl px-4 py-2 text-sm font-semibold ${exhausted ? "bg-voucher-exhausted text-voucher-exhausted-ink" : "bg-voucher-available text-voucher-available-ink"}`}>
          {badgeLabel}
        </span>
      </div>
      {status === "penalty" ? <div role="status" className="mt-4 flex items-start gap-3 rounded-xl bg-voucher-warning p-4 text-sm leading-6 text-voucher-warning-ink">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="mt-0.5 size-5 shrink-0"><path d="M12 3 2.5 20h19L12 3Z" fill="currentColor" /><path d="M12 9v5m0 3h.01" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>
        <p>{t("penaltyMessage")}</p>
      </div> : null}
    </section>
  );
}
