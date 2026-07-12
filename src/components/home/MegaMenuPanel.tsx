import type { MegaMenuCategory, MegaMenuLink } from "./megamenu-data";

const LINK_ICONS: Record<NonNullable<MegaMenuLink["type"]>, string> = {
  article: "/assets/navbar/icon-doc.svg",
  video: "/assets/navbar/icon-youtube.svg",
};

export default function MegaMenuPanel({ category }: { category: MegaMenuCategory }) {
  return (
    <div className="flex w-[1280px] gap-5 py-4">
      {/* column 1: marketing space */}
      <div className="h-[480px] w-[400px] shrink-0 overflow-hidden rounded-xl">
        <div className="h-1/2 w-full">
          <img
            src={category.promo.image}
            alt=""
            className="size-full object-cover"
          />
        </div>
        <div
          className="flex h-1/2 flex-col justify-between p-6"
          style={{
            backgroundImage:
              "linear-gradient(244.86deg, rgb(0, 181, 240) 0%, rgb(0, 92, 170) 100%)",
          }}
        >
          <div className="flex flex-col items-start gap-3">
            <p className="w-full text-xl font-semibold leading-7 tracking-[-0.4px] text-white">
              {category.promo.title}
            </p>
            <p className="w-full text-base leading-6 text-white/90">
              {category.promo.description}
            </p>
          </div>
          <button className="flex w-fit items-center gap-0.5 text-base font-semibold text-white transition-transform hover:translate-x-0.5">
            {category.promo.cta}
            <img src="/assets/navbar/icon-arrow-white.svg" alt="" className="size-5" />
          </button>
        </div>
      </div>

      {/* column 2: product list */}
      <div className="flex h-[480px] w-[420px] shrink-0 flex-col justify-between">
        <div className="flex flex-col items-start justify-center">
          <div className="w-full px-4 py-2">
            <p className="flex-1 text-xs font-semibold uppercase tracking-[1.8px] text-[#495057]">
              {category.listTitle}
            </p>
          </div>
          {category.products.map((product) => (
            <button
              key={product.title}
              className="flex w-full flex-col items-start gap-0.5 rounded-xl px-4 pb-4 pt-3 text-left transition-colors hover:bg-[#f4f8fc]"
            >
              <p className="text-base font-semibold leading-6 text-[#26292c]">
                {product.title}
              </p>
              <p className="text-sm leading-5 text-[#495057]">{product.description}</p>
            </button>
          ))}
        </div>
        <div className="px-4">
          <button className="flex items-center gap-0.5 text-base font-semibold text-[#005caa] transition-transform hover:translate-x-0.5">
            {category.ctaLabel}
            <img src="/assets/navbar/icon-arrow-blue.svg" alt="" className="size-5" />
          </button>
        </div>
      </div>

      {/* divider */}
      <div className="h-[480px] w-px shrink-0 bg-[#e9ecef]" />

      {/* column 3: tools & utility links */}
      <div className="flex h-[480px] flex-1 flex-col justify-between">
        <div className="flex items-center justify-between gap-4">
          {category.tools.map((tool) => (
            <div
              key={tool.title}
              className="flex h-[180px] w-[192px] flex-col justify-between rounded-xl border border-[#e9ecef] p-5"
            >
              <img src={tool.icon} alt="" className="size-10" />
              <p className="text-base font-semibold leading-6 text-[#26292c]">{tool.title}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-start">
          {category.links.map((link) => (
            <button
              key={link.label}
              className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-[#f4f8fc]"
            >
              <span className="flex size-8 shrink-0 items-center justify-center">
                <img src={LINK_ICONS[link.type ?? "article"]} alt="" className="size-6" />
              </span>
              <span className="flex-1 text-sm font-semibold leading-5 text-[#26292c]">
                {link.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
