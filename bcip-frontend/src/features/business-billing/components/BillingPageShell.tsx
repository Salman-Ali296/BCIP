import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { HelpdeskLogo } from "@/components/brand/helpdesk-logo";

interface BillingPageShellProps {
    children: ReactNode;
    backHref?: string;
    backLabel?: string;
    aside?: ReactNode;
}

/** Landing-page frame (white + lilac, plum ink, violet accent) shared by pricing and checkout pages. */
export function BillingPageShell({ children, backHref, backLabel, aside }: BillingPageShellProps) {
    return (
        <div className="relative min-h-screen overflow-hidden bg-wash text-ink antialiased">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-56 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-brand-glow/20 blur-[140px]"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-line-strong to-transparent"
            />
            <header className="relative border-b border-line">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
                    <div className="flex items-center gap-5">
                        <Link href="/" aria-label="BCIP home">
                            <HelpdeskLogo size="sm" theme="light" />
                        </Link>
                        {backHref && (
                            <Link
                                href={backHref}
                                className="hidden items-center gap-1.5 border-l border-line pl-5 text-sm font-medium text-muted transition hover:text-ink sm:inline-flex"
                            >
                                <ArrowLeft size={14} aria-hidden="true" />
                                {backLabel ?? "Back"}
                            </Link>
                        )}
                    </div>
                    {aside ?? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-subtle">
                            <LockKeyhole size={13} aria-hidden="true" /> Secure billing
                        </span>
                    )}
                </div>
            </header>
            <main className="relative mx-auto max-w-7xl px-5 pb-24 pt-12 sm:px-8 sm:pt-16">{children}</main>
        </div>
    );
}

export function Eyebrow({ children }: { children: ReactNode }) {
    return (
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-soft bg-lilac px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" />
            {children}
        </span>
    );
}

export function Notice({
    tone = "info",
    children,
}: {
    tone?: "info" | "success" | "error";
    children: ReactNode;
}) {
    const styles = {
        info: "border-line bg-wash text-ink-soft",
        success: "border-brand-soft bg-lilac text-brand-strong",
        error: "border-rose-200 bg-rose-50 text-rose-800",
    }[tone];
    return (
        <div role={tone === "error" ? "alert" : "status"} className={`rounded-2xl border px-5 py-4 text-sm leading-6 ${styles}`}>
            {children}
        </div>
    );
}
