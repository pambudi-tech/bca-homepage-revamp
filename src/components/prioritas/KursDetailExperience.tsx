"use client";

import { IconAsset } from "@/components/icons/IconAsset";

import { useEffect, useMemo, useRef, useState } from "react";
import TextField from "@/components/ui/TextField";
import PrioritasDirectoryDropdown from "@/components/prioritas/PrioritasDirectoryDropdown";
import KursRefreshButton from "@/components/prioritas/KursRefreshButton";
import { BackToTopAction } from "@/components/home/BackToTop";
import { useLenis } from "@/components/SmoothScroll";
import { getKursFlagPath, type KursDetailEntry } from "@/lib/kurs-detail";

type Copy = {
  ratesHeading: string;
  updatedAt: string;
  refresh: string;
  currency: string;
  buy: string;
  sell: string;
  converter: string;
  conversionEstimate: string;
  amount: string;
  from: string;
  to: string;
  swapCurrencies: string;
  viewConverter: string;
  note: string;
  tellerNote: string;
};

const NUMBER_FORMAT = new Intl.NumberFormat("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function currencyOption(item: KursDetailEntry) {
  return {
    value: item.code,
    accessibleLabel: item.code,
    horizontal: true,
    label: <><img src={item.flag} alt="" aria-hidden="true" className="size-5 shrink-0" />{item.code}</>,
  };
}

