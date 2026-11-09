"use client";

import { useEffect, useState, useRef } from "react";
import {
    Search,
    X,
    FileText,
    User,
    Sparkles,
    AlertTriangle,
    Shield,
    ArrowRight,
    Building2,
} from "lucide-react";
import { useEnterprise } from "../context/enterprise-context";

export function GlobalCommandPalette() {
    const {
        commandPaletteOpen,
        setCommandPaletteOpen,
        complaints,
        setSelectedComplaintId,
    } = useEnterprise();

    const [query, setQuery] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setCommandPaletteOpen(!commandPaletteOpen);
            }
            if (e.key === "Escape" && commandPaletteOpen) {
                setCommandPaletteOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [commandPaletteOpen, setCommandPaletteOpen]);

    useEffect(() => {
        if (commandPaletteOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
        } else {
            setQuery("");
        }
    }, [commandPaletteOpen]);

    if (!commandPaletteOpen) return null;

    const filteredComplaints = query.trim()
        ? complaints.filter((c) => {
              const q = query.toLowerCase();
              return (
                  c.id.toLowerCase().includes(q) ||
                  c.title.toLowerCase().includes(q) ||
                  c.customer.name.toLowerCase().includes(q) ||
                  c.referenceNumber.toLowerCase().includes(q) ||
                  c.category.toLowerCase().includes(q)
              );
          })
        : complaints.slice(0, 4);

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-950/60 p-4 backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
            aria-labelledby="global-search-modal"
        >
            <div className="relative flex flex-col w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200">
                {/* Search Input Bar */}
                <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3.5 bg-slate-50/50">
                    <Search className="h-5 w-5 text-slate-400 shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search complaints, customers, reference IDs, teams... (Esc to close)"
                        className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={() => setQuery("")}
                            className="text-slate-400 hover:text-slate-600 p-1"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                    <span className="rounded bg-slate-200/80 px-2 py-0.5 font-mono text-[10px] text-slate-600">
                        ESC
                    </span>
                </div>

                {/* Results List */}
                <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-100">
                    <div className="py-1">
                        <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Complaints & Cases ({filteredComplaints.length})
                        </p>
                        {filteredComplaints.map((c) => (
                            <button
                                key={c.id}
                                type="button"
                                onClick={() => {
                                    setSelectedComplaintId(c.id);
                                    setCommandPaletteOpen(false);
                                }}
                                className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-slate-100 transition group"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-50 text-blue-600 shrink-0">
                                        <FileText className="h-4 w-4" />
                                    </span>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs font-bold text-slate-900">
                                                {c.id}
                                            </span>
                                            <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-medium text-slate-600">
                                                {c.category}
                                            </span>
                                            <span className="text-[10px] text-slate-400">
                                                {c.customer.name}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-700 truncate mt-0.5">
                                            {c.title}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-[11px] font-medium text-slate-500">
                                        {c.sla.timeRemainingText}
                                    </span>
                                    <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600 transition" />
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="py-2">
                        <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Quick Enterprise Shortcuts
                        </p>
                        <div className="grid grid-cols-2 gap-1 px-1">
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedComplaintId("BCIP-10482");
                                    setCommandPaletteOpen(false);
                                }}
                                className="flex items-center gap-2.5 rounded-xl p-2.5 text-xs text-slate-700 hover:bg-slate-100 transition"
                            >
                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                                <span>High SLA Risk Queue (8 cases)</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setCommandPaletteOpen(false);
                                    window.location.href = "/business/trends";
                                }}
                                className="flex items-center gap-2.5 rounded-xl p-2.5 text-xs text-slate-700 hover:bg-slate-100 transition"
                            >
                                <Sparkles className="h-4 w-4 text-indigo-500" />
                                <span>Recurring Issue Clusters (3 active)</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setCommandPaletteOpen(false);
                                    window.location.href = "/business/teams";
                                }}
                                className="flex items-center gap-2.5 rounded-xl p-2.5 text-xs text-slate-700 hover:bg-slate-100 transition"
                            >
                                <Building2 className="h-4 w-4 text-blue-500" />
                                <span>Department Dispatch Matrix</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setCommandPaletteOpen(false);
                                    window.location.href = "/admin/audit-logs";
                                }}
                                className="flex items-center gap-2.5 rounded-xl p-2.5 text-xs text-slate-700 hover:bg-slate-100 transition"
                            >
                                <Shield className="h-4 w-4 text-emerald-500" />
                                <span>Immutable Audit Logs</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer hints */}
                <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-2.5 text-[11px] text-slate-500">
                    <div className="flex items-center gap-4">
                        <span>Navigate with ↑ ↓</span>
                        <span>Select with Enter</span>
                    </div>
                    <span>Multi-tenant Isolation: Enforced</span>
                </div>
            </div>
        </div>
    );
}
