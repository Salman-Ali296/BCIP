"use client";

import { useState } from "react";

export function ResolutionForm({ onResolve, pending }: { onResolve: (summary: string) => void; pending?: boolean }) { const [summary, setSummary] = useState(""); const valid = summary.trim().length >= 20; return <div className="space-y-3"><label className="block text-sm font-medium text-slate-700">Resolution summary<textarea value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="Explain how the complaint was resolved" className="mt-2 min-h-28 w-full rounded-md border border-slate-300 p-3 text-sm" /></label><p className="text-xs text-slate-500">{summary.length}/20 minimum characters</p><button type="button" disabled={!valid || pending} onClick={() => onResolve(summary.trim())} className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">{pending ? "Resolving..." : "Mark as resolved"}</button></div>; }