export default function KursDetailExperience({ rates, updatedAt, copy, tone = "prioritas", preview }: { rates: KursDetailEntry[]; updatedAt: string; copy: Copy; tone?: "prioritas" | "solitaire"; preview?: { amount?: string; from?: string; to?: string } }) {
  const [amount, setAmount] = useState(preview?.amount ?? "1");
  const [from, setFrom] = useState(preview?.from ?? "USD");
  const [to, setTo] = useState(preview?.to ?? "IDR");
  const [showMiniConverter, setShowMiniConverter] = useState(false);
  const converterRef = useRef<HTMLElement>(null);
  const lenis = useLenis();
  const isSolitaire = tone === "solitaire";

  useEffect(() => {
    if (preview) return;
    const panel = converterRef.current;
    if (!panel) return;
    const observer = new IntersectionObserver(([entry]) => {
      setShowMiniConverter(!entry.isIntersecting && entry.boundingClientRect.top > window.innerHeight - 112);
    }, { rootMargin: "0px 0px -112px 0px" });
    observer.observe(panel);
    return () => observer.disconnect();
  }, [preview]);

  const goToConverter = () => {
    const panel = converterRef.current;
    if (!panel) return;
    if (lenis) lenis.scrollTo(panel, { offset: -72, duration: 1 });
    else window.scrollTo({ top: window.scrollY + panel.getBoundingClientRect().top - 72, behavior: "smooth" });
  };
  const swapCurrencies = () => {
    setFrom(to);
    setTo(from);
  };
  const currencies = useMemo(() => [{ code: "IDR", flag: getKursFlagPath("indonesia"), buy: 1, sell: 1 }, ...rates], [rates]);
  const fromOptions = useMemo(() => currencies.filter((item) => item.code !== to).map(currencyOption), [currencies, to]);
  const toOptions = useMemo(() => currencies.filter((item) => item.code !== from).map(currencyOption), [currencies, from]);
  const amountValue = Number(amount.replaceAll(".", "").replace(",", "."));
  const fromRate = currencies.find((currency) => currency.code === from);
  const toRate = currencies.find((currency) => currency.code === to);
  const converted = fromRate && toRate && Number.isFinite(amountValue)
    ? amountValue * (fromRate.code === "IDR" ? 1 : fromRate.buy) / (toRate.code === "IDR" ? 1 : toRate.buy)
    : 0;
  const convertedText = Number.isFinite(converted) ? NUMBER_FORMAT.format(converted) : "—";

  return (
    <main className="pb-20 xl:pb-28">
      <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-6 px-4 py-10 xl:grid-cols-[minmax(0,1fr)_420px] xl:px-0">
        <section className={`flex flex-col gap-5 rounded-2xl border border-neutral-300 bg-white p-4 text-neutral-900 ${isSolitaire ? "shadow-panel" : "shadow-panel-gold"} md:p-6`} aria-labelledby="kurs-list-title">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <h2 id="kurs-list-title" className={`text-subtitle font-semibold xl:text-title ${isSolitaire ? "text-neutral-800" : "text-pbrown-800"}`}>{copy.ratesHeading}</h2>
            <div className="flex items-center gap-2 text-size-body-m text-neutral-600">
              <p>{copy.updatedAt}: {updatedAt} WIB</p>
              <KursRefreshButton label={copy.refresh} tone={tone} />
            </div>
          </div>
          <div className={`overflow-hidden rounded-xl border ${isSolitaire ? "border-neutral-300" : "border-pbrown-100"}`}>
            <div className={`grid grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)] border-b px-3 py-3 text-size-body-l font-semibold sm:px-4 ${isSolitaire ? "border-neutral-300 bg-neutral-800 text-neutral-100" : "border-pbrown-100 bg-pbrown-600 text-pbrown-100"}`}>
              <span>{copy.currency}</span><span>{copy.buy}</span><span>{copy.sell}</span>
            </div>
            {rates.map((rate, index) => (
              <div key={rate.code} className={`grid grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)] items-center border-b px-3 py-3 text-size-body-l last:border-0 sm:px-4 sm:py-3.5 ${isSolitaire ? `border-neutral-300 ${index % 2 === 0 ? "bg-neutral-100" : "bg-neutral-200/50"}` : `border-pbrown-100/70 ${index % 2 === 0 ? "bg-neutral-100" : "bg-pgold-100/50"}`} `}>
                <span className="flex items-center gap-2 font-semibold sm:gap-3"><img src={rate.flag} alt="" aria-hidden="true" className="size-5 shrink-0" />{rate.code}</span>
                <span className="tabular-nums">{NUMBER_FORMAT.format(rate.buy)}</span>
                <span className="tabular-nums">{NUMBER_FORMAT.format(rate.sell)}</span>
              </div>
            ))}
          </div>
          <div className={`flex flex-col gap-3 text-size-body-m leading-6 ${isSolitaire ? "text-neutral-700" : "text-pbrown-600"}`}>
            <p>{copy.note}</p>
            <p>{copy.tellerNote}</p>
          </div>
        </section>

        <section ref={converterRef} className={`flex h-fit scroll-mt-20 flex-col gap-5 rounded-2xl border border-neutral-300 bg-white p-5 text-neutral-900 ${isSolitaire ? "shadow-panel" : "shadow-panel-gold"} md:p-6 xl:sticky xl:top-22 xl:self-start`} aria-labelledby="kurs-converter-title">
          <div>
            <h2 id="kurs-converter-title" className={`text-subtitle font-semibold xl:text-title ${isSolitaire ? "text-neutral-800" : "text-pbrown-800"}`}>{copy.converter}</h2>
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_2rem_minmax(0,1fr)] items-end gap-2">
            <div className="flex min-w-0 flex-col gap-2">
              <span className="text-size-body-m leading-5 font-bold text-neutral-800 xl:text-size-body-l xl:leading-6">{copy.from}</span>
              <PrioritasDirectoryDropdown id="kurs-converter-from" label={copy.from} value={from} onChange={setFrom} options={fromOptions} size="medium" xlSize="large" tone={isSolitaire ? "solitaire" : "prioritas"} />
            </div>
            <button type="button" aria-label={copy.swapCurrencies} onClick={swapCurrencies} className={`mb-2 flex size-8 items-center justify-center rounded-full border transition-colors focus-visible:outline-2 ${isSolitaire ? "border-neutral-300 bg-neutral-200 text-neutral-800 hover:bg-neutral-300 focus-visible:outline-neutral-800" : "border-pbrown-100 bg-pgold-100 text-pbrown-700 hover:bg-pgold-200 focus-visible:outline-pgold-500"}`}>
              <IconAsset src="/assets/asset-bank/icons/KursDetailExperience-2fb471ace0094f70.svg" aria-hidden="true" className="size-4"  />
            </button>
            <div className="flex min-w-0 flex-col gap-2">
              <span className="text-size-body-m leading-5 font-bold text-neutral-800 xl:text-size-body-l xl:leading-6">{copy.to}</span>
              <PrioritasDirectoryDropdown id="kurs-converter-to" label={copy.to} value={to} onChange={setTo} options={toOptions} size="medium" xlSize="large" tone={isSolitaire ? "solitaire" : "prioritas"} />
            </div>
          </div>
          <TextField label={copy.amount} labelClassName="text-size-body-m leading-5 xl:text-size-body-l xl:leading-6" fieldSize="medium" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} />
          <div className={`flex min-h-32 flex-col justify-center rounded-xl p-5 ${isSolitaire ? "bg-neutral-800 text-neutral-100" : "bg-pbrown-700 text-pgold-100"}`}>
            <p className={`text-size-body-m ${isSolitaire ? "text-neutral-500" : "text-pgold-200/80"}`}>{copy.conversionEstimate}</p>
            <p className="mt-3 break-words text-display-l">{convertedText} <span className="text-size-body-xl">{to}</span></p>
          </div>
        </section>
      </div>
      <div className="md:hidden">
        <BackToTopAction label={copy.viewConverter} shown={showMiniConverter} onClick={goToConverter} fitContent direction="down" bottomInset="32px" progressiveBackdrop />
      </div>
    </main>
  );
}
