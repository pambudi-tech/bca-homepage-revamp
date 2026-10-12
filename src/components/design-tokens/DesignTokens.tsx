'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Check, ChevronDown, Copy, Monitor, Smartphone, Tablet } from 'lucide-react';
import WorkspaceNav from '@/components/docs/WorkspaceNav';
import WorkspaceTitle from '@/components/docs/WorkspaceTitle';
import { WorkspaceMenuItem, WorkspaceSidebar, WorkspaceSidebarLayout } from '@/components/docs/WorkspaceSidebar';
import { Button } from '@/components/catalog/ui/button';
import { Input } from '@/components/catalog/ui/input';
import CatalogOptions from '@/components/catalog/CatalogOptions';
import { colorCategories, visibleTokenSections, type DesignToken, type TokenData, type TokenSection } from './token-types';
import styles from './typography.module.css';
import SignatureDirectoryCard from '@/components/prioritas/SignatureDirectoryCard';
import BreakpointPreview from './BreakpointPreview';
import { breakpointExamples, type BreakpointExample } from './breakpoint-examples';
import { privilegeDetailBase } from '@/lib/privilege-paths';

type Translate = ReturnType<typeof useTranslations>;
const sourcePaths = { project: 'src/app/globals.css', tailwind: 'node_modules/tailwindcss/theme.css', recipe: 'src/app/globals.css', figma: 'bca-variable-color.json / Figma typography' };

function CopyValue({ value, t }: { value: string; t: Translate }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  async function copy() {
    try { await navigator.clipboard.writeText(value); setStatus('copied'); }
    catch { setStatus('failed'); }
  }
  // A one-shot feedback reset, with cleanup when filters unmount the button.
  useEffect(() => {
    if (status === 'idle') return;
    const timer = window.setTimeout(() => setStatus('idle'), 2000);
    return () => window.clearTimeout(timer);
  }, [status]);
  return <span className="inline-flex items-center gap-1">
    <Button type="button" variant="ghost" size="icon" onClick={copy} aria-label={t('copy', { value })} title={t('copy', { value })} className="size-8 shrink-0">
      {status === 'copied' ? <Check aria-hidden /> : <Copy aria-hidden />}
    </Button>
    <span role="status" className={status === 'failed' ? 'text-size-body-s text-red-500' : 'sr-only'}>{status === 'copied' ? t('copied') : status === 'failed' ? t('copyFailed') : ''}</span>
  </span>;
}

function TokenInfo({ item, t, extra }: { item: DesignToken; t: Translate; extra?: ReactNode }) {
  return <div className="min-w-0 p-4">
    <div className="flex items-start justify-between gap-2"><code className="min-w-0 break-all text-size-body-s font-semibold leading-5">{item.name}</code><CopyValue value={item.name} t={t} /></div>
    <div className="mt-2 flex items-start justify-between gap-2"><code className="min-w-0 break-all text-size-body-s leading-5 text-neutral-700">{item.value}</code><CopyValue value={item.value} t={t} /></div>
    {item.resolved !== item.value && item.group !== 'glass' && <code className="mt-1 block break-all text-size-body-s text-neutral-700">{item.resolved}</code>}
    {item.implementationName && <div className="mt-3 flex items-start justify-between gap-2"><div className="min-w-0"><p className="text-size-body-s text-neutral-700">{t('implementation.token')}</p><code className="mt-1 block break-all text-size-body-s">{item.implementationName}</code></div><CopyValue value={item.implementationName} t={t} /></div>}
    {item.aliasOf && <p className="mt-3 break-all text-size-body-s leading-5 text-neutral-700">{t('implementation.aliasOf')} <code>{item.aliasOf}</code></p>}
    {!item.typographyUsages && !!item.aliases?.length && <div className="mt-3"><p className="text-size-body-s text-neutral-700">{t('implementation.aliases')}</p>{item.aliases.map(alias => <div key={alias} className="mt-1 flex items-start justify-between gap-2"><code className="min-w-0 break-all text-size-body-s">{alias}</code><CopyValue value={alias} t={t} /></div>)}</div>}
    {extra}
    {item.implementationStatus && item.implementationStatus !== 'match' && <div className={`mt-3 rounded-lg border p-3 ${item.implementationStatus === 'different' ? 'border-red-500 bg-neutral-200' : 'border-neutral-400 bg-neutral-200/40'}`}><p className={`text-size-body-s font-medium ${item.implementationStatus === 'different' ? 'text-red-500' : ''}`}>{t(`implementation.${item.implementationStatus}`)}</p>{item.comparisonName && <p className="mt-2 text-size-body-s leading-5 text-neutral-700">{t('implementation.comparedWith')} <code>{item.comparisonName}</code></p>}{!!item.differences?.length && <DifferenceTable item={item} t={t} />}</div>}
    {item.colorUsages || item.typographyUsages ? <UsageCollection item={item} t={t} /> : <div className="mt-3 flex flex-wrap items-center justify-between gap-2">{item.utility ? <code className="break-all rounded bg-neutral-200 px-2 py-1 text-size-body-s">{item.utility}</code> : <span className="text-size-body-s text-neutral-700">{t('referenceOnly')}</span>}{item.source !== 'figma' && <span title={item.sourcePath ?? sourcePaths[item.source]} className="text-size-body-s text-neutral-700">{t(`sources.${item.source}`)}</span>}</div>}
  </div>;
}

