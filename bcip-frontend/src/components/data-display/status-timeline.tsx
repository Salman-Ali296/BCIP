import { STATUS_STEPS, type ComplaintStatus } from '@/types/complaint';

export function StatusTimeline({ status }: { status: ComplaintStatus }) {
  const cur = STATUS_STEPS.findIndex((s) => s.key === status);
  return (
    <ol className="space-y-4">
      {STATUS_STEPS.map((s, i) => {
        const done = i < cur || status === 'resolved';
        const active = i === cur && !done;
        return (
          <li key={s.key} aria-current={active ? 'step' : undefined} className="flex items-center gap-3 text-sm">
            <span className={`grid h-6 w-6 place-items-center rounded-full border-2 text-xs ${done ? 'border-emerald-500 bg-emerald-500 text-white' : active ? 'border-blue-600 text-blue-600' : 'border-slate-300'}`}>{done ? '\u2713' : ''}</span>
            <span className={done || active ? 'font-medium' : 'text-slate-400'}>{s.label}</span>
          </li>
        );
      })}
    </ol>
  );
}
