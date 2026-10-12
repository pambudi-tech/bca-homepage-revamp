'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { PreviewFrozenContext } from '@/lib/PreviewViewport';
import type { BreakpointExample } from './breakpoint-examples';

// The isolated document keeps CSS media queries and viewport units tied to the
// simulated width. Scaling only affects its presentation in the documentation.
export default function BreakpointPreview({ width, example }: { width: number; example: BreakpointExample }) {
  const locale = useLocale();
  const t = useTranslations('designTokens.breakpoint');
  const canvas = useRef<HTMLDivElement>(null);
  const [availableWidth, setAvailableWidth] = useState(0);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const observer = new ResizeObserver(() => setAvailableWidth(element.clientWidth));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const scale = availableWidth ? Math.min(1, availableWidth / width) : 1;
  const height = 900;
  const title = t('frameTitle', { page: t(`pages.${example}`), width });
  return <figure className="mt-6">
    <figcaption className="mb-3 flex flex-wrap justify-between gap-2 text-size-body-s text-neutral-700">
      <span>{t(`examples.${example}`)}</span><span>{t('readOnly')}</span>
    </figcaption>
    <div ref={canvas} className="relative overflow-hidden rounded-xl border border-neutral-400 bg-neutral-200">
      {!loaded && <p role="status" className="absolute inset-0 z-10 flex items-center justify-center bg-neutral-200 p-6 text-size-body-m text-neutral-700">{t('loading')}</p>}
      <div role="img" aria-label={title} className="relative mx-auto" style={{ width: width * scale, height: height * scale }}>
        <div inert aria-hidden className="absolute left-0 top-0 origin-top-left" style={{ width, height, transform: `scale(${scale})` }}>
          <iframe title={title} src={`/${locale}/design-tokens/preview/${example}`} width={width} height={height} tabIndex={-1} onLoad={() => setLoaded(true)} className="pointer-events-none block border-0" />
        </div>
      </div>
    </div>
  </figure>;
}

// Reuse the real page trees while keeping their controls and autoplay parked.
export function FrozenPagePreview({ children }: { children: ReactNode }) {
  return <PreviewFrozenContext.Provider value={true}>
    <style>{'html, body { overflow: hidden; }'}</style>
    <div inert>{children}</div>
  </PreviewFrozenContext.Provider>;
}
