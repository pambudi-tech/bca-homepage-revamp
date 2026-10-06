"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import PrioritasDirectoryDropdown from "@/components/prioritas/PrioritasDirectoryDropdown";
import { PrioritasButtonIcon, prioritasButtonClassName, solitaireButtonClassName } from "@/components/prioritas/PrioritasButton";
import InfoTip from "@/components/ui/InfoTip";
import FinancialReportOtpModal from "@/components/prioritas/FinancialReportOtpModal";
import { activatePortfolioViewSession } from "@/app/[locale]/prioritas/member/financial-report/actions";

type Report = "portfolio" | "tax";
type Period = "year" | "month";

const years = ["2026", "2025", "2024", "2023", "2022"];
const months = Array.from({ length: 12 }, (_, index) => String(index + 1));
const monthlyNetWorth = [3.65, 3.72, 3.78, 3.9, 4.05, 4.14, 4.28, 4.37, 4.3, 4.51, 4.58, 4.72];
const monthlyLiabilities = [0.52, 0.51, 0.53, 0.54, 0.52, 0.5, 0.48, 0.47, 0.49, 0.46, 0.45, 0.44];
const composition = [
  { key: "savings", percent: 40, color: "bg-asset-savings", solitaireColor: "bg-neutral-700", solitaireStroke: "var(--color-neutral-700)" },
  { key: "deposit", percent: 30, color: "bg-asset-deposit", solitaireColor: "bg-neutral-600", solitaireStroke: "var(--color-neutral-600)" },
  { key: "current", percent: 20, color: "bg-asset-current", solitaireColor: "bg-neutral-500", solitaireStroke: "var(--color-neutral-500)" },
  { key: "securities", percent: 10, color: "bg-asset-securities", solitaireColor: "bg-neutral-400", solitaireStroke: "var(--color-neutral-400)" },
] as const;
const compositionPieOrder = [...composition].reverse();

function describeCompositionArc(startPercent: number, endPercent: number) {
  const startAngle = (startPercent * 3.6) - 90;
  const endAngle = (endPercent * 3.6) - 90;
  const toPoint = (angle: number) => {
    const radians = angle * Math.PI / 180;
    return { x: 50 + 42 * Math.cos(radians), y: 50 + 42 * Math.sin(radians) };
  };
  const start = toPoint(startAngle);
  const end = toPoint(endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A 42 42 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

type PortfolioSnapshot = {
  netWorth: number;
  assets: number;
  liabilities: number;
  composition: Record<(typeof composition)[number]["key"], number>;
  categories: Record<"savings" | "investments" | "protection" | "consumerCredit" | "workingCapital" | "creditCard", number>;
};

function getPortfolioSnapshot(month: string): PortfolioSnapshot {
  const index = Math.max(0, Number(month) - 1) % monthlyNetWorth.length;
  const netWorth = monthlyNetWorth[index];
  const liabilities = monthlyLiabilities[index];
  const assets = netWorth + liabilities;
  return {
    netWorth,
    assets,
    liabilities,
    composition: {
      savings: assets * 0.4,
      deposit: assets * 0.3,
      current: assets * 0.2,
      securities: assets * 0.1,
    },
    categories: {
      savings: assets * (120 / 410.1),
      investments: assets * (210 / 410.1),
      protection: assets * (80.1 / 410.1),
      consumerCredit: liabilities * (12 / 33.6),
      workingCapital: liabilities * (14 / 33.6),
      creditCard: liabilities * (7.6 / 33.6),
    },
  };
}

function formatPortfolioAmount(value: number, locale: string) {
  const amount = new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value);
  const unit = locale.startsWith("id") ? "M" : locale.startsWith("zh") ? "十亿" : "B";
  return `Rp${amount} ${unit}`;
}

function formatPortfolioAxisAmount(value: number, locale: string) {
  const amount = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);
  const unit = locale.startsWith("id") ? "M" : locale.startsWith("zh") ? "十亿" : "B";
  return `Rp${amount} ${unit}`;
}

function ReportDropdown({ id, label, value, onChange, options, className = "", size = "large", xlSize, solitaire = false }: { id: string; label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[]; className?: string; size?: "medium" | "large"; xlSize?: "large"; solitaire?: boolean }) {
  return <div className={className}>
    <PrioritasDirectoryDropdown id={id} label={label} value={value} onChange={onChange} options={options} size={size} xlSize={xlSize} tone={solitaire ? "solitaire" : "prioritas"} />
  </div>;
}

