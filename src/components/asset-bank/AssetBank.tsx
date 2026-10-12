'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/catalog/ui/button';
import CatalogSelect from '@/components/catalog/CatalogSelect';
import manifest from './asset-manifest.json';
import aliases from './asset-aliases.json';
import { assetGroups, assetSize, assetUrl, fileSize, type Asset } from './asset-types';
import AssetDetail from './AssetDetail';
import WorkspaceNav from '@/components/docs/WorkspaceNav';
import WorkspaceTitle from '@/components/docs/WorkspaceTitle';
import { WorkspaceMenuItem, WorkspaceSidebar, WorkspaceSidebarLayout } from '@/components/docs/WorkspaceSidebar';
import './asset-bank.css';

const assets: Asset[] = manifest;
const assetAliases: Record<string, string> = aliases;
const pageSize = 60;
export default function AssetBank() {
  const t = useTranslations('assetBank');
  const label = (asset: Asset) => asset.labelKey ? t(`names.${asset.labelKey}`) : asset.name;
  const [group, setGroup] = useState('all');
  const [sort, setSort] = useState('collection');
  const [limit, setLimit] = useState(pageSize);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  useEffect(() => {
    const readHash = () => {
      const requestedId = window.location.hash.replace('#asset=', '');
      const id = assetAliases[requestedId] ?? requestedId;
      if (id !== requestedId) window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#asset=${id}`);
      setSelectedId(assets.some(asset => asset.id === id) ? id : null);
    };
    readHash();
    window.addEventListener('hashchange', readHash);
    return () => window.removeEventListener('hashchange', readHash);
  }, []);
  const filtered = useMemo(() => assets.filter(asset => group === 'all' || asset.group === group).sort((a,b) => sort === 'name' ? (a.labelKey ? t(`names.${a.labelKey}`) : a.name).localeCompare(b.labelKey ? t(`names.${b.labelKey}`) : b.name) : sort === 'size' ? b.bytes - a.bytes : 0), [group, sort, t]);
  const selected = assets.find(asset => asset.id === selectedId);
  const navigation = selected && !filtered.some(asset => asset.id === selected.id) ? assets : filtered;
  const position = navigation.findIndex(asset => asset.id === selectedId);
  const select = (asset: Asset | null) => { setSelectedId(asset?.id ?? null); window.history.replaceState(null,'',`${window.location.pathname}${window.location.search}${asset ? `#asset=${asset.id}` : ''}`); };
  return <main id="main-content" className="min-h-dvh bg-neutral-100 font-docs text-neutral-900">
    <header className="flex h-16 items-center justify-between gap-2 border-b border-neutral-400 px-5 lg:px-8">
      <WorkspaceTitle href="/asset-bank" />
      <WorkspaceNav active="assets" />
    </header>
    <WorkspaceSidebarLayout>
      <WorkspaceSidebar>
        <nav aria-label={t('collections')} className="flex gap-1 overflow-x-auto pb-1 lg:block lg:space-y-1">
          {['all', ...assetGroups].map(value => <WorkspaceMenuItem key={value} active={group === value} onClick={() => { setGroup(value); setLimit(pageSize); }}><span className="whitespace-nowrap">{t(`groups.${value}`)}</span><span className="text-size-body-s text-neutral-700">{value === 'all' ? assets.length : assets.filter(asset => asset.group === value).length}</span></WorkspaceMenuItem>)}
        </nav>
      </WorkspaceSidebar>
      <section aria-labelledby="asset-bank-heading" className="min-w-0 px-5 py-8 md:px-8 lg:px-10">
        <div className="mx-auto max-w-[1600px]">
          <h1 id="asset-bank-heading" className="text-display-l md:text-display-2xl">{t(`groups.${group}`)}</h1>
          <div className="mt-7 flex items-center justify-between gap-3 border-b border-neutral-400 pb-4">
            <p role="status" className="text-size-body-m text-neutral-700">{t('resultCount',{count:filtered.length})}</p>
            <CatalogSelect className="w-auto" label={t('sort')} value={sort} onChange={setSort} options={['collection','name','size'].map(value=>({value,label:t(`sorting.${value}`)}))} />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {filtered.slice(0,limit).map(asset => <button key={asset.id} type="button" onClick={() => select(asset)} aria-label={t('inspect',{name:label(asset)})} className="group min-w-0 overflow-hidden rounded-xl border border-neutral-400 text-left outline-none transition-colors hover:border-neutral-600 focus-visible:ring-2 focus-visible:ring-neutral-600">
              <div className={`asset-surface asset-surface-${asset.previewTone ?? 'checker'} relative flex aspect-[4/3] items-center justify-center overflow-hidden p-6`}><img src={assetUrl(asset, true)} alt="" loading="lazy" decoding="async" width={asset.width ?? undefined} height={asset.height ?? undefined} className={`max-h-full max-w-full object-contain transition-transform motion-safe:group-hover:scale-105 ${asset.group === 'icons' ? 'h-14 w-14' : ''}`} /><span className="absolute right-2 top-2 rounded border border-neutral-400 bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-700">{asset.format}</span></div>
              <div className="min-w-0 border-t border-neutral-400 px-3 py-3"><p title={label(asset)} className="min-h-10 break-words whitespace-normal text-size-body-m font-medium">{label(asset)}</p><p className="mt-1 truncate text-size-body-s text-neutral-700">{asset.path.split("/").slice(-3,-1).join(" / ")}</p><p className="mt-1 truncate text-size-body-s text-neutral-700">{assetSize(asset)} · {fileSize(asset.bytes)}</p></div>
            </button>)}
          </div>
          {filtered.length > limit && <div className="mt-8 flex flex-col items-center gap-3"><p className="text-size-body-s text-neutral-700">{t('showing',{shown:Math.min(limit,filtered.length),total:filtered.length})}</p><Button variant="outline" onClick={()=>setLimit(value=>value+pageSize)}>{t('loadMore')}</Button></div>}
        </div>
      </section>
    </WorkspaceSidebarLayout>
    {selected && <AssetDetail asset={selected} position={position} total={navigation.length} onClose={()=>select(null)} onMove={direction=>{const next=navigation[position+direction];if(next) select(next);}} />}
  </main>;
}
