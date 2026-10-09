import { useTranslations } from "next-intl";

type EventDate = {
  primary?: string;
  secondary?: string;
  dateParts?: Array<{ primary: string; secondary: string }>;
  expired?: boolean;
  expiredLabel?: string;
};

export default function PrioritasEventDateTile({ date, detail = false, timeLabel, timeIconSrc, solitaire = false, previewViewport }: { date?: EventDate; detail?: boolean; timeLabel?: string; timeIconSrc?: string; solitaire?: boolean; previewViewport?: "mobile" | "desktop" }) {
  const t = useTranslations("signaturePrivilege");
  const isTimeLabel = timeLabel !== undefined;
  const dateParts = date?.dateParts;
  const dateLabelType = previewViewport ? previewViewport === "desktop" ? "text-sm" : "text-xs" : "text-xs md:text-sm";
  const dateNumberType = previewViewport ? previewViewport === "desktop" ? "text-[28px]" : "text-2xl" : "text-2xl md:text-[28px]";
  return <div className={`glass-panel ${solitaire ? "glass-panel-solitaire" : "glass-panel-prioritas"} absolute z-10 overflow-hidden ${solitaire ? "bg-neutral-800/30" : "bg-pbrown-600/30"} text-white shadow-card ${isTimeLabel ? "left-2 top-2 flex min-h-12 w-fit flex-row items-center gap-2 rounded-xl px-3 py-2 text-left xl:left-4 xl:top-4 xl:min-h-14 xl:px-4 xl:text-base" : `top-0 flex min-w-20 flex-col items-center px-4 text-center ${detail ? "right-4 min-h-[86px] rounded-b-xl xl:right-6" : "right-4 h-[86px] rounded-b-2xl"} ${date?.expired ? "w-max justify-center" : "w-fit justify-end pb-4"}`} `} style={{ backgroundColor: date?.expired ? "color-mix(in srgb, var(--color-red-500) 30%, transparent)" : solitaire ? "color-mix(in srgb, var(--color-neutral-800) 30%, transparent)" : "color-mix(in srgb, var(--color-pbrown-600) 30%, transparent)", isolation: "isolate" }}>
    {isTimeLabel ? <><img src={timeIconSrc} alt="" className="size-5 shrink-0" /><span className="text-sm font-semibold xl:text-base">{timeLabel}</span></> : date?.expired ? <span className={`flex flex-col ${dateLabelType} font-semibold uppercase leading-4 tracking-[0.08em]`}>{(date.expiredLabel ?? t("eventDateExpired")).split(/\s+/).map((word) => <span key={word}>{word}</span>)}</span> : dateParts ? <div className="flex items-end gap-2">{dateParts.map((part, index) => <div key={`${part.primary}-${part.secondary}`} className="flex items-end gap-2"><span className="flex flex-col items-center justify-end"><span className={`${dateNumberType} leading-7 font-semibold`}>{part.primary}</span><span className={`mt-1 ${dateLabelType} font-semibold uppercase leading-4 tracking-[0.08em]`}>{part.secondary}</span></span>{index < dateParts.length - 1 ? <span className="mb-1 text-xl font-semibold leading-6">–</span> : null}</div>)}</div> : <span className="flex flex-col items-center justify-end"><span className={`${dateNumberType} leading-7 font-semibold`}>{date?.primary}</span><span className={`mt-1 ${dateLabelType} font-semibold uppercase leading-4 tracking-[0.08em]`}>{date?.secondary}</span></span>}
  </div>;
}