function DownloadButton({ onClick, label, solitaire = false }: { onClick: () => void; label: string; solitaire?: boolean }) {
  const buttonClassName = solitaire ? solitaireButtonClassName : prioritasButtonClassName;
  return <button type="button" onClick={onClick} className={buttonClassName({ variant: "secondary", size: "large", className: "w-full shrink-0 xl:w-auto" })}>
    <PrioritasButtonIcon src="/assets/prioritas/banking/download.svg" />
    <span className="prio-button__label">{label}</span>
  </button>;
}

function SummaryCards({ t, visible, onToggleVisibility, snapshot, locale, solitaire = false }: { t: ReturnType<typeof useTranslations<"memberFinancialReport">>; visible: boolean; onToggleVisibility: () => void; snapshot: PortfolioSnapshot; locale: string; solitaire?: boolean }) {
  const cards = [
    { key: "netWorth", change: "positive", amount: snapshot.netWorth },
    { key: "assets", change: "neutral", amount: snapshot.assets },
    { key: "liabilities", change: "warning", amount: snapshot.liabilities },
  ] as const;
  return <div className="grid divide-y divide-neutral-300 md:grid-cols-3 md:divide-x md:divide-y-0">
    {cards.map(({ key, change, amount }) => <div key={key} className="flex h-36 min-h-0 flex-col px-4 py-3 md:h-auto md:min-h-[200px] md:p-5">
      <div className="flex items-center gap-2 text-base font-semibold text-neutral-800 md:text-lg">
        {t(`summary.${key}`)} <InfoTip label={t(`summary.${key}Info`)} message={t(`summary.${key}Info`)} tone={solitaire ? "solitaire" : "prioritas"} />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 md:h-12">
        <p className="text-[28px] font-semibold leading-9 text-neutral-900 md:text-[32px] md:leading-10">{visible ? formatPortfolioAmount(amount, locale) : t("maskedAmount")}</p>
        {key === "netWorth" ? <button type="button" onClick={onToggleVisibility} aria-label={t(visible ? "visibility.hide" : "visibility.show")} aria-pressed={visible} className={(solitaire ? solitaireButtonClassName : prioritasButtonClassName)({ kind: "icon", variant: "secondary", surface: "default", size: "large", className: "shrink-0" })}>
          <PrioritasButtonIcon src={`/assets/member-login/eye${visible ? "" : "-off"}.svg`} />
        </button> : null}
      </div>
      <p className={`mt-auto pt-3 text-sm font-semibold md:text-base ${change === "positive" ? "text-green-600" : change === "warning" ? "text-pgold-700" : "text-neutral-600"}`}>{t(`summary.${key}Change`)}</p>
    </div>)}
  </div>;
}

