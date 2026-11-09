"use client";

import Link from "next/link";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import type { ComplaintResponse } from "@/features/complaints/submission/types/complaint.types";

interface SuccessModalProps { result: ComplaintResponse; onReset: () => void; }

export function SuccessModal({ result, onReset }: SuccessModalProps) {
    const [copied, setCopied] = useState(false);
    async function copyTrackingId() { await navigator.clipboard.writeText(result.trackingId); setCopied(true); window.setTimeout(() => setCopied(false), 1500); }
    return <div className="rounded-xl border border-emerald-200 bg-white p-8 text-center shadow-sm" role="dialog" aria-labelledby="submission-success-title"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><Check aria-hidden="true" /></div><h2 id="submission-success-title" className="mt-4 text-2xl font-semibold text-slate-950">Complaint submitted</h2><p className="mt-2 text-sm text-slate-600">We received your complaint on {new Date(result.submittedAt).toLocaleString()}.</p><div className="mt-6 flex items-center justify-between rounded-md bg-slate-100 px-4 py-3 text-left"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tracking ID</p><p className="mt-1 font-mono font-semibold text-slate-900">{result.trackingId}</p></div><button type="button" onClick={copyTrackingId} className="rounded p-2 text-slate-600 hover:bg-white" aria-label="Copy tracking ID">{copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}</button></div><div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row"><Link href={`/complaint/track/${result.trackingId}`} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Check status</Link><button type="button" onClick={onReset} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Submit another complaint</button></div></div>;
}
