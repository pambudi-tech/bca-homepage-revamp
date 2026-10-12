'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, ArrowRight, Download, ExternalLink, X } from 'lucide-react';
import { Button } from '@/components/catalog/ui/button';
import CatalogOptions from '@/components/catalog/CatalogOptions';
import { useScrollLock } from '@/components/SmoothScroll';
import { assetSize, assetUrl, fileSize, type Asset } from './asset-types';
import AssetPreview from './AssetPreview';

export default function AssetDetail({ asset, position, total, onClose, onMove }: { asset: Asset; position: number; total: number; onClose: () => void; onMove: (direction: number) => void }) {
  const t = useTranslations('assetBank');
  const dialog = useRef<HTMLDialogElement>(null);
  const [surface, setSurface] = useState<string | null>(null);
  const previewSurface = surface ?? asset.previewTone ?? 'checker';
  const name = asset.labelKey ? t(`names.${asset.labelKey}`) : asset.name;
  useScrollLock(true);
  useEffect(() => {
    dialog.current?.showModal();
  }, []);
  return <dialog ref={dialog} aria-labelledby="asset-detail-title" onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }} onKeyDown={event => {
    if ((event.target as HTMLElement).closest('input,select,textarea')) return;
    if (event.key === 'ArrowLeft' && position > 0) { event.preventDefault(); onMove(-1); }
    if (event.key === 'ArrowRight' && position < total - 1) { event.preventDefault(); onMove(1); }
  }} className="asset-dialog fixed inset-0 m-auto max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] max-w-6xl overflow-y-auto rounded-2xl border border-neutral-400 bg-neutral-100 p-0 font-docs text-neutral-900" data-lenis-prevent>
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-400 bg-neutral-100 px-5 py-3">
      <span className="text-size-body-m text-neutral-700">{t('preview')} · {position + 1} / {total}</span>
      <div className="flex gap-1"><Button variant="ghost" size="icon" aria-label={t('previous')} disabled={position <= 0} onClick={() => onMove(-1)}><ArrowLeft /></Button><Button variant="ghost" size="icon" aria-label={t('next')} disabled={position >= total - 1} onClick={() => onMove(1)}><ArrowRight /></Button><Button variant="ghost" size="icon" autoFocus aria-label={t('close')} onClick={onClose}><X /></Button></div>
    </header>
    <div className="grid lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0 p-5 md:p-8">
        <AssetPreview key={asset.id} src={assetUrl(asset)} name={name} surface={previewSurface} />
        <div className="mt-4"><CatalogOptions label={t('background')} value={previewSurface} onChange={setSurface} options={['checker', 'light', 'dark'].map(value => ({ value, label: t(`surfaces.${value}`) }))} /></div>
      </div>
      <section className="min-w-0 border-t border-neutral-400 p-6 lg:border-l lg:border-t-0">
        <p className="text-size-body-m text-neutral-700">{t(`groups.${asset.group}`)}</p>
        <h2 id="asset-detail-title" className="mt-2 break-words text-size-display-m font-semibold">{name}</h2>
        <dl className="mt-6 grid grid-cols-2 gap-y-4 text-size-body-m">{[[t('format'), asset.format], [t('dimensions'), assetSize(asset)], [t('fileSize'), fileSize(asset.bytes)], [t('brand'), t(`brands.${asset.brand}`)]].map(([label,value]) => <div key={label}><dt className="text-neutral-700">{label}</dt><dd className="mt-1 font-medium">{value}</dd></div>)}</dl>
        <div className="mt-5 grid gap-2"><Button asChild className="text-neutral-100"><a href={assetUrl(asset)} download><Download />{t('download')}</a></Button><Button asChild variant="ghost"><a href={assetUrl(asset)} target="_blank" rel="noreferrer"><ExternalLink />{t('openOriginal')}</a></Button></div>
        {asset.inline && <p className="mt-4 rounded-lg bg-neutral-200 p-3 text-size-body-m leading-6 text-neutral-700">{t('inlineNote')}</p>}
      </section>
    </div>
  </dialog>;
}
