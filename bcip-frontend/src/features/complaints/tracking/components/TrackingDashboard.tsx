"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { useComplaintTracking } from "@/features/complaints/tracking/hooks/useComplaintTracking";
import { ComplaintStatusCard } from "@/features/complaints/tracking/components/ComplaintStatusCard";
import { TimelineView } from "@/features/complaints/tracking/components/TimelineView";

export function TrackingDashboard({ initialTrackingId = "" }: { initialTrackingId?: string }) {
    const [trackingId, setTrackingId] = useState(initialTrackingId);
    const [searchValue, setSearchValue] = useState(initialTrackingId);
    const query = useComplaintTracking(trackingId);
    return <div className="space-y-6"><form onSubmit={(event) => { event.preventDefault(); setTrackingId(searchValue.trim()); }} className="flex gap-2"><label className="sr-only" htmlFor="tracking-id">Tracking ID</label><input id="tracking-id" value={searchValue} onChange={(event) => setSearchValue(event.target.value)} placeholder="Enter tracking ID" className="h-11 min-w-0 flex-1 rounded-md border border-slate-300 px-3 text-sm" /><button type="submit" className="inline-flex h-11 items-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"><Search aria-hidden="true" className="h-4 w-4" />Track</button></form>{query.isLoading && <div className="h-36 animate-pulse rounded-xl bg-slate-100" />}{query.isError && <p className="rounded-md bg-rose-50 p-4 text-sm text-rose-700" role="alert">We could not find that complaint. Check the tracking ID and try again.</p>}{query.data && <><ComplaintStatusCard complaint={query.data} /><div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="mb-5 text-lg font-semibold text-slate-950">Progress timeline</h2><TimelineView events={query.data.events} /></div></>}</div>;
}
