'use client';

import { useContext, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { NextIntlClientProvider, useLocale, useTranslations, type AbstractIntlMessages } from 'next-intl';
import { EyeOff, LockKeyhole, Maximize2, Minimize2, Monitor, MousePointer2, PencilLine, Eye, Smartphone } from 'lucide-react';
import MemberLoginExperience, { type MemberLoginPreview } from '@/components/member/MemberLoginExperience';
import FinancialReportExperience from '@/components/prioritas/FinancialReportExperience';
import FinancialReportOtpModal, { type OtpPreview } from '@/components/prioritas/FinancialReportOtpModal';
import PrioritasPageHeader from '@/components/prioritas/PrioritasPageHeader';
import KursDetailExperience from '@/components/prioritas/KursDetailExperience';
import BrandPageSurface from '@/components/prioritas/BrandPageSurface';
import { getPrivilegePromos } from '@/lib/partner-privileges';
import { getPrioritasSourceEvents } from '@/lib/prioritas-source-data';
import { PreviewFrozenContext, PreviewNavigationContext, PreviewViewportContext } from '@/lib/PreviewViewport';
import CatalogViewportStyles from '@/components/catalog/CatalogViewportStyles';
import LogoutConfirmDialog from '@/components/home/LogoutConfirmDialog';
import LoginPageView from '@/app/[locale]/login/LoginPageView';
import { LocationFlowPreview } from '../../../archive/lokasi-bca/LocationFinder';
import type { NearbyResponse } from '../../../archive/lokasi-bca/location-data';
import type { KursDetailEntry } from '@/lib/kurs-detail';
import PublicPrivilegeView from '@/components/prioritas/PublicPrivilegeView';
import MagazineIndexExperience from '@/components/prioritas/MagazineIndexExperience';
import Navbar from '@/components/home/Navbar';
import PrioritasDetailSubnav from '@/components/prioritas/PrioritasDetailSubnav';
import SearchOverlay from '@/components/home/SearchOverlay';
import PartnerPrivilegeDetailView from '@/components/prioritas/PartnerPrivilegeDetailView';
import type { FlowPageSnapshots } from './flow-pages';
import type { FlowBrand, FlowJourney, FlowScenario } from './flow-data';
import { flowPreviewState, type FlowStage } from './flow-preview-state';
import { flowPreviewAnnotations, type FlowAnnotationKind } from './flow-preview-annotations';

export type FlowPreviewData = { locations: NearbyResponse; rates: KursDetailEntry[]; updatedAt: number; pages: FlowPageSnapshots; languageLocale: string; languageMessages: AbstractIntlMessages };
const noop = () => {};
const noVerification = async () => null;

function Snapshot({ journey, scenario, stage, brand: selectedBrand, data }: { journey: FlowJourney; scenario: FlowScenario; stage: FlowStage; brand: FlowBrand; data: FlowPreviewData }) {
  const { scene, state } = flowPreviewState(journey, scenario, stage);
  const t = useTranslations('userFlows');
  const sig = useTranslations('signaturePrivilege');
  const magazine = useTranslations('magazineIndex');
  const kurs = useTranslations('prioritasKurs');
  const locale = useLocale();
  const brand = ['home', 'overview'].includes(scene) && state === 'otherBrand' ? selectedBrand === 'solitaire' ? 'prioritas' : 'solitaire' : selectedBrand;
  const solitaire = brand === 'solitaire';
  const viewport = useContext(PreviewViewportContext) ?? 1280;
  const shell = (title: string, children: ReactNode, section: "banking" | "magazine") => <><div className="relative"><Navbar variant={brand} disableHideShow /><PrioritasDetailSubnav label={sig("subNavLabel")} privilege={sig("subNav.privilege")} banking={sig("subNav.banking")} magazine={sig("subNav.magazine")} basePath={`/${brand}`} tone={brand} active={section} /><PrioritasPageHeader title={title} breadcrumbs={[{ label: t(`brands.${brand}`), href: `/${brand}` }, { label: title }]} tone={brand} /></div><BrandPageSurface tone={brand}><div className="mx-auto w-full max-w-[1280px] px-4 py-6 xl:px-0">{children}</div></BrandPageSurface></>;
  let screen: ReactNode;
  switch (scene) {
    case 'home':
      screen = state === 'individual' ? data.pages[brand].individualHome : state === 'translated' ? <NextIntlClientProvider locale={data.languageLocale} messages={data.languageMessages}>{data.pages[brand].languageHome}</NextIntlClientProvider> : <PreviewNavigationContext.Provider value={{ languageOpen: state === 'language', mobileMenuOpen: ['menu', 'language'].includes(state) }}><div className={`relative ${['menu', 'language'].includes(state) && viewport < 1280 ? 'h-[760px] overflow-hidden' : 'min-h-[680px]'}`}>{data.pages[brand].home}</div></PreviewNavigationContext.Provider>;
      break;
    case 'login': {
      const filled = !['default', 'cancel'].includes(state);
      const preview: MemberLoginPreview = { method: state === 'email' ? 'email' : 'bcaId', identifier: state === 'email' ? 'member@example.com' : state === 'invalidFormat' ? 'abc' : filled ? 'bca.member' : '', password: filled && state !== 'blankPassword' ? '••••••••' : '', touched: state === 'invalidFormat', credentialsError: state === 'wrong', notice: state === 'help', pending: state === 'pending' };
      screen = <MemberLoginExperience brand={brand} preview={preview} />;
      break;
    }
    case 'portfolio':
      screen = <FinancialReportExperience report={['tax', 'year', 'notice'].includes(state) ? 'tax' : 'portfolio'} portfolioSessionExpiresAt={null} preview={{ brand, visible: state === 'visible', period: state === 'year' ? 'year' : 'month', notice: state === 'notice' }} />;
      break;
    case 'otp': {
      const preview: OtpPreview = { step: state === 'noPhone' ? 'noPhone' : ['request', 'noSelection', 'cancel'].includes(state) ? 'request' : 'verify', phone: state === 'noSelection' ? '' : '0812•••••925', code: state === 'partial' ? '123' : state === 'rejected' ? '000000' : state === 'failure' ? '123456' : '', error: ['noSelection', 'rejected'].includes(state), seconds: ['resend', 'expiredCode'].includes(state) ? 0 : 119, submitting: state === 'failure' };
      screen = <div className="relative h-[680px] overflow-hidden"><FinancialReportExperience report="portfolio" portfolioSessionExpiresAt={null} preview={{ brand, visible: false }} /><FinancialReportOtpModal preview={preview} solitaire={solitaire} onClose={noop} onVerified={noVerification} /></div>;
      break;
    }
    case 'directory': {
      const activeTab = ['lifestyle', 'lifestyleFiltered'].includes(state) ? 'lifestyle' : state === 'event' ? 'event' : 'signature';
      const promos = getPrivilegePromos(activeTab === 'signature' ? 'complimentary' : 'lifestyle');
      const combined = ['combined', 'lifestyleFiltered'].includes(state);
      screen = <PublicPrivilegeView brand={brand} activeSection={activeTab} promos={promos} signaturePromos={getPrivilegePromos('signature')} events={getPrioritasSourceEvents()} bannerBackdrops={{}} now="2026-10-12T12:00:00+07:00" preview={{ categories: combined ? ['beauty'] : [], query: state === 'none' ? 'zzzzzz' : combined ? promos.find(item => item.privilegeCategory === 'beauty')?.brand ?? '' : '', page: state === 'pagination' ? 2 : 1, birthday: state === 'birthday' }} />;
      break;
    }
    case 'vouchers': {
      const transfer = ['transfer', 'copy', 'used', 'copyDenied', 'expand'].includes(state);
      const page = data.pages[brand][transfer ? 'transfer' : 'memberDetail'];
      screen = <PartnerPrivilegeDetailView surface={page.surface} detail={{ ...page.detail, memberVoucherStatus: transfer ? undefined : state === 'unlimited' || state === 'penalty' || state === 'exhausted' ? state : 'available', preview: { brand, transfer: { copied: state === 'copy', expanded: state === 'expand' || state === 'used' } } }} />;
      break;
    }
    case 'medical': {
      const page = data.pages[brand].medical;
      screen = <PartnerPrivilegeDetailView surface={page.surface} detail={{ ...page.detail, preview: { brand, medical: { copied: state === 'copied', locationIndex: state === 'selected' ? 1 : 0 } } }} />;
      break;
    }
    case 'detail':
      screen = <PartnerPrivilegeDetailView {...data.pages[brand][state === 'restricted' ? 'restricted' : state === 'member' ? 'memberDetail' : 'detail']} />;
      break;
    case 'overview':
      screen = <PreviewNavigationContext.Provider value={{ accountMenuOpen: state === 'accountMenu', mobileMenuOpen: state === 'accountMenu', memberArea: true }}><div className={state === 'accountMenu' && viewport < 1280 ? 'relative h-[760px] overflow-hidden' : 'relative'}>{data.pages[brand].overview}</div></PreviewNavigationContext.Provider>;
      break;
    case 'search': {
      const blank = ['blank', 'history', 'historyCleared', 'storage'].includes(state);
      screen = <div className="relative h-[800px] overflow-hidden">{data.pages[brand].home}<SearchOverlay open onClose={noop} initialSegment={solitaire ? 'Solitaire' : 'Prioritas'} preview={{ keyword: blank ? '' : state === 'empty' ? 'zzzzzz' : 'Airport', recent: state === 'history' ? ['Airport Lounge', 'Banking Privilege'] : [] }} /></div>;
      break;
    }
    case 'magazine':
      screen = state === 'member' ? <>{data.pages[brand].magazineHeader}<BrandPageSurface tone={brand}><MagazineIndexExperience memberLayout tone={brand} preview={{ page: 1 }} /></BrandPageSurface></> : shell(magazine('title'), <MagazineIndexExperience tone={brand} preview={{ page: state === 'page2' ? 2 : 1 }} />, 'magazine');
      break;
    case 'banking':
      screen = data.pages[brand][state === 'wealth' ? 'wealth' : 'banking'];
      break;
    case 'bankingDetail': screen = data.pages[brand].bankingDetail; break;
    case 'kurs': {
      const keys = ['ratesHeading', 'updatedAt', 'refresh', 'currency', 'buy', 'sell', 'converter', 'conversionEstimate', 'amount', 'from', 'to', 'swapCurrencies', 'viewConverter', 'note', 'tellerNote'] as const;
      const copy = Object.fromEntries(keys.map(key => [key, kurs(key)])) as { [K in typeof keys[number]]: string };
      screen = <KursDetailExperience tone={brand} rates={data.rates} updatedAt={new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }).format(data.updatedAt)} copy={copy} preview={{ amount: state === 'invalidAmount' ? 'abc' : ['converter', 'swapped'].includes(state) ? '100' : '1', from: state === 'swapped' ? 'IDR' : 'USD', to: state === 'swapped' ? 'USD' : 'IDR' }} />;
      break;
    }
    case 'branches': screen = <div className="min-h-[680px] bg-neutral-200 xl:p-8"><LocationFlowPreview initial={data.locations} tone={brand} state={state} /></div>; break;
    case 'contact': screen = data.pages[brand][state === 'documents' ? 'documents' : state === 'disclosure' ? 'contactDisclosure' : 'contact']; break;
    case 'logout': screen = <div className="relative h-[760px] overflow-hidden [transform:translateZ(0)]">{data.pages[brand].overview}<LogoutConfirmDialog open onCancel={noop} onConfirm={noop} tone={brand} /></div>; break;
    case 'preview': screen = <LoginPageView redirectTo={`/${brand}`} preview={state === 'wrong' ? 'error' : state === 'correct' ? 'success' : 'idle'} />; break;
    case 'notFound': screen = <div className="flex min-h-[680px] items-center justify-center gap-5 bg-neutral-100 text-neutral-900"><h1 className="border-r border-neutral-400 pr-5 text-heading">404</h1><p>{t('ui.notFound')}</p></div>; break;
  }
  const memberArea = ['overview', 'vouchers', 'medical', 'logout'].includes(scene) || scene === 'detail' && state === 'member' || scene === 'magazine' && state === 'member';
  return <PreviewNavigationContext.Provider value={{ memberArea }}><div data-flow-ui data-flow-case={`${journey.id}/${scenario.id}`} data-flow-stage={stage} data-flow-brand={brand} data-scene={scene} data-state={state} className="relative min-h-[680px] font-sans text-neutral-900 [transform:translateZ(0)]">{screen}</div></PreviewNavigationContext.Provider>;
}

