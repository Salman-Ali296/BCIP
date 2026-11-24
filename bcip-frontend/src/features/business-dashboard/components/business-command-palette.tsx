"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Search, X } from "lucide-react";
import { useEnterprise } from "@/features/enterprise/context/enterprise-context";
import { useBusinessWorkspace } from "@/features/business-trial/context/business-workspace-context";
import {
    businessDashboardQueryKey,
    getBusinessDashboard,
} from "@/lib/api/business-dashboard";
import {
    formatDashboardDate,
    formatDashboardStatus,
} from "./dashboard-widgets";

const QUICK_LINKS = [
    { href: "/business/inbox", label: "Complaint inbox" },
    { href: "/business/dashboard#ai-insights", label: "AI insights" },
    { href: "/business/teams", label: "Team management" },
    { href: "/business/reports", label: "Reports & analytics" },
];

export function BusinessCommandPalette() {
    const { commandPaletteOpen, setCommandPaletteOpen } = useEnterprise();
    const workspace = useBusinessWorkspace();
    const [search, setSearch] = useState("");
    const [query, setQuery] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const dialogRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const timer = window.setTimeout(() => setQuery(search.trim()), 250);
        return () => window.clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        if (commandPaletteOpen) {
            previousFocusRef.current =
                document.activeElement instanceof HTMLElement ? document.activeElement : null;
            inputRef.current?.focus();
        } else {
            previousFocusRef.current?.focus();
            previousFocusRef.current = null;
        }
    }, [commandPaletteOpen]);

    const closePalette = useCallback(() => {
        setSearch("");
        setQuery("");
        setCommandPaletteOpen(false);
    }, [setCommandPaletteOpen]);

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
                event.preventDefault();
                setCommandPaletteOpen(true);
            } else if (event.key === "Escape" && commandPaletteOpen) {
                event.preventDefault();
                closePalette();
            } else if (event.key === "Tab" && commandPaletteOpen && dialogRef.current) {
                const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
                    'input:not([disabled]), button:not([disabled]), a[href]',
                );
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (!first || !last) {
                    event.preventDefault();
                } else if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [commandPaletteOpen, closePalette, setCommandPaletteOpen]);

    const searchFilters = {
        range: "90d" as const,
        grouping: "week" as const,
        search: query,
        page: 1,
    };
    const searchQuery = useQuery({
        queryKey: businessDashboardQueryKey(workspace.businessName, searchFilters),
        queryFn: () => getBusinessDashboard(searchFilters),
        enabled: commandPaletteOpen && query.length >= 2,
        staleTime: 15_000,
    });

    if (!commandPaletteOpen) return null;

    return (
        <div
            className="business-command-backdrop"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) closePalette();
            }}
        >
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="business-search-title"
                className="business-command-dialog"
            >
                <h2 id="business-search-title" className="sr-only">Search complaints and workspace</h2>
                <div className="business-command-input-row">
                    <Search size={18} aria-hidden="true" />
                    <input
                        ref={inputRef}
                        type="search"
                        value={search}
                        maxLength={80}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search complaints by subject or tracking ID…"
                        aria-label="Search complaints"
                    />
                    <button
                        type="button"
                        className="business-command-close"
                        onClick={closePalette}
                        aria-label="Close search"
                    >
                        <X size={17} aria-hidden="true" />
                    </button>
                </div>

                <div className="business-command-content">
                    {query.length >= 2 ? (
                        <section aria-labelledby="business-search-results-heading">
                            <h3 id="business-search-results-heading" className="business-command-heading">
                                Complaint results
                            </h3>
                            {searchQuery.isPending ? (
                                <p className="business-command-empty" role="status">Searching complaints…</p>
                            ) : searchQuery.isError ? (
                                <div className="business-command-empty" role="alert">
                                    <p>Search results could not be loaded.</p>
                                    <button
                                        type="button"
                                        className="business-dashboard-text-link mt-2"
                                        onClick={() => void searchQuery.refetch()}
                                    >
                                        Try again
                                    </button>
                                </div>
                            ) : searchQuery.data?.recent.items.length ? (
                                <ul className="business-command-results">
                                    {searchQuery.data.recent.items.map((item) => (
                                        <li key={item.id}>
                                            <Link
                                                href={`/business/complaints/${encodeURIComponent(item.id)}`}
                                                onClick={closePalette}
                                                className="business-command-result"
                                            >
                                                <span className="min-w-0 flex-1">
                                                    <span className="block truncate text-sm font-semibold">{item.title}</span>
                                                    <span className="mt-1 block truncate text-xs text-[var(--workspace-muted)]">
                                                        {item.trackingId} · {formatDashboardStatus(item.status)} · {formatDashboardDate(item.createdAt)}
                                                    </span>
                                                </span>
                                                <ArrowUpRight size={15} aria-hidden="true" />
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="business-command-empty">No complaints match this search.</p>
                            )}
                        </section>
                    ) : (
                        <p className="business-command-hint">
                            Enter at least 2 characters to search your workspace complaints.
                        </p>
                    )}

                    <section className="mt-4" aria-labelledby="business-search-links-heading">
                        <h3 id="business-search-links-heading" className="business-command-heading">
                            Quick links
                        </h3>
                        <ul className="business-command-shortcuts">
                            {QUICK_LINKS.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        onClick={closePalette}
                                        className="business-command-shortcut"
                                    >
                                        {link.label}
                                        <ArrowUpRight size={14} aria-hidden="true" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
}
