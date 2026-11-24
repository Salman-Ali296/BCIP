"use client";

import Link from "next/link";
import {
    useEffect,
    useId,
    useRef,
    useState,
    type RefObject,
} from "react";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
    ArrowRight,
    ArrowUpRight,
    Bell,
    ChevronDown,
    Headset,
    LogOut,
    Menu,
    PanelLeftClose,
    PanelLeftOpen,
    Search,
    Settings2,
    X,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useOptionalBusinessWorkspace } from "@/features/business-trial/context/business-workspace-context";
import {
    businessDashboardQueryKey,
    getBusinessDashboard,
    type BusinessDashboardData,
} from "@/lib/api/business-dashboard";
import {
    formatDashboardDate,
    formatDashboardStatus,
} from "@/features/business-dashboard/components/dashboard-widgets";
import { useEnterprise } from "../context/enterprise-context";

/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */

type AuthUser = ReturnType<typeof useAuth>["user"];
type DashboardFilters = Parameters<typeof getBusinessDashboard>[0];
type AttentionItem = BusinessDashboardData["attention"][number];

interface EnterpriseHeaderProps {
    onMenuClick?: () => void;
    mobileMenuOpen?: boolean;
    onToggleSidebar?: () => void;
    sidebarCollapsed?: boolean;
}

interface NavProps {
    mobileMenuOpen: boolean;
    onMenuClick?: () => void;
    onToggleSidebar?: () => void;
    sidebarCollapsed: boolean;
}

interface HeaderStyles {
    header: string;
    row: string;
    start: string;
    end: string;
    iconButton: string;
    menuIconSize: number;
    searchIconSize: number;
    search: { button: string; label: string; kbd: string };
}

/* -------------------------------------------------------------------------- */
/*                                  Constants                                 */
/* -------------------------------------------------------------------------- */

const ATTENTION_LIMIT = 8;
const ATTENTION_FILTERS: DashboardFilters = {
    range: "30d",
    grouping: "day",
    page: 1,
};

const DEFAULT_PAGE_TITLE = "Overview";

/**
 * Ordered route → title map. Matching is segment-aware, so "/business/team"
 * no longer accidentally matches "/business/teams".
 */
const ROUTE_TITLES: ReadonlyArray<readonly [prefix: string, title: string]> = [
    ["/admin/organizations", "Organizations"],
    ["/admin/business-units", "Business units"],
    ["/admin/users", "User directory"],
    ["/admin/roles", "Roles & permissions"],
    ["/admin/sla-policies", "SLA policies"],
    ["/admin/security", "Security"],
    ["/admin/audit-logs", "Audit logs"],
    ["/admin/settings", "Platform settings"],
    ["/admin", "Platform overview"],
    ["/business/inbox", "Inbox"],
    ["/business/complaints", "Complaints"],
    ["/business/analytics", "Analytics"],
    ["/business/trends", "Trends"],
    ["/business/reports", "Reports"],
    ["/business/customers", "Customers"],
    ["/business/teams", "Teams"],
    ["/business/team", "Team"],
    ["/business/employees", "People"],
    ["/business/escalations", "Escalations"],
    ["/business/knowledge", "Knowledge"],
    ["/business/settings", "Workspace settings"],
    ["/business/billing", "Plan & billing"],
    ["/business/categories", "Categories"],
];

/** Visual tokens for the two header skins. Behavior is identical across both. */
const WORKSPACE_STYLES: HeaderStyles = {
    header:
        "enterprise-header sticky top-0 z-30 border-b border-[var(--workspace-line)] bg-[var(--workspace-card)]/95 backdrop-blur",
    row: "flex min-h-[4.25rem] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8",
    start: "flex min-w-0 items-center gap-2.5",
    end: "flex shrink-0 items-center gap-1.5 sm:gap-2",
    iconButton: "enterprise-header-icon-button",
    menuIconSize: 18,
    searchIconSize: 16,
    search: {
        button: "enterprise-header-search",
        label: "hidden sm:inline",
        kbd: "hidden lg:inline",
    },
};

