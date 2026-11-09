"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { HelpdeskLogo } from "@/components/brand/helpdesk-logo";
import { getRoleHome, useAuth } from "@/providers/auth-provider";
import {
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu, 
  Plus,
  Settings2,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";

const NAVIGATION_ITEMS = [
  { label: "Overview", href: "/business/dashboard", icon: LayoutDashboard, allowedRoles: ["BUSINESS_ADMIN", "MANAGER", "AGENT", "ESCALATION_AGENT", "BUSINESS"] },
  { label: "Complaints", href: "/business/complaints", icon: ClipboardList, allowedRoles: ["BUSINESS_ADMIN", "MANAGER", "AGENT", "ESCALATION_AGENT", "BUSINESS"] },
  { label: "Submit a complaint", href: "/business/complaints/new", icon: Plus, allowedRoles: ["BUSINESS_ADMIN", "MANAGER", "AGENT", "BUSINESS"] },
  { label: "Analytics", href: "/business/analytics", icon: BarChart3, allowedRoles: ["BUSINESS_ADMIN", "MANAGER", "BUSINESS"] },
  { label: "Team", href: "/business/employees", icon: Users, allowedRoles: ["BUSINESS_ADMIN", "MANAGER", "BUSINESS"] },
  { label: "Settings", href: "/business/settings", icon: Settings2, allowedRoles: ["BUSINESS_ADMIN", "BUSINESS"] },
] satisfies { label: string; href: string; icon: LucideIcon; allowedRoles: string[] }[];

export default function BusinessShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, status, error, refreshSession, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/login?returnTo=${encodeURIComponent(pathname)}`);
    } else if (
      status === "authenticated" &&
      user &&
      !NAVIGATION_ITEMS.some((item) => item.allowedRoles.includes(user.role))
    ) {
      router.replace(getRoleHome(user.role));
    }
  }, [pathname, router, status, user]);

  if (status === "error") {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f6f8fb] px-6">
        <div className="max-w-md text-center">
          <p className="text-sm text-[#5e6b7d]" role="alert">{error}</p>
          <button
            type="button"
            onClick={() => void refreshSession()}
            className="mt-4 rounded-lg bg-[#2454d6] px-4 py-2 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2454d6]"
          >
            Retry session check
          </button>
        </div>
      </main>
    );
  }

  if (status !== "authenticated" || !user || !user.role) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f6f8fb]">
        <div className="flex flex-col items-center gap-4" role="status" aria-live="polite">
          <span className="h-11 w-11 animate-spin rounded-full border-[3px] border-[#2454d6] border-t-transparent" />
          <p className="text-sm font-medium text-[#5e6b7d]">Loading your workspace…</p>
        </div>
      </div>
    );
  }

  const fullName = user.fullName ?? user.email;
  const allowedNavItems = NAVIGATION_ITEMS.filter((item) =>
    item.allowedRoles.includes(user.role)
  );
  const initials = fullName
    .trim()
    .split(/\s+/)
    .map((name) => name[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-[#101d30] md:flex">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close business navigation"
          className="fixed inset-0 z-40 bg-[#101d30]/45 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-[#101d30] text-white transition-transform duration-200 md:sticky md:top-0 md:h-screen md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[76px] items-center gap-3 border-b border-white/10 px-5">
          <Link
            href="/business/dashboard"
            className="flex min-w-0 flex-1 items-center gap-3 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8daeff]"
            onClick={() => setSidebarOpen(false)}
          >
            <HelpdeskLogo size="md" showText={true} theme="dark" />
          </Link>
          <button
            type="button"
            aria-label="Close navigation"
            className="rounded-lg p-2 text-slate-300 hover:bg-white/10 md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="px-5 pb-2 pt-7 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          Workspace
        </div>
        <nav aria-label="Business navigation" className="flex-1 space-y-1 overflow-y-auto px-3 pb-5">
          {allowedNavItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8daeff] ${
                  active
                    ? "bg-[#2454d6] text-white shadow-md shadow-blue-950/20"
                    : "text-slate-300 hover:bg-white/7 hover:text-white"
                }`}
              >
                <Icon className={`h-[18px] w-[18px] ${active ? "text-white" : "text-slate-400 group-hover:text-slate-200"}`} aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#d9e4ff] text-xs font-bold text-[#2454d6]">
              {initials || "U"}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-white">{fullName}</span>
              <span className="mt-0.5 block truncate text-xs text-slate-400">{user.role.replaceAll("_", " ")}</span>
            </span>
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:border-rose-300/30 hover:bg-rose-400/10 hover:text-rose-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#8daeff]"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-[#101d30]/8 bg-white/90 backdrop-blur-xl">
          <div className="flex h-[76px] items-center justify-between gap-4 px-5 sm:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                aria-label="Open business navigation"
                aria-expanded={sidebarOpen}
                className="rounded-xl border border-[#101d30]/10 p-2 text-[#5e6b7d] transition hover:bg-[#f6f8fb] hover:text-[#101d30] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2454d6] md:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </button>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#101d30]">{user.tenantName || "Business workspace"}</p>
                <p className="hidden text-xs text-[#8995a4] sm:block">Complaint operations</p>
              </div>
            </div>
            <div className="flex min-w-0 items-center gap-3">
              <span className="hidden max-w-48 truncate rounded-full border border-[#101d30]/10 bg-white px-3 py-1.5 text-xs font-medium text-[#5e6b7d] sm:inline-flex">
                {user.email}
              </span>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#edf2ff] text-sm font-semibold text-[#2454d6]">
                {initials || "U"}
              </span>
            </div>
          </div>
        </header>
        <div className="mx-auto w-full max-w-[1600px] flex-1 px-5 py-7 sm:px-8 sm:py-9">
          {children}
        </div>
      </div>
    </div>
  );
}
