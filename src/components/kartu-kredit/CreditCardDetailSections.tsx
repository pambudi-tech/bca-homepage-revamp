import type { ComparisonCard } from "@/components/kartu-kredit/CreditCardComparison";

type DetailSection = NonNullable<ComparisonCard["comparison"]>[number];

const sectionIds: Record<string, string> = {
  benefits: "manfaat",
  features: "fitur-utama",
  fees: "biaya",
  requirements: "syarat-pengajuan",
  limit: "limit",
  payments: "suku-bunga-pembayaran",
};

export default function CreditCardDetailSections({ sections, labels }: { sections: DetailSection[]; labels: Record<string, string> }) {
  return (
    <div className="bg-neutral-100">
      {sections.map((section) => (
        <section key={section.key} id={`detail-${sectionIds[section.key] ?? section.key}`} className="scroll-mt-[110px] border-b border-neutral-200 bg-white" aria-labelledby={`detail-${section.key}-title`}>
          <h2 id={`detail-${section.key}-title`} className="bg-blue-100 px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-blue-500 xl:px-20 xl:py-4 xl:text-sm">
            {labels[section.key] || section.key}
          </h2>
          <div className="mx-auto grid w-full max-w-[1280px] gap-6 px-4 py-6 sm:grid-cols-2 xl:grid-cols-3 xl:px-20">
            {section.groups.flatMap((group) => group.points).map((point, index) => (
              <article key={`${point.label}-${index}`} className="flex flex-col gap-2">
                <h3 className="text-sm font-bold leading-5 text-neutral-800">{point.label}</h3>
                {point.bullets?.length ? (
                  <ul className="list-disc space-y-1 pl-4 text-sm leading-5 text-neutral-700">
                    {point.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                  </ul>
                ) : point.description ? (
                  <p className="text-sm leading-5 text-neutral-700">{point.description}</p>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
