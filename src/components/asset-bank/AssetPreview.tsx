'use client';

import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/catalog/ui/button';

type View = { scale: number; x: number; y: number };
type Point = { x: number; y: number };
type GestureEvent = Event & { scale: number; clientX: number; clientY: number };
const MIN_ZOOM = 1;
const MAX_ZOOM = 16;
const INITIAL_VIEW: View = { scale: 1, x: 0, y: 0 };

export default function AssetPreview({ src, name, surface }: { src: string; name: string; surface: string }) {
  const t = useTranslations('assetBank');
  const viewport = useRef<HTMLDivElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const target = useRef<View>({ ...INITIAL_VIEW });
  const rendered = useRef<View>({ ...INITIAL_VIEW });
  const fittedSize = useRef({ width: 0, height: 0 });
  const animation = useRef<number | null>(null);
  const pointers = useRef(new Map<number, Point>());
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);

  const update = useCallback((next: View) => {
    const box = viewport.current;
    const img = image.current;
    if (!box || !img || !img.naturalWidth || !img.naturalHeight) return;
    const fit = Math.min(1, Math.max(1, box.clientWidth - 64) / img.naturalWidth, Math.max(1, box.clientHeight - 64) / img.naturalHeight);
    const width = img.naturalWidth * fit, height = img.naturalHeight * fit;
    fittedSize.current = { width, height };
    const scale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, next.scale));
    // Keep the artwork reachable, with the same 32px inset as the fitted view.
    const maxX = Math.max(0, (width * scale - box.clientWidth + 64) / 2);
    const maxY = Math.max(0, (height * scale - box.clientHeight + 64) / 2);
    target.current = { scale, x: Math.max(-maxX, Math.min(maxX, next.x)), y: Math.max(-maxY, Math.min(maxY, next.y)) };
    setZoom(scale);
    const paint = () => {
      const view = rendered.current;
      // Resize SVGs at their rendered resolution instead of magnifying a tiny
      // compositor bitmap. Vectors stay sharp even at the highest zoom level.
      img.style.maxWidth = 'none';
      img.style.maxHeight = 'none';
      img.style.width = `${fittedSize.current.width * view.scale}px`;
      img.style.height = `${fittedSize.current.height * view.scale}px`;
      img.style.transform = `translate3d(${view.x}px, ${view.y}px, 0)`;
    };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (animation.current !== null) cancelAnimationFrame(animation.current);
      animation.current = null;
      rendered.current = { ...target.current };
      paint();
      return;
    }
    if (animation.current !== null) return;
    let last = performance.now();
    const tick = (now: number) => {
      const factor = 1 - Math.exp(-Math.min(now - last, 64) / 55);
      last = now;
      const current = rendered.current, end = target.current;
      const settled = Math.abs(end.scale - current.scale) < 0.001 && Math.abs(end.x - current.x) < 0.05 && Math.abs(end.y - current.y) < 0.05;
      rendered.current = settled ? { ...end } : {
        scale: current.scale + (end.scale - current.scale) * factor,
        x: current.x + (end.x - current.x) * factor,
        y: current.y + (end.y - current.y) * factor,
      };
      paint();
      animation.current = settled ? null : requestAnimationFrame(tick);
    };
    animation.current = requestAnimationFrame(tick);
  }, []);

  const zoomTo = useCallback((value: number, point?: Point) => {
    const box = viewport.current;
    if (!box) return;
    const current = target.current;
    const scale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, value));
    const rect = box.getBoundingClientRect();
    const x = point ? point.x - rect.left - rect.width / 2 : 0;
    const y = point ? point.y - rect.top - rect.height / 2 : 0;
    const ratio = scale / current.scale;
    update({ scale, x: x - (x - current.x) * ratio, y: y - (y - current.y) * ratio });
  }, [update]);

  useEffect(() => {
    const box = viewport.current;
    if (!box) return;
    let gestureScale = 0;
    const wheel = (event: WheelEvent) => {
      if (gestureScale) { event.preventDefault(); return; }
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? box.clientHeight : 1;
      if (event.ctrlKey || event.metaKey) {
        // Browsers report trackpad pinch as Ctrl+wheel. Keep it inside the preview.
        event.preventDefault();
        zoomTo(target.current.scale * Math.exp(-event.deltaY * unit * 0.01), { x: event.clientX, y: event.clientY });
      } else if (target.current.scale > MIN_ZOOM) {
        event.preventDefault();
        update({ ...target.current, x: target.current.x - event.deltaX * unit, y: target.current.y - event.deltaY * unit });
      }
    };
    // Safari uses gesture events for trackpad pinch rather than Ctrl+wheel.
    const gestureStart = (event: Event) => { event.preventDefault(); gestureScale = target.current.scale; };
    const gestureChange = (event: Event) => {
      event.preventDefault();
      const gesture = event as GestureEvent;
      zoomTo(gestureScale * gesture.scale, { x: gesture.clientX, y: gesture.clientY });
    };
    const gestureEnd = (event: Event) => { event.preventDefault(); gestureScale = 0; };
    box.addEventListener('wheel', wheel, { passive: false });
    box.addEventListener('gesturestart', gestureStart, { passive: false });
    box.addEventListener('gesturechange', gestureChange, { passive: false });
    box.addEventListener('gestureend', gestureEnd, { passive: false });
    const observer = new ResizeObserver(() => update(target.current));
    observer.observe(box);
    return () => {
      box.removeEventListener('wheel', wheel);
      box.removeEventListener('gesturestart', gestureStart);
      box.removeEventListener('gesturechange', gestureChange);
      box.removeEventListener('gestureend', gestureEnd);
      observer.disconnect();
      if (animation.current !== null) cancelAnimationFrame(animation.current);
      animation.current = null;
    };
  }, [update, zoomTo]);

  const pointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const points = pointers.current;
    const previous = points.get(event.pointerId);
    if (!previous) return;
    const before = [...points.values()];
    const next = { x: event.clientX, y: event.clientY };
    points.set(event.pointerId, next);
    const after = [...points.values()];
    if (before.length === 2) {
      const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
      const midpoint = (a: Point, b: Point) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
      const oldDistance = distance(before[0], before[1]);
      if (oldDistance < 1) return;
      const oldMid = midpoint(before[0], before[1]), newMid = midpoint(after[0], after[1]);
      zoomTo(target.current.scale * distance(after[0], after[1]) / oldDistance, oldMid);
      update({ ...target.current, x: target.current.x + newMid.x - oldMid.x, y: target.current.y + newMid.y - oldMid.y });
    } else if (before.length === 1 && target.current.scale > MIN_ZOOM) {
      update({ ...target.current, x: target.current.x + next.x - previous.x, y: target.current.y + next.y - previous.y });
    }
  };
  const endPointer = (event: PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId);
    setDragging(pointers.current.size > 0);
  };

  return <>
    <div
      ref={viewport}
      role="region"
      aria-label={t('zoomPreview')}
      tabIndex={0}
      className={`asset-surface asset-surface-${surface} flex h-[36dvh] min-h-48 touch-none select-none items-center justify-center overflow-hidden rounded-xl border border-neutral-400 p-8 outline-none focus-visible:ring-1 focus-visible:ring-neutral-600 lg:h-[55dvh] ${zoom > 1 ? dragging ? 'cursor-grabbing' : 'cursor-grab' : ''}`}
      onPointerDown={event => {
        if (event.button !== 0) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
        setDragging(true);
      }}
      onPointerMove={pointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      onLostPointerCapture={endPointer}
      onKeyDown={event => {
        if (['+', '=', '-', '0', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
          event.preventDefault(); event.stopPropagation();
          if (event.key === '+' || event.key === '=') zoomTo(target.current.scale * 1.25);
          else if (event.key === '-') zoomTo(target.current.scale / 1.25);
          else if (event.key === '0') update(INITIAL_VIEW);
          else update({ ...target.current, x: target.current.x + (event.key === 'ArrowLeft' ? 40 : event.key === 'ArrowRight' ? -40 : 0), y: target.current.y + (event.key === 'ArrowUp' ? 40 : event.key === 'ArrowDown' ? -40 : 0) });
        }
      }}
    >
      <img ref={image} src={src} alt={name} draggable={false} onLoad={() => update(target.current)} className="max-h-full max-w-full flex-none object-contain will-change-transform" />
    </div>
    <div className="mt-3 flex flex-wrap items-center gap-2" role="group" aria-label={t('zoomControls')}>
      <Button variant="outline" size="icon" aria-label={t('zoomOut')} disabled={zoom <= MIN_ZOOM} onClick={() => zoomTo(target.current.scale / 1.25)}><Minus /></Button>
      <input type="range" min={100} max={1600} step={1} value={Math.round(zoom * 100)} aria-label={t('zoomLevel')} aria-valuetext={`${Math.round(zoom * 100)}%`} onChange={event => zoomTo(Number(event.target.value) / 100)} className="min-w-20 flex-1 accent-neutral-900 sm:max-w-40" />
      <output className="w-14 text-center text-size-body-m tabular-nums">{Math.round(zoom * 100)}%</output>
      <Button variant="outline" size="icon" aria-label={t('zoomIn')} disabled={zoom >= MAX_ZOOM} onClick={() => zoomTo(target.current.scale * 1.25)}><Plus /></Button>
      <Button variant="ghost" size="sm" onClick={() => update(INITIAL_VIEW)}><RotateCcw />{t('zoomReset')}</Button>
    </div>
    <p className="mt-2 text-size-body-s text-neutral-700">{t('zoomHint')}</p>
  </>;
}
