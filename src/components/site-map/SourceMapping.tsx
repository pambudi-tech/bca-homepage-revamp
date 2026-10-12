import { ArrowUpRight } from 'lucide-react';
import type { useTranslations } from 'next-intl';
import type { SiteNode } from './site-map-types';

type Translate = ReturnType<typeof useTranslations>;
export default function SourceMapping({ node, t }: { node: SiteNode; t: Translate }) {
  const origin = node.origin;
  return <section aria-labelledby="map-origin-title" className="border-t border-neutral-400 p-5">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h3 id="map-origin-title" className="text-size-body-m font-semibold">{t('origin.heading')}</h3>
      {origin && <span className="rounded-md bg-neutral-200 px-2 py-1 text-size-body-s text-neutral-700">{t(`origin.status.${origin.status}`)}</span>}
    </div>
    {origin ? <>
      {origin.previousName && <p className="mt-3 text-size-body-s text-neutral-700">{t('origin.previous', { name: origin.previousName })}</p>}
      <p className="mt-3 text-size-body-m leading-6 text-neutral-700">{t(`origin.notes.${origin.note}`, { path: node.path })}</p>
      {origin.sources.length > 0 && <ul className="mt-4 space-y-2">{origin.sources.map(source => <li key={source.href}>
        <a href={source.href} target="_blank" rel="noopener noreferrer" className="group flex items-start gap-2 rounded-lg border border-neutral-400 p-3 outline-none hover:bg-neutral-200 focus-visible:ring-2 focus-visible:ring-neutral-600">
          <span className="min-w-0 flex-1"><span className="block text-size-body-m font-medium group-hover:underline">{t(`origin.sources.${source.label}`)}</span><span className="mt-1 block break-all text-size-body-s leading-5 text-neutral-700">{source.href}</span></span>
          <ArrowUpRight aria-hidden className="mt-0.5 size-4 shrink-0" />
        </a>
      </li>)}</ul>}
      {node.kind === 'detail' && <p className="mt-3 text-size-body-s leading-5 text-neutral-700">{t('origin.categorySource')}</p>}
      {node.area === 'member' && <p className="mt-3 text-size-body-s leading-5 text-neutral-700">{t('origin.memberSource')}</p>}
    </> : <p className="mt-3 text-size-body-m leading-6 text-neutral-700">{t('origin.unmapped')}</p>}
    {node.label === 'home' && <details className="mt-5 border-t border-neutral-400 pt-4">
      <summary className="cursor-pointer text-size-body-m font-medium">{t('origin.pendingHeading')}</summary>
      <p className="mt-3 text-size-body-m leading-6 text-neutral-700">{t('origin.held')}</p>

    </details>}
  </section>;
}
