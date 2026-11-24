'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';

export type Placement = 'auto' | 'top' | 'bottom' | 'left' | 'right';

export type TourStep = {
  /** Matches data-tour="..." on the element to highlight. Omit for a centered card. */
  target?: string;
  title: string;
  body: string;
  placement?: Placement;
};

type Props = {
  steps: TourStep[];
  /** Include the user id and a version, e.g. `bcip:tour:dashboard:v1:${user.id}`. Bump the version to re-show after a redesign. */
  storageKey: string;
  onFinish?: (reason: 'done' | 'skip') => void;
};

const START_EVENT = 'bcip:start-tour';
/** Call from a "Take the tour" button / help menu to replay the tour. */
export const startTour = () => window.dispatchEvent(new Event(START_EVENT));

const PAD = 8;   // spotlight padding around the element
const GAP = 12;  // distance between spotlight and card
const EDGE = 12; // minimum distance from the viewport edge

type Rect = { top: number; left: number; width: number; height: number };
const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), Math.max(min, max));

export function ProductTour({ steps, storageKey, onFinish }: Props) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [entered, setEntered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const step = steps[index];
  const isLast = index === steps.length - 1;

  // Show automatically the first time; replay on demand via startTour().
  useEffect(() => {
    let done = false;
    try { done = localStorage.getItem(storageKey) === 'done'; } catch { /* storage blocked */ }
    const autoOpen = !done && steps.length ? setTimeout(() => setOpen(true), 0) : undefined;

    const replay = () => { setIndex(0); setOpen(true); };
    window.addEventListener(START_EVENT, replay);
    return () => {
      if (autoOpen) clearTimeout(autoOpen);
      window.removeEventListener(START_EVENT, replay);
    };
  }, [storageKey, steps.length]);

  const finish = useCallback((reason: 'done' | 'skip') => {
    try { localStorage.setItem(storageKey, 'done'); } catch { /* ignore */ }
    setOpen(false);
    setIndex(0);
    onFinish?.(reason);
  }, [storageKey, onFinish]);

  const next = useCallback(() => (isLast ? finish('done') : setIndex((i) => i + 1)), [isLast, finish]);
  const back = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);

  // Find the target, scroll it into view, and keep the spotlight on it during scroll/resize.
  const target = step?.target;
  useEffect(() => {
    if (!open) return;
    const el = target ? document.querySelector<HTMLElement>(`[data-tour="${target}"]`) : null;
    // Missing or hidden (e.g. sidebar collapsed on mobile) → fall back to a centered card.
    if (!el || el.getClientRects().length === 0) {
      const frame = requestAnimationFrame(() => setRect(null));
      return () => cancelAnimationFrame(frame);
    }

    el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' });
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open, index, target]);

  // Enter animation on every step (fade + slide + scale).
  useEffect(() => {
    if (!open) return;
    let f2 = 0;
    const f1 = requestAnimationFrame(() => { setEntered(false); f2 = requestAnimationFrame(() => setEntered(true)); });
    return () => { cancelAnimationFrame(f1); cancelAnimationFrame(f2); };
  }, [open, index]);

  // Place the card next to the spotlight, flipping sides when there is no room.
  const placement = step?.placement ?? 'auto';
  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!open || !card) return;
    const w = card.offsetWidth;  // offset* ignores the scale transform used by the animation
    const h = card.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (!rect) { setPos({ top: (vh - h) / 2, left: (vw - w) / 2 }); return; }

    const bottom = rect.top + rect.height + PAD + GAP;
    const top = rect.top - PAD - GAP - h;
    const right = rect.left + rect.width + PAD + GAP;
    const left = rect.left - PAD - GAP - w;
    const cx = rect.left + rect.width / 2 - w / 2;
    const cy = rect.top + rect.height / 2 - h / 2;

    const options = {
      bottom: { top: bottom, left: cx, fits: bottom + h <= vh - EDGE },
      top: { top, left: cx, fits: top >= EDGE },
      right: { top: cy, left: right, fits: right + w <= vw - EDGE },
      left: { top: cy, left, fits: left >= EDGE },
    };
    const order: Exclude<Placement, 'auto'>[] = ['bottom', 'top', 'right', 'left'];
    if (placement !== 'auto') order.unshift(placement);

    // Nothing fits (very large element, small phone): dock the card at the bottom of the screen.
    const choice = order.map((p) => options[p]).find((o) => o.fits) ?? { top: vh - h - EDGE, left: (vw - w) / 2 };
    setPos({ top: clamp(choice.top, EDGE, vh - h - EDGE), left: clamp(choice.left, EDGE, vw - w - EDGE) });
  }, [open, rect, index, placement]);

  // Keyboard: → next, ← back, Esc skip. Move focus to the card for screen readers.
  useEffect(() => {
    if (!open) return;
    cardRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish('skip');
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') back();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, index, next, back, finish]);

  if (!open || !step) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000]">
      {/* Click shield: the page underneath is not clickable while the tour runs. */}
      <div className={`absolute inset-0 transition-colors duration-300 ${rect ? 'bg-transparent' : 'bg-slate-900/60'}`} />

      {rect && (
        <div
          aria-hidden
          className="pointer-events-none absolute rounded-xl ring-2 ring-emerald-400 transition-all duration-300 ease-out motion-reduce:transition-none"
          style={{
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
            boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.6)',
          }}
        />
      )}

      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        aria-describedby="tour-body"
        tabIndex={-1}
        style={{ top: pos.top, left: pos.left }}
        className={`absolute w-[min(340px,calc(100vw-24px))] rounded-2xl bg-white p-5 shadow-2xl outline-none transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none ${
          entered ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-2 scale-95 opacity-0'
        }`}
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-medium text-emerald-600">Step {index + 1} of {steps.length}</span>
          <button type="button" onClick={() => finish('skip')} className="text-xs text-slate-400 hover:text-slate-600">
            Skip tour
          </button>
        </div>

        <h2 id="tour-title" className="text-base font-semibold text-slate-900">{step.title}</h2>
        <p id="tour-body" className="mt-1.5 text-sm leading-relaxed text-slate-600">{step.body}</p>

        <div className="mt-5 flex items-center justify-between">
          <div className="flex gap-1.5" aria-hidden>
            {steps.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? 'w-5 bg-emerald-500' : 'w-1.5 bg-slate-200'}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {index > 0 && <Button variant="outline" size="sm" onClick={back}>Back</Button>}
            <Button size="sm" onClick={next}>{isLast ? 'Done' : 'Next'}</Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
