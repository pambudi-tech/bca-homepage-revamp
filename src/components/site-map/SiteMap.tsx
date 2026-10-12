'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowRight, ArrowUpRight, ChevronDown, ChevronRight, ChevronsDownUp, ChevronsUpDown, FileText, FolderOpen, Globe2, Home, KeyRound, Layers, LockKeyhole, Search, ShieldCheck, X } from 'lucide-react';
import { Link, getPathname } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import type { AppLocale } from '@/i18n/routing';
import { Button } from '@/components/catalog/ui/button';
import CatalogOptions from '@/components/catalog/CatalogOptions';
import SourceMapping from './SourceMapping';
import WorkspaceNav from '@/components/docs/WorkspaceNav';
import WorkspaceTitle from '@/components/docs/WorkspaceTitle';
import SoliprioSegmentSelector from '@/components/home/SoliprioSegmentSelector';
import { findTrail, flattenNodes, type MapArea, type MapBrand, type NodeKind, type SiteNode } from './site-map-types';

const icons = { home: Home, directory: FolderOpen, detail: FileText, information: FileText, login: KeyRound, tab: Layers };
type Translate = ReturnType<typeof useTranslations>;

function KindBadge({ kind, t }: { kind: NodeKind; t: Translate }) {
  return <span className={`shrink-0 rounded-md px-2 py-0.5 text-size-body-s ${kind === 'detail' ? 'border border-dashed border-neutral-400 text-neutral-700' : 'bg-neutral-200 text-neutral-700'}`}>{t(`kinds.${kind}`)}</span>;
}

function Branch({ node, selectedId, expanded, onToggle, onSelect, t }: {
  node: SiteNode; selectedId: string; expanded: Set<string>;
  onToggle: (id: string) => void; onSelect: (node: SiteNode) => void; t: Translate;
}) {
  const Icon = icons[node.kind];
  const hasChildren = !!node.children?.length;
  const open = expanded.has(node.id);
  const selected = node.id === selectedId;
  return <li className="relative min-w-0">
    <div className={`group flex min-w-0 items-center gap-1 rounded-xl border p-1 transition-colors ${selected ? 'border-neutral-600 bg-neutral-200' : 'border-transparent hover:border-neutral-400 hover:bg-neutral-200/50'}`}>
      {hasChildren ? <button type="button" aria-expanded={open} aria-controls={`${node.id}-children`} aria-label={t(open ? 'collapseBranch' : 'expandBranch', { name: t(`pages.${node.label}.title`) })} onClick={() => onToggle(node.id)} className="flex size-8 shrink-0 items-center justify-center rounded-md outline-none hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-neutral-600 disabled:cursor-default">
        {open ? <ChevronDown aria-hidden className="size-4" /> : <ChevronRight aria-hidden className="size-4" />}
      </button> : <span className="flex size-8 shrink-0 items-center justify-center"><span className="size-1 rounded-full bg-neutral-400" /></span>}
      <button type="button" onClick={() => onSelect(node)} aria-pressed={selected} className="flex min-w-0 flex-1 items-start gap-2.5 rounded-lg py-2 pr-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-neutral-600">
        <Icon aria-hidden className={`mt-0.5 size-4 shrink-0 ${selected ? 'text-neutral-900' : 'text-neutral-700'}`} />
        <span className="min-w-0 flex-1"><span className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1"><span className={`text-size-body-m ${selected || node.kind === 'home' ? 'font-semibold' : 'font-medium'}`}>{t(`pages.${node.label}.title`)}</span><KindBadge kind={node.kind} t={t} /></span><span title={node.path} className="mt-1 block truncate font-mono text-size-body-s text-neutral-700">{node.path}</span></span>
      </button>
    </div>
    {hasChildren && <ul id={`${node.id}-children`} hidden={!open} className="ml-5 space-y-1 border-l border-neutral-400 pl-2 pt-1 sm:pl-3">
      {node.children!.map(child => <Branch key={child.id} node={child} selectedId={selectedId} expanded={expanded} onToggle={onToggle} onSelect={onSelect} t={t} />)}
    </ul>}
  </li>;
}

