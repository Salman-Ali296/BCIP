"use client";

import { CheckCircle2, AlertCircle, FileText, UserPlus, Clock } from "lucide-react";
import type { CustomerActivityItem } from "../types";

interface RecentActivityTimelineProps {
    activities: CustomerActivityItem[];
    onSelectComplaint?: (complaintId: string) => void;
}

export function RecentActivityTimeline({
    activities,
    onSelectComplaint,
}: RecentActivityTimelineProps) {
    const getIcon = (type: CustomerActivityItem["type"]) => {
        switch (type) {
            case "requested":
                return <AlertCircle className="h-4 w-4 text-amber-600" aria-hidden="true" />;
            case "assigned":
                return <UserPlus className="h-4 w-4 text-blue-600" aria-hidden="true" />;
            case "resolved":
                return <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />;
            case "submitted":
                return <FileText className="h-4 w-4 text-slate-600" aria-hidden="true" />;
            default:
                return <Clock className="h-4 w-4 text-slate-500" aria-hidden="true" />;
        }
    };

    const getBgColor = (type: CustomerActivityItem["type"]) => {
        switch (type) {
            case "requested":
                return "bg-amber-100 ring-4 ring-amber-50";
            case "assigned":
                return "bg-blue-100 ring-4 ring-blue-50";
            case "resolved":
                return "bg-emerald-100 ring-4 ring-emerald-50";
            default:
                return "bg-slate-100 ring-4 ring-slate-50";
        }
    };

    return (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                    <h3 className="text-base font-semibold text-slate-900">Recent Activity</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Real-time milestones across your inquiries</p>
                </div>
                <span className="text-xs font-medium text-slate-400">Live feed</span>
            </div>

            <ol className="relative mt-6 space-y-6 border-l-2 border-slate-100 pl-6 ml-2" aria-label="Recent activity log">
                {activities.map((item) => (
                    <li key={item.id} className="relative group">
                        {/* Timeline Node Icon */}
                        <span
                            className={`absolute -left-[35px] top-0.5 flex h-7 w-7 items-center justify-center rounded-full transition-transform group-hover:scale-110 ${getBgColor(
                                item.type
                            )}`}
                            aria-hidden="true"
                        >
                            {getIcon(item.type)}
                        </span>

                        <div className="min-w-0">
                            <div className="flex flex-wrap items-baseline gap-2">
                                <span className="text-xs font-semibold text-slate-500">
                                    {item.timestamp}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => onSelectComplaint?.(item.complaintId)}
                                    className="rounded bg-slate-100 px-1.5 py-0.2 text-[11px] font-medium text-slate-600 hover:bg-blue-100 hover:text-blue-800 transition-colors"
                                >
                                    {item.complaintId}
                                </button>
                            </div>

                            <p className="mt-1 text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                                {item.title}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">
                                {item.description}
                            </p>
                        </div>
                    </li>
                ))}
            </ol>
        </div>
    );
}
