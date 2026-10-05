import { Link } from "@/i18n/navigation";
import { PrioritasButtonIcon, prioritasButtonClassName, solitaireButtonClassName } from "@/components/prioritas/PrioritasButton";

export default function CardSection({
  copy,
  imageSrc = "/assets/prioritas/card/prio-card.webp",
  tone = "prioritas",
}: {
  copy: {
    eyebrow: string;
    heading: string;
    description: string;
    action: string;
    imageAlt: string;
  };
  imageSrc?: string;
  tone?: "prioritas" | "solitaire";
}) {
  const fillClassName = tone === "solitaire" ? "bg-solitaire-card-fill" : "bg-pbrown-700";
  const gradientFromClassName = tone === "solitaire" ? "from-solitaire-card-fill" : "from-pbrown-700";
  const glowClassName = tone === "solitaire" ? "grayscale" : "";
  const buttonClassName = tone === "solitaire" ? solitaireButtonClassName : prioritasButtonClassName;

  return (
    <section id="card" className={`relative isolate h-[560px] overflow-hidden ${fillClassName} text-pgold-100 xl:h-[480px]`}>
      <div aria-hidden="true" className="absolute bottom-0 left-1/2 -z-10 h-[300px] w-[932px] -translate-x-1/2 xl:bottom-auto xl:top-0 xl:h-full xl:w-[1512px]">
        <img
          src={imageSrc}
          alt=""
          className="absolute inset-0 size-full object-cover object-center xl:inset-auto xl:left-[161px] xl:top-0 xl:h-full xl:w-[1598px] xl:max-w-none"
        />
        <div aria-hidden="true" className={`pointer-events-none absolute inset-y-0 left-0 w-[65%] bg-gradient-to-r ${gradientFromClassName} to-transparent`} />
        <div aria-hidden="true" className={`pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b ${gradientFromClassName} to-transparent xl:hidden`} />
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <img src="/assets/prioritas/card/prio-glow.png" alt="" className={`absolute -right-[390px] -top-[320px] h-[800px] w-[939px] max-w-none xl:-right-[120px] xl:-top-[320px] ${glowClassName}`} />
        <img src="/assets/prioritas/card/prio-glow.png" alt="" className={`absolute -bottom-[320px] -left-[390px] h-[800px] w-[939px] max-w-none rotate-180 xl:-bottom-[320px] xl:-left-[120px] ${glowClassName}`} />
      </div>
      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1280px] items-start px-4 py-12 xl:px-10 xl:pt-16 xl:pb-0">
        <div className="flex w-full max-w-[500px] flex-col items-start gap-6">
          <div className="flex flex-col items-start gap-4">
            <p className="text-heading max-w-[400px] text-pgold-100 xl:text-display">{copy.heading}</p>
            <p className="max-w-[460px] text-base leading-7 text-wrap-pretty text-pgold-100/80">{copy.description}</p>
          </div>
          <Link href="/prioritas/tentang-kami" className={buttonClassName({ kind: "text", surface: "inverse", size: "large" })}>
            <span className="prio-button__label">{copy.action}</span>
            <PrioritasButtonIcon src="/assets/prioritas/card/arrow-right.svg" />
          </Link>
        </div>
      </div>
    </section>
  );
}
