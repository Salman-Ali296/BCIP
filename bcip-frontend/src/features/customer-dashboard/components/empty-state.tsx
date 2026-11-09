"use client";

import { Inbox, PlusCircle } from "lucide-react";

interface CustomerEmptyStateProps {
    onNewComplaint: () => void;
    isFilterEmpty?: boolean;
    onResetFilter?: () => void;
}

export function CustomerEmptyState({
    onNewComplaint,
    isFilterEmpty = false,
    onResetFilter,
}: CustomerEmptyStateProps) {
    if (isFilterEmpty) {
        return (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-slate-100 text-slate-500">
                    <Inbox className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900">
                    No matching complaints found
                </h3>
                <p className="mt-1 max-w-sm text-xs text-slate-500">
                    Try adjusting your search criteria or filter status.
                </p>
                {onResetFilter && (
                    <button
                        type="button"
                        onClick={onResetFilter}
                        className="mt-4 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        Reset filters
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                <Inbox className="h-7 w-7 stroke-[1.8]" aria-hidden="true" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">
                No complaints yet
            </h3>
            <p className="mt-1.5 max-w-md text-sm text-slate-600">
                When you need help, submit a complaint and track the progress right here.
            </p>
            <button
                type="button"
                onClick={onNewComplaint}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition"
            >
                <PlusCircle className="h-4 w-4" aria-hidden="true" />
                Submit Your First Complaint
            </button>
        </div>
    );
}
