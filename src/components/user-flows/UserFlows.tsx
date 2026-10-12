'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Copy, RotateCcw, Search } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import WorkspaceNav from '@/components/docs/WorkspaceNav';
import WorkspaceTitle from '@/components/docs/WorkspaceTitle';
import { Button } from '@/components/catalog/ui/button';
import { Input } from '@/components/catalog/ui/input';
import FlowUIPreview, { type FlowPreviewData } from './FlowUIPreview';
import { flowTrack } from './flow-graph';
import type { FlowStage } from './flow-preview-state';
import { flowJourneys, flowKinds, flowStatuses, parseScenarioHash, scenarioHash, type FlowBrand, type FlowJourney, type FlowKind, type FlowScenario, type FlowStatus } from './flow-data';

type Translate = ReturnType<typeof useTranslations>;
type Filters = { query: string; brand: FlowBrand | 'all'; kind: FlowKind | 'all'; status: FlowStatus | 'all' };
const areas = ['public', 'both', 'member', 'preview'] as const;
const statusStyles: Record<FlowStatus, string> = {
  available: 'border-green-300 bg-green-100 text-green-700', demo: 'border-blue-300 bg-blue-200 text-blue-700',
  gap: 'border-yellow-300 bg-yellow-100 text-yellow-700', external: 'border-neutral-400 bg-neutral-200 text-neutral-700',
};
function Badge({ status, t }: { status: FlowStatus; t: Translate }) {
  return <span title={t(`statusHelp.${status}`)} className={`inline-flex items-center rounded-md border px-2 py-1 text-size-body-s font-medium ${statusStyles[status]}`}>{t(`statuses.${status}`)}</span>;
}
const kindStyles: Record<FlowKind, string> = {
  normal: 'bg-green-100 text-green-700', negative: 'bg-red-100 text-red-700',
  alternative: 'bg-blue-100 text-blue-700', recovery: 'bg-purple-100 text-purple-700', edge: 'bg-yellow-100 text-yellow-700',
};
function KindBadge({ kind, t }: { kind: FlowKind; t: Translate }) {
  return <span className={`inline-flex shrink-0 items-center rounded-md px-2 py-1 text-size-body-s font-semibold ${kindStyles[kind]}`}>{t(`kinds.${kind}`)}</span>;
}
function FilterSelect<T extends string>({ label, value, values, onChange }: { label: string; value: T; values: { value: T; label: string }[]; onChange: (value: T) => void }) {
  return <label className="flex min-w-0 flex-col gap-1.5 text-size-body-s font-medium text-neutral-700"><span>{label}</span><select value={value} onChange={event => onChange(event.target.value as T)} className="h-10 w-full rounded-lg border border-neutral-400 bg-neutral-100 px-3 text-size-body-m text-neutral-900 outline-none focus-visible:ring-2 focus-visible:ring-neutral-600">{values.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>;
}

export default function UserFlows({ previewData }: { previewData: FlowPreviewData }) {
  const t = useTranslations('userFlows');
  const locale = useLocale();
  const [filters, setFilters] = useState<Filters>({ query: '', brand: 'all', kind: 'all', status: 'all' });
  const [selection, setSelection] = useState({ journeyId: 'navigation', scenarioId: 'menu' });
  const [lobby, setLobby] = useState(true);
  const [stage, setStage] = useState<FlowStage>(2);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const detailRef = useRef<HTMLElement>(null);
  const stagesRef = useRef<HTMLDivElement>(null);
  const textAt = (journey: FlowJourney, scenario: FlowScenario, field: string) => t(`journeys.${journey.id}.scenarios.${scenario.id}.${field}`);
  useEffect(() => {
    const read = () => {
      const found = parseScenarioHash(window.location.hash);
      setLobby(!found);
      if (!found) return;
      setSelection({ journeyId: found.journey.id, scenarioId: found.scenario.id });
      setFilters({ query: '', brand: found.brand, kind: 'all', status: 'all' });
      setStage(found.stage); setCopyState('idle');
    };
    read(); window.addEventListener('hashchange', read); window.addEventListener('popstate', read);
    return () => { window.removeEventListener('hashchange', read); window.removeEventListener('popstate', read); };
  }, []);
  useEffect(() => {
    const group = stagesRef.current;
    const selected = group?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!group || !selected) return;
    const centerSelected = () => {
      const selectedRect = selected.getBoundingClientRect();
      const groupRect = group.getBoundingClientRect();
      group.scrollTo({ left: group.scrollLeft + selectedRect.left + selectedRect.width / 2 - groupRect.left - group.clientWidth / 2, behavior: 'instant' });
    };
    centerSelected();
    const observer = new ResizeObserver(centerSelected);
    observer.observe(group);
    return () => observer.disconnect();
  }, [stage, selection.journeyId, selection.scenarioId, lobby]);
  const terms = filters.query.trim().toLocaleLowerCase(locale).split(/\s+/).filter(Boolean);
  const groups = flowJourneys.map(journey => ({ journey, scenarios: journey.scenarios.filter(scenario => {
    if (filters.brand !== 'all' && scenario.brand !== 'both' && scenario.brand !== filters.brand || filters.kind !== 'all' && scenario.kind !== filters.kind || filters.status !== 'all' && scenario.status !== filters.status) return false;
    const searchable = [t(`journeys.${journey.id}.title`), t(`journeys.${journey.id}.description`), ...['title', 'condition', 'response', 'recovery'].map(field => textAt(journey, scenario, field)), t(`kinds.${scenario.kind}`), t(`statuses.${scenario.status}`)].join(' ').toLocaleLowerCase(locale);
    return terms.every(term => searchable.includes(term));
  }) })).filter(group => group.scenarios.length);
  const active = groups.find(group => group.journey.id === selection.journeyId) ?? groups[0];
  const journey = active?.journey;
  const scenario = active?.scenarios.find(item => item.id === selection.scenarioId) ?? active?.scenarios[0];
  const dirty = filters.query !== '' || filters.brand !== 'all' || filters.kind !== 'all' || filters.status !== 'all';
  const brand = scenario?.brand !== 'both' && scenario?.brand ? scenario.brand : filters.brand === 'all' ? 'prioritas' : filters.brand;
  function updateFilters(next: Partial<Filters>) { setFilters(previous => ({ ...previous, ...next })); setStage(2); setCopyState('idle'); }
  function select(nextJourney: FlowJourney, nextScenario: FlowScenario, nextStage: FlowStage = 2, focus = false) {
    setSelection({ journeyId: nextJourney.id, scenarioId: nextScenario.id }); setStage(nextStage); setCopyState('idle');
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${scenarioHash(nextJourney, nextScenario, filters.brand, nextStage)}`);
    if (focus) requestAnimationFrame(() => {
      detailRef.current?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
      detailRef.current?.focus({ preventScroll: true });
    });
  }
  function openFlow(nextJourney: FlowJourney, nextScenario: FlowScenario) {
    window.history.pushState(null, '', `${window.location.pathname}${window.location.search}#${scenarioHash(nextJourney, nextScenario, filters.brand, 2)}`);
    select(nextJourney, nextScenario);
    setLobby(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
    requestAnimationFrame(() => detailRef.current?.focus({ preventScroll: true }));
  }
  function showLobby() {
    window.history.pushState(null, '', `${window.location.pathname}${window.location.search}`);
    setLobby(true);
    window.scrollTo({ top: 0, behavior: 'instant' });
    requestAnimationFrame(() => detailRef.current?.focus({ preventScroll: true }));
  }
  async function copyLink() {
    if (!journey || !scenario) return;
    const url = new URL(window.location.href); url.hash = scenarioHash(journey, scenario, filters.brand, stage);
    try { await navigator.clipboard.writeText(url.href); setCopyState('copied'); } catch { setCopyState('failed'); }
  }
  const track = journey ? flowTrack(journey) : [];
  const stageBody = journey && scenario ? stage === 0 ? t(`journeys.${journey.id}.entry`) : textAt(journey, scenario, stage === 1 ? 'condition' : stage === 2 ? 'response' : 'recovery') : '';

  return <main id="main-content" className={`${lobby ? "min-h-dvh" : "flex h-dvh flex-col overflow-hidden"} bg-neutral-100 font-docs text-neutral-900`}>
    <header className="grid shrink-0 grid-cols-1 items-center gap-x-4 gap-y-3 border-b border-neutral-400 px-5 py-3 md:grid-cols-[minmax(0,1fr)_auto] xl:min-h-16 lg:px-8">
      <WorkspaceTitle href="/user-flows" /><div className="md:justify-self-end"><WorkspaceNav active="flows" /></div>
    </header>
    <section ref={detailRef} tabIndex={-1} aria-labelledby="flow-title" className={`${lobby ? "px-5 py-8 md:px-8 lg:px-10" : "flex min-h-0 flex-1 flex-col px-3 pb-3 pt-3 md:px-5 md:pb-5"} min-w-0 scroll-mt-5 outline-none`}>
        <div className={`${lobby ? "max-w-[1600px]" : "flex min-h-0 flex-1 flex-col max-w-[1800px]"} mx-auto w-full`}>
          {lobby ? <>
          <h1 id="flow-title" className="text-heading-m">{t('lobby.title')}</h1>
          <p className="mt-2 mb-6 text-size-body-m text-neutral-700">{t('lobby.help')}</p>
          <div className="grid gap-3 border-b border-neutral-400 pb-5 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_150px_150px_170px]">
            <label className="flex min-w-0 flex-col gap-1.5 text-size-body-s font-medium text-neutral-700"><span>{t('search')}</span><span className="relative"><Search aria-hidden className="absolute left-3 top-3 size-4" /><Input type="search" value={filters.query} onChange={event => updateFilters({ query: event.target.value })} placeholder={t('searchPlaceholder')} className="h-10 rounded-lg pl-9" /></span></label>
            <FilterSelect label={t('brand')} value={filters.brand} onChange={brand => updateFilters({ brand })} values={(['all', 'prioritas', 'solitaire'] as const).map(value => ({ value, label: value === 'all' ? t('brands.both') : t(`brands.${value}`) }))} />
            <FilterSelect label={t('kind')} value={filters.kind} onChange={kind => updateFilters({ kind })} values={['all' as const, ...flowKinds].map(value => ({ value, label: value === 'all' ? t('all') : t(`kinds.${value}`) }))} />
            <FilterSelect label={t('status')} value={filters.status} onChange={status => updateFilters({ status })} values={['all' as const, ...flowStatuses].map(value => ({ value, label: value === 'all' ? t('all') : t(`statuses.${value}`) }))} />
          </div>
          {dirty && <div className="mt-3 flex justify-end"><Button type="button" variant="ghost" size="sm" onClick={() => updateFilters({ query: '', brand: 'all', kind: 'all', status: 'all' })}><RotateCcw aria-hidden />{t('reset')}</Button></div>}
          {groups.length ? <nav aria-label={t('journeysLabel')} className="mt-7 space-y-8">
            {areas.map(area => {
              const items = groups.filter(group => group.journey.area === area);
              return items.length ? <section key={area} aria-labelledby={`flow-area-${area}`}>
                <h2 id={`flow-area-${area}`} className="mb-3 text-size-body-m font-semibold text-neutral-700">{t(`areas.${area}`)}</h2>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {items.map(group => <a key={group.journey.id} href={`#${scenarioHash(group.journey, group.scenarios[0], filters.brand, 2)}`} onClick={event => {
                    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                    event.preventDefault(); openFlow(group.journey, group.scenarios[0]);
                  }} className="group flex min-w-0 flex-col rounded-2xl border border-neutral-400 p-5 outline-none transition-colors hover:border-blue-500 hover:bg-blue-100/50 focus-visible:ring-2 focus-visible:ring-neutral-600">
                    <span className="flex items-start justify-between gap-4"><span className="text-size-body-l font-semibold">{t(`journeys.${group.journey.id}.title`)}</span><ArrowUpRight aria-hidden className="mt-1 size-4 shrink-0 text-neutral-600 group-hover:text-blue-700" /></span>
                    <span className="mt-2 text-size-body-s leading-5 text-neutral-700">{t(`journeys.${group.journey.id}.description`)}</span>
                    <span className="mt-auto pt-5 text-size-body-s font-medium text-neutral-600">{t('lobby.cases', { count: group.scenarios.length })}</span>
                  </a>)}
                </div>
              </section> : null;
            })}
          </nav> : <div className="flex min-h-80 flex-col items-center justify-center text-center"><h2 className="text-heading-m">{t('emptyTitle')}</h2><p className="mt-2 text-size-body-m text-neutral-700">{t('emptyBody')}</p><Button type="button" variant="outline" className="mt-5" onClick={() => updateFilters({ query: '', brand: 'all', kind: 'all', status: 'all' })}>{t('reset')}</Button></div>}
          </> : journey && scenario ? <>
            <div className="mb-3 flex shrink-0 items-center justify-between gap-2">
              <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3"><Button type="button" variant="ghost" size="sm" onClick={showLobby}><ArrowLeft aria-hidden /><span className="hidden sm:inline">{t('lobby.back')}</span><span className="sr-only sm:hidden">{t('board.back')}</span></Button><h1 id="flow-title" className="truncate text-size-body-m font-semibold md:text-heading-xs">{t(`journeys.${journey.id}.title`)}</h1></div>
              <div className="flex gap-2"><Button type="button" variant="outline" size="sm" aria-label={t('copyLink')} title={t('copyLink')} onClick={copyLink}><Copy aria-hidden /></Button><Button asChild variant="outline" size="sm"><Link href={journey.href.replace('{brand}', brand)} prefetch={false} target="_blank" rel="noopener noreferrer" aria-label={t('openPage')} title={t('openPage')}><ArrowUpRight aria-hidden /></Link></Button></div>
            </div>
            <p role="status" className={copyState === 'idle' ? 'sr-only' : 'mb-2 shrink-0 text-size-body-s text-neutral-700'}>{copyState === 'idle' ? '' : t(copyState === 'copied' ? 'copied' : 'copyFailed')}</p>
            <div className="mb-3 shrink-0 lg:hidden"><label className="flex items-center gap-3 text-size-body-s font-semibold"><span>{t('board.cases')}</span><select aria-label={t('ui.allCases')} value={scenario.id} onChange={event => { const row = active.scenarios.find(item => item.id === event.target.value); if (row) select(journey, row); }} className="h-10 min-w-0 flex-1 rounded-lg border border-neutral-400 bg-neutral-100 px-3 text-size-body-m outline-none focus-visible:ring-2 focus-visible:ring-blue-500">{flowKinds.map(kind => { const rows = active.scenarios.filter(row => row.kind === kind); return rows.length ? <optgroup key={kind} label={t(`kinds.${kind}`)}>{rows.map(row => <option key={row.id} value={row.id}>{t(`kinds.${kind}`)} · {textAt(journey, row, 'title')}</option>)}</optgroup> : null; })}</select></label></div>
            <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
              <nav aria-label={t('ui.allCases')} className="hidden min-h-0 flex-col overflow-hidden rounded-xl border border-neutral-400 lg:flex">
                <div className="flex shrink-0 items-center justify-between border-b border-neutral-400 px-4 py-3"><h2 className="text-size-body-m font-semibold">{t('board.cases')}</h2><span className="text-size-body-s text-neutral-600">{active.scenarios.length}</span></div>
                <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-2" data-lenis-prevent>
                  {flowKinds.map(kind => {
                    const rows = active.scenarios.filter(row => row.kind === kind);
                    return rows.length ? <section key={kind} aria-label={t(`kinds.${kind}`)}>
                      <div className="mb-1 flex items-center justify-between px-2 py-1"><KindBadge kind={kind} t={t} /><span className="text-size-body-s text-neutral-600">{rows.length}</span></div>
                      {rows.map(row => <button key={row.id} type="button" data-flow-case={row.id} aria-pressed={scenario.id === row.id} onClick={() => select(journey, row)} className={`flex w-full items-start gap-2 rounded-lg px-3 py-3 text-left text-size-body-m leading-5 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${scenario.id === row.id ? 'bg-blue-100 font-semibold text-blue-700' : 'text-neutral-800 hover:bg-neutral-200'}`}><span className="min-w-0 flex-1">{textAt(journey, row, 'title')}</span>{scenario.id === row.id && <Check aria-hidden className="mt-0.5 size-4 shrink-0" />}</button>)}
                    </section> : null;
                  })}
                </div>
              </nav>
              <section aria-label={t('board.selectedCase')} className="flex min-h-0 min-w-0 flex-col">
                <div className="mb-3 flex shrink-0 flex-wrap items-center gap-2" aria-live="polite"><KindBadge kind={scenario.kind} t={t} /><h2 className="min-w-0 flex-1 text-size-body-l font-semibold">{textAt(journey, scenario, 'title')}</h2><Badge status={scenario.status} t={t} /></div>
                <div ref={stagesRef} role="group" aria-label={t('board.stages')} className="mb-3 flex shrink-0 items-center gap-1 overflow-x-auto text-size-body-s" data-lenis-prevent>
                  {[...track.map(node => ({ stage: node.stage, label: t(`graph.nodes.${node.key}`) })), { stage: 2 as const, label: t('ui.result') }].map((item, index) => <div key={item.stage} className="flex shrink-0 items-center gap-1">{index > 0 && <ArrowRight aria-hidden className="size-3.5 text-neutral-500" />}<button type="button" aria-pressed={stage === item.stage} onClick={() => select(journey, scenario, item.stage)} className={`whitespace-nowrap rounded-lg px-3 py-2 font-medium outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${stage === item.stage ? 'bg-blue-500 text-neutral-100' : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'}`}>{item.label}</button></div>)}
                </div>
                <div className="min-h-0 flex-1"><FlowUIPreview journey={journey} scenario={scenario} stage={stage} brand={brand} data={previewData} fill /></div>
                <details key={`${journey.id}/${scenario.id}/${stage}`} className="mt-3 max-h-40 shrink-0 overflow-y-auto rounded-lg border border-neutral-400 px-3 py-2 text-size-body-s" data-lenis-prevent>
                  <summary className="cursor-pointer font-medium text-neutral-700 outline-none focus-visible:ring-2 focus-visible:ring-blue-500">{t('board.explanation')}</summary>
                  <p className="mt-2 leading-5 text-neutral-700">{stageBody}</p>
                  {stage === 2 && <p className="mt-2 leading-5 text-neutral-700">{textAt(journey, scenario, 'recovery')}</p>}
                  {stage >= 2 && ['gap', 'external'].includes(scenario.status) && <p className="mt-2 leading-5 text-neutral-600">{t(`statusHelp.${scenario.status}`)}</p>}
                  <details className="mt-3 border-t border-neutral-300 pt-2"><summary className="cursor-pointer text-neutral-600">{t('source')}</summary><ul className="mt-2 space-y-1">{journey.sources.map(source => <li key={source} className="break-all font-mono text-neutral-600">{source}</li>)}</ul></details>
                </details>
              </section>
            </div>
          </> : null}
        </div>
    </section>
  </main>;
}