const PLATFORM_STYLES: HeaderStyles = {
    header:
        "sticky top-0 z-30 border-b border-slate-200/90 bg-white/95 backdrop-blur",
    row: "flex min-h-[4.75rem] items-center justify-between gap-4 px-4 sm:px-7 lg:px-10",
    start: "flex min-w-0 items-center gap-3",
    end: "flex items-center gap-2 sm:gap-3",
    iconButton:
        "grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-50",
    menuIconSize: 19,
    searchIconSize: 15,
    search: {
        button:
            "hidden min-h-10 min-w-48 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-left text-xs text-slate-400 transition hover:border-slate-300 md:flex lg:min-w-64",
        label: "flex-1",
        kbd: "rounded-md border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px]",
    },
};

/* -------------------------------------------------------------------------- */
/*                               Pure helpers                                 */
/* -------------------------------------------------------------------------- */

function matchesRoute(pathname: string, prefix: string): boolean {
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function getPageTitle(pathname: string): string {
    return (
        ROUTE_TITLES.find(([prefix]) => matchesRoute(pathname, prefix))?.[1] ??
        DEFAULT_PAGE_TITLE
    );
}

/** Up to two initials, Unicode-safe. Returns "" when nothing usable exists. */
export function getInitials(name: string): string {
    return name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => Array.from(part)[0] ?? "")
        .join("")
        .toUpperCase();
}

function formatAttentionCount(count: number): string {
    return count >= ATTENTION_LIMIT ? `${ATTENTION_LIMIT}+` : String(count);
}

/* -------------------------------------------------------------------------- */
/*                                    Hooks                                   */
/* -------------------------------------------------------------------------- */

function useAttentionCases(workspaceName: string) {
    const query = useQuery({
        queryKey: businessDashboardQueryKey(workspaceName, ATTENTION_FILTERS),
        queryFn: () => getBusinessDashboard(ATTENTION_FILTERS),
        staleTime: 30_000,
    });

    const items: AttentionItem[] = query.data?.attention ?? [];

    return {
        query,
        items,
        countLabel: formatAttentionCount(items.length),
    };
}

/**
 * Closes a popover when the user clicks outside `ref` or presses Escape.
 * `setOpen` must be a stable setter (e.g. from useState) to avoid re-subscribing.
 */
function useDismissOnOutsideOrEscape(
    ref: RefObject<HTMLElement | null>,
    isOpen: boolean,
    setOpen: (open: boolean) => void,
) {
    useEffect(() => {
        if (!isOpen) return;

        function handlePointerDown(event: MouseEvent) {
            const target = event.target;
            if (target instanceof Node && ref.current && !ref.current.contains(target)) {
                setOpen(false);
            }
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") setOpen(false);
        }

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [ref, isOpen, setOpen]);
}

/* -------------------------------------------------------------------------- */
/*                               Shared pieces                                */
/* -------------------------------------------------------------------------- */

function NavControls({
    styles,
    mobileMenuOpen,
    onMenuClick,
    onToggleSidebar,
    sidebarCollapsed,
}: NavProps & { styles: HeaderStyles }) {
    const menuLabel = mobileMenuOpen ? "Close navigation" : "Open navigation";
    const sidebarLabel = sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar";

    return (
        <>
            <button
                type="button"
                onClick={onMenuClick}
                className={`${styles.iconButton} md:hidden`}
                aria-label={menuLabel}
                aria-expanded={mobileMenuOpen}
            >
                {mobileMenuOpen ? (
                    <X size={styles.menuIconSize} aria-hidden="true" />
                ) : (
                    <Menu size={styles.menuIconSize} aria-hidden="true" />
                )}
            </button>

            {onToggleSidebar && (
                <button
                    type="button"
                    onClick={onToggleSidebar}
                    className={`${styles.iconButton} hidden md:grid`}
                    aria-label={sidebarLabel}
                    title={sidebarLabel}
                >
                    {sidebarCollapsed ? (
                        <PanelLeftOpen size={17} aria-hidden="true" />
                    ) : (
                        <PanelLeftClose size={17} aria-hidden="true" />
                    )}
                </button>
            )}
        </>
    );
}

function SearchButton({
    styles,
    label,
    onOpen,
}: {
    styles: HeaderStyles;
    label: string;
    onOpen: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onOpen}
            className={styles.search.button}
            aria-label="Search the workspace"
        >
            <Search size={styles.searchIconSize} aria-hidden="true" />
            <span className={styles.search.label}>{label}</span>
            <kbd className={styles.search.kbd}>Ctrl K</kbd>
        </button>
    );
}

