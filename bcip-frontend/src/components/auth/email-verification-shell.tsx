import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, MailCheck, ShieldCheck } from "lucide-react";

import { HelpdeskLogo } from "@/components/brand/helpdesk-logo";

interface EmailVerificationShellProps {
    heading: ReactNode;
    description: string;
    children: ReactNode;
}

const STEPS = [
    "Request a 6-digit code",
    "Enter the code from your inbox",
    "Return to sign in",
];

export function EmailVerificationShell({
    heading,
    description,
    children,
}: EmailVerificationShellProps) {
    return (
        <main id="main-content" className="landing-page-shell flex min-h-[calc(100dvh-32px)] flex-col">
            <header className="flex h-[72px] items-center justify-between gap-4 border-b border-[var(--landing-border)] bg-white/95 px-5 sm:px-8">
                <Link
                    href="/"
                    aria-label="BCIP Helpdesk home"
                className="rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--landing-violet)]"
                >
                    <HelpdeskLogo size="md" theme="light" />
                </Link>

                <Link
                    href="/login"
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold text-[var(--landing-muted)] transition hover:bg-[var(--landing-wash)] hover:text-[var(--landing-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-violet)] sm:px-3 sm:text-sm"
                >
                    <span className="hidden sm:inline">Already verified?</span>
                    <span>Sign in</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
            </header>

            <div className="relative flex flex-1 items-center overflow-hidden bg-white px-5 py-10 sm:px-8 sm:py-14 lg:px-14">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -left-24 -top-28 h-80 w-80 rounded-full bg-[var(--landing-lilac)] opacity-80 blur-3xl"
                />

                <div className="relative mx-auto grid w-full max-w-[1080px] items-center gap-10 lg:grid-cols-[1fr_0.88fr] lg:gap-16">
                    <section className="max-w-xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--landing-border)] bg-[var(--landing-wash)] px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--landing-violet)] sm:text-xs">
                            <MailCheck className="h-3.5 w-3.5" aria-hidden="true" />
                            Secure account setup
                        </div>

                        <h1 className="mt-6 text-4xl font-semibold leading-[1.08] tracking-[-0.045em] text-[var(--landing-ink)] sm:text-5xl">
                            {heading}
                        </h1>

                        <p className="mt-5 max-w-lg text-sm leading-7 text-[var(--landing-muted)] sm:text-base">
                            {description}
                        </p>

                        <ol className="mt-8 space-y-4">
                            {STEPS.map((step, index) => (
                                <li key={step} className="flex items-center gap-3 text-sm text-[#514961]">
                                    <span
                                        aria-hidden="true"
                                        className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[var(--landing-border)] bg-white text-[10px] font-bold text-[var(--landing-violet)]"
                                    >
                                        {index + 1}
                                    </span>
                                    <span className="text-[var(--landing-ink)]">{step}</span>
                                </li>
                            ))}
                        </ol>
                    </section>

                    <section
                        aria-label="Email verification"
                        className="w-full rounded-3xl border border-[var(--landing-border)] bg-white p-6 shadow-[0_24px_70px_rgba(32,18,57,0.1)] sm:p-8"
                    >
                        {children}
                    </section>
                </div>
            </div>

            <footer className="flex items-center justify-center gap-2 border-t border-[var(--landing-border)] bg-[var(--landing-wash)] px-5 py-4 text-center text-[11px] leading-5 text-[var(--landing-muted)] sm:text-xs">
                <ShieldCheck className="h-4 w-4 shrink-0 text-[var(--landing-violet)]" aria-hidden="true" />
                <span>For privacy, verification responses don’t reveal whether an account is registered.</span>
            </footer>
        </main>
    );
}
