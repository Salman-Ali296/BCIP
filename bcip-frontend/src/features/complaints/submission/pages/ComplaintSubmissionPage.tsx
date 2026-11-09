"use client";

import { useQuery } from "@tanstack/react-query";
import { ComplaintForm } from "@/features/complaints/submission/components/ComplaintForm";
import { getTenantIdBySlug } from "@/features/complaints/submission/services/complaintService";

export function ComplaintSubmissionPage({ tenantId, businessSlug }: { tenantId?: string; businessSlug?: string }) {
    const tenantQuery = useQuery({ queryKey: ["tenant", businessSlug], queryFn: () => getTenantIdBySlug(businessSlug as string), enabled: !tenantId && Boolean(businessSlug), staleTime: 5 * 60 * 1000 });
    const resolvedTenantId = tenantId ?? tenantQuery.data;
    return <main className="min-h-screen bg-slate-50 px-6 py-12"><div className="mx-auto max-w-3xl"><p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Customer support portal</p><h1 className="mt-2 text-3xl font-semibold text-slate-950">Submit a complaint</h1><p className="mt-2 text-slate-600">Tell us what happened. We will create a tracking ID so you can follow progress.</p>{tenantQuery.isError && <p className="mt-6 rounded-md bg-rose-50 p-4 text-sm text-rose-700" role="alert">This business support portal could not be found.</p>}{resolvedTenantId && <div className="mt-8"><ComplaintForm tenantId={resolvedTenantId} /></div>}</div></main>;
}