function WealthChart({ t, interval, setInterval, visible, selectedMonth, locale, solitaire = false }: { t: ReturnType<typeof useTranslations<"memberFinancialReport">>; interval: string; setInterval: (value: string) => void; visible: boolean; selectedMonth: string; locale: string; solitaire?: boolean }) {
  const selectedMonthIndex = Math.max(0, Number(selectedMonth) - 1) % monthlyNetWorth.length;
  const chartData = interval === "yearly"
    ? [2022, 2023, 2024, 2025, 2026].map((year) => ({ label: year === 2026 ? `${t(`months.${selectedMonthIndex + 1}`)} 2026` : String(year), value: monthlyNetWorth[selectedMonthIndex] - (2026 - year) * 0.45 }))
    : Array.from({ length: 6 }, (_, pointIndex) => {
      const monthIndex = (selectedMonthIndex - 5 + pointIndex + 12) % 12;
      const value = monthlyNetWorth[monthIndex] - (monthIndex > selectedMonthIndex ? 24 : 0);
      return { label: t(`months.${monthIndex + 1}`), value };
    });
  const maxValue = Math.max(...chartData.map(({ value }) => value));
  const axisMax = Math.max(5, Math.ceil(maxValue));
  const points = chartData.map(({ value }, index) => ({ x: index * (680 / (chartData.length - 1)), y: 390 - (value / axisMax) * 350 }));
  const linePath = points.map(({ x, y }, index) => `${index === 0 ? "M" : "L"}${x} ${y}`).join(" ");
  const areaPath = `${linePath} L680 410 L0 410 Z`;
  const chartLabels = chartData.map(({ label }) => label);
  return <section aria-labelledby="wealth-chart-title" className={`min-w-0 rounded-xl border ${solitaire ? "border-neutral-300 shadow-card" : "border-pbrown-100 shadow-prioritas"} bg-white p-5 md:p-6`}>
    <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-start md:justify-between">
      <h2 id="wealth-chart-title" className="text-subtitle text-neutral-800">{t("chart.title")}</h2>
      <ReportDropdown id="financial-chart-interval" label={t("chart.intervalLabel")} value={interval} onChange={setInterval} options={[{ value: "yearly", label: t("chart.yearly") }, { value: "monthly", label: t("chart.monthly") }]} className="w-full md:w-40" size="medium" xlSize="large" solitaire={solitaire} />
    </div>
    <div className="mt-6 grid grid-cols-[64px_minmax(0,1fr)] gap-1 md:grid-cols-[84px_minmax(0,1fr)] md:gap-3">
      <div className="flex h-80 flex-col justify-between pb-0 text-right text-sm font-semibold text-neutral-700 md:h-[410px]">{Array.from({ length: 6 }, (_, i) => <span key={i} className="whitespace-nowrap">{i === 5 ? "0" : visible ? formatPortfolioAxisAmount(axisMax * (5 - i) / 5, locale) : t("maskedAmount")}</span>)}</div>
      <div className="min-w-0">
        <div className="relative h-80 border-l border-b border-neutral-300 md:h-[410px]">
          <div aria-hidden className="absolute inset-0 flex flex-col justify-between">{Array.from({ length: 6 }, (_, i) => <div key={i} className="w-full border-t border-neutral-300" />)}</div>
          <svg aria-hidden viewBox="0 0 720 410" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible">
            <defs><linearGradient id="financial-chart-fill" x1="0" y1="0" x2="0" y2="1"><stop stopColor={solitaire ? "var(--color-neutral-500)" : "var(--color-pgold-400)"} stopOpacity="0.3" /><stop offset="1" stopColor={solitaire ? "var(--color-neutral-500)" : "var(--color-pgold-400)"} stopOpacity="0" /></linearGradient></defs>
            <path d={areaPath} fill="url(#financial-chart-fill)" />
            <path d={linePath} fill="none" stroke={solitaire ? "var(--color-neutral-600)" : "var(--color-pgold-400)"} strokeWidth="2" vectorEffect="non-scaling-stroke" />
          </svg>
          <div aria-hidden className="pointer-events-none absolute inset-0">
            {points.map(({ x, y }, index) => <span key={index} className={`absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full ${solitaire ? "bg-neutral-700" : "bg-pgold-500"}`} style={{ left: `${x / 720 * 100}%`, top: `${y / 410 * 100}%` }} />)}
          </div>
        </div>
        <div className="mt-3 flex justify-between text-xs text-neutral-700 md:text-sm">{chartLabels.map((label, index) => <span key={`${label}-${index}`}>{label}</span>)}</div>
      </div>
    </div>
    <p className="mt-5 flex items-center justify-center gap-2 text-sm text-neutral-700"><span className={`size-3 rounded-sm ${solitaire ? "bg-neutral-700" : "bg-pgold-500"}`} />{t("summary.netWorth")}</p>
  </section>;
}