function UsageCollection({ item, t }: { item: DesignToken; t: Translate }) {
  const usages = item.colorUsages ?? item.typographyUsages ?? [];
  const copy = item.colorUsages ? 'colorCollection' : 'typeCollection';
  // Native disclosure state can change before hydration or be restored by the
  // browser on reload. Keep that DOM-owned open attribute instead of resetting it.
  // Temporarily hide usage collections in both color and typography cards.
  // Keep their data and disclosure content ready to show again.
  return <details hidden suppressHydrationWarning className="group mt-3 rounded-lg border border-neutral-400">
    <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-lg p-3 text-size-body-s font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 [&::-webkit-details-marker]:hidden" aria-label={t(`${copy}.label`, { color: item.name, style: item.name, count: usages.length })}>
      <span>{t(`${copy}.title`)} <span className="ml-1 font-normal text-neutral-700">{usages.length}</span></span>
      <ChevronDown aria-hidden className="size-4 shrink-0 group-open:rotate-180" />
    </summary>
    <div className="max-h-80 overflow-y-auto border-t border-neutral-400 p-3" data-lenis-prevent>
      <p className="text-size-body-s leading-5 text-neutral-700">{t(`${copy}.${usages.length ? 'description' : 'empty'}`)}</p>
      {usages.map(usage => <div key={usage.name} className="mt-3 border-t border-neutral-400 pt-3">
        <div className="flex items-start justify-between gap-2"><code className="min-w-0 break-all text-size-body-s font-semibold">{usage.name}</code><CopyValue value={usage.name} t={t} /></div>
        <ul className="mt-2 space-y-3">{usage.rules.map((rule, index) => <li key={`${rule.sourcePath}-${index}`} className="min-w-0 text-size-body-s leading-5">
          <code className="block break-all">{rule.value}</code>
          <code className="mt-1 block break-all text-neutral-700">{rule.scope}</code>
          <span className="mt-1 block break-all text-neutral-700">{rule.sourcePath}</span>
        </li>)}</ul>
      </div>)}
    </div>
  </details>;
}

