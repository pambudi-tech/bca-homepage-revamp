"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PrioritasButton } from "@/components/prioritas/PrioritasButton";

type AirportTransferVoucher = {
  id: string;
  provider: string;
  amount: string;
  logo?: string;
  code: string;
  usedOn?: string;
};

const domesticVouchers: AirportTransferVoucher[] = [
  { id: "first", provider: "Golden Rama", amount: "Rp2,000,000", logo: "/assets/prioritas/partner-logos/golden-rama.png", code: "SU-GB-ABCDE" },
  { id: "second", provider: "Goldenbird", amount: "Rp750,000", logo: "/assets/prioritas/member-airport-transfer/goldenbird-750k.png", code: "SU-GB-FGHIJ" },
  { id: "third", provider: "Goldenbird", amount: "Rp750,000", logo: "/assets/prioritas/member-airport-transfer/goldenbird-750k.png", code: "SU-GB-KLMNO" },
  { id: "grab", provider: "Grab", amount: "Rp350,000", code: "12RET56Y" },
  { id: "used", provider: "Goldenbird", amount: "Rp750,000", logo: "/assets/prioritas/member-airport-transfer/goldenbird-750k.png", code: "SU-GB-PQRST", usedOn: "08/09/2026" },
];
const internationalVouchers: AirportTransferVoucher[] = [
  { id: "singapore", provider: "Golden Rama", amount: "Rp2,000,000", logo: "/assets/prioritas/partner-logos/golden-rama.png", code: "SU-GR-INTL01" },
  { id: "kuala-lumpur", provider: "Golden Rama", amount: "Rp2,000,000", logo: "/assets/prioritas/partner-logos/golden-rama.png", code: "SU-GR-INTL02" },
];
const INITIAL_VOUCHER_COUNT = 2;

export default function MemberAirportTransferModule({ variant }: { variant: "domestic" | "international" }) {
  const t = useTranslations("memberAirportTransfer");
  const vouchers = variant === "international" ? internationalVouchers : domesticVouchers;
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  async function copyCode(id: string, code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId((current) => current === id ? null : current), 2000);
    } catch {
      setCopiedId(null);
    }
  }

  function renderVoucher(voucher: (typeof vouchers)[number]) {
    return (
      <div key={voucher.id} className="flex flex-col gap-0">
        <div className={`flex flex-col overflow-hidden rounded-t-xl ${voucher.usedOn ? "rounded-b-none" : "rounded-b-xl"} border border-neutral-300 lg:h-[88px] lg:flex-row`}>
          <div className="flex h-[80px] min-w-0 flex-1 items-center justify-between gap-4 p-4 lg:h-[88px] lg:w-1/2 lg:flex-none">
            {voucher.logo ? <img src={voucher.logo} alt="" className="size-10 shrink-0 object-contain lg:size-[54px]" /> : <img src="/assets/prioritas/member-airport-transfer/grab-logo.svg" alt="" className="h-8 w-[58px] shrink-0 object-contain" />}
            <div className="flex min-w-0 flex-1 items-center justify-between gap-3 lg:flex-col lg:items-start lg:justify-center lg:gap-0">
              <p className="text-base leading-6 text-neutral-700">{voucher.provider}</p>
              <p className="text-lg font-semibold leading-[26px] tracking-tight text-pbrown-500 lg:mt-1">{voucher.amount}</p>
            </div>
          </div>
          <div className={`relative flex h-[80px] min-w-0 flex-1 flex-row flex-wrap items-center justify-between gap-4 p-4 after:absolute after:inset-x-0 after:top-0 after:h-px after:bg-[repeating-linear-gradient(to_right,var(--color-pbrown-100)_0_6px,transparent_6px_12px)] lg:h-auto lg:w-1/2 lg:flex-none lg:justify-between lg:after:hidden lg:before:absolute lg:before:inset-y-0 lg:before:left-0 lg:before:w-px lg:before:bg-[repeating-linear-gradient(to_bottom,var(--color-pbrown-100)_0_6px,transparent_6px_12px)] ${voucher.usedOn ? "bg-white" : "bg-gradient-to-r from-white to-pgold-100"}`}>
            <code className={`break-all font-sans text-base font-semibold leading-6 tracking-tight ${voucher.usedOn ? "text-neutral-500 line-through" : "text-neutral-900"}`}>{voucher.code}</code>
            {voucher.usedOn ? <PrioritasButton size="large" disabled>{t("used")}</PrioritasButton> : <PrioritasButton size="large" onClick={() => void copyCode(voucher.id, voucher.code)} trailingIcon={<img src="/assets/prioritas/member-airport-transfer/copy.svg" alt="" aria-hidden="true" className="size-5" />} aria-label={t("copyCode", { code: voucher.code })}>
              {copiedId === voucher.id ? t("copied") : t("copy")}
            </PrioritasButton>}
          </div>
        </div>
        {voucher.usedOn ? <div className="rounded-t-none rounded-b-xl border border-t-0 border-pbrown-100 bg-pgold-100 p-4">
          <p className="text-sm leading-5 text-pbrown-600">{t("usedOn", { date: voucher.usedOn })}</p>
        </div> : null}
      </div>
    );
  }

  return (
    <section aria-labelledby="member-airport-transfer-title" className="pointer-events-auto relative z-0 -mx-4 mb-0 w-[calc(100%+2rem)] rounded-t-[20px] rounded-b-none bg-white px-4 pb-11 pt-6 shadow-none xl:mx-0 xl:mb-5 xl:w-full xl:rounded-xl xl:p-6 xl:shadow-prioritas">
      <div className="flex flex-col gap-0.5 lg:gap-2">
        <h2 id="member-airport-transfer-title" className="text-lg font-semibold leading-7 tracking-tight text-neutral-900 xl:text-xl">{t("title")}</h2>
        <p className="text-sm leading-6 text-neutral-700 xl:text-base">{t("description")}</p>
      </div>
      <div className="mt-4 flex flex-col gap-4">
        {vouchers.slice(0, INITIAL_VOUCHER_COUNT).map(renderVoucher)}
        <div className={`grid transition-[grid-template-rows,opacity] duration-500 ease-in-out motion-reduce:transition-none ${showAll ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
          <div className="min-h-0 overflow-hidden">
            <div className="flex flex-col gap-4">
              {vouchers.slice(INITIAL_VOUCHER_COUNT).map(renderVoucher)}
            </div>
          </div>
        </div>
      </div>
      {vouchers.length > INITIAL_VOUCHER_COUNT ? <PrioritasButton variant="secondary" size="large" className="mt-4 w-full" onClick={() => setShowAll((current) => !current)} trailingIcon={<span aria-hidden="true" className={`size-5 bg-current transition-transform ${showAll ? "rotate-180" : ""}`} style={{ maskImage: "url(/assets/navbar/chevron-down-dark.svg)", WebkitMaskImage: "url(/assets/navbar/chevron-down-dark.svg)", maskPosition: "center", WebkitMaskPosition: "center", maskRepeat: "no-repeat", WebkitMaskRepeat: "no-repeat", maskSize: "contain" }} />} aria-expanded={showAll}>
        {showAll ? t("hideMore") : t("viewMore")}
      </PrioritasButton> : null}
      <ul className="mt-5 list-disc space-y-2 pl-5 text-sm leading-6 text-neutral-700">
        <li>{t("notes.updated")}</li>
        <li>{t("notes.contact")}</li>
      </ul>
    </section>
  );
}
