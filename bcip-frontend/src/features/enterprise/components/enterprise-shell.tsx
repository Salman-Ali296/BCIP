"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import "@/app/(business)/business-workspace.css";
import "@/app/(admin)/admin-portal.css";
import { EnterpriseProvider, useEnterprise } from "../context/enterprise-context";
import { GlobalCommandPalette } from "./global-command-palette";
import { EscalationDialog } from "./escalation-dialog";
import { ResolutionDialog } from "./resolution-dialog";
import { useOptionalBusinessWorkspace } from "@/features/business-trial/context/business-workspace-context";
import { BusinessCommandPalette } from "@/features/business-dashboard/components/business-command-palette";
import { EnterpriseHeader } from "./enterprise-header";
import { EnterpriseSidebar } from "./enterprise-sidebar";

/* -------------------------------------------------------------------------- */
/*                                  Constants                                 */
/* -------------------------------------------------------------------------- */

/** Tailwind's default `md` breakpoint. Keep in sync with the Tailwind config. */
const DESKTOP_MEDIA_QUERY = "(min-width: 768px)";
const ADMIN_ROOT = "/admin";
const BUSINESS_DASHBOARD_PATH = "/business/dashboard";

type ShellVariant = "business" | "admin" | "platform";

const SHELL_CLASSES: Record<ShellVariant, string> = {
    business: "business-shell min-h-screen md:flex",
    admin: "admin-portal min-h-screen md:flex",
    platform: "min-h-screen bg-wash text-slate-900 md:flex",
};

const MAIN_CLASSES =
    "mx-auto w-full max-w-[1500px] flex-1 px-4 py-6 sm:px-7 sm:py-8 lg:px-10";

/* -------------------------------------------------------------------------- */
/*                               Pure helpers                                 */
/* -------------------------------------------------------------------------- */

type ClassValue = string | false | null | undefined;

/** Joins truthy class names. Swap in your `cn`/`clsx` if you already have one. */
function cx(...classes: ClassValue[]): string {
    return classes.filter(Boolean).join(" ");
}

/** True for `/admin` and `/admin/...`, but not for prefixes like `/administrator`. */
function isSectionPath(pathname: string, section: string): boolean {
    return pathname === section || pathname.startsWith(`${section}/`);
}

/** A workspace takes precedence over the route, as in the original. */
function getShellVariant({
    hasWorkspace,
    isAdminRoute,
}: {
    hasWorkspace: boolean;
    isAdminRoute: boolean;
}): ShellVariant {
    if (hasWorkspace) return "business";
    if (isAdminRoute) return "admin";
    return "platform";
}

/* -------------------------------------------------------------------------- */
/*                                    Hooks                                   */
/* -------------------------------------------------------------------------- */

/**
 * Owns the mobile navigation drawer. While open, it locks body scroll and
 * listens for Escape. It closes on route change and once the viewport reaches
 * the desktop breakpoint, where the sidebar is always visible.
 */
function useMobileNav(pathname: string) {
    const [isOpen, setIsOpen] = useState(false);
    const [lastPathname, setLastPathname] = useState(pathname);

    // Close on any route change (link click, back/forward, redirect). Adjusting
    // state during render is React's documented pattern for this. Unlike an
    // effect, it never commits a frame with the stale drawer still open.
    if (pathname !== lastPathname) {
        setLastPathname(pathname);
        setIsOpen(false);
    }

    useEffect(() => {
        if (!isOpen) return;

        const previousOverflow = document.body.style.overflow;
        const desktop = window.matchMedia(DESKTOP_MEDIA_QUERY);

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setIsOpen(false);
        };
        const handleBreakpoint = (event: MediaQueryListEvent) => {
            if (event.matches) setIsOpen(false);
        };

        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", handleKeyDown);
        desktop.addEventListener("change", handleBreakpoint);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleKeyDown);
            desktop.removeEventListener("change", handleBreakpoint);
        };
    }, [isOpen]);

    const close = useCallback(() => setIsOpen(false), []);
    const toggle = useCallback(() => setIsOpen((open) => !open), []);

    return { isOpen, close, toggle };
}

/* -------------------------------------------------------------------------- */
/*                               Shell pieces                                 */
/* -------------------------------------------------------------------------- */

