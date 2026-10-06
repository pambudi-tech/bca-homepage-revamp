import { Link } from "@/i18n/navigation";

type GeneralPrivateBankingEntryPointsProps = {
  title: string;
  entries: Array<{ href: string; title: string; action: string; image: string }>;
};

export default function GeneralPrivateBankingEntryPoints({ title, entries }: GeneralPrivateBankingEntryPointsProps) {
  return (
    <section className="pointer-events-auto mt-8 xl:mt-10" aria-labelledby="general-entry-points-title">
      <h2 id="general-entry-points-title" className="mb-4 text-subtitle font-semibold text-neutral-800 xl:text-heading">
        {title}
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:gap-6">
        {entries.map((entry) => (
          <Link key={entry.href} href={entry.href} className="group relative isolate flex min-h-[240px] overflow-hidden rounded-2xl border border-neutral-300 bg-neutral-800 shadow-card transition-[box-shadow] duration-300 hover:shadow-panel focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500 xl:min-h-[300px]">
            <img aria-hidden src={entry.image} alt="" className="absolute inset-0 z-0 size-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <span aria-hidden className="absolute inset-0 z-10 bg-gradient-to-t from-neutral-900/85 via-neutral-900/25 to-transparent" />
            <span className="relative z-20 mt-auto flex w-full items-end justify-between gap-4 p-5 text-neutral-100 xl:p-6">
              <span>
                <span className="block text-title font-semibold xl:text-heading">{entry.title}</span>
                <span className="mt-2 block text-sm font-semibold xl:text-base">{entry.action}</span>
              </span>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mb-1 size-6 shrink-0 transition-transform group-hover:translate-x-1">
                <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
