import { Link } from "@/i18n/navigation";

type Copy = {
  eyebrow: string;
  heading: string;
  features: string[];
  action: string;
};

export default function FinancialReportSection({ copy }: { copy: Copy }) {
  return (
    <section id="financial-report" className="relative h-[600px] min-h-0 overflow-hidden bg-pbrown-700 text-pgold-100 xl:h-auto xl:min-h-[640px]">
      <img
        src="/assets/prioritas/financial/background.png"
        alt=""
        aria-hidden
        className="absolute left-1/2 top-1/2 z-0 h-[320px] w-full translate-x-[calc(-50%_+_40px)] -translate-y-1/2 object-cover object-right xl:inset-0 xl:size-full xl:translate-x-0 xl:translate-y-0 xl:object-center"
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-1 h-full bg-gradient-to-b from-pbrown-700 via-transparent to-pbrown-700 xl:hidden" aria-hidden />
      <div
        className="absolute inset-0 z-0 bg-[linear-gradient(90deg,var(--color-pbrown-700)_0%,rgb(53_30_8_/_0.82)_32%,rgb(50_32_17_/_0)_71%)]"
        aria-hidden
      />

      <div className="pointer-events-none absolute inset-y-0 left-0 z-1 block w-full overflow-hidden mix-blend-screen" aria-hidden>
        <div className="absolute left-[2px] top-0 h-[600px] w-[calc(100%-2px)] overflow-hidden xl:h-[640px]">
          <div className="absolute -left-[160px] -top-[357px] flex h-[1004px] w-[1999px] items-center justify-center mix-blend-screen xl:-left-[92px] xl:-top-[408px] xl:h-[1147px] xl:w-[2284.7px]">
            <div className="-rotate-90 flex-none">
              <div className="relative h-[1999px] w-[1004px] xl:h-[2284.7px] xl:w-[1147px]">
                <div className="pointer-events-none absolute inset-0" aria-hidden>
                  <img
                    src="/assets/prioritas/financial/decoration-art.png"
                    alt=""
                    className="absolute size-full object-bottom mix-blend-screen"
                  />
                  <div className="absolute inset-0 bg-pgold-300 mix-blend-color" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto flex min-h-[600px] w-full max-w-[1280px] flex-col px-4 py-10 xl:min-h-[640px] xl:px-0 xl:py-20">
        <header className="flex flex-col gap-6 xl:flex-row xl:items-start xl:gap-10">
          <p className="text-eyebrow uppercase text-pgold-300 xl:w-[180px] xl:shrink-0 xl:py-2 xl:text-eyebrow-lg">{copy.eyebrow}</p>
          <h2 className="text-heading max-w-[560px] text-pgold-100 xl:text-display">{copy.heading}</h2>
        </header>

        <div className="mx-auto mt-auto flex w-full max-w-[752px] flex-col items-start gap-6 xl:mt-40 xl:gap-12">
          <div className="grid w-full grid-cols-2 gap-4 md:grid-cols-3">
            {copy.features.map((feature, index) => (
              <div
                key={feature}
                className={`glass-panel glass-panel-prioritas relative flex min-h-0 items-start overflow-hidden rounded-2xl px-4 pb-5 pt-4 ${index === 0 ? "col-start-1 row-start-1" : index === 1 ? "col-start-1 row-start-2" : "col-start-2 row-start-2"} md:col-auto md:row-auto md:min-h-36 md:px-6 md:py-5`}
                style={{ backgroundColor: "color-mix(in srgb, var(--color-pbrown-900) 50%, transparent)", backdropFilter: "blur(16px) saturate(1.25)", WebkitBackdropFilter: "blur(16px) saturate(1.25)", isolation: "isolate" }}
              >
                <p className="text-sm font-semibold leading-5 text-neutral-100 xl:text-xl xl:leading-7 xl:tracking-[-0.4px]">{feature}</p>
              </div>
            ))}
          </div>
          <Link href="/artikel" className="btn-base w-full bg-neutral-100 text-pbrown-600 transition-colors hover:bg-pgold-100 xl:w-fit">
            <span className="px-0.5 text-base font-semibold">{copy.action}</span>
            <span
              aria-hidden
              className="size-5 shrink-0 bg-pbrown-600"
              style={{
                maskImage: "url(/assets/cycle1/pelajari-icon.svg)",
                WebkitMaskImage: "url(/assets/cycle1/pelajari-icon.svg)",
                maskRepeat: "no-repeat",
                WebkitMaskRepeat: "no-repeat",
                maskPosition: "center",
                WebkitMaskPosition: "center",
                maskSize: "contain",
                WebkitMaskSize: "contain",
              }}
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
