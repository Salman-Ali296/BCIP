"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, LoaderCircle, ShieldCheck } from "lucide-react";
import {
    acceptBusinessInvitation,
    inspectBusinessInvitation,
} from "@/features/business-trial/api/business-onboarding-api";
import { ApiClientError } from "@/lib/api/client";

interface InvitationDetails {
    email: string;
    role: string;
    businessName: string;
    expiresAt: string;
}

function AcceptInvitationForm() {
    const searchParams = useSearchParams();
    const [token] = useState(() => searchParams.get("token") ?? "");
    const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
    const [fullName, setFullName] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(Boolean(token));
    const [submitting, setSubmitting] = useState(false);
    const [accepted, setAccepted] = useState(false);
    const [error, setError] = useState(
        token ? "" : "This invitation link is missing its invitation code.",
    );

    useEffect(() => {
        let current = true;
        if (window.location.search) {
            window.history.replaceState(window.history.state, "", window.location.pathname);
        }
        if (!token) {
            return;
        }
        inspectBusinessInvitation(token)
            .then((details) => {
                if (current) setInvitation(details);
            })
            .catch((requestError: unknown) => {
                if (!current) return;
                setError(
                    requestError instanceof ApiClientError && requestError.status === 404
                        ? "This invitation has expired or has already been used. Ask your business administrator for a new invitation."
                        : "We couldn’t verify this invitation. Please try again.",
                );
            })
            .finally(() => {
                if (current) setLoading(false);
            });
        return () => {
            current = false;
        };
    }, [token]);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!invitation || submitting || accepted) return;
        if (fullName.trim().length < 3) {
            setError("Enter your full name.");
            return;
        }
        if (password.length < 12) {
            setError("Choose a password with at least 12 characters.");
            return;
        }
        setSubmitting(true);
        setError("");
        try {
            await acceptBusinessInvitation({ token, fullName: fullName.trim(), password });
            setAccepted(true);
            setPassword("");
        } catch (requestError: unknown) {
            setError(
                requestError instanceof ApiClientError && requestError.status === 404
                    ? "This invitation has expired or has already been used."
                    : requestError instanceof ApiClientError && requestError.status === 409
                      ? "This invitation has already been accepted. Ask your business administrator for help."
                      : "We couldn’t accept this invitation. Please try again.",
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="business-flow grid min-h-screen place-items-center px-4 py-10 sm:px-7">
            <section className="business-card w-full max-w-xl p-6 sm:p-9">
                <span className="grid size-12 place-items-center rounded-2xl bg-[var(--workspace-green-wash)] text-[var(--workspace-green)]">
                    <ShieldCheck size={22} aria-hidden="true" />
                </span>
                <p className="business-eyebrow mt-6">BCIP business workspace</p>
                <h1 className="business-display mt-2 text-3xl">
                    {accepted ? "You’re on the team." : "Accept your invitation"}
                </h1>

                {loading ? (
                    <p className="mt-5 flex items-center gap-2 text-sm text-[var(--workspace-muted)]" role="status">
                        <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
                        Checking invitation…
                    </p>
                ) : accepted ? (
                    <>
                        <p className="mt-3 text-sm leading-6 text-[var(--workspace-muted)]">
                            Your account for {invitation?.businessName} is ready. Sign in with the invited email address to open your workspace.
                        </p>
                        <Link
                            href="/login"
                            className="business-button-primary mt-6"
                        >
                            Sign in to BCIP
                            <ArrowRight size={15} aria-hidden="true" />
                        </Link>
                    </>
                ) : invitation ? (
                    <>
                        <p className="mt-3 text-sm leading-6 text-[var(--workspace-muted)]">
                            You’ve been invited to join <strong>{invitation.businessName}</strong> as a {invitation.role.toLowerCase().replace(/_/g, " ")}.
                        </p>
                        <p className="mt-3 rounded-xl bg-[var(--workspace-paper)] p-3 text-sm">
                            Invitation for <strong>{invitation.email}</strong>
                        </p>
                        <p className="mt-2 text-xs text-[var(--workspace-muted)]">
                            Expires {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(invitation.expiresAt))}
                        </p>
                        <form onSubmit={submit} className="mt-6 space-y-4">
                            <div>
                                <label htmlFor="invited-full-name" className="text-sm font-semibold">Your full name</label>
                                <input
                                    id="invited-full-name"
                                    className="mt-2 w-full rounded-xl border border-[var(--workspace-line)] bg-white px-3.5 py-3 text-sm outline-none focus:border-[var(--workspace-green)]"
                                    required
                                    minLength={3}
                                    maxLength={120}
                                    autoComplete="name"
                                    value={fullName}
                                    onChange={(event) => setFullName(event.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="invited-password" className="text-sm font-semibold">Create a password</label>
                                <input
                                    id="invited-password"
                                    className="mt-2 w-full rounded-xl border border-[var(--workspace-line)] bg-white px-3.5 py-3 text-sm outline-none focus:border-[var(--workspace-green)]"
                                    required
                                    minLength={12}
                                    maxLength={128}
                                    type="password"
                                    autoComplete="new-password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                />
                                <p className="mt-1.5 text-xs text-[var(--workspace-muted)]">Use at least 12 characters.</p>
                            </div>
                            {error && <p role="alert" className="rounded-xl bg-[var(--workspace-rust-wash)] p-3 text-sm text-[var(--workspace-rust)]">{error}</p>}
                            <button type="submit" disabled={submitting} className="business-button-primary w-full">
                                {submitting ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : null}
                                {submitting ? "Creating your account…" : "Accept invitation"}
                                {!submitting ? <ArrowRight size={15} aria-hidden="true" /> : null}
                            </button>
                        </form>
                    </>
                ) : (
                    <>
                        <p role="alert" className="mt-3 text-sm leading-6 text-[var(--workspace-muted)]">
                            {error || "This invitation could not be verified."}
                        </p>
                        <Link href="/login" className="business-button-secondary mt-6">
                            Go to sign in
                        </Link>
                    </>
                )}
            </section>
        </main>
    );
}

export default function AcceptInvitationPage() {
    return (
        <Suspense fallback={
            <main className="business-flow grid min-h-screen place-items-center px-4">
                <p role="status" className="text-sm text-[var(--workspace-muted)]">Loading invitation…</p>
            </main>
        }>
            <AcceptInvitationForm />
        </Suspense>
    );
}
