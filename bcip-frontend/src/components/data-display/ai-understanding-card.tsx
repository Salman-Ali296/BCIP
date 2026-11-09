import { Card } from '@/components/ui';
import type { Classification } from '@/types/complaint';

const tone = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-slate-100 text-slate-700',
  HIGH: 'bg-red-100 text-red-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  LOW: 'bg-slate-100 text-slate-700',
  CRITICAL: 'bg-red-100 text-red-700',
};

export function AIUnderstandingCard({ c }: { c: Classification }) {
  const rows: [string, React.ReactNode][] = [
    ['Category', c.category],
    ['Priority', <span key="p" className={`rounded px-2 py-0.5 text-xs font-semibold capitalize ${tone[c.priority]}`}>{c.priority}</span>],
    ['Sentiment', <span key="s" className="capitalize">{c.sentiment}</span>],
  ];
  return (
    <Card>
      <h2 className="mb-3 font-semibold">AI understanding</h2>
      <dl className="divide-y text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between py-2"><dt className="text-slate-500">{k}</dt><dd>{v}</dd></div>
        ))}
      </dl>
    </Card>
  );
}