/* -------------------------------------------------------------------------- */
/*                           Workspace-only widgets                           */
/* -------------------------------------------------------------------------- */

function AttentionPanelBody({
    isPending,
    isError,
    hasData,
    items,
    onRetry,
    onNavigate,
}: {
    isPending: boolean;
    isError: boolean;
    hasData: boolean;
    items: AttentionItem[];
    onRetry: () => void;
    onNavigate: () => void;
}) {
    if (isPending && !hasData) {
        return (
            <p className="p-4 text-sm text-[var(--workspace-muted)]" role="status">
                Loading priority cases…
            </p>
        );
    }

    if (isError && !hasData) {
        return (
            <div className="p-4 text-sm" role="alert">
                <p className="text-[var(--workspace-muted)]">
                    Priority cases could not be loaded.
                </p>
                <button
                    type="button"
                    className="business-dashboard-text-link mt-2"
                    onClick={onRetry}
                >
                    Try again
                </button>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <p className="p-4 text-sm text-[var(--workspace-muted)]">
                No active cases need attention.
            </p>
        );
    }

    return (
        <ul className="max-h-[min(60vh,26rem)] overflow-y-auto p-2">
            {items.map((item) => (
                <li key={item.id}>
                    <Link
                        href={`/business/complaints/${encodeURIComponent(item.id)}`}
                        onClick={onNavigate}
                        className="business-alert-item"
                    >
                        <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold">
                                {item.title}
                            </span>
                            <span className="mt-1 block truncate text-xs text-[var(--workspace-muted)]">
                                {item.trackingId} · {formatDashboardStatus(item.status)} ·{" "}
                                {formatDashboardDate(item.createdAt)}
                            </span>
                        </span>
                        <ArrowUpRight size={14} aria-hidden="true" />
                    </Link>
                </li>
            ))}
        </ul>
    );
}

function AttentionMenu({
    workspaceName,
    styles,
}: {
    workspaceName: string;
    styles: HeaderStyles;
}) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const panelId = useId();
    const { query, items, countLabel } = useAttentionCases(workspaceName);

    useDismissOnOutsideOrEscape(containerRef, open, setOpen);

    const close = () => setOpen(false);
    const hasItems = items.length > 0;

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                className={`${styles.iconButton} relative ${hasItems ? "has-attention" : ""}`}
                aria-label={
                    query.isError && !query.data
                        ? "Cases needing attention, unavailable"
                        : `Cases needing attention, ${countLabel} active cases`
                }
                aria-expanded={open}
                aria-haspopup="dialog"
                aria-controls={open ? panelId : undefined}
                title="Cases needing attention"
            >
                <Bell size={17} aria-hidden="true" />
                {hasItems && (
                    <span className="enterprise-alert-count" aria-hidden="true">
                        {countLabel}
                    </span>
                )}
            </button>

            {open && (
                <div
                    id={panelId}
                    role="dialog"
                    aria-label="Cases needing attention"
                    className="enterprise-header-popover business-alert-popover"
                >
                    <div className="flex items-start justify-between gap-3 border-b border-[var(--workspace-line)] p-4">
                        <div>
                            <h2 className="text-sm font-bold">Cases needing attention</h2>
                            <p className="mt-1 text-xs text-[var(--workspace-muted)]">
                                Active priority cases from your workspace
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={close}
                            className="enterprise-header-icon-button h-8 w-8"
                            aria-label="Close attention panel"
                        >
                            <X size={15} aria-hidden="true" />
                        </button>
                    </div>

                    <AttentionPanelBody
                        isPending={query.isPending}
                        isError={query.isError}
                        hasData={query.data !== undefined}
                        items={items}
                        onRetry={() => void query.refetch()}
                        onNavigate={close}
                    />

                    <Link
                        href="/business/inbox"
                        onClick={close}
                        className="flex items-center justify-between border-t border-[var(--workspace-line)] px-4 py-3 text-xs font-bold text-[var(--workspace-accent-strong)]"
                    >
                        Open complaint inbox <ArrowRight size={14} aria-hidden="true" />
                    </Link>
                </div>
            )}
        </div>
    );
}

