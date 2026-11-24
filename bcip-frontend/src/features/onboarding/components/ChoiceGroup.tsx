'use client';

import type { Question } from '../types';

type Props = {
  question: Question;
  value: string[];
  otherText: string;
  onChange: (value: string[]) => void;
  onOtherChange: (text: string) => void;
};

const GRID = {
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-3',
  4: 'grid-cols-2 md:grid-cols-4',
} as const;

/** One component for every single- and multi-select question. */
export function ChoiceGroup({ question: q, value, otherText, onChange, onOtherChange }: Props) {
  const toggle = (id: string) => {
    if (!q.multi) return onChange([id]);
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  };

  return (
    <fieldset className="mb-8">
      <legend className="mb-1 text-lg font-semibold text-slate-800">
        {q.title}
        {!q.required && <span className="ml-2 text-sm font-normal text-slate-400">(optional)</span>}
      </legend>
      <p className="mb-3 text-sm text-slate-500">{q.multi ? 'Select all that apply' : 'Choose one'}</p>

      <div role={q.multi ? 'group' : 'radiogroup'} className={`grid gap-3 ${GRID[q.columns ?? 2]}`}>
        {q.options.map((o) => {
          const selected = value.includes(o.id);
          return (
            <button
              key={o.id}
              type="button"
              role={q.multi ? 'checkbox' : 'radio'}
              aria-checked={selected}
              onClick={() => toggle(o.id)}
              className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                selected
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              {o.icon && <span className="text-xl" aria-hidden>{o.icon}</span>}
              <span className="flex-1">
                <span className="block font-medium text-slate-800">{o.label}</span>
                {o.hint && <span className="block text-sm text-slate-500">{o.hint}</span>}
              </span>
              {q.multi && (
                <span
                  aria-hidden
                  className={`flex h-5 w-5 items-center justify-center rounded border text-xs ${
                    selected ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300'
                  }`}
                >
                  {selected && '✓'}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {q.allowOther && value.includes('other') && (
        <input
          type="text"
          value={otherText}
          onChange={(e) => onOtherChange(e.target.value)}
          placeholder="Tell us a bit more"
          maxLength={120}
          aria-label={`${q.title} — other`}
          className="mt-3 w-full rounded-lg border-2 border-slate-200 px-4 py-2.5 focus:border-emerald-500 focus:outline-none"
        />
      )}
    </fieldset>
  );
}
