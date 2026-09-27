import { Link } from "@/i18n/navigation";
import MagazineCard from "@/components/prioritas/MagazineCard";

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
      <div className="relative mx-auto flex w-full max-w-[1280px] flex-col gap-12 px-4 xl:gap-14 xl:px-0">
        <header className="flex flex-col gap-6 xl:flex-row xl:items-start xl:gap-10">
          <div className="flex flex-1 flex-col gap-6 xl:flex-row xl:gap-10">
            <p className="text-eyebrow uppercase text-pgold-300 xl:w-[180px] xl:shrink-0 xl:py-2 xl:text-eyebrow-lg">{copy.eyebrow}</p>
            <h2 className="text-heading max-w-[520px] text-pgold-100 xl:text-display">{copy.heading}</h2>
          </div>
          <Link href="/prioritas/e-magazine" className="btn-base hidden w-fit bg-neutral-100 text-pbrown-600 transition-colors hover:bg-pgold-100 md:flex">
            <span className="px-0.5 text-base font-semibold">{copy.viewMore}</span>
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
        </header>

        <div className="hide-scrollbar -mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 xl:gap-10">
          {copy.cards.map((card) => <MagazineCard key={card.title + card.image} {...card} href="/prioritas/e-magazine" className="h-[380px] w-[280px] shrink-0 snap-center md:h-[420px] md:w-auto md:shrink md:snap-none xl:h-[532px]" />)}
        </div>
        <Link href="/prioritas/e-magazine" className="btn-base w-full bg-neutral-100 text-pbrown-600 transition-colors hover:bg-pgold-100 md:hidden">
          <span className="px-0.5 text-base font-semibold">{copy.viewMore}</span>
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
    </section>
  );
}
