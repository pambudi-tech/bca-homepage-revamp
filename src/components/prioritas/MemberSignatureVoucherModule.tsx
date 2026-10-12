"use client";

import { IconAsset } from "@/components/icons/IconAsset";

import { useTranslations } from "next-intl";
import { AIRPORT_LOUNGE_VOUCHER_COUNT, type MemberSignatureVoucherStatus } from "@/lib/member-signature-voucher";

export default function MemberSignatureVoucherModule({ status, solitaire = false }: { status: MemberSignatureVoucherStatus; solitaire?: boolean }) {
  const t = useTranslations("memberSignatureVoucher");
  const exhausted = status === "exhausted";
  const badgeLabel = exhausted ? t("exhausted") : status === "unlimited" ? t("unlimited") : t("available", { count: AIRPORT_LOUNGE_VOUCHER_COUNT });

  return (
    <section aria-label={t("title")} className={`pointer-events-auto relative z-0 -mx-4 mb-0 w-[calc(100%+2rem)] rounded-t-[20px] rounded-b-none bg-white p-4 pb-9 shadow-none ${solitaire ? "border border-neutral-300" : ""} xl:mx-0 xl:mb-5 xl:w-full xl:rounded-xl xl:p-6 xl:shadow-card`}>
      <div className="flex flex-nowrap items-center justify-between gap-3">
        <h2 className="text-size-body-xl font-semibold text-neutral-900 xl:text-size-display-s">{t("title")}</h2>
        <span className={`inline-flex min-h-10 items-center rounded-xl px-4 py-2 text-size-body-m font-semibold ${exhausted ? "bg-red-300 text-red-700" : "bg-green-300 text-green-700"}`}>
          {badgeLabel}
        </span>
      </div>
      {status === "penalty" ? <div role="status" className="mt-4 flex items-start gap-3 rounded-xl bg-yellow-100 p-4 text-size-body-m leading-6 text-yellow-700">
        <IconAsset src="/assets/asset-bank/icons/MemberSignatureVoucherModule-f781f2369d4fdda4.svg" aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
        <p>{t("penaltyMessage")}</p>
      </div> : null}
    </section>
  );
}
