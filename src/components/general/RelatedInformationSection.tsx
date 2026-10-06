import { Link } from "@/i18n/navigation";

type RelatedInformationSectionProps = {
  title: string;
  links: Array<{ href: string; label: string }>;
  tone?: "general" | "solitaire" | "prioritas";
};

export default function RelatedInformationSection({ title, links, tone = "general" }: RelatedInformationSectionProps) {
  const prioritas = tone === "prioritas";
  const headingClass = prioritas ? "text-pbrown-600" : "text-neutral-800";
  const linkClass = prioritas
    ? "border-pbrown-100 text-pbrown-600 hover:border-pgold-500"
    : "border-neutral-300 text-neutral-800 hover:border-neutral-800";

  return (
    <section className="pointer-events-auto mt-6 w-full xl:mt-8" aria-labelledby="related-information-title">
      <h2 id="related-information-title" className={`mb-3 text-subtitle xl:text-heading ${headingClass}`}>
        {title}
      </h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className={`group flex items-center justify-between rounded-2xl border bg-white px-5 py-4 transition-colors ${linkClass}`}>
            <span className="text-base font-semibold xl:text-title">{link.label}</span>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-5 shrink-0 transition-transform group-hover:translate-x-1">
              <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        ))}
      </div>
    </section>
  );
}
