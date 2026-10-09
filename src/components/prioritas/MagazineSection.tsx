import { Link } from "@/i18n/navigation";
import MagazineCard from "@/components/prioritas/MagazineCard";
import { PrioritasButtonIcon, prioritasButtonClassName } from "@/components/prioritas/PrioritasButton";

type MagazineCard = {
  title: string;
  action: string;
  image: string;
  imageAlt: string;
};

type Copy = {
  eyebrow: string;
  heading: string;
  viewMore: string;
  cards: MagazineCard[];
};

export default function MagazineSection({ copy }: { copy: Copy }) {
  return (
    <section id="magazine" className="relative overflow-hidden bg-pbrown-700 py-12 text-pgold-100 xl:py-20">
      <div className="relative mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-4 md:gap-12 xl:gap-14 xl:px-0">
        <header className="flex flex-col gap-6 xl:flex-row xl:items-start xl:gap-10">
          <div className="flex flex-1 flex-col gap-6 xl:flex-row xl:gap-10">
            <p className="text-eyebrow-lg uppercase text-pgold-300 md:text-eyebrow xl:w-[180px] xl:shrink-0 xl:py-2 xl:text-eyebrow-xl">{copy.eyebrow}</p>
            <h2 className="text-heading max-w-[520px] text-pgold-100 xl:text-display">{copy.heading}</h2>
          </div>
          <div className="hidden md:block">
            <Link href="/prioritas/e-magazine" className={prioritasButtonClassName({ surface: "inverse", size: "large", className: "w-fit" })}>
              <span className="prio-button__label">{copy.viewMore}</span>
              <PrioritasButtonIcon src="/assets/cycle1/pelajari-icon.svg" />
            </Link>
          </div>
        </header>

        <div className="flex flex-col gap-4">
          <div className="hide-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0">
            {copy.cards.map((card) => <MagazineCard key={card.title + card.image} {...card} href="/prioritas/e-magazine" className="h-[380px] w-[280px] shrink-0 snap-center md:h-[420px] md:w-auto md:shrink md:snap-none xl:h-[532px]" usePrioritasButtonLibrary />)}
          </div>
          <div className="md:hidden">
            <Link href="/prioritas/e-magazine" className={prioritasButtonClassName({ surface: "inverse", size: "large", className: "w-full" })}>
              <span className="prio-button__label">{copy.viewMore}</span>
              <PrioritasButtonIcon src="/assets/cycle1/pelajari-icon.svg" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
