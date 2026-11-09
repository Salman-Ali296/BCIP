"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import "@/app/(business)/business-workspace.css";
import "@/app/(admin)/admin-portal.css";
import { EnterpriseProvider, useEnterprise } from "../context/enterprise-context";
import { EnterpriseHeader } from "./enterprise-header";
import { EnterpriseSidebar } from "./enterprise-sidebar";
import { GlobalCommandPalette } from "./global-command-palette";
import { EscalationDialog } from "./escalation-dialog";
import { ResolutionDialog } from "./resolution-dialog";
import { useOptionalBusinessWorkspace } from "@/features/business-trial/context/business-workspace-context";

function EnterpriseShellInner({ children }: { children: ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { toastMessage } = useEnterprise();
    const workspace = useOptionalBusinessWorkspace();
    const pathname = usePathname();
    const isAdmin = pathname.startsWith("/admin");

    return (
        <div
            className={
                workspace
                    ? "business-shell min-h-screen md:flex"
                    : isAdmin
                      ? "admin-portal min-h-screen md:flex"
                    : "min-h-screen bg-[#f8fafc] text-slate-900 md:flex"
            }
        >
            {sidebarOpen && (
                <button
                    type="button"
                    aria-label="Close navigation"
                    className="fixed inset-0 z-40 bg-black/45 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div
                className={`fixed inset-y-0 left-0 z-50 w-72 transition-transform duration-200 md:sticky md:top-0 md:h-screen md:translate-x-0 ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <EnterpriseSidebar onNavigate={() => setSidebarOpen(false)} />
            </div>

            <div className="flex min-h-screen min-w-0 flex-1 flex-col">
                <EnterpriseHeader onMenuClick={() => setSidebarOpen(true)} />
                <main
                    id="main-content"
                    className="mx-auto w-full max-w-[1500px] flex-1 px-4 py-6 sm:px-7 sm:py-8 lg:px-10"
                >
                    {children}
                </main>
            </div>

            <GlobalCommandPalette />
            <EscalationDialog />
            <ResolutionDialog />

            {toastMessage && (
                <div
                    role="status"
                    className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-[var(--workspace-green-deep)] px-4 py-3 text-sm font-semibold text-white shadow-xl"
                >
                    <CheckCircle2 className="h-4 w-4 text-[var(--workspace-acid)]" />
                    <span>{toastMessage}</span>
                </div>
            )}
        </div>
    );
}

export function EnterpriseShell({ children }: { children: ReactNode }) {
    return (
        <EnterpriseProvider>
            <EnterpriseShellInner>{children}</EnterpriseShellInner>
        </EnterpriseProvider>
    );
}

export default EnterpriseShell;