function ProfileMenu({
    user,
    workspaceName,
    initials,
    onLogout,
}: {
    user: AuthUser;
    workspaceName: string;
    initials: string;
    onLogout: () => void;
}) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const panelId = useId();

    useDismissOnOutsideOrEscape(containerRef, open, setOpen);

    const close = () => setOpen(false);
    const displayName = user?.fullName ?? "Workspace account";

    return (
        <div className="relative" ref={containerRef}>
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                className="enterprise-profile-trigger"
                aria-label="Open account controls"
                aria-expanded={open}
                aria-haspopup="menu"
                aria-controls={open ? panelId : undefined}
            >
                <span className="enterprise-profile-avatar">{initials}</span>
                <span className="hidden min-w-0 text-left lg:block">
                    <span className="block max-w-32 truncate text-xs font-bold">
                        {displayName}
                    </span>
                    <span className="block max-w-32 truncate text-[10px] text-[var(--workspace-muted)]">
                        {user?.email ?? "Business owner"}
                    </span>
                </span>
                <ChevronDown
                    size={14}
                    className="hidden text-[var(--workspace-muted)] lg:block"
                    aria-hidden="true"
                />
            </button>

            {open && (
                <div
                    id={panelId}
                    className="enterprise-header-popover enterprise-profile-popover"
                >
                    <div className="border-b border-[var(--workspace-line)] px-4 py-3">
                        <p className="truncate text-sm font-bold">{displayName}</p>
                        <p className="mt-1 truncate text-xs text-[var(--workspace-muted)]">
                            {user?.email ?? workspaceName}
                        </p>
                    </div>

                    <Link href="/business/settings" onClick={close} className="enterprise-profile-link">
                        <Settings2 size={15} aria-hidden="true" /> Workspace settings
                    </Link>
                    <Link href="/business/billing" onClick={close} className="enterprise-profile-link">
                        <ArrowUpRight size={15} aria-hidden="true" /> Plan & billing
                    </Link>
                    <Link href="/support" onClick={close} className="enterprise-profile-link">
                        <Headset size={15} aria-hidden="true" /> Help & support
                    </Link>

                    <button
                        type="button"
                        onClick={() => {
                            close();
                            onLogout();
                        }}
                        className="enterprise-profile-link is-danger"
                    >
                        <LogOut size={15} aria-hidden="true" /> Sign out
                    </button>
                </div>
            )}
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*                                  Header bars                               */
/* -------------------------------------------------------------------------- */

function WorkspaceHeaderBar({
    workspaceName,
    pageTitle,
    nav,
    searchLabel,
    onOpenSearch,
    initials,
    user,
    onLogout,
}: {
    workspaceName: string;
    pageTitle: string;
    nav: NavProps;
    searchLabel: string;
    onOpenSearch: () => void;
    initials: string;
    user: AuthUser;
    onLogout: () => void;
}) {
    const styles = WORKSPACE_STYLES;

    return (
        <header className={styles.header}>
            <div className={styles.row}>
                <div className={styles.start}>
                    <NavControls styles={styles} {...nav} />

                    <nav className="min-w-0" aria-label="Breadcrumb">
                        <ol className="flex min-w-0 items-center gap-2 text-sm">
                            <li className="hidden min-w-0 items-center gap-2 text-xs text-[var(--workspace-muted)] sm:flex">
                                <span className="max-w-40 truncate">{workspaceName}</span>
                                <span aria-hidden="true">/</span>
                            </li>
                            <li
                                aria-current="page"
                                className="truncate font-semibold text-[var(--workspace-ink)]"
                            >
                                {pageTitle}
                            </li>
                        </ol>
                    </nav>
                </div>

                <div className={styles.end}>
                    <SearchButton styles={styles} label={searchLabel} onOpen={onOpenSearch} />

                    <AttentionMenu workspaceName={workspaceName} styles={styles} />

                    <Link
                        href="/support"
                        className="enterprise-header-icon-button hidden sm:grid"
                        aria-label="Help and support"
                        title="Help and support"
                    >
                        <Headset size={17} aria-hidden="true" />
                    </Link>

                    <ProfileMenu
                        user={user}
                        workspaceName={workspaceName}
                        initials={initials}
                        onLogout={onLogout}
                    />
                </div>
            </div>
        </header>
    );
}

function PlatformHeaderBar({
    isAdmin,
    pageTitle,
    nav,
    searchLabel,
    onOpenSearch,
    initials,
    user,
}: {
    isAdmin: boolean;
    pageTitle: string;
    nav: NavProps;
    searchLabel: string;
    onOpenSearch: () => void;
    initials: string;
    user: AuthUser;
}) {
    const styles = PLATFORM_STYLES;

    return (
        <header className={styles.header}>
            <div className={styles.row}>
                <div className={styles.start}>
                    <NavControls styles={styles} {...nav} />

                    <div className="min-w-0">
                        <p className="hidden text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 sm:block">
                            {isAdmin ? "Platform control" : "BCIP workspace"}
                        </p>
                        <h2 className="truncate text-base font-bold text-slate-900">
                            {pageTitle}
                        </h2>
                    </div>
                </div>

                <div className={styles.end}>
                    <SearchButton styles={styles} label={searchLabel} onOpen={onOpenSearch} />

                    <span
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-900 text-xs font-extrabold text-white"
                        aria-label={user?.fullName ?? "Workspace user"}
                        title={user?.fullName ?? "Workspace user"}
                    >
                        {initials}
                    </span>
                </div>
            </div>
        </header>
    );
}

/* -------------------------------------------------------------------------- */
/*                                  Entry point                               */
/* -------------------------------------------------------------------------- */

export function EnterpriseHeader({
    onMenuClick,
    mobileMenuOpen = false,
    onToggleSidebar,
    sidebarCollapsed = false,
}: EnterpriseHeaderProps) {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const { setCommandPaletteOpen } = useEnterprise();
    const workspace = useOptionalBusinessWorkspace();

    const isAdmin = pathname.startsWith("/admin");
    const pageTitle = getPageTitle(pathname);
    const initials =
        getInitials(user?.fullName ?? workspace?.businessName ?? "Workspace") || "BO";

    const searchLabel = isAdmin
        ? "Find an organization or user"
        : workspace
            ? "Search complaints"
            : "Find a complaint or customer";

    const nav: NavProps = {
        mobileMenuOpen,
        onMenuClick,
        onToggleSidebar,
        sidebarCollapsed,
    };

    const openSearch = () => setCommandPaletteOpen(true);
    const handleLogout = () => void logout();

    if (workspace) {
        return (
            <WorkspaceHeaderBar
                workspaceName={workspace.businessName}
                pageTitle={pageTitle}
                nav={nav}
                searchLabel={searchLabel}
                onOpenSearch={openSearch}
                initials={initials}
                user={user}
                onLogout={handleLogout}
            />
        );
    }

    return (
        <PlatformHeaderBar
            isAdmin={isAdmin}
            pageTitle={pageTitle}
            nav={nav}
            searchLabel={searchLabel}
            onOpenSearch={openSearch}
            initials={initials}
            user={user}
        />
    );
}