function DifferenceTable({ item, t }: { item: DesignToken; t: Translate }) {
  const format = (field: string, value: string) => field === 'trim' ? t(value === 'true' ? 'type.trimBoth' : 'type.noTrim') : value;
  return <div className="mt-3 overflow-x-auto" data-lenis-prevent><table className="w-full text-left text-size-body-s"><thead><tr className="text-neutral-700"><th className="pb-2 pr-3 font-normal">{t('implementation.property')}</th><th className="pb-2 pr-3 font-normal">{t('implementation.reference')}</th><th className="pb-2 font-normal">{t('implementation.current')}</th></tr></thead><tbody>{item.differences?.map(diff => <tr key={diff.field} className="border-t border-neutral-400"><th className="py-2 pr-3 font-normal">{t(diff.field === 'value' ? 'implementation.value' : `type.${diff.field}`)}</th>{[diff.reference, diff.current].map((value, index) => <td key={index} className="py-2 pr-3 font-mono">{diff.field === 'value' && <span aria-hidden className="mr-1 inline-block size-3 rounded-sm border border-neutral-400 align-middle" style={{ background: value }} />}{format(diff.field, value)}</td>)}</tr>)}</tbody></table></div>;
}

function TypeSpecimen({ item, sample, t }: { item: DesignToken; sample: string; t: Translate }) {
  const size = item.pixels ?? 16;
  const ratio = item.lineHeight?.match(/^calc\(([\d.]+)\s*\/\s*([\d.]+)\)$/);
  const leading = ratio ? Number(ratio[1]) / Number(ratio[2]) : Number(item.lineHeight);
  return <article className="min-w-0 overflow-hidden rounded-xl border border-neutral-400">
    <div className="flex min-h-36 items-center overflow-x-auto border-b border-neutral-400 bg-neutral-200/40 p-6" data-lenis-prevent><div className="border border-dashed border-neutral-600"><p className={`font-sans ${item.utility} ${item.trim ? styles.verticalTrim : ''}`} style={{ fontSize: `${size}px`, lineHeight: item.lineHeight, letterSpacing: item.tracking, fontWeight: item.weight, textTransform: item.group === 'eyebrow' || item.name.includes('eyebrow') ? 'uppercase' : undefined }}>{sample}</p></div></div>
    <TokenInfo item={item} t={t} extra={<><dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-size-body-s">{[
      ['fontSize', `${size}px`], ['lineHeight', `${Number((size * leading).toFixed(2))}px`], ['tracking', item.tracking === 'inherit' ? t('type.inherited') : item.tracking], ['weight', item.weight === 'inherit' ? t('type.inherited') : item.weight], ['trim', t(item.trim ? 'type.trimBoth' : 'type.noTrim')],
    ].map(([key, value]) => <div key={key}><dt className="text-neutral-700">{t(`type.${key}`)}</dt><dd className="mt-1 font-mono">{value}</dd></div>)}</dl>{item.trim && <code className="mt-4 block text-size-body-s leading-5 text-neutral-700">text-box-trim: trim-both;<br />text-box-edge: cap alphabetic;</code>}</>} />
  </article>;
}

function TypeGallery({ items, sample, t }: { items: DesignToken[]; sample: string; t: Translate }) {
  const groups = [...new Set(items.map(item => item.group))];
  return <div className="mt-5 space-y-8">{groups.map(group => <section key={group} aria-labelledby={`type-group-${group}`}><h3 id={`type-group-${group}`} className="mb-2 flex items-center gap-3 text-title">{t(`typeGroups.${group}`)}<span className="text-size-body-s font-normal text-neutral-700">{items.filter(item => item.group === group).length}</span></h3><p className="mb-4 max-w-3xl text-size-body-m leading-6 text-neutral-700">{t(`typeUsage.${group}`)}</p><div className="grid items-start gap-4 md:grid-cols-2 2xl:grid-cols-3">{items.filter(item => item.group === group).map(item => <TypeSpecimen key={item.name} item={item} sample={sample} t={t} />)}</div></section>)}</div>;
}

