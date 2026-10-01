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
  subtitleFontWeight = "semibold",
}: {
  breadcrumbs: BreadcrumbItem[];
  title: string;
  subtitle?: string;
  logo?: { src: string; alt: string };
  layout?: "directory" | "detail";
  memberArea?: boolean;
  subtitleFontWeight?: "normal" | "semibold";
}) {
  const detailLayout = layout === "detail";
  const missingDetailIdentity = detailLayout && !subtitle && !logo;

  return (
    <header className={`relative isolate overflow-clip ${memberArea ? "h-[232px] bg-pgold-100 text-pbrown-800 xl:h-[264px]" : "h-[344px] bg-pbrown-600 text-pgold-100 xl:h-[384px]"}`}>
      {!memberArea ? <div className={`pointer-events-none absolute inset-x-0 top-0 ${detailLayout ? "z-0 h-[344px] overflow-hidden bg-pbrown-600 xl:h-[384px]" : "inset-y-0 overflow-hidden"}`}>
        <img
          src="/assets/prioritas/card/prio-glow.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -right-[390px] -top-[320px] h-[960px] w-auto max-w-none opacity-80 xl:-right-[120px]"
        />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-pbrown-600 to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[112px] bg-pbrown-700/25 backdrop-blur-md xl:h-[120px]" />
      </div> : null}
      <div className="relative z-10 mx-auto h-full w-full max-w-[1280px] px-4 xl:px-0">
        <nav aria-label="Breadcrumb" className={`hide-scrollbar -mx-4 flex max-w-[calc(100%+2rem)] items-center gap-2 overflow-x-auto overscroll-x-contain px-4 text-sm font-semibold leading-6 [scrollbar-width:none] xl:mx-0 xl:max-w-full xl:px-0 ${memberArea ? "pt-4 text-pbrown-500 xl:pt-5" : "pt-[128px] text-pgold-100/85 xl:pt-[140px]"}`}>
          {breadcrumbs.map((item, index) => (
            <span key={`${item.label}-${index}`} className="flex shrink-0 items-center gap-2">
              {index > 0 ? memberArea
                ? <span aria-hidden="true" className="size-5 shrink-0 bg-pbrown-500 [mask-image:url('/assets/prioritas/detail/molton-brown/chevron-right.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] [-webkit-mask-image:url('/assets/prioritas/detail/molton-brown/chevron-right.svg')] [-webkit-mask-position:center] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:contain]" />
                : <img src="/assets/prioritas/detail/molton-brown/chevron-right.svg" alt="" aria-hidden="true" className="size-5 shrink-0" />
                : null}
              {item.href ? <Link href={item.href} className="shrink-0">{item.label}</Link> : <span aria-current="page" className="shrink-0">{item.label}</span>}
            </span>
          ))}
        </nav>
        <div className={detailLayout ? `absolute ${missingDetailIdentity ? "bottom-20 xl:bottom-32" : "bottom-11 xl:bottom-[88px]"} left-4 right-4 flex items-start justify-between gap-4 min-[375px]:gap-8 xl:left-0 xl:right-0 xl:gap-8` : "absolute bottom-20 left-4 right-4 flex items-end justify-between gap-8 xl:bottom-[88px] xl:left-0 xl:right-0"}>
          <div className="max-w-[560px]">
            <h1 data-prioritas-detail-title={detailLayout ? "" : undefined} className={`text-heading xl:text-display ${memberArea ? "text-neutral-900" : "text-pgold-100"} ${detailLayout ? "line-clamp-3 xl:line-clamp-2" : ""}`}>{title}</h1>
            {subtitle ? <p className={`mt-3 text-sm leading-6 xl:text-base ${subtitleFontWeight === "normal" ? "font-normal" : "font-semibold"} ${memberArea ? "text-pbrown-600" : "text-pgold-100/85"}`}>{subtitle}</p> : null}
          </div>
          {logo ? <span className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-3 shadow-card xl:size-30">
            <img src={logo.src} alt={logo.alt} className="size-full object-contain" />
          </span> : null}
        </div>
      </div>
    </header>
  );
}