function Composition({ t, visible, snapshot, locale, solitaire = false }: { t: ReturnType<typeof useTranslations<"memberFinancialReport">>; visible: boolean; snapshot: PortfolioSnapshot; locale: string; solitaire?: boolean }) {
  const [activeKey, setActiveKey] = useState<(typeof composition)[number]["key"] | null>(null);
  const arcs = compositionPieOrder.map((item, index) => {
    const startPercent = compositionPieOrder.slice(0, index).reduce((total, segment) => total + segment.percent, 0);
    return { ...item, path: describeCompositionArc(startPercent + 0.3, startPercent + item.percent - 0.3) };
  });
  return <section aria-labelledby="asset-composition-title" className={`rounded-xl border ${solitaire ? "border-neutral-300 shadow-card" : "border-pbrown-100 shadow-prioritas"} bg-white px-4 pb-8 pt-12 md:px-8`}>
    <div className="relative mx-auto size-50 max-w-full rounded-full md:size-[280px]">
      <svg viewBox="0 0 100 100" role="group" aria-label={t("composition.title")} className="size-full overflow-visible">
        {arcs.map((item) => <path
          key={item.key}
          d={item.path}
          fill="none"
          stroke={solitaire ? item.solitaireStroke : `var(--color-${item.color.replace("bg-", "")})`}
          strokeWidth="16"
          strokeLinecap="butt"
          role="button"
          tabIndex={0}
          aria-label={`${t(`composition.${item.key}`)} ${item.percent}%`}
          aria-pressed={activeKey === item.key}
          opacity={activeKey && activeKey !== item.key ? 0.28 : 1}
          onMouseEnter={() => setActiveKey(item.key)}
          onMouseLeave={() => setActiveKey(null)}
          onFocus={() => setActiveKey(item.key)}
          onBlur={() => setActiveKey(null)}
          onClick={() => setActiveKey(item.key)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setActiveKey(item.key);
            }
          }}
          className="cursor-pointer transition-opacity focus-visible:outline-none"
        />)}
      </svg>
      <div className="absolute inset-8 flex items-center justify-center rounded-full bg-white text-center md:inset-[44px]">
        <h2 id="asset-composition-title" className="max-w-28 text-base font-semibold leading-5 text-neutral-800">{t("composition.title")}</h2>
      </div>
    </div>
    <ul className="mt-12 w-full divide-y divide-neutral-300 text-sm font-semibold text-neutral-700 md:text-base md:font-normal">
      {composition.map((item) => <li key={item.key} className="w-full">
        <button type="button" aria-pressed={activeKey === item.key} onMouseEnter={() => setActiveKey(item.key)} onMouseLeave={() => setActiveKey(null)} onFocus={() => setActiveKey(item.key)} onBlur={() => setActiveKey(null)} onClick={() => setActiveKey(item.key)} className={`grid min-h-12 w-full grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-2 text-left transition-opacity ${activeKey === item.key ? "font-semibold" : "md:font-normal"} ${activeKey && activeKey !== item.key ? "opacity-30" : "opacity-100"}`}>
          <span className="flex min-w-0 items-center gap-3"><span className={`size-4 shrink-0 rounded-sm ${solitaire ? item.solitaireColor : item.color}`} />{t(`composition.${item.key}`)}</span><span>{item.percent}%</span><span className="size-1 rounded-full bg-neutral-500" aria-hidden="true" /><span>{visible ? formatPortfolioAmount(snapshot.composition[item.key], locale) : t("maskedAmount")}</span>
        </button>
      </li>)}
    </ul>
  </section>;
}

function CategoryCards({ t, category, visible, snapshot, locale, solitaire = false }: { t: ReturnType<typeof useTranslations<"memberFinancialReport">>; category: "assets" | "liabilities"; visible: boolean; snapshot: PortfolioSnapshot; locale: string; solitaire?: boolean }) {
  const keys = category === "assets" ? ["savings", "investments", "protection"] as const : ["consumerCredit", "workingCapital", "creditCard"] as const;
  return <section aria-labelledby={`${category}-heading`}>
    <h2 id={`${category}-heading`} className="mb-6 text-2xl font-semibold text-neutral-800">{t(`categories.${category}`)}</h2>
    <div className={`grid overflow-hidden rounded-xl border ${solitaire ? "border-neutral-300 shadow-card" : "border-pbrown-100 shadow-prioritas"} bg-white md:grid-cols-3 md:divide-x ${solitaire ? "md:divide-neutral-300" : "md:divide-pbrown-100"}`}>
      {keys.map((key) => <article key={key} className="flex h-36 flex-col border-b border-pbrown-100 p-4 last:border-b-0 md:h-auto md:min-h-[200px] md:border-b-0 md:p-5"><h3 className="text-base font-semibold text-neutral-800 md:text-lg">{t(`categories.${key}`)}</h3><p className="mt-3 text-[28px] font-semibold leading-9 text-neutral-900 md:text-[32px] md:leading-10">{visible ? formatPortfolioAmount(snapshot.categories[key], locale) : t("maskedAmount")}</p><p className="mt-auto pt-3 text-sm font-semibold text-green-600 md:text-base">{t("categories.change")}</p></article>)}
    </div>
  </section>;
}