export default function SiteMap({ nodes }: { nodes: SiteNode[] }) {
  const t = useTranslations('siteMap');
  const locale = useLocale() as AppLocale;
  const allNodes = useMemo(() => flattenNodes(nodes), [nodes]);
  const [brand, setBrand] = useState<MapBrand>('prioritas');
  const [area, setArea] = useState<MapArea | 'all'>('all');
  const [selectedId, setSelectedId] = useState('prioritas-public-home');
  const [expanded, setExpanded] = useState(() => new Set(allNodes.filter(node => node.kind === 'home').map(node => node.id)));

  useEffect(() => {
    const readHash = () => {
      const id = window.location.hash.slice(1);
      const found = allNodes.find(node => node.id === id);
      if (!found) return;
      setSelectedId(found.id);
      setBrand(found.brand);
      setArea('all');
      setExpanded(previous => new Set([...previous, ...findTrail(nodes, found.id).map(node => node.id)]));
    };
    readHash();
    window.addEventListener('hashchange', readHash);
    return () => window.removeEventListener('hashchange', readHash);
  }, [allNodes, nodes]);

  const scope = allNodes.filter(node => node.brand === brand && (area === 'all' || node.area === area));
  const matches = new Set(scope.map(node => node.id));
  function filterTree(tree: SiteNode[]): SiteNode[] {
    return tree.filter(node => node.brand === brand && (area === 'all' || node.area === area)).flatMap(node => {
      const children = filterTree(node.children ?? []);
      return matches.has(node.id) || children.length ? [{ ...node, children }] : [];
    });
  }
  const visible = filterTree(nodes);
  const visibleNodes = flattenNodes(visible);
  const selected = visibleNodes.find(node => node.id === selectedId && matches.has(node.id)) ?? visibleNodes.find(node => matches.has(node.id)) ?? visibleNodes[0];
  const trail = selected ? findTrail(nodes, selected.id) : [];
  const toggle = (id: string) => setExpanded(previous => { const next = new Set(previous); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  const select = (node: SiteNode) => {
    setSelectedId(node.id);
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${node.id}`);
    if (window.matchMedia('(max-width: 1279px)').matches) requestAnimationFrame(() => {
      const panel = document.getElementById('map-detail');
      panel?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
      panel?.focus({ preventScroll: true });
    });
  };
  const reset = () => { setArea('all'); };

  return <main id="main-content" className="min-h-dvh bg-neutral-100 font-docs text-neutral-900">
    <header className="flex h-16 items-center justify-between gap-2 border-b border-neutral-400 px-5 lg:px-8">
      <WorkspaceTitle href="/site-map" />
      <WorkspaceNav active="map" />
    </header>
    <div className="mx-auto max-w-[1800px] px-5 py-8 md:px-8 lg:px-10 lg:py-10">
      <div><h1 className="text-display md:text-display-2xl">{t('heading')}</h1><p className="mt-3 max-w-2xl text-size-body-m leading-6 text-neutral-700">{t('subtitle')}</p></div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-y border-neutral-400 py-4">
        <SoliprioSegmentSelector value={brand} onChange={value => { setBrand(value); setSelectedId(`${value}-${area === 'member' ? 'member-overview' : 'public-home'}`); }} surface="default" label={t('brand')} />
        <div className="flex w-full flex-wrap items-center gap-3 md:w-auto">
          <CatalogOptions label={t('area')} value={area} onChange={setArea} hideLabel options={(['all', 'public', 'member'] as const).map(value => ({ value, label: t(`filters.${value}`) }))} />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p role="status" className="text-size-body-s text-neutral-700">{t('instruction')}</p>
        <div className="flex flex-wrap items-center gap-1">{(area !== 'all') && <Button type="button" size="sm" variant="ghost" onClick={reset}><X aria-hidden />{t('reset')}</Button>}<Button type="button" size="sm" variant="ghost" onClick={() => setExpanded(new Set(allNodes.filter(node => node.children?.length).map(node => node.id)))}><ChevronsUpDown aria-hidden className="size-4" />{t('expandAll')}</Button><Button type="button" size="sm" variant="ghost" onClick={() => setExpanded(new Set())}><ChevronsDownUp aria-hidden className="size-4" />{t('collapseAll')}</Button></div>
      </div>

      {visible.length ? <div className="mt-5 grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px] 2xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className={`grid items-start gap-5 ${area === 'all' ? 'lg:grid-cols-2' : ''}`}>
          {(['public', 'member'] as const).map(value => {
            const roots = visible.filter(node => node.area === value);
            const AreaIcon = value === 'member' ? LockKeyhole : Globe2;
            return roots.length ? <section key={value} aria-labelledby={`map-area-${value}`} className="min-w-0 overflow-hidden rounded-2xl border border-neutral-400">
              <div className={`border-b border-neutral-400 p-5 ${value === 'member' ? `${brand === 'prioritas' ? 'bg-pbrown-600' : 'bg-neutral-900'} text-neutral-100` : brand === 'prioritas' ? 'bg-pgold-100' : 'bg-neutral-200'}`}>
                <div className="flex items-center justify-between gap-3"><h2 id={`map-area-${value}`} className="flex items-center gap-2 text-size-body-l font-semibold"><AreaIcon aria-hidden className="size-4" />{t(`areas.${value}.title`)}</h2><span className="rounded-full border border-current/20 px-2.5 py-1 text-size-body-s">{t(value === 'member' ? 'loginRequired' : 'publicAccess')}</span></div>
                <p className={`mt-2 text-size-body-s leading-5 ${value === 'member' ? 'text-neutral-100/80' : 'text-neutral-700'}`}>{t(`areas.${value}.description`)}</p>
              </div>
              <ul className="space-y-2 p-3 sm:p-4">{roots.map(node => <Branch key={node.id} node={node} selectedId={selected?.id ?? ''} expanded={expanded} onToggle={toggle} onSelect={select} t={t} />)}</ul>
            </section> : null;
          })}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-1 text-size-body-s text-neutral-700 lg:col-span-full"><span className="flex items-center gap-2"><FileText aria-hidden className="size-3.5" />{t('legendDetail')}</span><span className="flex items-center gap-2"><Layers aria-hidden className="size-3.5" />{t('legendTab')}</span></div>
        </div>

        {selected && <aside id="map-detail" tabIndex={-1} aria-labelledby="map-detail-title" className="scroll-mt-6 rounded-2xl border border-neutral-400 bg-neutral-100 outline-none focus-visible:ring-2 focus-visible:ring-neutral-600 xl:sticky xl:top-6">
          <div className="border-b border-neutral-400 p-5"><div className="flex items-center gap-2"><KindBadge kind={selected.kind} t={t} />{selected.area === 'member' && <LockKeyhole aria-label={t('loginRequired')} className="size-3.5 text-neutral-700" />}</div><h2 id="map-detail-title" className="mt-3 text-size-display-s font-semibold">{t(`pages.${selected.label}.title`)}</h2><p className="mt-3 text-size-body-m leading-6 text-neutral-700">{t(`pages.${selected.label}.description`)}</p></div>
          <div className="space-y-5 p-5">
            <div><h3 className="text-size-body-s font-semibold text-neutral-700">{t('position')}</h3><ol className="mt-2 flex flex-wrap items-center gap-1.5 text-size-body-s"><li>{t(`brands.${brand}`)}</li><li className="flex items-center gap-1.5"><ChevronRight aria-hidden className="size-3" />{t(`areas.${selected.area}.title`)}</li>{trail.map(node => <li key={node.id} className="flex items-center gap-1.5"><ChevronRight aria-hidden className="size-3" /><button type="button" onClick={() => { setExpanded(previous => new Set([...previous, ...trail.map(item => item.id)])); select(node); }} className="rounded text-left underline-offset-4 hover:underline focus-visible:outline-neutral-600">{t(`pages.${node.label}.title`)}</button></li>)}</ol></div>
            <div><h3 className="text-size-body-s font-semibold text-neutral-700">{t(selected.kind === 'detail' ? 'routePattern' : 'url')}</h3><code className="mt-2 block break-all rounded-lg border border-neutral-400 bg-neutral-200 p-3 text-size-body-s leading-5">{getPathname({ locale, href: selected.path })}</code>{selected.kind === 'detail' && <p className="mt-2 text-size-body-s leading-5 text-neutral-700">{t('patternHelp')}</p>}</div>
            {selected.note && <div className="rounded-xl bg-neutral-200 p-3"><p className="flex items-center gap-2 text-size-body-s font-semibold"><ShieldCheck aria-hidden className="size-4" />{t('behavior')}</p><p className="mt-2 text-size-body-s leading-5 text-neutral-700">{t(`notes.${selected.note}${selected.note === 'voucher' ? brand === 'solitaire' ? 'Solitaire' : 'Prioritas' : ''}`)}</p></div>}
            {selected.area === 'member' && selected.kind !== 'login' && <p className="flex items-start gap-2 text-size-body-s leading-5 text-neutral-700"><LockKeyhole aria-hidden className="mt-0.5 size-3.5 shrink-0" />{t('memberHelp', { brand: t(`brands.${brand}`) })}</p>}
            <Button asChild className="w-full text-neutral-100"><Link href={selected.href} prefetch={false} target="_blank" rel="noopener noreferrer">{t(selected.kind === 'detail' ? 'openExample' : 'openPage')}<ArrowUpRight aria-hidden /></Link></Button>
            {selected.children?.length ? <div className="border-t border-neutral-400 pt-4"><h3 className="text-size-body-s font-semibold text-neutral-700">{t('children')}</h3><ul className="mt-2 space-y-1">{selected.children.map(child => <li key={child.id}><button type="button" onClick={() => { setExpanded(previous => new Set([...previous, ...trail.map(node => node.id)])); select(child); }} className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-left text-size-body-s outline-none hover:bg-neutral-200 focus-visible:ring-2 focus-visible:ring-neutral-600">{t(`pages.${child.label}.title`)}<ArrowRight aria-hidden className="size-3.5 shrink-0" /></button></li>)}</ul></div> : null}
          </div>
          <SourceMapping node={selected} t={t} />
        </aside>}
      </div> : <div className="mt-6 flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-400 p-6 text-center"><Search aria-hidden className="size-8 text-neutral-700" /><h2 className="mt-4 text-size-body-xl font-semibold">{t('emptyTitle')}</h2><p className="mt-2 text-size-body-m text-neutral-700">{t('emptyDescription')}</p><Button type="button" variant="outline" onClick={reset} className="mt-5">{t('reset')}</Button></div>}
      <p className="mt-8 border-t border-neutral-400 pt-5 text-size-body-s leading-5 text-neutral-700">{t('scopeNote')}</p>
    </div>
  </main>;
}
