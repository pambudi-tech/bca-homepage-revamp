import { Link } from "@/i18n/navigation";

export default function CardSection({
  copy,
}: {
  copy: {
    eyebrow: string;
    heading: string;
    description: string;
    action: string;
    imageAlt: string;
  };
}) {
  return (
    <section id="card" className="relative isolate h-[480px] overflow-hidden bg-pbrown-700 text-pgold-100 xl:h-[480px]">
      <div aria-hidden="true" className="absolute bottom-0 left-1/2 -z-10 h-[300px] w-[932px] -translate-x-1/2 xl:bottom-auto xl:top-0 xl:h-full xl:w-[1512px]">
        <img
          src="/assets/prioritas/card/prio-card.webp"
          alt=""
          className="absolute inset-0 size-full object-cover object-center xl:inset-auto xl:left-[161px] xl:top-0 xl:h-full xl:w-[1598px] xl:max-w-none"
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-pbrown-700 to-transparent xl:hidden" />
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <img src="/assets/prioritas/card/prio-glow.png" alt="" className="absolute -right-[390px] -top-[320px] h-[800px] w-[939px] max-w-none xl:-right-[120px] xl:-top-[320px]" />
        <img src="/assets/prioritas/card/prio-glow.png" alt="" className="absolute -bottom-[320px] -left-[390px] h-[800px] w-[939px] max-w-none rotate-180 xl:-bottom-[320px] xl:-left-[120px]" />
      </div>
      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1280px] items-start px-4 pt-16 xl:px-10 xl:pt-16">
        <div className="flex w-full max-w-[500px] flex-col items-start gap-6">
          <div className="flex flex-col items-start gap-4">
            <p className="text-heading max-w-[400px] text-pgold-100 xl:text-display">{copy.heading}</p>
            <p className="max-w-[460px] text-sm leading-5 text-pgold-100/80 xl:text-xl xl:leading-[1.5]">{copy.description}</p>
          </div>
          <Link href="/prioritas" className="inline-flex items-center gap-0.5 text-sm font-semibold leading-5 text-pgold-300 transition-colors hover:text-pgold-100 xl:text-base xl:leading-4">
            <span className="px-0.5">{copy.action}</span>
            <img src="/assets/prioritas/card/arrow-right.svg" alt="" aria-hidden="true" className="size-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