const subscribeMobileViewport = (onChange: () => void) => {
  const query = window.matchMedia('(max-width: 767px)');
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
};
const readMobileViewport = () => window.matchMedia('(max-width: 767px)').matches;
const serverMobileViewport = () => false;

export default function FlowUIPreview({ journey, scenario, stage, brand, data, fill = false }: { journey: FlowJourney; scenario: FlowScenario; stage: FlowStage; brand: FlowBrand; data: FlowPreviewData; fill?: boolean }) {
  const t = useTranslations('userFlows');
  const [deviceOverride, setDevice] = useState<'desktop' | 'mobile' | null>(null);
  const mobileViewport = useSyncExternalStore(subscribeMobileViewport, readMobileViewport, serverMobileViewport);
  const device = deviceOverride ?? (mobileViewport ? 'mobile' : 'desktop');
  const viewKey = `${journey.id}/${scenario.id}/${stage}`;
  const [viewOverride, setViewOverride] = useState<{ key: string; focus: boolean } | null>(null);
  const focusView = viewOverride?.key === viewKey ? viewOverride.focus : true;
  const [dimensions, setDimensions] = useState({ available: 800, availableHeight: 600, height: 680, crop: { x: 0, y: 0, width: 1440, height: 680 }, dialog: false, markers: [] as { x: number; y: number; width: number; height: number; kind: FlowAnnotationKind }[] });
  const boxRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const width = device === 'desktop' ? 1440 : 390;
  const previewState = flowPreviewState(journey, scenario, stage);
  const { scene } = previewState;
  const crop = focusView ? dimensions.crop : { x: 0, y: 0, width, height: dimensions.height };
  const scale = Math.min(1, dimensions.available / crop.width, focusView && dimensions.dialog ? dimensions.availableHeight / crop.height : 1);
  useEffect(() => {
    const box = boxRef.current;
    const content = contentRef.current;
    if (!box || !content) return;
    const update = () => {
      const computed = getComputedStyle(box);
      const source = content.getBoundingClientRect();
      const rect = (node: HTMLElement) => {
        const bounds = node.getBoundingClientRect();
        return { x: Math.round((bounds.left - source.left) / scale), y: Math.round((bounds.top - source.top) / scale), width: Math.round(bounds.width / scale), height: Math.round(bounds.height / scale) };
      };
      const { focus, annotations, dialog } = flowPreviewAnnotations(content, journey, scenario, stage, flowPreviewState(journey, scenario, stage));
      const markers = annotations.map(item => ({ ...rect(item.element), kind: item.kind }));
      let target = focus ? rect(focus) : null;
      // Absolute menus do not contribute to their trigger wrapper's height.
      // Include their rendered bounds so focus mode keeps every option visible.
      const context = focus?.querySelectorAll<HTMLElement>('[role="menu"], [data-prioritas-index-tabs]') ?? [];
      for (const element of context) {
        if (!target || !element.offsetWidth || !element.offsetHeight) continue;
        const bounds = rect(element);
        const x = Math.min(target.x, bounds.x);
        const y = Math.min(target.y, bounds.y);
        target = { x, y, width: Math.max(target.x + target.width, bounds.x + bounds.width) - x, height: Math.max(target.y + target.height, bounds.y + bounds.height) - y };
      }
      // Alerts can sit above a form card. Include every annotated target in the
      // region so cropping cannot hide the very response being documented.
      for (const marker of markers) {
        if (!target) { target = marker; continue; }
        const x = Math.min(target.x, marker.x);
        const y = Math.min(target.y, marker.y);
        target = { x, y, width: Math.max(target.x + target.width, marker.x + marker.width) - x, height: Math.max(target.y + target.height, marker.y + marker.height) - y };
      }
      const padding = 24;
      const height = content.offsetHeight;
      const maxHeight = device === 'desktop' ? 640 : 760;
      const cropWidth = target ? Math.min(width, target.width + padding * 2) : width;
      // Keep only the relevant module plus a little context. Long modules are
      // bounded around the marked action; expanded voucher lists retain scrolling.
      const cropHeight = target ? Math.min(height, target.height + padding * 2, dialog || scenario.id === 'expand' ? Infinity : maxHeight) : Math.min(height, maxHeight);
      const x = target ? Math.max(0, Math.min(width - cropWidth, target.x - padding)) : 0;
      let y = target ? Math.max(0, target.y - padding) : 0;
      const lastMarker = markers.at(-1);
      if (lastMarker && lastMarker.y + lastMarker.height > y + cropHeight - 24) y = Math.max(0, lastMarker.y + lastMarker.height + 24 - cropHeight);
      y = Math.min(Math.max(0, height - cropHeight), y);
      const next = {
        available: box.clientWidth - parseFloat(computed.paddingLeft) - parseFloat(computed.paddingRight),
        availableHeight: box.clientHeight - parseFloat(computed.paddingTop) - parseFloat(computed.paddingBottom),
        height, crop: { x, y, width: cropWidth, height: cropHeight }, dialog, markers,
      };
      setDimensions(previous => JSON.stringify(previous) === JSON.stringify(next) ? previous : next);
    };
    const observer = new ResizeObserver(update);
    // Some owning controls mount their overlay after hydration without changing
    // the page's outer size. Re-measure that subtree, too.
    let mutationFrame = 0;
    const mutations = new MutationObserver(() => {
      if (!mutationFrame) mutationFrame = window.requestAnimationFrame(() => { mutationFrame = 0; update(); });
    });
    mutations.observe(content, { childList: true, subtree: true });
    observer.observe(box); observer.observe(content); update();
    box.scrollTop = 0; box.scrollLeft = 0;
    return () => { observer.disconnect(); mutations.disconnect(); window.cancelAnimationFrame(mutationFrame); };
  }, [width, journey, scenario, stage, brand, device, scale, focusView]);
  const alt = t('ui.previewAlt', { case: t(`journeys.${journey.id}.scenarios.${scenario.id}.title`), stage: stage + 1 }) + (dimensions.markers.length ? ` · ${dimensions.markers.map((marker, index) => `${index + 1}: ${t(`actions.${marker.kind}`)}`).join(', ')}` : '');
  return <section aria-label={t('ui.preview')} className={`${fill ? "flex h-full min-h-0 flex-col" : ""} min-w-0 overflow-hidden rounded-xl border border-neutral-400 bg-neutral-100`}>
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-neutral-400 px-3 py-2">
      <h3 className="flex items-center gap-2 text-size-body-s font-medium text-neutral-600"><LockKeyhole aria-hidden className="size-3.5" />{t('board.static')}</h3>
      <div className="flex items-center gap-2">
        <button type="button" title={t(focusView ? 'board.wholeScreen' : 'board.focusUI')} aria-label={t(focusView ? 'board.wholeScreen' : 'board.focusUI')} onClick={() => setViewOverride({ key: viewKey, focus: !focusView })} className="flex items-center gap-2 rounded-lg px-2 py-2 text-size-body-s text-neutral-700 hover:bg-neutral-200 outline-none focus-visible:ring-2 focus-visible:ring-blue-500">{focusView ? <Minimize2 aria-hidden className="size-4" /> : <Maximize2 aria-hidden className="size-4" />}<span className="hidden sm:inline">{t(focusView ? 'board.wholeScreen' : 'board.focusUI')}</span></button>
        <div role="group" aria-label={t('ui.device')} className="flex gap-1 rounded-lg bg-neutral-200 p-1">{(['desktop', 'mobile'] as const).map(value => <button key={value} type="button" aria-pressed={device === value} onClick={() => setDevice(value)} className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-size-body-s font-medium outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${device === value ? 'bg-neutral-100 shadow-card' : 'text-neutral-700'}`}>{value === 'desktop' ? <Monitor aria-hidden className="size-4" /> : <Smartphone aria-hidden className="size-4" />}<span className="hidden sm:inline">{t(`ui.${value}`)}</span><span className="sr-only sm:hidden">{t(`ui.${value}`)}</span></button>)}</div>
      </div>
    </div>
    <div ref={boxRef} role="img" aria-label={alt} className={`${fill ? "min-h-0 flex-1" : "max-h-[680px] min-h-64"} overflow-auto bg-neutral-200 p-4 md:p-6`} data-lenis-prevent>
      <div className="relative mx-auto overflow-hidden rounded-lg border border-neutral-400 bg-neutral-100 shadow-card" data-flow-crop={focusView ? "focused" : "whole"} style={{ width: crop.width * scale, height: crop.height * scale }}>
        <PreviewViewportContext.Provider value={width}><PreviewFrozenContext.Provider value>
          <div ref={contentRef} inert aria-hidden="true" data-catalog-screen="user-flow" className="pointer-events-none absolute left-0 top-0 origin-top-left select-none" style={{ width, transform: `translate(${-crop.x * scale}px, ${-crop.y * scale}px) scale(${scale})` }}>
            <Snapshot key={`${journey.id}/${scenario.id}/${stage}/${brand}/${device}`} journey={journey} scenario={scenario} stage={stage} brand={brand} data={data} />
          </div>
          {dimensions.markers.map((marker, index) => {
            const x = (marker.x - crop.x) * scale;
            const y = (marker.y - crop.y) * scale;
            const markerWidth = marker.width * scale;
            const markerHeight = marker.height * scale;
            const response = marker.kind === 'response';
            if (x + markerWidth < 0 || y + markerHeight < 0 || x > crop.width * scale || y > crop.height * scale) return null;
            return <div key={index} aria-hidden="true" data-flow-marker={marker.kind} className={`pointer-events-none absolute z-[120] rounded-lg border-2 ${response ? 'border-purple-600' : 'border-blue-500'}`} style={{ left: x - 4, top: y - 4, width: markerWidth + 8, height: markerHeight + 8 }}>
              <span className={`absolute flex w-max items-center gap-1.5 rounded-md px-2 py-1 text-size-body-s font-semibold text-neutral-100 shadow-card ${response ? 'bg-purple-600' : 'bg-blue-500'}`} style={{ ...(!response && markerWidth < 116 && x + markerWidth > 116 ? { right: 0 } : { left: Math.max(-x + 4, Math.min(0, crop.width * scale - x - 116)) }), ...(y >= 32 ? { bottom: 'calc(100% + 4px)' } : { top: 'calc(100% + 4px)' }) }}>
                {response ? <Eye className="size-3.5" /> : marker.kind === 'input' ? <PencilLine className="size-3.5" /> : <MousePointer2 className="size-3.5" />}<span>{!response && `${index + 1} · `}{t(`actions.${marker.kind}`)}</span>
              </span>
            </div>;
          })}
          <CatalogViewportStyles key={`${scene}/${width}`} width={width} screen="user-flow" />
        </PreviewFrozenContext.Provider></PreviewViewportContext.Provider>
      </div>
    </div>
    {!fill && <div className="flex items-start gap-2 border-t border-neutral-400 px-4 py-3 text-size-body-s leading-5 text-neutral-600"><EyeOff aria-hidden className="mt-0.5 size-4 shrink-0" /><p>{t('ui.excerpt')}</p></div>}
    <style>{'[data-flow-ui] *, [data-flow-ui] *::before, [data-flow-ui] *::after {animation:none!important;transition:none!important;caret-color:transparent!important} [data-flow-ui] [data-reveal] {opacity:1!important;transform:none!important}'}</style>
  </section>;
}
