import React from 'react';

interface Props {
  currentStatus: string;
}

const statusFlow = ['submitted', 'acknowledged', 'in_progress', 'resolved'];

const statusLabels: Record<string, string> = {
  submitted: '📥 Submitted',
  acknowledged: '👀 Acknowledged',
  in_progress: '🔄 In Progress',
  resolved: '✅ Resolved',
};

export function ComplaintStatusTracker({ currentStatus }: Props) {
  const currentStatusIndex = statusFlow.indexOf(currentStatus);
  const isResolved = currentStatus === 'resolved';

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-6 mb-6">
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
        Resolution Progress
      </h2>
      <div className="flex items-center justify-between">
        {statusFlow.map((status, index) => (
          <React.Fragment key={status}>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  index <= currentStatusIndex
                    ? index < currentStatusIndex
                      ? 'bg-emerald-500 text-white'
                      : isResolved
                      ? 'bg-emerald-500 text-white'
                      : 'bg-indigo-600 text-white ring-4 ring-indigo-200'
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                {index < currentStatusIndex ? '✓' : index + 1}
              </div>
              <span
                className={`text-xs mt-2 font-medium ${
                  index <= currentStatusIndex ? 'text-slate-800' : 'text-slate-400'
                }`}
              >
                {statusLabels[status]}
              </span>
            </div>
            {index < statusFlow.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 rounded-full ${
                  index < currentStatusIndex ? 'bg-emerald-500' : 'bg-slate-200'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}