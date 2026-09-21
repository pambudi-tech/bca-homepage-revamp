import { Link } from "@/i18n/navigation";

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
    <section id="magazine" className="relative overflow-hidden bg-pbrown-700 py-16 text-pgold-100 xl:py-20">
      <div className="relative mx-auto flex w-full max-w-[1280px] flex-col gap-10 px-4 xl:gap-14 xl:px-0">
        <header className="flex flex-col gap-6 xl:flex-row xl:items-start xl:gap-10">
          <div className="flex flex-1 flex-col gap-6 xl:flex-row xl:gap-10">
            <p className="text-eyebrow uppercase text-pgold-300 xl:w-[180px] xl:shrink-0 xl:py-2 xl:text-eyebrow-lg">{copy.eyebrow}</p>
            <h2 className="text-heading max-w-[520px] text-pgold-100 xl:text-display">{copy.heading}</h2>
          </div>
          <Link href="/artikel" className="btn-base hidden w-fit bg-neutral-100 text-pbrown-600 transition-colors hover:bg-pgold-100 md:flex">
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
          {copy.cards.map((card) => (
            <Link
              key={card.title + card.image}
              href="/artikel"
              className="group relative h-[380px] w-[280px] shrink-0 snap-center overflow-hidden rounded-xl md:h-[420px] md:w-auto md:shrink md:snap-none xl:h-[532px]"
            >
              <img src={card.image} alt={card.imageAlt} loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-[rgb(47_24_4_/_0)] to-pbrown-800/95 opacity-0 backdrop-blur-[8px] transition-opacity duration-300 group-hover:opacity-100" />
              <div className="absolute inset-x-6 bottom-6 flex translate-y-3 flex-col items-center gap-6 text-center opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <p className="w-full text-2xl font-semibold leading-[1.3] text-neutral-100">{card.title}</p>
                <span className="flex h-12 items-center justify-center rounded-full bg-pgold-300 px-6 text-base font-semibold leading-4 text-pbrown-700">
                  {card.action}
                </span>
              </div>
            </Link>
          ))}
        </div>
        <Link href="/artikel" className="btn-base w-full bg-neutral-100 text-pbrown-600 transition-colors hover:bg-pgold-100 md:hidden">
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
