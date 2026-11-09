"use client";

import { ArrowDownUp } from "lucide-react";
import type { SortDirection, SortKey } from "@/features/dashboard/types/dashboard.types";

export function SortControls({ sortKey, direction, onChange }: { sortKey: SortKey; direction: SortDirection; onChange: (key: SortKey, direction: SortDirection) => void }) { return <label className="inline-flex items-center gap-2 text-sm text-slate-600">Sort by<select value={sortKey} onChange={(event) => onChange(event.target.value as SortKey, direction)} className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-800"><option value="createdAt">Created date</option><option value="priority">Priority</option><option value="status">Status</option></select><button type="button" onClick={() => onChange(sortKey, direction === "asc" ? "desc" : "asc")} className="rounded-md border border-slate-300 p-2 hover:bg-slate-50" aria-label={`Sort ${direction === "asc" ? "descending" : "ascending"}`}><ArrowDownUp className="h-4 w-4" /></button></label>; }
