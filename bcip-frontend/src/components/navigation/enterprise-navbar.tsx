"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HelpdeskLogo } from "@/components/brand/helpdesk-logo";
import {
    ChevronDown,
    LayoutDashboard,
    LogOut,
    Menu,
    Search,
    X,
} from "lucide-react";

import { useAuth } from "@/providers/auth-provider";
import { CommandPalette } from "./command-palette";

export function EnterpriseNavbar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const [mobileOpen, setMobileOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

    // Hide navbar on third-party embeds
    if (pathname?.startsWith("/embed")) return null;

    // Global shortcut listener for Command / Ctrl + K
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                setCommandPaletteOpen((prev) => !prev);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Exact Enterprise Navigation links as specified
    const navItems = [
        {
            label: "Track Complaint",
            href: "/support/track",
            active: pathname.startsWith("/support/track") || pathname.startsWith("/complaint/track"),
        },
        {
            label: "Submit Complaint",
            href: "/complaint/new",
            active: pathname.startsWith("/complaint/new"),
        },
        {
            label: "Business Platform",
            href: "/business/dashboard",
            active: pathname.startsWith("/business"),
        },
        {
            label: "Support",
            href: "/support",
            active: pathname === "/support" || pathname.startsWith("/support/report"),
        },
    ];

    return (
        <>
            {/* Enterprise Clean Navbar Container */}
            <header className="sticky top-0 z-50 w-full px-3 sm:px-6 py-3">
                <nav
                    className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#0c1524]/90 px-4 sm:px-6 shadow-xl backdrop-blur-md"
                    aria-label="Enterprise Navigation"
                >
                    {/* Left: Brand Logo & Title */}
                    <Link
                        href="/"
                        className="flex items-center gap-3 shrink-0 group"
                    >
                        <HelpdeskLogo size="md" showText={true} theme="dark" />
                    </Link>

                    {/* Center: Navigation Links (Clean, No Wrapping) */}
                    <div className="hidden md:flex items-center gap-1 lg:gap-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`rounded-lg px-3 py-1.5 text-xs lg:text-sm font-semibold transition whitespace-nowrap ${
                                    item.active
                                        ? "bg-white/10 text-white font-bold"
                                        : "text-slate-300 hover:text-white hover:bg-white/5"
                                }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right: Actions & User Menu */}
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        {/* Command Palette Trigger */}
                        <button
                            onClick={() => setCommandPaletteOpen(true)}
                            className="hidden sm:grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
                            aria-label="Search"
                            title="Quick search (⌘K)"
                        >
                            <Search className="h-3.5 w-3.5" />
                        </button>

                        {user ? (
                            /* Logged In User Pill */
                            <div className="relative">
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center gap-2 rounded-lg bg-white/10 border border-white/15 px-3 py-1.5 text-xs text-white hover:bg-white/15 transition cursor-pointer"
                                >
                                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="max-w-[120px] sm:max-w-[150px] truncate font-medium">
                                        {user.email || user.fullName || "My Account"}
                                    </span>
                                    <ChevronDown className="h-3 w-3 text-slate-400" />
                                </button>

                                {userMenuOpen && (
                                    <div
                                        className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-white/15 bg-[#0a1120] p-2 shadow-2xl z-50 text-white backdrop-blur-xl"
                                        onMouseLeave={() => setUserMenuOpen(false)}
                                    >
                                        <div className="border-b border-white/10 p-2.5">
                                            <p className="text-xs font-bold text-white truncate">
                                                {user.fullName || "Account Member"}
                                            </p>
                                            <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                                {user.email}
                                            </p>
                                        </div>

                                        <div className="py-1">
                                            <Link
                                                href={
                                                    user.role === "SUPER_ADMIN"
                                                        ? "/admin/dashboard"
                                                        : "/business/dashboard"
                                                }
                                                onClick={() => setUserMenuOpen(false)}
                                                className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 cursor-pointer"
                                            >
                                                <LayoutDashboard className="h-3.5 w-3.5 text-blue-400" />
                                                Workspace Dashboard
                                            </Link>
                                        </div>

                                        <div className="border-t border-white/10 pt-1">
                                            <button
                                                onClick={() => {
                                                    setUserMenuOpen(false);
                                                    logout();
                                                }}
                                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                                            >
                                                <LogOut className="h-3.5 w-3.5" />
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Guest CTAs: Sign In + Get Started */
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/login"
                                    className="rounded-lg px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/signup"
                                    className="rounded-lg bg-[#2454d6] hover:bg-[#1b43b4] text-white px-3.5 py-1.5 text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition whitespace-nowrap"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="md:hidden grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
                            aria-label="Toggle navigation menu"
                        >
                            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                        </button>
                    </div>
                </nav>
            </header>

            {/* Responsive Mobile Drawer */}
            {mobileOpen && (
                <div className="fixed top-16 inset-x-3 z-50 mx-auto max-w-sm rounded-2xl bg-[#0c1524] border border-white/15 p-4 shadow-2xl backdrop-blur-2xl md:hidden text-white">
                    <div className="space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className={`block rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
                                    item.active
                                        ? "bg-white/15 text-white"
                                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                                }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    <div className="mt-3 pt-3 border-t border-white/10">
                        {user ? (
                            <button
                                onClick={() => {
                                    setMobileOpen(false);
                                    logout();
                                }}
                                className="w-full flex items-center justify-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 py-2 text-xs font-bold text-rose-300"
                            >
                                <LogOut className="h-3.5 w-3.5" />
                                Sign Out
                            </button>
                        ) : (
                            <div className="grid grid-cols-2 gap-2">
                                <Link
                                    href="/login"
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center justify-center rounded-lg border border-white/15 py-2 text-xs font-bold text-white hover:bg-white/5"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/signup"
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center justify-center rounded-lg bg-[#2454d6] text-white py-2 text-xs font-bold hover:bg-[#1b43b4]"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <CommandPalette
                isOpen={commandPaletteOpen}
                onClose={() => setCommandPaletteOpen(false)}
            />
        </>
    );
}