export default function FinancialReportExperience({ report, portfolioSessionExpiresAt: initialPortfolioSessionExpiresAt }: { report: Report; portfolioSessionExpiresAt: number | null }) {
  const t = useTranslations("memberFinancialReport");
  const locale = useLocale();
  const isSolitaire = usePathname().startsWith("/solitaire/member");
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
  const portfolioSnapshot = getPortfolioSnapshot(portfolioMonth);

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

  return <div className={`relative isolate ${isSolitaire ? "bg-neutral-200" : ""} ${report === "tax" ? "min-h-[calc(100vh-320px)]" : ""}`}>
    <img aria-hidden src="/assets/prioritas/member-overview/decoration.png" alt="" className={`pointer-events-none absolute inset-x-0 top-0 -z-10 h-[748px] w-full object-cover object-top ${isSolitaire ? "grayscale" : ""}`} />
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-10 px-4 pt-8 pb-10 xl:px-0">
      {report === "tax" ? <section aria-label={t("tax.title")} className={`flex w-full flex-col gap-5 rounded-xl border ${isSolitaire ? "border-neutral-300 shadow-card" : "border-pbrown-100 shadow-prioritas"} bg-white p-4 md:p-6 xl:flex-row xl:items-center xl:justify-between`}>
        <h2 className="w-full text-xl font-semibold leading-7 text-blue-800 xl:max-w-52">{t("tax.title")}</h2>
        <div className="flex w-full flex-wrap items-center gap-3 xl:w-auto xl:flex-nowrap">
          <div role="group" aria-label={t("tax.periodLabel")} className="flex w-full gap-3 xl:w-[240px] xl:flex-none">{(["year", "month"] as const).map((value) => <button key={value} type="button" aria-pressed={period === value} onClick={() => setPeriod(value)} className="priosoli-chip priosoli-chip--medium priosoli-chip--xl-large flex-1 justify-center">{t(`tax.${value}`)}</button>)}</div>
          <ReportDropdown id="financial-tax-year" label={t("tax.yearLabel")} value={year} onChange={setYear} options={yearOptions} className="w-full xl:w-[150px] xl:flex-none" size="medium" xlSize="large" solitaire={isSolitaire} />
          {period === "month" ? <ReportDropdown id="financial-tax-month" label={t("tax.monthLabel")} value={month} onChange={setMonth} options={monthOptions} className="w-full xl:w-[150px] xl:flex-none" size="medium" xlSize="large" solitaire={isSolitaire} /> : null}
        </div>
        <div className="w-full xl:w-auto"><DownloadButton onClick={showNotice} label={t("download")} solitaire={isSolitaire} /></div>
      </section> : <>
        <div>
          <section aria-label={t("overviewLabel")} className={`overflow-hidden rounded-xl border ${isSolitaire ? "border-neutral-300 shadow-card" : "border-pbrown-100 shadow-prioritas"} bg-white`}>
            <div className={`flex items-center justify-between gap-3 border-b ${isSolitaire ? "border-neutral-300" : "border-pbrown-100"} p-4 md:p-5`}>
              <ReportDropdown id="financial-portfolio-month" label={t("portfolio.periodLabel")} value={portfolioMonth} onChange={setPortfolioMonth} options={monthOptions.map((option) => ({ ...option, label: `${option.label} 2026` }))} className="min-w-0 flex-1 md:w-[260px] md:flex-none" size="medium" xlSize="large" solitaire={isSolitaire} />
              <div className="md:hidden">
                <button type="button" onClick={showNotice} aria-label={t("download")} className={(isSolitaire ? solitaireButtonClassName : prioritasButtonClassName)({ kind: "icon", variant: "secondary", size: "medium" })}>
                  <PrioritasButtonIcon src="/assets/prioritas/banking/download.svg" />
                </button>
              </div>
              <div className="hidden md:block"><DownloadButton onClick={showNotice} label={t("download")} solitaire={isSolitaire} /></div>
            </div>
            <SummaryCards t={t} visible={amountsVisible} snapshot={portfolioSnapshot} locale={locale} onToggleVisibility={() => {
              if (amountsVisible) setAmountsVisible(false);
              else if (portfolioSessionExpiresAt && portfolioSessionExpiresAt > Date.now()) setAmountsVisible(true);
              else setOtpOpen(true);
            }} solitaire={isSolitaire} />
          </section>
          <p className="mt-4 text-sm text-neutral-700">{t("updated")}</p>
        </div>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,846px)_minmax(0,410px)]"><WealthChart t={t} interval={interval} setInterval={setInterval} visible={amountsVisible} selectedMonth={portfolioMonth} locale={locale} solitaire={isSolitaire} /><Composition t={t} visible={amountsVisible} snapshot={portfolioSnapshot} locale={locale} solitaire={isSolitaire} /></div>
        <CategoryCards t={t} category="assets" visible={amountsVisible} snapshot={portfolioSnapshot} locale={locale} solitaire={isSolitaire} />
        <CategoryCards t={t} category="liabilities" visible={amountsVisible} snapshot={portfolioSnapshot} locale={locale} solitaire={isSolitaire} />
      </>}
      {notice ? <p role="status" className="rounded-xl border border-pgold-400 bg-pgold-100 p-4 text-base text-pbrown-800">{notice}</p> : null}
    </div>
    {otpOpen ? <FinancialReportOtpModal onClose={() => setOtpOpen(false)} onVerified={verifyPortfolioOtp} /> : null}
  </div>;
}
