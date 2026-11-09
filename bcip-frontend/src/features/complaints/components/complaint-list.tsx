
import Link from "next/link";
import { ErrorMessage } from "@/components/feedback/error-message";
import { EmptyState } from "@/components/data-display/empty-state";
import { StatusBadge } from "@/components/data-display/status-badge";
import { ComplaintListSkeleton } from "@/features/complaints/components/complaint-list-skeleton";
import type { Complaint } from "@/features/complaints/types/complaint";

interface ComplaintListProps {
    complaints?: Complaint[];
    isLoading?: boolean;
    error?: string;
}

export function ComplaintList({
    complaints = [],
    isLoading = false,
    error,
}: ComplaintListProps) {
    // 1. Loading State
    if (isLoading) {
        return <ComplaintListSkeleton />;
    }

    // 2. Error State
    if (error) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <ErrorMessage message={error} />
            </div>
        );
    }

    // 3. Empty State
    if (complaints.length === 0) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
                <EmptyState
                    title="No complaints yet"
                    description="You have not submitted any complaints. Submit your first complaint to start tracking your support requests."
                    action={
                        <Link
                            href="/customer/complaints/new"
                            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                        >
                            Submit Complaint
                        </Link>
                    }
                />
            </div>
        );
    }

    // 4. Data State
    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50/50">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-slate-700">
                                Complaint
                            </th>

                            <th className="px-6 py-4 font-semibold text-slate-700">
                                Category
                            </th>

                            <th className="px-6 py-4 font-semibold text-slate-700">
                                Status
                            </th>

                            <th className="px-6 py-4 font-semibold text-slate-700">
                                Submitted
                            </th>

                            <th className="px-6 py-4 text-right font-semibold text-slate-700">
                                Action
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-200">
                        {complaints.map((complaint) => (
                            <tr
                                key={complaint.id}
                                className="transition-colors hover:bg-slate-50/80"
                            >
                                <td className="px-6 py-4">
                                    <div className="space-y-1">
                                        <p className="font-medium text-slate-900">
                                            {complaint.title}
                                        </p>

                                        <p className="font-mono text-xs text-slate-500">
                                            {complaint.trackingId}
                                        </p>
                                    </div>
                                </td>

                                <td className="px-6 py-4 text-slate-600">
                                    {complaint.category}
                                </td>

                                <td className="px-6 py-4">
                                    <StatusBadge status={complaint.status} />
                                </td>

                                <td className="px-6 py-4 text-slate-600">
                                    {complaint.createdAt}
                                </td>

                                <td className="px-6 py-4 text-right">
                                    <Link
                                        href={`/business/complaints/${complaint.id}`}
                                        className="inline-flex items-center rounded-md bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-100"
                                    >
                                        View Details
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
