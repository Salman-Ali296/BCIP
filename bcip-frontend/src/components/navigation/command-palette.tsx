"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowRight,
    BrainCircuit,
    Compass,
    FileText,
    HelpCircle,
    LayoutDashboard,
    Search,
    ShieldCheck,
    Ticket,
    UserCheck,
    X,
} from "lucide-react";

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
}

const quickLinks = [
    {
        title: "Track Complaint Ticket",
        description: "Check live status using your tracking reference (e.g., CMP-2026-98124)",
        icon: Ticket,
        href: "/support/track",
        badge: "Customer",
    },
    {
        title: "Submit a Complaint (Text / Voice)",
        description: "Lodge a formal dispute with multi-modal voice or text intake",
        icon: FileText,
        href: "/support/report",
        badge: "Customer",
    },
    {
        title: "Business Operations Dashboard",
        description: "Triage inbox, SLA escalations, staff assignment, and analytics",
        icon: LayoutDashboard,
        href: "/business/dashboard",
        badge: "Business",
    },
    {
        title: "Platform Admin Console",
        description: "Multi-tenant business verification, audit logs, and system health",
        icon: ShieldCheck,
        href: "/admin/dashboard",
        badge: "System Admin",
    },
    {
        title: "AI Triage & Capabilities",
        description: "NLP category inference, urgency scoring, and deduplication engine",
        icon: BrainCircuit,
        href: "/#intelligence",
        badge: "Platform",
    },
    {
        title: "Pricing & Enterprise ROI",
        description: "Tiered plans, SME starter options, and volume custom quotes",
        icon: Compass,
        href: "/pricing",
        badge: "Plans",
    },
    {
        title: "Design System & Architecture",
        description: "Review authoritative RBAC, data schemas, and UI specifications",
        icon: HelpCircle,
        href: "/about",
        badge: "Docs",
    },
];

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [trackingInput, setTrackingInput] = useState("");

    // Listen for Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        if (isOpen) {
            document.body.style.overflow = "hidden";
            window.addEventListener("keydown", handleKeyDown);
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            document.body.style.overflow = "unset";
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const filteredLinks = quickLinks.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        item.badge.toLowerCase().includes(query.toLowerCase())
    );

    const handleTrackSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = trackingInput.trim();
        if (trimmed) {
            onClose();
            router.push(`/support/track/${encodeURIComponent(trimmed)}`);
        }
    };

    const handleSelectLink = (href: string) => {
        onClose();
        router.push(href);
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-start justify-center p-4 sm:p-6 md:p-20"
            role="dialog"
            aria-modal="true"
            aria-label="Command palette and quick lookup"
        >
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-[#101d30]/60 backdrop-blur-md transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Box */}
            <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl transition-all">
                {/* Search Bar */}
                <div className="flex items-center border-b border-slate-100 px-4 py-3.5">
                    <Search className="mr-3 h-5 w-5 shrink-0 text-slate-400" />
                    <input
                        type="text"
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search pages, portals, documentation or enter ticket ID..."
                        className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                    />
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Close command palette"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Instant Tracking Section */}
                <form
                    onSubmit={handleTrackSubmit}
                    className="flex items-center justify-between border-b border-slate-100 bg-[#edf2ff]/50 px-4 py-2.5 text-xs text-[#2454d6]"
                >
                    <div className="flex items-center gap-2">
                        <Ticket className="h-4 w-4 shrink-0 text-[#2454d6]" />
                        <span className="font-semibold text-slate-700">Quick Ticket Lookup:</span>
                        <input
                            type="text"
                            value={trackingInput}
                            onChange={(e) => setTrackingInput(e.target.value)}
                            placeholder="e.g. CMP-2026-98124"
                            className="rounded-md border border-slate-200 bg-white px-2 py-1 font-mono text-xs uppercase text-slate-900 outline-none focus:border-[#2454d6]"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!trackingInput.trim()}
                        className="inline-flex items-center gap-1 rounded-md bg-[#2454d6] px-2.5 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1b43b4] disabled:opacity-40"
                    >
                        Track <ArrowRight className="h-3 w-3" />
                    </button>
                </form>

                {/* Search Results List */}
                <div className="max-h-80 overflow-y-auto p-2">
                    <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        {query ? "Matching Results" : "Suggested Workspaces & Destinations"}
                    </div>

                    {filteredLinks.length > 0 ? (
                        <div className="space-y-1">
                            {filteredLinks.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={item.href}
                                        onClick={() => handleSelectLink(item.href)}
                                        className="group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-50"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-slate-200/80 bg-white text-slate-600 shadow-xs transition group-hover:border-[#2454d6]/40 group-hover:bg-[#edf2ff] group-hover:text-[#2454d6]">
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-slate-900 group-hover:text-[#2454d6]">
                                                    {item.title}
                                                </div>
                                                <div className="text-xs text-slate-500 line-clamp-1">
                                                    {item.description}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 group-hover:bg-[#edf2ff] group-hover:text-[#2454d6]">
                                                {item.badge}
                                            </span>
                                            <ArrowRight className="h-3.5 w-3.5 text-slate-400 opacity-0 transition group-hover:opacity-100 group-hover:text-[#2454d6]" />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-8 text-center">
                            <p className="text-sm text-slate-500">No matching destinations found for &quot;{query}&quot;</p>
                            <p className="mt-1 text-xs text-slate-400">
                                Try searching for &quot;ticket&quot;, &quot;support&quot;, &quot;business&quot;, or &quot;pricing&quot;.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer Hotkey Info */}
                <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-4 py-2.5 text-xs text-slate-500">
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1">
                            <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-700 shadow-2xs">ESC</kbd> to close
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-700 shadow-2xs">↵</kbd> to select
                        </span>
                    </div>
                    <div className="text-[11px] font-medium text-slate-400">
                        BCIP Navigation Engine
                    </div>
                </div>
            </div>
        </div>
    );
}
