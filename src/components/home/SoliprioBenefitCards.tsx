import { ArrowRight } from "./SoliprioCard";

export type SoliprioBenefit = {
  key: string;
  image: string;
  title: string;
  cta: string;
};

export default function SoliprioBenefitCards({
  benefits,
  className = "",
}: {
  benefits: readonly SoliprioBenefit[];
  className?: string;
}) {
  return (
    <div className={`hide-scrollbar flex gap-4 overflow-x-auto ${className}`}>
      {benefits.map((benefit) => (
        <a
          key={benefit.key}
          href="#"
          className="group relative h-[320px] w-[240px] shrink-0 snap-center overflow-hidden rounded-3xl border border-neutral-100/20"
        >
          <img
            loading="lazy"
            decoding="async"
            src={benefit.image}
            alt=""
            className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-x-2 bottom-2 flex min-h-[144px] flex-col justify-between rounded-2xl border border-neutral-100/35 bg-neutral-900/45 p-4 text-neutral-100 backdrop-blur-[16px]">
            <p className="text-base leading-6 font-semibold">{benefit.title}</p>
            <span className="flex items-center gap-2 text-sm font-semibold">
              {benefit.cta}
              <ArrowRight />
            </span>
          </div>
        </a>
      ))}
    </div>
  );
}