function ColorGallery({ items, t }: { items: DesignToken[]; t: Translate }) {
  return <div className="mt-5 space-y-12">{Object.entries(colorCategories).map(([category, families]) => {
    const categoryItems = items.filter(item => families.some(family => family === item.group));
    if (!categoryItems.length) return null;
    return <section key={category} aria-labelledby={`color-category-${category}`}>
      <h2 id={`color-category-${category}`} className="text-heading-m">{t(`colorCategories.${category}.title`)}</h2>
      <p className="mt-2 mb-6 max-w-3xl text-size-body-m leading-6 text-neutral-700">{t(`colorCategories.${category}.description`)}</p>
      <div className="space-y-8">{families.map(group => {
    const colors = items.filter(item => item.group === group);
    if (!colors.length) return null;
    return <section key={group} aria-labelledby={`color-group-${group}`}>
      <h3 id={`color-group-${group}`} className="mb-2 flex items-center gap-3 text-title">{t(`groups.${group}`)}<span className="text-size-body-s font-normal text-neutral-700">{colors.length}</span></h3>
      <p className="mb-4 max-w-3xl text-size-body-m leading-6 text-neutral-700">{t(`colorUsage.${group}`)}</p>
      <div className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{colors.map(item => <article key={item.name} className="min-w-0 overflow-hidden rounded-xl border border-neutral-400">
        <div className="h-28 border-b border-neutral-400" style={{ backgroundColor: item.resolved }} aria-label={item.resolved} />
        <TokenInfo item={item} t={t} />
      </article>)}</div>
    </section>;
      })}</div>
    </section>;
  })}</div>;
}

function EffectSpecimen({ item, example, t }: { item: DesignToken; example: TokenData['glassExample']; t: Translate }) {
  const tone = item.utility === 'glass-panel-solitaire' ? 'solitaire' : 'prioritas';
  return <article className="min-w-0 overflow-hidden rounded-xl border border-neutral-400">
    <div className="border-b border-neutral-400 bg-neutral-200/40 p-4">
      <SignatureDirectoryCard image={example.image} title={example.title} tone={tone} href={`${privilegeDetailBase(`/${tone}`, 'signature')}/${example.id}`} previewViewport="desktop" />
    </div>
    <TokenInfo item={item} t={t} />
  </article>;
}

function Breakpoints({ data, items, t }: { data: TokenData; items: DesignToken[]; t: Translate }) {
  const [width, setWidth] = useState(390);
  const [example, setExample] = useState<BreakpointExample>('homepage');
  const mode = width >= data.desktopMin ? 'desktop' : width >= data.tabletMin ? 'tablet' : 'mobile';
  const Icon = mode === 'desktop' ? Monitor : mode === 'tablet' ? Tablet : Smartphone;
  return <div className="space-y-6">
    <div className="rounded-2xl border border-neutral-400 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="flex items-center gap-2 font-semibold"><Icon aria-hidden className="size-5" />{t('breakpoint.preview')}</h3><output htmlFor="token-viewport" className="font-mono text-size-body-m">{width}px · {t(`breakpoint.${mode}`)}</output></div>
      <div className="mt-5"><CatalogOptions label={t('breakpoint.page')} value={example} onChange={setExample} options={breakpointExamples.map(value => ({ value, label: t(`breakpoint.pages.${value}`) }))} /></div>
      <label htmlFor="token-viewport" className="mt-5 block text-size-body-s text-neutral-700">{t('breakpoint.width')}</label><input id="token-viewport" type="range" min="320" max="1920" step="1" value={width} onChange={event => setWidth(Number(event.target.value))} className="mt-3 w-full accent-neutral-900" />
      <div className="mt-3"><CatalogOptions label={t('breakpoint.width')} hideLabel value={String(width)} onChange={value => setWidth(Number(value))} options={[390, data.tabletMin - 1, data.tabletMin, 1024, data.desktopMin - 1, data.desktopMin, 1536].map(value => ({ value: String(value), label: `${value}px` }))} /></div>
      <BreakpointPreview key={example} width={width} example={example} />
      <div className="mt-6 grid gap-3 sm:grid-cols-3">{(['mobile', 'tablet', 'desktop'] as const).map((value, index) => <div key={value} className={`rounded-xl border p-4 ${mode === value ? 'border-neutral-900 bg-neutral-200' : 'border-neutral-400'}`}><p className="text-size-body-m font-semibold">{t(`breakpoint.${value}`)}</p><p className="mt-2 font-mono text-size-body-s">{index === 0 ? `< ${data.tabletMin}px` : index === 1 ? `${data.tabletMin}–${data.desktopMin - 1}px` : `≥ ${data.desktopMin}px`}</p><p className="mt-2 text-size-body-s leading-5 text-neutral-700">{t(`breakpoint.${value}Rule`)}</p></div>)}</div>
      <p className="mt-5 text-size-body-s leading-5 text-neutral-700">{t('breakpoint.rule')}</p><code className="mt-2 block break-all text-size-body-s text-neutral-700">src/lib/useIsDesktop.ts · src/components/home/HeroSection.tsx</code>
    </div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{items.map(item => <article key={item.name} className="rounded-xl border border-neutral-400"><TokenInfo item={item} t={t} extra={<p className="mt-3 text-size-body-m font-semibold">{t('breakpoint.minimum', { value: item.pixels ?? 0 })}</p>} /></article>)}</div>
  </div>;
}

