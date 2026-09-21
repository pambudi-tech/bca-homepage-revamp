import { ProductAccordion, type ProductAccordionItem } from "@/components/home/ProductSection";

type CardCopy = {
  title: string;
  action: string;
  alt: string;
};

export default function SolitairePrivilegeSection({
  eyebrow,
  heading,
  cards,
  viewMore,
}: {
  eyebrow: string;
  heading: string;
  cards: [CardCopy, CardCopy, CardCopy];
  viewMore: string;
}) {
  const items: ProductAccordionItem[] = cards.map((card, index) => ({
    key: `solitaire-privilege-${index}`,
    title: card.title,
    description: "",
    action: card.action,
    image: [
      "/assets/solitaire/privilege/lounge-source.png",
      "/assets/solitaire/privilege/health-source.png",
      "/assets/solitaire/privilege/event-source.png",
    ][index],
  }));

  return (
    <section id="privilege" className="relative isolate min-h-[960px] overflow-hidden bg-neutral-400 py-20 text-neutral-900">
      <div className="pointer-events-none absolute left-0 right-0 top-[214px] aspect-[3840/1240] opacity-70">
        <img src="/assets/solitaire/privilege/background.png" alt="" aria-hidden className="size-full object-cover" />
      </div>
      <img
        src="/assets/solitaire/privilege/accent-circle.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[393px] h-[200px] w-[4000px] max-w-none -translate-x-[calc(50%+78px)]"
      />

      <div className="relative mx-auto w-full max-w-[1280px] px-4 xl:px-0">
        <header className="mb-14 flex flex-col gap-6 xl:flex-row xl:items-start xl:gap-10">
          <p className="text-eyebrow uppercase text-neutral-900 xl:w-[180px] xl:shrink-0 xl:py-2 xl:text-eyebrow-lg">
            {eyebrow}
          </p>
          <div className="flex flex-1 items-start justify-between gap-10">
            <h2 className="text-heading max-w-[560px] text-neutral-900 xl:text-display">
              {heading}
            </h2>
            <button type="button" className="btn-base shrink-0 border border-neutral-300 bg-neutral-100 text-neutral-800 hover:bg-white">
              <span className="font-semibold">{viewMore}</span>
              <img src="/assets/cycle1/chevron-right-1.svg" alt="" className="size-5 brightness-0" />
            </button>
          </div>
        </header>

        <ProductAccordion items={items} defaultKey={items[0].key} layout="solitaire" controls />
      </div>
    </section>
  );
}
