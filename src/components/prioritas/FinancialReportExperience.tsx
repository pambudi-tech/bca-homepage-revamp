"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import PrioritasDirectoryDropdown from "@/components/prioritas/PrioritasDirectoryDropdown";
import { PrioritasButtonIcon, prioritasButtonClassName } from "@/components/prioritas/PrioritasButton";
import InfoTip from "@/components/ui/InfoTip";
import FinancialReportOtpModal from "@/components/prioritas/FinancialReportOtpModal";
import { activatePortfolioViewSession } from "@/app/[locale]/prioritas/member/financial-report/actions";

type Report = "portfolio" | "tax";
type Period = "year" | "month";

const years = ["2026", "2025", "2024", "2023", "2022"];
const months = Array.from({ length: 12 }, (_, index) => String(index + 1));
const composition = [
  { key: "savings", percent: 40, color: "bg-asset-savings" },
  { key: "deposit", percent: 30, color: "bg-asset-deposit" },
  { key: "current", percent: 20, color: "bg-asset-current" },
  { key: "securities", percent: 10, color: "bg-asset-securities" },
] as const;

function ReportDropdown({ id, label, value, onChange, options, className = "", size = "large", xlSize }: { id: string; label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[]; className?: string; size?: "medium" | "large"; xlSize?: "large" }) {
  return <div className={className}>
    <PrioritasDirectoryDropdown id={id} label={label} value={value} onChange={onChange} options={options} size={size} xlSize={xlSize} />
  </div>;
}

function DownloadButton({ onClick, label }: { onClick: () => void; label: string }) {
  return <button type="button" onClick={onClick} className={prioritasButtonClassName({ variant: "secondary", size: "large", className: "w-full shrink-0 xl:w-auto" })}>
    <PrioritasButtonIcon src="/assets/prioritas/banking/download.svg" />
    <span className="prio-button__label">{label}</span>
  </button>;
}

function SummaryCards({ t, visible, onToggleVisibility }: { t: ReturnType<typeof useTranslations<"memberFinancialReport">>; visible: boolean; onToggleVisibility: () => void }) {
  const cards = [
    { key: "netWorth", change: "positive" },
    { key: "assets", change: "neutral" },
    { key: "liabilities", change: "warning" },
  ] as const;
  return <div className="grid divide-y divide-neutral-300 md:grid-cols-3 md:divide-x md:divide-y-0">
    {cards.map(({ key, change }) => <div key={key} className="flex h-36 min-h-0 flex-col px-4 py-3 md:h-auto md:min-h-[200px] md:p-5">
      <div className="flex items-center gap-2 text-base font-semibold text-neutral-800 md:text-lg">
        {t(`summary.${key}`)} <InfoTip label={t(`summary.${key}Info`)} message={t(`summary.${key}Info`)} tone="prioritas" />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 md:h-12">
        <p className="text-[28px] font-semibold leading-9 text-neutral-900 md:text-[32px] md:leading-10">{visible ? t(`previewAmounts.${key}`) : t("maskedAmount")}</p>
        {key === "netWorth" ? <button type="button" onClick={onToggleVisibility} aria-label={t(visible ? "visibility.hide" : "visibility.show")} aria-pressed={visible} className={prioritasButtonClassName({ kind: "icon", variant: "secondary", surface: "default", size: "large", className: "shrink-0" })}>
          <PrioritasButtonIcon src={`/assets/member-login/eye${visible ? "" : "-off"}.svg`} />
        </button> : null}
      </div>
      <p className={`mt-auto pt-3 text-sm font-semibold md:text-base ${change === "positive" ? "text-green-600" : change === "warning" ? "text-pgold-700" : "text-neutral-600"}`}>{t(`summary.${key}Change`)}</p>
    </div>)}
  </div>;
}

