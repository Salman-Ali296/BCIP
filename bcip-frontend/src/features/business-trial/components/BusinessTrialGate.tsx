"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowUpRight, LockKeyhole, RotateCw } from "lucide-react";
import {
    businessPlanCanAccess,
    getBusinessSubscription,
    hasActiveBusinessSubscription,
    normalizeBusinessPlan,
    requiredPlanForPath,
    type BusinessPlan,
} from "@/lib/api/business-billing";
import { ApiClientError } from "@/lib/api/client";
import {
    BusinessTrialApiError,
    getBusinessTrialStatus,
} from "@/features/business-trial/api/business-trial-api";
import {
    BusinessWorkspaceProvider,
    type BusinessWorkspace,
} from "@/features/business-trial/context/business-workspace-context";
import { EnterpriseShell } from "@/features/enterprise/components/enterprise-shell";
import { getRoleHome, useAuth } from "@/providers/auth-provider";

type GateState = "checking" | "allowed" | "error";

const JOURNEY_ROUTES = new Set([
    "/business/trial",
    "/business/upgrade",
    "/business/onboarding",
]);

function isUnauthorized(error: unknown): boolean {
    return (
        (error instanceof BusinessTrialApiError || error instanceof ApiClientError) &&
        error.status === 401
    );
}

function GateMessage({
    title,
    description,
    action,
    onRetry,
}: {
    title: string;
    description: string;
    action?: ReactNode;
    onRetry?: () => void;
}) {
    return (
        <main className="business-flow grid min-h-screen place-items-center px-5 py-12 sm:px-8">
            <section className="business-card w-full max-w-lg p-7 sm:p-9">
                <p className="business-eyebrow">Business workspace</p>
                <h1 className="business-display mt-3 text-3xl">{title}</h1>
                <p className="mt-3 text-sm leading-6 text-[var(--workspace-muted)]">
                    {description}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                    {action}
                    {onRetry && (
                        <button
                            type="button"
                            onClick={onRetry}
                            className="business-button-secondary"
                        >
                            <RotateCw size={16} aria-hidden="true" />
                            Try again
                        </button>
                    )}
                </div>
            </section>
        </main>
    );
}

