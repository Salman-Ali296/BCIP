"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { TrackedComplaint } from "@/features/complaints/tracking/services/trackingService";
import { StatusBadge } from "@/features/complaints/tracking/components/StatusBadge";

export function ComplaintStatusCard({ complaint }: { complaint: TrackedComplaint }) {
    const [expanded, setExpanded] = useState(false);
    return <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><button type="button" className="flex w-full items-start justify-between gap-4 text-left" onClick={() => setExpanded((current) => !current)} aria-expanded={expanded}><div><p className="font-mono text-xs text-slate-500">{complaint.trackingId}</p><h2 className="mt-1 text-lg font-semibold text-slate-950">{complaint.title}</h2><p className="mt-1 text-sm text-slate-500">{complaint.category}</p></div><div className="flex items-center gap-3"><StatusBadge status={complaint.status} />{expanded ? <ChevronUp aria-hidden="true" className="h-4 w-4" /> : <ChevronDown aria-hidden="true" className="h-4 w-4" />}</div></button><div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 text-sm sm:grid-cols-3"><div><span className="text-slate-500">Priority</span><p className="font-semibold text-slate-800">{complaint.priority}</p></div><div><span className="text-slate-500">Last updated</span><p className="font-semibold text-slate-800">{new Date(complaint.updatedAt ?? complaint.createdAt).toLocaleString()}</p></div><div><span className="text-slate-500">Status</span><p className="font-semibold text-slate-800">{complaint.status}</p></div></div>{expanded && complaint.description && <p className="mt-4 whitespace-pre-wrap border-t border-slate-100 pt-4 text-sm leading-6 text-slate-700">{complaint.description}</p>}</article>;
}
