"use client";

export function AssigneeSelector({ assignedToId, onChange }: { assignedToId?: string | null; onChange: (value: string | undefined) => void }) { return <label className="block text-sm font-medium text-slate-700">Assigned to<select value={assignedToId ?? ""} onChange={(event) => onChange(event.target.value || undefined)} className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-2 text-sm"><option value="">Unassigned</option><option value="self">Assign to me</option></select></label>; }
