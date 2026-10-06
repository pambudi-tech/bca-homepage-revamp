"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PrioritasButton, prioritasButtonClassName } from "@/components/prioritas/PrioritasButton";

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
    <section aria-labelledby="member-medical-check-up-title" className={`pointer-events-auto relative z-0 -mx-4 mb-0 w-[calc(100%+2rem)] rounded-t-[20px] rounded-b-none bg-white px-4 pb-8 pt-6 shadow-none ${solitaire ? "border border-neutral-300" : ""} xl:mx-0 xl:mb-5 xl:w-full xl:rounded-xl xl:p-6 xl:shadow-prioritas`}>
      <div className="flex flex-col gap-0.5 lg:gap-2">
        <h2 id="member-medical-check-up-title" className="text-lg font-semibold leading-7 tracking-tight text-neutral-900 xl:text-xl">{t("title")}</h2>
        <p className="text-sm leading-6 text-neutral-700 xl:text-base">{t("description")}</p>
      </div>

      <div className="mt-4 flex flex-col overflow-hidden rounded-xl border border-neutral-300 lg:min-h-[88px] lg:flex-row">
        <div className="flex min-h-20 min-w-0 flex-1 items-center justify-between gap-4 p-4 lg:w-1/2 lg:flex-none">
          <div className="min-w-0">
            <p className="text-base leading-6 text-neutral-700">{t("provider")}</p>
            <p className="mt-1 text-lg font-semibold leading-[26px] tracking-tight text-pbrown-500">{t("voucherValue")}</p>
          </div>
          <span className="shrink-0 rounded-full bg-pgold-100 px-3 py-1 text-sm font-semibold text-pbrown-600">{t("voucherLabel")}</span>
        </div>
        <div className="relative flex min-h-20 min-w-0 flex-1 flex-wrap items-center justify-between gap-4 border-t border-dashed border-pbrown-100 bg-gradient-to-r from-white to-pgold-100 p-4 lg:w-1/2 lg:flex-none lg:border-l lg:border-t-0">
          <div className="min-w-0">
            <p className="text-xs leading-4 text-neutral-600">{t("codeLabel")}</p>
            <code className="break-all font-sans text-base font-semibold leading-6 tracking-tight text-neutral-900">{VOUCHER_CODE}</code>
          </div>
          <PrioritasButton size="large" onClick={() => void copyCode()} aria-label={t("copyCode", { code: VOUCHER_CODE })}>
            {copied ? t("copied") : t("copy")}
          </PrioritasButton>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <label className="flex flex-col gap-2 text-sm font-semibold text-neutral-800">
          {t("locationLabel")}
          <select value={location} onChange={(event) => setLocation(event.target.value)} className="h-12 w-full rounded-xl border border-neutral-300 bg-neutral-200 px-4 text-base font-normal text-neutral-800 focus:border-2 focus:border-pgold-500 focus:outline-none">
            {locations.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <a href={bookingHref} target="_blank" rel="noreferrer" className={prioritasButtonClassName({ size: "large", className: "w-full sm:w-auto" })}>
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
