import { PrioritasButtonIcon, prioritasButtonClassName } from "@/components/prioritas/PrioritasButton";

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
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="size-5 shrink-0">
      <path d="M6.1 3.2h2.2l1.1 3.1-1.6 1.3a12 12 0 0 0 4.6 4.6l1.3-1.6 3.1 1.1v2.2c0 .9-.7 1.6-1.6 1.6A12.7 12.7 0 0 1 4.5 4.8c0-.9.7-1.6 1.6-1.6Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function PrioritasContactSection({ copy }: { copy: ContactCopy }) {
  return (
    <section aria-label={copy.heading} className="bg-pbrown-700 text-pgold-100">
      <div className="mx-auto grid min-h-[240px] w-full max-w-[1280px] items-center gap-x-8 gap-y-6 px-4 py-12 md:grid-cols-[minmax(0,1fr)_260px_260px] md:gap-4 md:px-8 xl:gap-5 xl:px-0">
        <h2 className="max-w-[360px] text-heading text-pgold-100 md:text-hero-title-mobile">{copy.heading}</h2>

        <article className="glass-panel glass-panel-prioritas relative flex h-[160px] flex-col justify-between overflow-hidden rounded-lg p-5">
          <h3 className="w-full text-base font-semibold leading-6 text-pgold-100">{copy.riplayTitle}</h3>
          <a href={RIPLAY_URL} target="_blank" rel="noopener noreferrer" className={prioritasButtonClassName({ kind: "text", surface: "inverse", size: "medium", className: "w-fit" })}>
            <PrioritasButtonIcon src="/assets/prioritas/banking/download.svg" />
            <span className="prio-button__label">{copy.download}</span>
          </a>
        </article>

        <article className="glass-panel glass-panel-prioritas relative flex h-[160px] flex-col justify-between overflow-hidden rounded-lg p-5 max-md:-mt-2">
          <h3 className="text-base font-semibold leading-6 text-pgold-100">{copy.contactTitle}</h3>
          <a href="tel:150022" className={prioritasButtonClassName({ kind: "text", surface: "inverse", size: "medium", className: "w-fit" })}>
            <PhoneIcon />
            <span className="prio-button__label">{copy.phone}</span>
          </a>
        </article>
      </div>
    </section>
  );
}
