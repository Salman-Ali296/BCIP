"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getRoleHome, useAuth } from "@/providers/auth-provider";

interface CustomerShellProps {
    children: ReactNode;
}

export function CustomerShell({ children }: CustomerShellProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, status, error, refreshSession } = useAuth();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.replace(`/login?returnTo=${encodeURIComponent(pathname)}`);
        } else if (status === "authenticated" && user?.role !== "CUSTOMER") {
            router.replace(getRoleHome(user?.role));
        }
    }, [pathname, router, status, user]);

    if (status === "error") {
        return (
            <main className="customer-portal grid min-h-screen place-items-center px-6">
                <div className="max-w-md text-center">
                    <p className="text-sm text-slate-600" role="alert">{error}</p>
                    <button
                        type="button"
                        onClick={() => void refreshSession()}
                    className="mt-4 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
                    >
                        Retry session check
                    </button>
                </div>
            </main>
        );
    }

    if (status !== "authenticated" || user?.role !== "CUSTOMER") {
        return (
            <div className="customer-portal grid min-h-screen place-items-center" role="status" aria-live="polite">
                <span className="h-11 w-11 animate-spin rounded-full border-[3px] border-emerald-400 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="customer-portal min-h-screen antialiased">
            <main className="mx-auto w-full max-w-7xl min-h-screen px-4 py-6 sm:px-8 sm:py-8 lg:px-10">
                    {children}
            </main>
        </div>
    );
}