/**
 * Decorative scrim. Keyboard users close the drawer with Escape or the header
 * toggle, so the scrim is hidden from assistive tech and removed from tab order.
 */
function MobileNavBackdrop({ onClick }: { onClick: () => void }) {
    return (
        <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            onClick={onClick}
            className="enterprise-sidebar-backdrop"
        />
    );
}

function SidebarFrame({
    isOpen,
    isCollapsed,
    onNavigate,
}: {
    isOpen: boolean;
    isCollapsed: boolean;
    onNavigate: () => void;
}) {
    return (
        <div
            className={cx(
                "enterprise-sidebar-frame",
                isOpen && "is-open",
                isCollapsed && "is-collapsed",
            )}
        >
            <EnterpriseSidebar onNavigate={onNavigate} collapsed={isCollapsed} />
        </div>
    );
}

/**
 * The live region stays mounted and only its contents change. Screen readers
 * announce updates inside an existing region more reliably than a region that
 * is inserted together with its content.
 */
function ShellToast({ message }: { message: string | null | undefined }) {
    return (
        <div role="status" className="fixed bottom-5 right-5 z-50">
            {message && (
                <div className="flex items-center gap-2 rounded-xl bg-[var(--workspace-green-deep)] px-4 py-3 text-sm font-semibold text-white shadow-xl">
                    <CheckCircle2
                        className="h-4 w-4 text-[var(--workspace-acid)]"
                        aria-hidden="true"
                    />
                    <span>{message}</span>
                </div>
            )}
        </div>
    );
}

function ShellOverlays({
    hasWorkspace,
    toastMessage,
}: {
    hasWorkspace: boolean;
    toastMessage: string | null | undefined;
}) {
    return (
        <>
            {hasWorkspace ? <BusinessCommandPalette /> : <GlobalCommandPalette />}
            <EscalationDialog />
            <ResolutionDialog />
            <ShellToast message={toastMessage} />
        </>
    );
}

/* -------------------------------------------------------------------------- */
/*                                   Layout                                   */
/* -------------------------------------------------------------------------- */

function EnterpriseShellLayout({ children }: { children: ReactNode }) {
    const { toastMessage } = useEnterprise();
    const workspace = useOptionalBusinessWorkspace();
    const pathname = usePathname();

    const mobileNav = useMobileNav(pathname);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const toggleSidebar = useCallback(
        () => setSidebarCollapsed((collapsed) => !collapsed),
        [],
    );

    const hasWorkspace = Boolean(workspace);
    // The collapse preference only exists inside the business workspace.
    const isSidebarCollapsed = hasWorkspace && sidebarCollapsed;
    const isBusinessDashboard =
        hasWorkspace && pathname === BUSINESS_DASHBOARD_PATH;
    const variant = getShellVariant({
        hasWorkspace,
        isAdminRoute: isSectionPath(pathname, ADMIN_ROOT),
    });

    return (
        <div
            className={cx(
                SHELL_CLASSES[variant],
                isBusinessDashboard && "business-dashboard-shell",
            )}
        >
            {mobileNav.isOpen && <MobileNavBackdrop onClick={mobileNav.close} />}

            <SidebarFrame
                isOpen={mobileNav.isOpen}
                isCollapsed={isSidebarCollapsed}
                onNavigate={mobileNav.close}
            />

            <div className="flex min-h-screen min-w-0 flex-1 flex-col">
                <EnterpriseHeader
                    onMenuClick={mobileNav.toggle}
                    mobileMenuOpen={mobileNav.isOpen}
                    onToggleSidebar={hasWorkspace ? toggleSidebar : undefined}
                    sidebarCollapsed={isSidebarCollapsed}
                />
                <main
                    id="main-content"
                    className={cx(
                        MAIN_CLASSES,
                        isBusinessDashboard && "business-dashboard-main",
                    )}
                >
                    {children}
                </main>
            </div>

            <ShellOverlays hasWorkspace={hasWorkspace} toastMessage={toastMessage} />
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*                                Entry point                                 */
/* -------------------------------------------------------------------------- */

export function EnterpriseShell({ children }: { children: ReactNode }) {
    return (
        <EnterpriseProvider>
            <EnterpriseShellLayout>{children}</EnterpriseShellLayout>
        </EnterpriseProvider>
    );
}

export default EnterpriseShell;