import { ProductAccordion, type ProductAccordionItem } from "@/components/home/ProductSection";
import { solitaireButtonClassName } from "@/components/prioritas/PrioritasButton";
import { Link } from "@/i18n/navigation";

type CardCopy = {
  title: string;
  action: string;
  alt: string;
  href: string;
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
    href: card.href,
    image: [
      "/assets/solitaire/privilege/lounge-source.png",
      "/assets/solitaire/privilege/health-source.png",
      "/assets/solitaire/privilege/event-source.png",
    ][index],
  }));

  return (
    <section id="privilege" className="relative isolate overflow-hidden bg-neutral-400 py-12 text-neutral-900 xl:py-20">
      <div className="pointer-events-none absolute left-0 right-0 top-[214px] aspect-[3840/1240] opacity-70">
        <img src="/assets/solitaire/privilege/background.png" alt="" aria-hidden className="size-full object-cover" />
      </div>
      <div className="relative mx-auto w-full max-w-[1280px] px-4 xl:px-0">
        <header className="mb-8 flex flex-col gap-6 md:mb-12 xl:mb-14 xl:flex-row xl:items-start xl:gap-10">
          <p className="text-eyebrow-lg uppercase text-neutral-900 md:text-eyebrow xl:w-[180px] xl:shrink-0 xl:py-2 xl:text-eyebrow-xl">
            {eyebrow}
          </p>
          <div className="flex flex-1 items-start justify-between gap-10">
            <h2 className="text-heading max-w-[560px] text-neutral-900 xl:text-display">
              {heading}
            </h2>
            <div className="hidden shrink-0 xl:block">
              <Link href="/solitaire/privilege" className={solitaireButtonClassName({ variant: "secondary", size: "large" })}>
                <span className="prio-button__label">{viewMore}</span>
                <img src="/assets/navbar/arrow-right.svg" alt="" className="size-5 brightness-0" />
              </Link>
            </div>
          </div>
        </header>

        <div className="flex flex-col gap-8 xl:block">
          <ProductAccordion items={items} defaultKey={items[0].key} layout="solitaire" controls />
          <div className="xl:hidden">
            <Link href="/solitaire/privilege" className={solitaireButtonClassName({ variant: "secondary", size: "large", className: "w-full" })}>
              <span className="prio-button__label">{viewMore}</span>
              <img src="/assets/navbar/arrow-right.svg" alt="" className="size-5 brightness-0" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