function WealthChart({ t, interval, setInterval, visible }: { t: ReturnType<typeof useTranslations<"memberFinancialReport">>; interval: string; setInterval: (value: string) => void; visible: boolean }) {
  return <section aria-labelledby="wealth-chart-title" className="min-w-0 rounded-xl border border-pbrown-100 bg-white p-5 shadow-prioritas md:p-6">
    <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-start md:justify-between">
      <h2 id="wealth-chart-title" className="text-subtitle text-neutral-800">{t("chart.title")}</h2>
      <ReportDropdown id="financial-chart-interval" label={t("chart.intervalLabel")} value={interval} onChange={setInterval} options={[{ value: "yearly", label: t("chart.yearly") }, { value: "monthly", label: t("chart.monthly") }]} className="w-full md:w-40" size="medium" xlSize="large" />
    </div>
    <div className="mt-6 grid grid-cols-[52px_minmax(0,1fr)] gap-1 md:gap-3">
      <div className="flex h-80 flex-col justify-between pb-0 text-right text-sm font-semibold text-neutral-700 md:h-[410px]">{Array.from({ length: 7 }, (_, i) => <span key={i}>{i === 6 ? "0" : visible ? t(`previewAmounts.chart.${i}`) : t("maskedAmount")}</span>)}</div>
      <div className="min-w-0">
        <div className="relative h-80 border-l border-b border-neutral-300 md:h-[410px]">
          <div aria-hidden className="absolute inset-0 flex flex-col justify-between">{Array.from({ length: 7 }, (_, i) => <div key={i} className="w-full border-t border-neutral-300" />)}</div>
          <svg aria-hidden viewBox="0 0 720 410" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible">
            <defs><linearGradient id="financial-chart-fill" x1="0" y1="0" x2="0" y2="1"><stop stopColor="var(--color-pgold-400)" stopOpacity="0.3" /><stop offset="1" stopColor="var(--color-pgold-400)" stopOpacity="0" /></linearGradient></defs>
            <path d="M0 355 L165 307 L335 170 L505 199 L680 101 L680 410 L0 410 Z" fill="url(#financial-chart-fill)" />
            <path d="M0 355 L165 307 L335 170 L505 199 L680 101" fill="none" stroke="var(--color-pgold-400)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          </svg>
          <div aria-hidden className="pointer-events-none absolute inset-0">
            {[[0, 355], [165, 307], [335, 170], [505, 199], [680, 101]].map(([x, y]) => <span key={x} className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pgold-500" style={{ left: `${x / 720 * 100}%`, top: `${y / 410 * 100}%` }} />)}
          </div>
        </div>
        <div className="mt-3 flex justify-between text-xs text-neutral-700 md:text-sm">{(interval === "yearly" ? ["2022", "2023", "2024", "2025", t("chart.lastPeriod")] : ["3", "4", "5", "6", "7"].map((month) => t(`months.${month}`))).map((label) => <span key={label}>{label}</span>)}</div>
      </div>
    </div>
    <p className="mt-5 flex items-center justify-center gap-2 text-sm text-neutral-700"><span className="size-3 rounded-sm bg-pgold-500" />{t("summary.netWorth")}</p>
  </section>;
}

function Composition({ t, visible }: { t: ReturnType<typeof useTranslations<"memberFinancialReport">>; visible: boolean }) {
  return <section aria-labelledby="asset-composition-title" className="rounded-xl border border-pbrown-100 bg-white px-4 pb-8 pt-12 shadow-prioritas md:px-8">
    <div className="relative mx-auto size-50 max-w-full rounded-full md:size-[280px]" style={{ background: "conic-gradient(var(--color-asset-securities) 0% 9.45%, white 9.45% 10.05%, var(--color-asset-current) 10.05% 29.45%, white 29.45% 30.05%, var(--color-asset-deposit) 30.05% 59.45%, white 59.45% 60.05%, var(--color-asset-savings) 60.05% 99.45%, white 99.45% 100%)" }}>
      <div className="absolute inset-8 flex items-center justify-center rounded-full bg-white text-center md:inset-[44px]">
        <h2 id="asset-composition-title" className="max-w-28 text-base font-semibold leading-5 text-neutral-800">{t("composition.title")}</h2>
      </div>
    </div>
    <ul className="mt-12 w-full divide-y divide-neutral-300 text-sm font-semibold text-neutral-700 md:text-base md:font-normal">
      {composition.map((item) => <li key={item.key} className="grid min-h-12 w-full grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-2"><span className="flex min-w-0 items-center gap-3"><span className={`size-4 shrink-0 rounded-sm ${item.color}`} />{t(`composition.${item.key}`)}</span><span>{item.percent}%</span><span className="size-1 rounded-full bg-neutral-500" aria-hidden="true" /><span>{visible ? t(`previewAmounts.composition.${item.key}`) : t("maskedAmount")}</span></li>)}
    </ul>
  </section>;
}

function CategoryCards({ t, category, visible }: { t: ReturnType<typeof useTranslations<"memberFinancialReport">>; category: "assets" | "liabilities"; visible: boolean }) {
  const keys = category === "assets" ? ["savings", "investments", "protection"] as const : ["consumerCredit", "workingCapital", "creditCard"] as const;
  return <section aria-labelledby={`${category}-heading`}>
    <h2 id={`${category}-heading`} className="mb-6 text-2xl font-semibold text-neutral-800">{t(`categories.${category}`)}</h2>
    <div className="grid overflow-hidden rounded-xl border border-pbrown-100 bg-white shadow-prioritas md:grid-cols-3 md:divide-x md:divide-pbrown-100">
      {keys.map((key) => <article key={key} className="flex h-36 flex-col border-b border-pbrown-100 p-4 last:border-b-0 md:h-auto md:min-h-[200px] md:border-b-0 md:p-5"><h3 className="text-base font-semibold text-neutral-800 md:text-lg">{t(`categories.${key}`)}</h3><p className="mt-3 text-[28px] font-semibold leading-9 text-neutral-900 md:text-[32px] md:leading-10">{visible ? t(`previewAmounts.categories.${key}`) : t("maskedAmount")}</p><p className="mt-auto pt-3 text-sm font-semibold text-green-600 md:text-base">{t("categories.change")}</p></article>)}
    </div>
  </section>;
}

export default function FinancialReportExperience({ report, portfolioSessionExpiresAt: initialPortfolioSessionExpiresAt }: { report: Report; portfolioSessionExpiresAt: number | null }) {
  const t = useTranslations("memberFinancialReport");
  const [period, setPeriod] = useState<Period>("month");
  const [year, setYear] = useState("2026");
  const [month, setMonth] = useState("6");
  const [portfolioMonth, setPortfolioMonth] = useState("7");
  const [interval, setInterval] = useState("yearly");
  const [notice, setNotice] = useState("");
  const [portfolioSessionExpiresAt, setPortfolioSessionExpiresAt] = useState(initialPortfolioSessionExpiresAt);
  const [amountsVisible, setAmountsVisible] = useState(report === "portfolio" && initialPortfolioSessionExpiresAt !== null);
  const [otpOpen, setOtpOpen] = useState(false);
  const showNotice = () => setNotice(t("previewNotice"));
  const yearOptions = years.map((item) => ({ value: item, label: item }));
  const monthOptions = months.map((item) => ({ value: item, label: t(`months.${item}`) }));

  useEffect(() => {
    if (!portfolioSessionExpiresAt) return;
    const timer = window.setTimeout(() => {
      setPortfolioSessionExpiresAt(null);
      setAmountsVisible(false);
    }, Math.max(0, portfolioSessionExpiresAt - Date.now()));
    return () => window.clearTimeout(timer);
  }, [portfolioSessionExpiresAt]);

  async function verifyPortfolioOtp(code: string) {
    const expiresAt = await activatePortfolioViewSession(code);
    if (expiresAt) {
      setPortfolioSessionExpiresAt(expiresAt);
      setAmountsVisible(true);
    }
    return expiresAt;
  }

  return <div className={`relative isolate ${report === "tax" ? "min-h-[calc(100vh-320px)]" : ""}`}>
    <img aria-hidden src="/assets/prioritas/member-overview/decoration.png" alt="" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[748px] w-full object-cover object-top" />
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-10 px-4 pt-8 pb-10 xl:px-0">
      {report === "tax" ? <section aria-label={t("tax.title")} className="flex w-full flex-col gap-5 rounded-xl border border-pbrown-100 bg-white p-4 shadow-prioritas md:p-6 xl:flex-row xl:items-center xl:justify-between">
        <h2 className="w-full text-xl font-semibold leading-7 text-blue-800 xl:max-w-52">{t("tax.title")}</h2>
        <div className="flex w-full flex-wrap items-center gap-3 xl:w-auto">
          <div role="group" aria-label={t("tax.periodLabel")} className="flex w-full gap-3">{(["year", "month"] as const).map((value) => <button key={value} type="button" aria-pressed={period === value} onClick={() => setPeriod(value)} className="priosoli-chip priosoli-chip--medium priosoli-chip--xl-large flex-1 justify-center">{t(`tax.${value}`)}</button>)}</div>
          <ReportDropdown id="financial-tax-year" label={t("tax.yearLabel")} value={year} onChange={setYear} options={yearOptions} className="w-full xl:w-[150px]" size="medium" />
          {period === "month" ? <ReportDropdown id="financial-tax-month" label={t("tax.monthLabel")} value={month} onChange={setMonth} options={monthOptions} className="w-full xl:w-[150px]" size="medium" /> : null}
        </div>
        <div className="w-full xl:w-auto"><DownloadButton onClick={showNotice} label={t("download")} /></div>
      </section> : <>
        <div>
          <section aria-label={t("overviewLabel")} className="overflow-hidden rounded-xl border border-pbrown-100 bg-white shadow-prioritas">
            <div className="flex items-center justify-between gap-3 border-b border-pbrown-100 p-4 md:p-5">
              <ReportDropdown id="financial-portfolio-month" label={t("portfolio.periodLabel")} value={portfolioMonth} onChange={setPortfolioMonth} options={monthOptions.map((option) => ({ ...option, label: `${option.label} 2026` }))} className="min-w-0 flex-1 md:w-[260px] md:flex-none" size="medium" xlSize="large" />
              <button type="button" onClick={showNotice} aria-label={t("download")} className={`${prioritasButtonClassName({ kind: "icon", variant: "secondary", size: "medium" })} md:hidden`}>
                <PrioritasButtonIcon src="/assets/prioritas/banking/download.svg" />
              </button>
              <div className="hidden md:block"><DownloadButton onClick={showNotice} label={t("download")} /></div>
            </div>
            <SummaryCards t={t} visible={amountsVisible} onToggleVisibility={() => {
              if (amountsVisible) setAmountsVisible(false);
              else if (portfolioSessionExpiresAt && portfolioSessionExpiresAt > Date.now()) setAmountsVisible(true);
              else setOtpOpen(true);
            }} />
          </section>
          <p className="mt-4 text-sm text-neutral-700">{t("updated")}</p>
        </div>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,846px)_minmax(0,410px)]"><WealthChart t={t} interval={interval} setInterval={setInterval} visible={amountsVisible} /><Composition t={t} visible={amountsVisible} /></div>
        <CategoryCards t={t} category="assets" visible={amountsVisible} />
        <CategoryCards t={t} category="liabilities" visible={amountsVisible} />
      </>}
      {notice ? <p role="status" className="rounded-xl border border-pgold-400 bg-pgold-100 p-4 text-base text-pbrown-800">{notice}</p> : null}
    </div>
    {otpOpen ? <FinancialReportOtpModal onClose={() => setOtpOpen(false)} onVerified={verifyPortfolioOtp} /> : null}
  </div>;
}
