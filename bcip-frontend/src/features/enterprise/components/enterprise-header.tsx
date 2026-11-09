"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, Search } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useOptionalBusinessWorkspace } from "@/features/business-trial/context/business-workspace-context";
import { useEnterprise } from "../context/enterprise-context";

function getPageTitle(pathname: string): string {
    if (pathname.startsWith("/admin/organizations")) return "Organizations";
    if (pathname.startsWith("/admin/business-units")) return "Business units";
    if (pathname.startsWith("/admin/users")) return "User directory";
    if (pathname.startsWith("/admin/roles")) return "Roles & permissions";
    if (pathname.startsWith("/admin/sla-policies")) return "SLA policies";
    if (pathname.startsWith("/admin/security")) return "Security";
    if (pathname.startsWith("/admin/audit-logs")) return "Audit logs";
    if (pathname.startsWith("/admin/settings")) return "Platform settings";
    if (pathname.startsWith("/admin")) return "Platform overview";
    if (pathname.startsWith("/business/inbox")) return "Inbox";
    if (pathname.startsWith("/business/complaints")) return "Complaints";
    if (pathname.startsWith("/business/analytics")) return "Analytics";
    if (pathname.startsWith("/business/trends")) return "Trends";
    if (pathname.startsWith("/business/reports")) return "Reports";
    if (pathname.startsWith("/business/customers")) return "Customers";
    if (pathname.startsWith("/business/teams")) return "Teams";
    if (pathname.startsWith("/business/team")) return "Team";
    if (pathname.startsWith("/business/employees")) return "People";
    if (pathname.startsWith("/business/escalations")) return "Escalations";
    if (pathname.startsWith("/business/knowledge")) return "Knowledge";
    if (pathname.startsWith("/business/settings")) return "Workspace settings";
    if (pathname.startsWith("/business/categories")) return "Categories";
    if (pathname.startsWith("/business/performance")) return "Performance";
    return "Overview";
}

export function EnterpriseHeader({ onMenuClick }: { onMenuClick?: () => void }) {
    const pathname = usePathname();
    const { user } = useAuth();
    const { setCommandPaletteOpen } = useEnterprise();
    const workspace = useOptionalBusinessWorkspace();
    const isAdmin = pathname.startsWith("/admin");
    const pageTitle = getPageTitle(pathname);
    const initials = (user?.fullName ?? workspace?.businessName ?? "Workspace")
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();

    return (
        <header
            className={`sticky top-0 z-30 backdrop-blur ${
                workspace
                    ? "border-b border-[var(--workspace-line)] bg-[var(--workspace-card)]/95"
                    : "border-b border-slate-200/90 bg-white/95"
            }`}
        >
            <div className="flex min-h-[4.75rem] items-center justify-between gap-4 px-4 sm:px-7 lg:px-10">
                <div className="flex min-w-0 items-center gap-3">
                    <button
                        type="button"
                        onClick={onMenuClick}
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[var(--workspace-line)] text-[var(--workspace-ink)] md:hidden"
                        aria-label="Open navigation"
                    >
                        <Menu size={19} aria-hidden="true" />
                    </button>
                    <div className="min-w-0">
                        <p className={`hidden text-[10px] font-bold uppercase tracking-[0.14em] sm:block ${
                            workspace ? "text-[var(--workspace-muted)]" : "text-slate-400"
                        }`}>
                            {workspace?.businessName ?? (isAdmin ? "Platform control" : "BCIP workspace")}
                        </p>
                        <h2 className={`truncate text-base font-bold ${
                            workspace ? "text-[var(--workspace-ink)]" : "text-slate-900"
                        }`}>
                            {pageTitle}
                        </h2>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    <button
                        type="button"
                        onClick={() => setCommandPaletteOpen(true)}
                        className={`hidden min-h-10 min-w-48 items-center gap-2 rounded-xl border px-3 text-left text-xs transition md:flex lg:min-w-64 ${
                            workspace
                                ? "border-[var(--workspace-line)] bg-[var(--workspace-paper)] text-[var(--workspace-muted)] hover:border-[var(--workspace-green)]"
                                : "border-slate-200 bg-slate-50 text-slate-400 hover:border-slate-300"
                        }`}
                        aria-label="Search the workspace"
                    >
                        <Search size={15} aria-hidden="true" />
                        <span className="flex-1">
                            {isAdmin ? "Find an organization or user" : "Find a complaint or customer"}
                        </span>
                        <kbd className="rounded-md border border-[var(--workspace-line)] bg-[var(--workspace-card)] px-1.5 py-0.5 font-mono text-[10px]">
                            ⌘K
                        </kbd>
                    </button>
                    {workspace && (
                        <Link
                            href="/business/upgrade"
                            className="business-button-secondary min-h-10 px-3 py-2 text-xs"
                        >
                            <span className="hidden sm:inline">Plan & billing</span>
                            <span className="sm:hidden">Plan</span>
                            <ArrowUpRight size={14} aria-hidden="true" />
                        </Link>
                    )}
                    <span
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-extrabold ${
                            workspace
                                ? "bg-[var(--workspace-green-wash)] text-[var(--workspace-green-deep)]"
                                : "bg-slate-900 text-white"
                        }`}
                        aria-label={user?.fullName ?? "Business owner"}
                        title={user?.fullName ?? "Business owner"}
                    >
                        {initials || "BO"}
                    </span>
                </div>
            </div>
        </header>
    );
}
