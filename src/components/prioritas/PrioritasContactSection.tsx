import { IconAsset } from "@/components/icons/IconAsset";
import { PrioritasButtonIcon, prioritasButtonClassName, solitaireButtonClassName } from "@/components/prioritas/PrioritasButton";

type ContactCopy = {
  heading: string;
  riplayTitle: string;
  download: string;
  contactTitle: string;
  phone: string;
};

const RIPLAY_URL = "https://prioritas.bca.co.id/en/riplay?query=2025";

function PhoneIcon() {
  return (
    <IconAsset src="/assets/asset-bank/icons/PhoneIcon-cdee3f83c701968a.svg" aria-hidden="true" className="size-5 shrink-0" />
  );
}

export default function PrioritasContactSection({ copy, tone = "prioritas" }: { copy: ContactCopy; tone?: "prioritas" | "solitaire" }) {
  const isSolitaire = tone === "solitaire";
  const glassStyle = isSolitaire ? {
    backgroundColor: "color-mix(in srgb, var(--color-neutral-900) 30%, transparent)",
    isolation: "isolate" as const,
  } : undefined;
  const buttonClassName = isSolitaire ? solitaireButtonClassName : prioritasButtonClassName;

  return (
    <section aria-label={copy.heading} className={`${isSolitaire ? "bg-neutral-700" : "bg-pbrown-700"} text-pgold-100`}>
      <div className="mx-auto grid min-h-[240px] w-full max-w-[1280px] items-center gap-x-8 gap-y-6 px-4 py-12 md:grid-cols-[minmax(0,1fr)_260px_260px] md:gap-4 md:gap-y-6 md:px-8 xl:gap-5 xl:px-0">
        <h2 className="max-w-[360px] text-display-m text-pgold-100 md:text-hero-title-mobile">{copy.heading}</h2>

        <article className={`glass-panel ${isSolitaire ? "glass-panel-solitaire" : "glass-panel-prioritas"} relative flex h-[160px] flex-col justify-between overflow-hidden rounded-lg p-5`} style={glassStyle}>
          <h3 className="w-full text-size-body-l font-semibold leading-6 text-pgold-100">{copy.riplayTitle}</h3>
          <a href={RIPLAY_URL} target="_blank" rel="noopener noreferrer" className={buttonClassName({ kind: "text", surface: "inverse", size: "medium", className: "w-fit" })}>
            <PrioritasButtonIcon src="/assets/prioritas/banking/download.svg" />
            <span className="prio-button__label">{copy.download}</span>
          </a>
        </article>

        <article className={`glass-panel ${isSolitaire ? "glass-panel-solitaire" : "glass-panel-prioritas"} relative flex h-[160px] flex-col justify-between overflow-hidden rounded-lg p-5 max-md:-mt-2`} style={glassStyle}>
          <h3 className="text-size-body-l font-semibold leading-6 text-pgold-100">{copy.contactTitle}</h3>
          <a href="tel:150022" className={buttonClassName({ kind: "text", surface: "inverse", size: "medium", className: "w-fit" })}>
            <PhoneIcon />
            <span className="prio-button__label">{copy.phone}</span>
          </a>
        </article>
      </div>
    </section>
  );
}