function MotionSpecimen({ item }: { item: DesignToken }) {
  const points = item.value.match(/cubic-bezier\(([^)]+)\)/)?.[1].split(',').map(Number);
  return <div className="flex h-36 items-center justify-center border-b border-neutral-400 bg-neutral-200/40 p-4"><svg aria-hidden viewBox="-5 -5 110 110" className="h-full overflow-visible"><path d="M0 0V100H100" fill="none" stroke="var(--color-neutral-400)" />{points && <><path d={`M0 100L${points[0] * 100} ${100 - points[1] * 100}M100 0L${points[2] * 100} ${100 - points[3] * 100}`} fill="none" stroke="var(--color-neutral-600)" strokeDasharray="3 3" /><path d={`M0 100C${points[0] * 100} ${100 - points[1] * 100} ${points[2] * 100} ${100 - points[3] * 100} 100 0`} fill="none" stroke="var(--color-blue-500)" strokeWidth="3" /></>}</svg></div>;
}

export default function DesignTokens({ data }: { data: TokenData }) {
  const t = useTranslations('designTokens');
  const [section, setSection] = useState<TokenSection>('colors');
  const [group, setGroup] = useState('all');
  const [sample, setSample] = useState<string | null>(null);
  const [typeGroup, setTypeGroup] = useState('all');
  useEffect(() => {
    const sync = () => {
      const hash = window.location.hash.slice(1);
      if (visibleTokenSections.some(value => value === hash)) { setSection(hash as TokenSection); }
    };
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);
  function select(value: TokenSection) {
    setSection(value);
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${value}`);
  }
  const sectionItems = data.sections[section];
  const colorGroups = ['all', ...Object.keys(colorCategories)];
  const selectedFamilies = colorCategories[group as keyof typeof colorCategories];
  const items = sectionItems.filter(item => (section !== 'colors' || group === 'all' || selectedFamilies?.some(family => family === item.group)) && (section !== 'typography' || typeGroup === 'all' || item.group === typeGroup));
  const countFor = (key: TokenSection) => data.sections[key].length;
  const text = sample ?? t('sample');
  return <main id="main-content" className="min-h-dvh bg-neutral-100 font-docs text-neutral-900">
    <header className="flex min-h-16 items-center justify-between gap-2 border-b border-neutral-400 px-5 py-2 lg:px-8"><WorkspaceTitle href="/design-tokens" /><WorkspaceNav active="tokens" /></header>
    <WorkspaceSidebarLayout>
      <WorkspaceSidebar><nav aria-label={t('categories')} className="flex gap-1 overflow-x-auto pb-1 lg:block lg:space-y-1">{visibleTokenSections.map(value => <WorkspaceMenuItem key={value} active={section === value} onClick={() => select(value)}><span className="whitespace-nowrap">{t(`sections.${value}.title`)}</span><span className="text-size-body-s text-neutral-700">{countFor(value)}</span></WorkspaceMenuItem>)}</nav></WorkspaceSidebar>
      <div className="min-w-0 px-5 py-8 md:px-8 lg:px-10"><div className="mx-auto max-w-screen-2xl">
        <div><h1 id="tokens-section-title" className="text-display md:text-display-2xl">{t(`sections.${section}.title`)}</h1><p className="mt-3 max-w-2xl text-size-body-m leading-6 text-neutral-700">{t(`sections.${section}.description`)}</p></div>
        <section aria-labelledby="tokens-section-title" className="mt-5">
          {section === 'typography' && <div className="mt-5"><CatalogOptions label={t('type.categories')} hideLabel value={typeGroup} onChange={setTypeGroup} options={['all', 'display', 'eyebrow', 'heading', 'body', 'label'].map(value => ({ value, label: t(`typeGroups.${value}`) }))} /></div>}
          {section === 'colors' && <div className="mt-5"><CatalogOptions label={t('palettes')} hideLabel value={group} onChange={setGroup} options={colorGroups.map(value => ({ value, label: t(value === 'all' ? 'groups.all' : `colorCategories.${value}.title`) }))} /></div>}
          {section === 'typography' && <div className="mt-5 rounded-xl border border-neutral-400 p-5"><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-title">{t('type.family')}</p><p className="text-size-body-s text-neutral-700">{t('type.weights')}</p></div><label htmlFor="type-sample" className="mt-4 block text-size-body-s text-neutral-700">{t('type.editSample')}</label><Input id="type-sample" value={text} onChange={event => setSample(event.target.value)} className="mt-2" /></div>}
          {section === 'spacing' && <div className="mt-5 rounded-xl bg-neutral-200 p-4 text-size-body-m"><code>--spacing: {data.spacingUnit}</code><p className="mt-2 text-size-body-s leading-5 text-neutral-700">{t('spacingRule')}</p></div>}
          {!items.length ? <p className="rounded-xl border border-dashed border-neutral-400 p-10 text-center text-size-body-m text-neutral-700">{t('empty')}</p> : section === 'breakpoints' ? <Breakpoints data={data} items={items} t={t} /> : section === 'typography' ? <TypeGallery items={items} sample={text} t={t} /> : section === 'colors' ? <ColorGallery items={items} t={t} /> : <div className={`mt-5 grid gap-4 ${section === 'effects' ? 'md:grid-cols-2 2xl:grid-cols-3' : 'sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'}`}>
            {items.map(item => section === 'effects' ? <EffectSpecimen key={item.name} item={item} example={data.glassExample} t={t} /> : <article key={item.name} className="min-w-0 overflow-hidden rounded-xl border border-neutral-400">
              {section === 'spacing' ? <div className="flex h-28 flex-col justify-center gap-3 overflow-x-auto border-b border-neutral-400 bg-neutral-200/40 px-5" data-lenis-prevent><span className="text-size-body-s font-semibold">{item.pixels}px</span><div className="flex h-8 items-stretch"><span className="w-3 shrink-0 rounded bg-neutral-400" /><span className="shrink-0 bg-blue-200" style={{ width: item.pixels }} /><span className="w-3 shrink-0 rounded bg-neutral-400" /></div></div> : section === 'radius' ? <div className="flex h-36 items-center justify-center border-b border-neutral-400 bg-neutral-200/40 p-5"><div className="flex h-20 w-32 items-center justify-center border-2 border-blue-500 bg-blue-100 text-size-body-s font-semibold text-blue-500" style={{ borderRadius: item.value }}>{item.pixels !== undefined ? `${item.pixels}px` : t('pill')}</div></div> : <MotionSpecimen item={item} />}
              <TokenInfo item={item} t={t} />
            </article>)}
          </div>}
        </section>
      </div></div>
    </WorkspaceSidebarLayout>
  </main>;
}
