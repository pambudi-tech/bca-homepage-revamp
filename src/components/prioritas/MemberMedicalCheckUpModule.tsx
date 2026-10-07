"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PrioritasButton, prioritasButtonClassName, solitaireButtonClassName } from "@/components/prioritas/PrioritasButton";
import PrioritasDirectoryDropdown from "@/components/prioritas/PrioritasDirectoryDropdown";

const VOUCHER_CODE = "EHS-SG-26-A4K8";
export default function MemberMedicalCheckUpModule({ solitaire = false }: { solitaire?: boolean }) {
  const t = useTranslations("memberMedicalCheckUp");
  const locations = t.raw("locations") as string[];
  const [copied, setCopied] = useState(false);
  const [location, setLocation] = useState(locations[0] ?? "");
  const message = t("whatsappMessage", { code: VOUCHER_CODE, location });
  const bookingHref = `https://wa.me/6281130181122?text=${encodeURIComponent(message)}`;

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(VOUCHER_CODE);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section aria-labelledby="member-medical-check-up-title" className={`pointer-events-auto relative z-0 -mx-4 mb-0 w-[calc(100%+2rem)] rounded-t-[20px] rounded-b-none bg-white px-4 pb-8 pt-6 shadow-none ${solitaire ? "border border-neutral-300" : ""} xl:mx-0 xl:mb-5 xl:w-full xl:rounded-xl xl:p-6 ${solitaire ? "xl:shadow-card" : "xl:shadow-prioritas"}`}>
      <div className="flex flex-col gap-0.5 lg:gap-2">
        <h2 id="member-medical-check-up-title" className="text-lg font-semibold leading-7 tracking-tight text-neutral-900 xl:text-xl">{t("title")}</h2>
        <p className="text-sm leading-6 text-neutral-700 xl:text-base">{t("description")}</p>
      </div>

      <div className="mt-4 flex flex-col overflow-hidden rounded-xl border border-neutral-300 lg:min-h-[88px] lg:flex-row">
        <div className="flex min-h-20 min-w-0 flex-1 items-center justify-between gap-4 p-4 lg:w-1/2 lg:flex-none">
          <div className="min-w-0">
            <p className="text-base leading-6 text-neutral-700">{t("provider")}</p>
            <p className={`mt-1 text-lg font-semibold leading-[26px] tracking-tight ${solitaire ? "text-neutral-800" : "text-pbrown-500"}`}>{t("voucherValue")}</p>
          </div>
          <span className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${solitaire ? "bg-neutral-200 text-neutral-800" : "bg-pgold-100 text-pbrown-600"}`}>{t("voucherLabel")}</span>
        </div>
        <div className={`relative flex min-h-20 min-w-0 flex-1 flex-wrap items-center justify-between gap-4 border-t border-dashed p-4 lg:w-1/2 lg:flex-none lg:border-l lg:border-t-0 ${solitaire ? "border-neutral-300 bg-gradient-to-r from-neutral-100 to-neutral-200" : "border-pbrown-100 bg-gradient-to-r from-white to-pgold-100"}`}>
          <div className="min-w-0">
            <p className="text-xs leading-4 text-neutral-600">{t("codeLabel")}</p>
            <code className="break-all font-sans text-base font-semibold leading-6 tracking-tight text-neutral-900">{VOUCHER_CODE}</code>
          </div>
          <PrioritasButton tone={solitaire ? "solitaire" : "prioritas"} size="large" onClick={() => void copyCode()} aria-label={t("copyCode", { code: VOUCHER_CODE })}>
            {copied ? t("copied") : t("copy")}
          </PrioritasButton>
        </div>
      </div>

      <div className={`mt-4 grid gap-3 ${solitaire ? "" : "sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"}`}>
        <div className="flex flex-col gap-2 text-sm font-semibold text-neutral-800">
          <span>{t("locationLabel")}</span>
          <PrioritasDirectoryDropdown id="medical-check-up-location" label={t("locationLabel")} value={location} onChange={setLocation} options={locations.map((item) => ({ value: item, label: item }))} size={solitaire ? "large" : "medium"} tone={solitaire ? "solitaire" : "prioritas"} optionWeight="regular" />
        </div>
        <a href={bookingHref} target="_blank" rel="noreferrer" className={(solitaire ? solitaireButtonClassName : prioritasButtonClassName)({ size: "large", className: solitaire ? "w-full" : "w-full sm:w-auto" })}>
          {t("book")}
        </a>
      </div>

      <ul className="mt-5 list-disc space-y-2 pl-5 text-sm leading-6 text-neutral-700">
        <li>{t("eligibility")}</li>
        <li>{t("bookingTerms")}</li>
        <li>{t("paymentTerms")}</li>
        <li>{t("validityTerms")}</li>
        <li>{t("cancellationTerms")}</li>
      </ul>
    </section>
  );
}