export function BusinessTrialGate({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, status, error: authError, refreshSession } = useAuth();
    const isJourneyRoute = JOURNEY_ROUTES.has(pathname);
    const isBusinessUser = [
        "BUSINESS_ADMIN",
        "MANAGER",
        "AGENT",
        "ESCALATION_AGENT",
        "BUSINESS",
    ].includes(user?.role ?? "");
    const [state, setState] = useState<GateState>("checking");
    const [workspace, setWorkspace] = useState<BusinessWorkspace | null>(null);
    const [verifiedPath, setVerifiedPath] = useState<string | null>(null);
    const [retry, setRetry] = useState(0);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.replace(`/login?returnTo=${encodeURIComponent(pathname)}`);
        } else if (status === "authenticated" && user && !isBusinessUser) {
            router.replace(getRoleHome(user.role));
        }
    }, [isBusinessUser, pathname, router, status, user]);

    useEffect(() => {
        if (
            status !== "authenticated" ||
            !user ||
            !isBusinessUser ||
            isJourneyRoute ||
            workspace
        ) {
            return;
        }

        let current = true;

        Promise.all([getBusinessTrialStatus(), getBusinessSubscription()])
            .then(([trialStatus, subscription]) => {
                if (!current) return;

                const hasTrial = trialStatus.trial?.active === true;
                const hasPaidPlan = hasActiveBusinessSubscription(subscription);
                if (!hasTrial && !hasPaidPlan) {
                    router.replace("/business/upgrade");
                    return;
                }
                if (!trialStatus.onboardingComplete) {
                    router.replace("/business/onboarding");
                    return;
                }

                const plan = hasTrial
                    ? "business"
                    : normalizeBusinessPlan(subscription.plan);
                if (!plan) {
                    setVerifiedPath(pathname);
                    setState("error");
                    return;
                }

                setWorkspace({
                    businessName: trialStatus.tenant.name,
                    plan,
                    isTrial: hasTrial,
                    trialDaysRemaining: hasTrial
                        ? trialStatus.trial?.daysRemaining ?? null
                        : null,
                    complaintPortalUrl: trialStatus.complaintPortalUrl,
                });
                setVerifiedPath(pathname);
                setState("allowed");
            })
            .catch((error: unknown) => {
                if (!current) return;
                if (isUnauthorized(error)) {
                    router.replace(
                        `/login?returnTo=${encodeURIComponent(pathname)}`,
                    );
                    return;
                }
                setVerifiedPath(pathname);
                setState("error");
            });

        return () => {
            current = false;
        };
    }, [isBusinessUser, isJourneyRoute, pathname, retry, router, status, user, workspace]);

    if (status === "error") {
        return (
            <GateMessage
                title="We couldn’t check your sign-in session"
                description={authError ?? "Your session could not be verified. Please try again."}
                onRetry={() => void refreshSession()}
            />
        );
    }

    if (status !== "authenticated" || !user || !isBusinessUser) {
        return (
            <main className="business-flow grid min-h-screen place-items-center px-5">
                <p role="status" className="text-sm text-[var(--workspace-muted)]">
                    Checking your business access…
                </p>
            </main>
        );
    }

    if (isJourneyRoute) return children;

    if (
        state === "checking" ||
        (!workspace && verifiedPath !== pathname) ||
        (state === "allowed" && !workspace)
    ) {
        return (
            <main className="business-flow grid min-h-screen place-items-center px-5">
                <p role="status" className="text-sm text-[var(--workspace-muted)]">
                    Preparing your workspace…
                </p>
            </main>
        );
    }

    if (state === "error" || !workspace) {
        return (
            <GateMessage
                title="We couldn’t verify your workspace"
                description="Your plan details are temporarily unavailable. Your access has not been changed. Please try again in a moment."
                onRetry={() => {
                    setState("checking");
                    setVerifiedPath(null);
                    setRetry((value) => value + 1);
                }}
            />
        );
    }

    const minimumPlan = requiredPlanForPath(pathname);
    const hasFeatureAccess =
        workspace.isTrial || businessPlanCanAccess(workspace.plan, minimumPlan);
    const lockedPlan: BusinessPlan | null = hasFeatureAccess ? null : minimumPlan;

    return (
        <BusinessWorkspaceProvider value={workspace}>
            <EnterpriseShell>
                {workspace.isTrial && (
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--workspace-line)] bg-[var(--workspace-card)] px-4 py-3 text-sm">
                        <p>
                            <span className="font-bold">Trial workspace</span>
                            {workspace.trialDaysRemaining !== null && (
                                <span className="ml-2 text-[var(--workspace-muted)]">
                                    {workspace.trialDaysRemaining}{" "}
                                    {workspace.trialDaysRemaining === 1 ? "day" : "days"} remaining
                                </span>
                            )}
                        </p>
                        <Link
                            href="/business/upgrade"
                            className="font-bold text-[var(--workspace-green)] underline underline-offset-4"
                        >
                            Explore plans
                        </Link>
                    </div>
                )}
                {lockedPlan ? (
                    <section className="business-card mx-auto max-w-3xl p-7 sm:p-10">
                        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--workspace-rust-wash)] text-[var(--workspace-rust)]">
                            <LockKeyhole size={21} aria-hidden="true" />
                        </span>
                        <p className="business-eyebrow mt-6">Available with {lockedPlan}</p>
                        <h1 className="business-display mt-2 text-3xl sm:text-4xl">
                            Make room for more of your team’s work.
                        </h1>
                        <p className="mt-4 max-w-xl text-sm leading-6 text-[var(--workspace-muted)]">
                            This workspace area isn’t included in your current plan.
                            Compare plans to see what’s available and choose the right fit.
                        </p>
                        <Link href="/business/upgrade" className="business-button-primary mt-7">
                            Compare plans
                            <ArrowUpRight size={16} aria-hidden="true" />
                        </Link>
                    </section>
                ) : (
                    children
                )}
            </EnterpriseShell>
        </BusinessWorkspaceProvider>
    );
}
