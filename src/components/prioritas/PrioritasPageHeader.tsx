import { Link } from "@/i18n/navigation";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

export default function PrioritasPageHeader({
  breadcrumbs,
  title,
  subtitle,
  logo,
  layout = "directory",
  memberArea = false,
  hideBreadcrumb = false,
  alignTitleWithContent = false,
  tallGeneralHeader = false,
  alignMobileContentToIndexTitle = false,
  subtitleFontWeight = "semibold",
  tone = "prioritas",
}: {
  breadcrumbs: BreadcrumbItem[];
  title: string;
  subtitle?: string;
  logo?: { src: string; alt: string };
  layout?: "directory" | "detail";
  memberArea?: boolean;
  hideBreadcrumb?: boolean;
  alignTitleWithContent?: boolean;
  tallGeneralHeader?: boolean;
  alignMobileContentToIndexTitle?: boolean;
  subtitleFontWeight?: "normal" | "semibold";
  tone?: "prioritas" | "solitaire" | "general";
}) {
  const detailLayout = layout === "detail";
  const isGeneral = tone === "general" && !memberArea;
  const isSolitaire = tone === "solitaire";
  const missingDetailIdentity = detailLayout && !subtitle && !logo && !isSolitaire && !isGeneral && !alignTitleWithContent;
  const bannerSurface = isGeneral ? "bg-neutral-100" : isSolitaire ? "bg-neutral-900" : "bg-pbrown-600";
  const breadcrumbColor = isGeneral ? "text-neutral-600" : isSolitaire ? "text-neutral-500" : "text-pgold-100/85";

  return (
    <header className={`relative isolate overflow-clip ${memberArea ? `h-[232px] ${isSolitaire ? "bg-neutral-100 text-neutral-800" : "bg-pgold-100 text-pbrown-800"} xl:h-[264px]` : isGeneral ? tallGeneralHeader ? "h-[272px] bg-neutral-100 text-neutral-800 xl:h-[312px]" : "h-[232px] bg-neutral-100 text-neutral-800 xl:h-[312px]" : `h-[344px] ${bannerSurface} ${isSolitaire ? "text-neutral-100" : "text-pgold-100"} xl:h-[384px]`} `}>
      {!memberArea && !isGeneral ? <div className={`pointer-events-none absolute inset-x-0 top-0 ${detailLayout ? `z-0 h-[344px] overflow-hidden ${bannerSurface} xl:h-[384px]` : "inset-y-0 overflow-hidden"}`}>
        <img
          src="/assets/prioritas/card/prio-glow.png"
          alt=""
          aria-hidden="true"
          className={`pointer-events-none absolute -right-[390px] -top-[320px] h-[960px] w-auto max-w-none opacity-80 xl:-right-[120px] ${isSolitaire ? "grayscale mix-blend-screen" : ""}`}
        />
        <div aria-hidden className={`absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t ${isSolitaire ? "from-neutral-900" : "from-pbrown-600"} to-transparent`} />
        <div aria-hidden className={`pointer-events-none absolute inset-x-0 top-0 z-0 h-[112px] ${isSolitaire ? "bg-neutral-900/25" : "bg-pbrown-700/25"} backdrop-blur-md xl:h-[120px]`} />
      </div> : null}
      <div className="relative z-10 mx-auto h-full w-full max-w-[1280px] px-4 xl:px-0">
      {!hideBreadcrumb ? <nav aria-label="Breadcrumb" className={`hide-scrollbar -mx-4 flex max-w-[calc(100%+2rem)] items-center gap-2 overflow-x-auto overscroll-x-contain px-4 text-sm font-semibold leading-6 [scrollbar-width:none] xl:mx-0 xl:max-w-full xl:px-0 ${memberArea ? `pt-4 ${isSolitaire ? "text-neutral-700" : "text-pbrown-500"} xl:pt-5` : isGeneral ? "pt-5 text-neutral-600 xl:pt-6" : `pt-[128px] ${breadcrumbColor} xl:pt-[140px]`}`}>
          {breadcrumbs.map((item, index) => (
            <span key={`${item.label}-${index}`} className="flex shrink-0 items-center gap-2">
              {index > 0 ? memberArea
                ? isSolitaire
                  ? <span aria-hidden="true" className="size-5 shrink-0 bg-neutral-700 [mask-image:url('/assets/prioritas/detail/molton-brown/chevron-right.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] [-webkit-mask-image:url('/assets/prioritas/detail/molton-brown/chevron-right.svg')] [-webkit-mask-position:center] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:contain]" />
                  : <span aria-hidden="true" className="size-5 shrink-0 bg-pbrown-500 [mask-image:url('/assets/prioritas/detail/molton-brown/chevron-right.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] [-webkit-mask-image:url('/assets/prioritas/detail/molton-brown/chevron-right.svg')] [-webkit-mask-position:center] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:contain]" />
                : isSolitaire || isGeneral
                  ? <span aria-hidden="true" className="size-5 shrink-0 bg-neutral-500 [mask-image:url('/assets/prioritas/detail/molton-brown/chevron-right.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] [-webkit-mask-image:url('/assets/prioritas/detail/molton-brown/chevron-right.svg')] [-webkit-mask-position:center] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:contain]" />
                  : <img src="/assets/prioritas/detail/molton-brown/chevron-right.svg" alt="" aria-hidden="true" className="size-5 shrink-0" />
                : null}
              {item.href ? <Link href={item.href} className="shrink-0">{item.label}</Link> : <span aria-current="page" className="shrink-0">{item.label}</span>}
            </span>
          ))}
        </nav> : null}
          <div className={detailLayout ? `absolute ${missingDetailIdentity ? "bottom-20 xl:bottom-[72px]" : alignMobileContentToIndexTitle ? "bottom-[78px] xl:bottom-[72px]" : isGeneral ? tallGeneralHeader ? "bottom-11 xl:bottom-[88px]" : "bottom-8 xl:bottom-10" : "bottom-11 xl:bottom-[72px]"} left-4 right-4 flex items-start justify-between gap-4 min-[375px]:gap-8 xl:left-0 xl:right-0 xl:gap-8 xl:items-end` : `absolute ${isGeneral && !tallGeneralHeader ? "bottom-8 xl:bottom-10" : "bottom-20 xl:bottom-[72px]"} left-4 right-4 flex items-end justify-between gap-8 xl:left-0 xl:right-0`}>
          <div className="max-w-[560px]">
            <h1 data-prioritas-detail-title={detailLayout ? "" : undefined} className={`text-heading xl:text-display ${memberArea || isGeneral ? "text-neutral-800" : isSolitaire ? "text-neutral-100" : "text-pgold-100"} ${detailLayout ? "line-clamp-3" : ""} xl:line-clamp-3`}>{title}</h1>
            {subtitle ? <p className={`mt-3 text-sm leading-6 xl:text-base ${subtitleFontWeight === "normal" ? "font-normal" : "font-semibold"} ${memberArea ? isSolitaire ? "text-neutral-700" : "text-pbrown-600" : isGeneral ? "text-neutral-700" : isSolitaire ? "text-neutral-100/85" : "text-pgold-100/85"}`}>{subtitle}</p> : null}
          </div>
          {logo ? <span className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-3 shadow-card xl:size-30">
            <img src={logo.src} alt={logo.alt} className="size-full object-contain" />
          </span> : null}
        </div>
      </div>
    </header>
  );
}
