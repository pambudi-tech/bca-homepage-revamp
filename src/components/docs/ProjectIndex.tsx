'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowRight, Check, Copy, FolderOpen, KeyRound, Layers, Network, Palette } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import BrandPageSurface from '@/components/prioritas/BrandPageSurface';
import { PrioritasButton, prioritasButtonClassName, solitaireButtonClassName } from '@/components/prioritas/PrioritasButton';
import TextField from '@/components/ui/TextField';
import { memberDemoCredentials } from '@/lib/member-demo-credentials';
import WorkspaceNav from './WorkspaceNav';
import WorkspaceTitle from './WorkspaceTitle';

const brands = ['prioritas', 'solitaire'] as const;
const documents = [
  { id: 'catalog', href: '/component-catalog', Icon: Layers },
  { id: 'assets', href: '/asset-bank', Icon: FolderOpen },
  { id: 'tokens', href: '/design-tokens', Icon: Palette },
  { id: 'map', href: '/site-map', Icon: Network },
] as const;

function CopyValue({ label, value, tone }: { label: string; value: string; tone: typeof brands[number] }) {
  const t = useTranslations('projectIndex');
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setStatus('copied');
    } catch {
      setStatus('error');
    }
  }
  return <div className="min-w-0">
    <TextField label={label} value={value} readOnly tone={tone} fieldSize="medium" labelClassName="text-label-s-semibold" className="font-mono" trailingAdornment={
      <PrioritasButton tone={tone} kind="icon" variant="secondary" size="small" onClick={copy} aria-label={t('copyField', { label })}>
        {status === 'copied' ? <Check aria-hidden className="size-4 text-green-700" /> : <Copy aria-hidden className="size-4" />}
      </PrioritasButton>
    } />
    <div role="status" className="mt-1 min-h-4 text-body-s-regular text-neutral-700">{status === 'copied' ? t('copied') : status === 'error' ? t('copyFailed') : ''}</div>
  </div>;
}

export default function ProjectIndex() {
  const t = useTranslations('projectIndex');
  const sectionTitle = 'text-heading-s text-neutral-900';
  return <main id="main-content" className="min-h-dvh bg-neutral-100 font-docs text-neutral-900">
    <header className="flex h-16 items-center justify-between gap-2 border-b border-neutral-400 px-5 lg:px-8">
      <WorkspaceTitle href="/project-index" /><WorkspaceNav active="index" />
    </header>
    <div className="mx-auto max-w-[1800px] px-5 py-8 md:px-8 lg:px-10 lg:py-10">
      <h1 className="mb-8 text-display md:text-display-2xl">{t('title')}</h1>
      <section id="documentation" aria-labelledby="documentation-title">
        <h2 id="documentation-title" className={sectionTitle}>{t('documentation.title')}</h2>
        <p className="mt-2 text-body-m-regular text-neutral-700">{t('documentation.description')}</p>
        <div className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(min(100%,16rem),1fr))] gap-4">
          {documents.map(({ id, href, Icon }) => <Link key={id} href={href} prefetch={false} className="group flex min-w-0 flex-col rounded-2xl border border-neutral-400 p-5 transition-colors hover:bg-neutral-200 focus-visible:outline-2 focus-visible:outline-blue-500">
            <div className="mb-6 flex items-center justify-between gap-4">
              <Icon aria-hidden className="size-6 shrink-0 text-neutral-700" />
              <ArrowRight aria-hidden className="size-4 shrink-0 text-neutral-700 group-hover:text-neutral-900" />
            </div>
            <h3 className="text-body-l-semibold">{t(`documentation.${id}.title`)}</h3>
            <p className="mt-2 text-body-m-regular text-neutral-700">{t(`documentation.${id}.description`)}</p>
          </Link>)}
        </div>
      </section>

      <section id="prototype" aria-labelledby="prototype-title" className="mt-12">
        <h2 id="prototype-title" className={sectionTitle}>{t('prototype.title')}</h2>
        <p className="mt-2 text-body-m-regular text-neutral-700">{t('prototype.description')}</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {brands.map(brand => <article key={brand} className={`min-w-0 overflow-hidden rounded-2xl border font-sans shadow-card ${brand === 'prioritas' ? 'border-pgold-300' : 'border-neutral-400'}`}>
            <header className={`relative isolate flex min-h-56 flex-col justify-end overflow-clip px-6 pt-6 pb-20 md:px-8 md:pt-8 md:pb-22 ${brand === 'prioritas' ? 'bg-pbrown-600 text-pgold-100' : 'bg-neutral-900 text-neutral-100'}`}>
              <img src="/assets/prioritas/card/prio-glow.webp" alt="" aria-hidden="true" className={`pointer-events-none absolute -right-24 -top-64 -z-10 h-[720px] w-auto max-w-none opacity-80 ${brand === 'solitaire' ? 'grayscale mix-blend-screen' : ''}`} />
              <div aria-hidden="true" className={`pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t ${brand === 'prioritas' ? 'from-pbrown-600' : 'from-neutral-900'} to-transparent`} />
              <h3 className="text-heading-l">{t(`brands.${brand}`)}</h3>
              <p className={`mt-2 text-body-m-regular ${brand === 'prioritas' ? 'text-pgold-100/85' : 'text-neutral-100/85'}`}>{t(`prototype.${brand}`)}</p>
              <Link href={`/${brand}`} target="_blank" rel="noopener noreferrer" prefetch={false} className={(brand === 'prioritas' ? prioritasButtonClassName : solitaireButtonClassName)({ kind: 'text', surface: 'inverse', size: 'large', className: 'mt-5 self-start' })}>
                {t('openPrototype')}<ArrowRight aria-hidden className="size-4" /><span className="sr-only">{t('opensNewTab')}</span>
              </Link>
            </header>
            <BrandPageSurface tone={brand}>
              <div className="px-5 pb-5 md:px-6 md:pb-6">
                <section aria-label={t('access.title')} className="relative z-10 -mt-14 rounded-xl bg-neutral-100 p-5">
                  <h4 className="text-body-l-semibold">{t('access.title')}</h4>
                  <p className="mt-2 text-body-m-regular text-neutral-700">{t('access.description')}</p>
                  <div className="mt-5 space-y-2">
                    <CopyValue label={t('bcaId')} value={memberDemoCredentials[brand].bcaId} tone={brand} />
                    <CopyValue label={t('email')} value={memberDemoCredentials[brand].email} tone={brand} />
                    <CopyValue label={t('password')} value={memberDemoCredentials[brand].password} tone={brand} />
                  </div>
                  <Link href={{ pathname: '/member/login', query: { from: brand } }} target="_blank" rel="noopener noreferrer" prefetch={false} className={(brand === 'prioritas' ? prioritasButtonClassName : solitaireButtonClassName)({ size: 'large', className: 'mt-5 w-full' })}>
                    {t('openLogin')}<ArrowRight aria-hidden className="size-4" /><span className="sr-only">{t('opensNewTab')}</span>
                  </Link>
                </section>
              </div>
            </BrandPageSurface>
          </article>)}
        </div>
        <aside className="mt-4 rounded-xl bg-neutral-200 p-5">
          <h3 className="flex items-center gap-2 text-body-l-semibold"><KeyRound aria-hidden className="size-4" />{t('otp.title')}</h3>
          <p className="mt-2 text-body-m-regular text-neutral-700">{t('otp.description')}</p>
          <p className="mt-2 text-body-s-regular text-neutral-700">{t('demoNote')}</p>
        </aside>
      </section>
    </div>
  </main>;
}
