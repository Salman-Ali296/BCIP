"use client";

import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    ArrowRight,
    BrainCircuit,
    Building2,
    Check,
    CheckCircle2,
    CircleHelp,
    LoaderCircle,
    Plus,
    Power,
    Rocket,
    RotateCw,
    Send,
    Sparkles,
    Trash2,
    Users,
    Workflow,
} from "lucide-react";
import { HelpdeskLogo } from "@/components/brand/helpdesk-logo";
import {
    getBusinessPlanName,
    getBusinessSubscription,
    hasActiveBusinessSubscription,
} from "@/lib/api/business-billing";
import { ApiClientError } from "@/lib/api/client";
import {
    BusinessTrialApiError,
    getBusinessTrialStatus,
} from "@/features/business-trial/api/business-trial-api";
import {
    completeBusinessWorkspaceOnboarding,
    createBusinessInvitation,
    getBusinessOnboarding,
    saveBusinessOnboardingStep,
    type BusinessIdentityStep,
    type BusinessOnboardingData,
    type BusinessPriority,
    type BusinessWeekday,
    type BusinessTeamDraft,
    type TeamRoleLevelRole,
} from "@/features/business-trial/api/business-onboarding-api";

type StepNumber = 1 | 2 | 3 | 4 | 5;

const STEPS: Array<{ number: StepNumber; short: string; title: string; description: string; icon: typeof Building2 }> = [
    { number: 1, short: "Business profile", title: "Business profile", description: "Your organization’s identity and the primary contact customers and BCIP can reach.", icon: Building2 },
    { number: 2, short: "Operations & SLAs", title: "Operations & service levels", description: "Build your complaint-handling teams by role and level, and set the response targets you commit to.", icon: Workflow },
    { number: 3, short: "Complaint intelligence", title: "Complaint intelligence", description: "The categories customers complain about and how AI should assist your team with triage.", icon: BrainCircuit },
    { number: 4, short: "Team & access", title: "Team & access", description: "Place your people in departments and teams, and invite the agents and managers who handle cases.", icon: Users },
    { number: 5, short: "Review & submit", title: "Workspace preferences & review", description: "Personalize the workspace, choose notifications, then submit your configuration to launch.", icon: Rocket },
];

function formatDuration(minutes: number): string {
    if (!Number.isFinite(minutes) || minutes < 1) return "";
    if (minutes < 60) return `${minutes} min`;
    const hours = minutes / 60;
    if (hours < 24) return `${Number.isInteger(hours) ? hours : hours.toFixed(1)} h`;
    const days = hours / 24;
    return `${Number.isInteger(days) ? days : days.toFixed(1)} ${days === 1 ? "day" : "days"}`;
}

function SectionHeading({ title, description }: { title: string; description?: string }) {
    return (
        <div className="md:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--workspace-green)]">{title}</h3>
            {description && <p className="mt-1 text-xs leading-5 text-[var(--workspace-muted)]">{description}</p>}
        </div>
    );
}

interface PlanContext {
    name: string;
    isTrial: boolean;
    daysRemaining: number | null;
    features: Record<string, boolean>;
}

const WEEKDAYS: BusinessWeekday[] = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
];
const PRIORITIES: BusinessPriority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

const TEAM_ROLE_LEVELS: Array<{ role: TeamRoleLevelRole; level: number; label: string; hint: string }> = [
    { role: "MANAGER", level: 1, label: "Manager", hint: "Owns the team and approves resolutions" },
    { role: "ESCALATION_AGENT", level: 2, label: "Escalation agent", hint: "Handles breached or high-risk cases" },
    { role: "AGENT", level: 3, label: "Agent", hint: "Responds to and resolves complaints" },
];

function sameName(left: string, right: string): boolean {
    return left.trim().toLocaleLowerCase() === right.trim().toLocaleLowerCase();
}

/** Teams are edited in one place; each team's lead lives on its matching department. */
function withTeamLeads(data: BusinessOnboardingData): BusinessOnboardingData {
    const operations = data.steps["2"];
    return {
        ...data,
        steps: {
            ...data.steps,
            "2": {
                ...operations,
                teams: operations.teams.map((team) => ({
                    ...team,
                    roleLevels: team.roleLevels ?? [],
                    leadUserId: team.leadUserId
                        ?? operations.departments.find((department) => sameName(department.name, team.name))?.managerUserId
                        ?? null,
                })),
            },
        },
    };
}

/** Builds the API payload: one department per team (keeps ownership and Step 4 working). */
function toOperationsPayload(data: BusinessOnboardingData): BusinessOnboardingData["steps"]["2"] {
    const operations = data.steps["2"];
    const matched = new Set<string>();
    const departments = operations.teams.map((team) => {
        const savedName = team.id ? data.teams.find((saved) => saved.id === team.id)?.name : undefined;
        const department = operations.departments.find((item) =>
            !matched.has(item.name.toLocaleLowerCase()) &&
            (sameName(item.name, savedName ?? team.name) || sameName(item.name, team.name)),
        );
        if (department) matched.add(department.name.toLocaleLowerCase());
        return {
            ...(department?.id ? { id: department.id } : {}),
            name: team.name.trim(),
            description: team.description,
            managerUserId: team.leadUserId ?? null,
            isActive: team.isActive,
        };
    });
    const legacyDepartments = operations.departments.filter((department) =>
        !matched.has(department.name.toLocaleLowerCase()) &&
        !departments.some((item) => sameName(item.name, department.name)),
    );
    return {
        ...operations,
        departments: [...departments, ...legacyDepartments],
        teams: operations.teams.map((team) => ({
            ...(team.id ? { id: team.id } : {}),
            name: team.name.trim(),
            description: team.description,
            roleLevels: (team.roleLevels ?? []).filter((level) => level.count > 0),
            isActive: team.isActive,
        })),
    };
}
const INPUT_CLASS =
    "mt-2 w-full rounded-xl border border-[var(--workspace-line)] bg-white px-3.5 py-3 text-sm text-[var(--workspace-ink)] outline-none transition focus:border-[var(--workspace-green)] focus:ring-4 focus:ring-[var(--workspace-green-wash)]";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--workspace-ink)]";

const INDUSTRIES = [
     'Technology',
        'Software & SaaS',
        'IT Services',
        'Healthcare',
        'Pharmaceuticals',
        'Fitness & Wellness',
        'Finance',
        'Banking',
        'Insurance',
        'Real Estate',
        'Retail',
        'E-commerce',
        'Wholesale & Distribution',
        'Food & Beverage',
        'Restaurants & Cafes',
        'Fashion & Apparel',
        'Beauty & Personal Care',
        'Education',
        'Manufacturing',
        'Construction',
        'Automotive',
        'Agriculture',
        'Energy & Utilities',
        'Telecommunications',
        'Media & Entertainment',
        'Marketing & Advertising',
        'Logistics',
        'Transportation',
        'Hospitality',
        'Travel & Tourism',
        'Legal Services',
        'Consulting & Professional Services',
        'Security Services',
        'Government & Public Sector',
        'Non-Profit',
        'Other',
];
const TEAM_SIZES = ["1–10", "11–50", "51–200", "201–500", "501–1000", "1000+"];

function isUnauthorized(error: unknown): boolean {
    return (
        (error instanceof BusinessTrialApiError || error instanceof ApiClientError) &&
        error.status === 401
    );
}

function Field({
    label,
    children,
    hint,
    error,
    labelable = true,
}: {
    label: string;
    children: ReactNode;
    hint?: string;
    error?: string;
    labelable?: boolean;
}) {
    return (
        <div>
            {labelable ? (
                <label className={LABEL_CLASS}>
                    <span>{label}</span>
                    {children}
                </label>
            ) : (
                <>
                    <p className={LABEL_CLASS}>{label}</p>
                    {children}
                </>
            )}
            {hint && !error && (
                <p className="mt-1.5 text-xs leading-5 text-[var(--workspace-muted)]">{hint}</p>
            )}
            {error && (
                <p className="mt-1.5 text-xs font-medium text-[var(--workspace-rust)]" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}

function formatRole(role: string): string {
    return role.toLowerCase().split("_").map(
        (part) => part.charAt(0).toUpperCase() + part.slice(1),
    ).join(" ");
}

function formatDate(value: string): string {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(new Date(value));
}

export function BusinessSetup() {
    const router = useRouter();
    const [onboarding, setOnboarding] = useState<BusinessOnboardingData | null>(null);
    const [activeStep, setActiveStep] = useState<StepNumber>(1);
    const [loading, setLoading] = useState(true);
    const [loadingError, setLoadingError] = useState("");
    const [submitError, setSubmitError] = useState("");
    const [notice, setNotice] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [inviting, setInviting] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState<"MANAGER" | "AGENT" | "ESCALATION_AGENT">("AGENT");
    const [inviteDepartmentId, setInviteDepartmentId] = useState("");
    const [planContext, setPlanContext] = useState<PlanContext | null>(null);

    const loadWorkspace = useCallback(async () => {
        try {
            const [trial, subscription] = await Promise.all([
                getBusinessTrialStatus(),
                getBusinessSubscription(),
            ]);
            if (trial.trial?.active !== true && !hasActiveBusinessSubscription(subscription)) {
                router.replace("/business/upgrade");
                return;
            }
            if (trial.onboardingComplete) {
                router.replace("/business/dashboard");
                return;
            }
            const paid = hasActiveBusinessSubscription(subscription);
            const planSlug = trial.access.plan ?? subscription.plan ?? trial.trial?.plan ?? "starter";
            setPlanContext({
                name: getBusinessPlanName(planSlug),
                isTrial: !paid && trial.trial?.active === true,
                daysRemaining: !paid && trial.trial?.active ? trial.trial.daysRemaining : null,
                features: trial.access.features ?? subscription.features ?? {},
            });
            const workspace = await getBusinessOnboarding();
            setOnboarding(withTeamLeads(workspace));
            setActiveStep(Math.min(5, Math.max(1, workspace.progress.currentStep)) as StepNumber);
        } catch (error: unknown) {
            if (isUnauthorized(error)) {
                router.replace("/login?returnTo=%2Fbusiness%2Fonboarding");
                return;
            }
            setLoadingError(
                error instanceof ApiClientError && error.status === 403
                    ? "Only the business administrator can configure this workspace, and an active plan or trial is required."
                    : "We couldn’t load your workspace setup. Please try again.",
            );
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        let active = true;
        void Promise.resolve().then(() => {
            if (active) void loadWorkspace();
        });
        return () => {
            active = false;
        };
    }, [loadWorkspace]);

    function validateStep(step: StepNumber): Record<string, string> {
        const errors: Record<string, string> = {};
        const value = onboarding?.steps[String(step) as keyof BusinessOnboardingData["steps"]];
        if (!value) return errors;

        if (step === 1) {
            const identity = value as BusinessIdentityStep;
            if (identity.businessName.trim().length < 2) errors.businessName = "Enter your business name.";
            if (!identity.industry) errors.industry = "Choose an industry.";
            if (!identity.teamSize) errors.teamSize = "Choose a business size.";
            if (identity.country.trim().length < 2) errors.country = "Enter your country.";
            if (!identity.timezone.trim()) errors.timezone = "Enter a time zone.";
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identity.primaryEmail.trim())) {
                errors.primaryEmail = "Enter a valid contact email.";
            }
            if (identity.primaryContactName.trim().length < 2) errors.primaryContactName = "Enter a contact name.";
            if (!/^[+()\d.\-\s]{7,30}$/.test(identity.phone.trim())) errors.phone = "Enter a valid phone number.";
            if (identity.website && !/^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(identity.website)) {
                errors.website = "Use a valid HTTP or HTTPS website URL.";
            }
            if (identity.logoUrl && !/^https:\/\/[^\s/$.?#].[^\s]*$/i.test(identity.logoUrl)) {
                errors.logoUrl = "Use a valid HTTPS image URL.";
            }
        } else if (step === 2) {
            const operations = value as BusinessOnboardingData["steps"]["2"];
            if (!operations.teams.length) errors.teams = "Add at least one team.";
            if (operations.teams.length > 30) errors.teams = "A maximum of 30 teams can be configured.";
            if (new Set(operations.teams.map((team) => team.name.trim().toLocaleLowerCase())).size !== operations.teams.length) {
                errors.teams = "Team names must be unique.";
            }
            operations.teams.forEach((team, index) => {
                if (team.name.trim().length < 2) errors[`team-${index}`] = "Enter a team name or remove this row.";
            });
            if (!operations.workingDays.length) errors.workingDays = "Choose at least one working day.";
            if (operations.workingHourStart >= operations.workingHourEnd) {
                errors.workingHours = "End time must be after start time.";
            }
            if (operations.defaultResponseTargetMinutes < 1) errors.responseTarget = "Enter a response target.";
            if (operations.defaultResolutionTargetMinutes < 1) errors.resolutionTarget = "Enter a resolution target.";
            if (operations.escalationThresholdMinutes < 1) errors.escalationTarget = "Enter an escalation threshold.";
        } else if (step === 3) {
            const intelligence = value as BusinessOnboardingData["steps"]["3"];
            if (!intelligence.categories.length) errors.categories = "Add at least one complaint category.";
            if (intelligence.categories.length > 50) errors.categories = "A maximum of 50 categories can be configured.";
            if (new Set(intelligence.categories.map((category) => category.name.trim().toLocaleLowerCase())).size !== intelligence.categories.length) {
                errors.categories = "Category names must be unique.";
            }
            intelligence.categories.forEach((category, index) => {
                if (category.name.trim().length < 2) errors[`category-${index}`] = "Enter a category name.";
            });
        } else if (step === 4) {
            const team = value as BusinessOnboardingData["steps"]["4"];
            if (new Set(team.members.map((member) => member.userId)).size !== team.members.length) {
                errors.members = "A team member can only be listed once.";
            }
            team.members.forEach((member) => {
                if (!onboarding?.users.some((user) => user.id === member.userId)) {
                    errors[`member-${member.userId}`] = "This member is no longer available. Reload the workspace.";
                }
                if (member.departmentId && !onboarding?.departments.some(
                    (department) => department.id === member.departmentId && department.isActive,
                )) {
                    errors[`department-${member.userId}`] = "Reassign this member or remove them from the inactive department.";
                }
                if (member.teamId && !onboarding?.teams.some(
                    (assignedTeam) => assignedTeam.id === member.teamId && assignedTeam.isActive,
                )) {
                    errors[`team-${member.userId}`] = "Reassign this member or remove them from the inactive team.";
                }
            });
        } else if (step === 5) {
            const workspace = value as BusinessOnboardingData["steps"]["5"];
            if (workspace.workspaceDisplayName.trim().length < 2) errors.workspaceDisplayName = "Enter a workspace name.";
            if (!/^#[0-9a-f]{6}$/i.test(workspace.primaryColor)) errors.primaryColor = "Use a six-digit hex color.";
        }
        return errors;
    }

    function updateIdentity<K extends keyof BusinessIdentityStep>(
        key: K,
        value: BusinessIdentityStep[K],
    ) {
        setOnboarding((current) => current && ({
            ...current,
            steps: { ...current.steps, "1": { ...current.steps["1"], [key]: value } },
        }));
    }

    function updateOperations<K extends keyof BusinessOnboardingData["steps"]["2"]>(
        key: K,
        value: BusinessOnboardingData["steps"]["2"][K],
    ) {
        setOnboarding((current) => current && ({
            ...current,
            steps: { ...current.steps, "2": { ...current.steps["2"], [key]: value } },
        }));
    }

    function updateTeamRow(index: number, patch: Partial<BusinessTeamDraft>) {
        setOnboarding((current) => current && ({
            ...current,
            steps: {
                ...current.steps,
                "2": {
                    ...current.steps["2"],
                    teams: current.steps["2"].teams.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, ...patch } : item),
                },
            },
        }));
    }

    function setRoleCount(team: BusinessTeamDraft, index: number, role: TeamRoleLevelRole, count: number) {
        const others = (team.roleLevels ?? []).filter((level) => level.role !== role);
        const safeCount = Math.max(0, Math.min(500, Math.floor(count) || 0));
        const next = safeCount > 0 ? [...others, { role, count: safeCount }] : others;
        next.sort((a, b) =>
            TEAM_ROLE_LEVELS.findIndex((item) => item.role === a.role) -
            TEAM_ROLE_LEVELS.findIndex((item) => item.role === b.role));
        updateTeamRow(index, { roleLevels: next });
    }

    function updateIntelligence(
        update: (value: BusinessOnboardingData["steps"]["3"]) => BusinessOnboardingData["steps"]["3"],
    ) {
        setOnboarding((current) => current && ({
            ...current,
            steps: { ...current.steps, "3": update(current.steps["3"]) },
        }));
    }

    function updateTeam(
        update: (value: BusinessOnboardingData["steps"]["4"]) => BusinessOnboardingData["steps"]["4"],
    ) {
        setOnboarding((current) => current && ({
            ...current,
            steps: { ...current.steps, "4": update(current.steps["4"]) },
        }));
    }

    function updateWorkspace(
        update: (value: BusinessOnboardingData["steps"]["5"]) => BusinessOnboardingData["steps"]["5"],
    ) {
        setOnboarding((current) => current && ({
            ...current,
            steps: { ...current.steps, "5": update(current.steps["5"]) },
        }));
    }

    async function persistStep(step: StepNumber): Promise<BusinessOnboardingData | null> {
        if (!onboarding || saving) return null;
        const errors = validateStep(step);
        setFieldErrors(errors);
        setSubmitError("");
        setNotice("");
        if (Object.keys(errors).length) {
            setSubmitError("Review the highlighted fields before continuing.");
            return null;
        }
        setSaving(true);
        try {
            const updated = await saveBusinessOnboardingStep(
                step,
                onboarding.progress.version,
                step === 2
                    ? toOperationsPayload(onboarding)
                    : onboarding.steps[String(step) as keyof BusinessOnboardingData["steps"]],
            );
            setOnboarding(withTeamLeads(updated));
            setFieldErrors({});
            setNotice("Changes saved.");
            return updated;
        } catch (error: unknown) {
            if (isUnauthorized(error)) {
                router.replace("/login?returnTo=%2Fbusiness%2Fonboarding");
                return null;
            }
            if (error instanceof ApiClientError && error.status === 409) {
                setSubmitError("This workspace changed in another tab. Reload the latest saved setup before continuing.");
            } else if (error instanceof ApiClientError && error.code === "NOT_FOUND") {
                setSubmitError("The workspace save service is unavailable. Restart the backend service and refresh this page before trying again.");
            } else {
                setSubmitError(
                    error instanceof ApiClientError && error.status === 400
                        ? "Some details need attention. Review the highlighted fields and try again."
                        : "Unable to save changes. Please try again.",
                );
            }
            return null;
        } finally {
            setSaving(false);
        }
    }

    async function continueStep(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const saved = await persistStep(activeStep);
        if (saved && activeStep < 5) {
            setActiveStep((activeStep + 1) as StepNumber);
            setNotice("");
        }
    }

    async function finishSetup(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const saved = await persistStep(5);
        if (!saved) return;
        setSaving(true);
        setSubmitError("");
        try {
            await completeBusinessWorkspaceOnboarding(saved.progress.version);
            router.replace("/business/dashboard");
        } catch (error: unknown) {
            if (isUnauthorized(error)) {
                router.replace("/login?returnTo=%2Fbusiness%2Fonboarding");
                return;
            }
            if (error instanceof ApiClientError && error.status === 409) {
                setSubmitError("This workspace changed in another tab. Reload the latest saved setup before completing it.");
            } else if (error instanceof ApiClientError && error.code === "NOT_FOUND") {
                setSubmitError("The workspace setup service is unavailable. Restart the backend service and refresh this page before trying again.");
            } else {
                setSubmitError("We couldn’t complete workspace setup. Your saved details are safe; please try again.");
            }
        } finally {
            setSaving(false);
        }
    }

    async function sendInvitation() {
        if (!onboarding || inviting) return;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail.trim())) {
            setSubmitError("Enter a valid email address for the invitation.");
            return;
        }
        setInviting(true);
        setSubmitError("");
        setNotice("");
        try {
            const invitation = await createBusinessInvitation({
                email: inviteEmail.trim().toLowerCase(),
                role: inviteRole,
                departmentId: inviteDepartmentId || null,
            });
            const department = onboarding.departments.find(
                (item) => item.id === inviteDepartmentId,
            );
            setInviteEmail("");
            setOnboarding((current) => current && ({
                ...current,
                invitations: [
                    {
                        id: invitation.id,
                        email: invitation.email,
                        role: inviteRole,
                        expiresAt: invitation.expiresAt,
                        department: department ? { name: department.name } : null,
                    },
                    ...current.invitations,
                ],
            }));
            setNotice("Invitation sent. It expires in seven days.");
        } catch (error: unknown) {
            if (isUnauthorized(error)) {
                router.replace("/login?returnTo=%2Fbusiness%2Fonboarding");
                return;
            }
            setSubmitError(
                error instanceof ApiClientError && error.status === 403
                    ? "The workspace cannot add another member at this time. Check its plan limit or ask an administrator."
                    : error instanceof ApiClientError && error.status === 409
                      ? "An account or pending invitation already uses that email address."
                      : "The invitation could not be sent. Please try again.",
            );
        } finally {
            setInviting(false);
        }
    }

    if (loading) {
        return (
            <main className="business-flow grid min-h-screen place-items-center px-5">
                <p role="status" className="flex items-center gap-2 text-sm text-[var(--workspace-muted)]">
                    <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
                    Loading your workspace setup…
                </p>
            </main>
        );
    }

    if (loadingError || !onboarding) {
        return (
            <main className="business-flow grid min-h-screen place-items-center px-5 py-10">
                <section className="business-card w-full max-w-lg p-7 sm:p-9">
                    <p className="business-eyebrow">Business workspace</p>
                    <h1 className="business-display mt-3 text-3xl">Setup isn’t available yet.</h1>
                    <p className="mt-3 text-sm leading-6 text-[var(--workspace-muted)]">
                        {loadingError || "We couldn’t load your business workspace."}
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            setLoadingError("");
                            setLoading(true);
                            void loadWorkspace();
                        }}
                        className="business-button-secondary mt-6"
                    >
                        <RotateCw size={15} aria-hidden="true" />
                        Try again
                    </button>
                </section>
            </main>
        );
    }

    const step = STEPS[activeStep - 1];
    const identity = onboarding.steps["1"];
    const operations = onboarding.steps["2"];
    const intelligence = onboarding.steps["3"];
    const team = onboarding.steps["4"];
    const workspace = onboarding.steps["5"];

    const completedSteps = Math.min(5, onboarding.progress.completedThrough);
    const progressPercent = Math.round((completedSteps / STEPS.length) * 100);
    const StepIcon = step.icon;
    const lacksResponseAi = planContext ? planContext.features.ai_response_suggestions !== true : false;
    const lacksDuplicateAi = planContext ? planContext.features.duplicate_detection !== true : false;

    return (
        <main className="business-flow min-h-screen">
            <div className="business-flow-hero">
                <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-7">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-5">
                            <Link href="/" aria-label="BCIP home"><HelpdeskLogo size="sm" theme="light" /></Link>
                            <Link href="/business/upgrade" className="hidden items-center gap-1.5 border-l border-line pl-5 text-sm font-medium text-muted transition hover:text-ink sm:inline-flex">
                                <ArrowLeft size={14} aria-hidden="true" /> Plans & billing
                            </Link>
                        </div>
                        {planContext && (
                            <Link href="/business/upgrade" className="inline-flex items-center gap-2 rounded-full border border-brand-soft bg-lilac px-3.5 py-1.5 text-xs font-semibold text-brand transition hover:border-line-strong">
                                <Sparkles size={13} aria-hidden="true" />
                                {planContext.name}
                                {planContext.isTrial ? ` trial · ${planContext.daysRemaining ?? 0} days left` : " plan"}
                            </Link>
                        )}
                    </div>

                    <header className="mt-12 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
                        <div className="max-w-2xl">
                            <span className="inline-flex items-center gap-2 rounded-full border border-brand-soft bg-lilac px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
                                <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" /> Workspace configuration
                            </span>
                            <h1 className="mt-5 text-4xl font-semibold leading-[1.1] tracking-[-0.04em] text-ink sm:text-5xl">
                                Set up {onboarding.tenant.name} for complaint operations.
                            </h1>
                            <p className="mt-4 text-base leading-7 text-muted">
                                Five short sections cover everything your team needs on day one. Progress saves as you go, and you can change any of it later in Settings.
                            </p>
                        </div>
                        <div className="w-full rounded-2xl border border-line bg-wash p-5 lg:w-72">
                            <div className="flex items-baseline justify-between text-sm">
                                <span className="font-medium text-ink-soft">Setup progress</span>
                                <span className="font-semibold text-ink">{progressPercent}%</span>
                            </div>
                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-line" aria-hidden="true">
                                <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${Math.max(progressPercent, 4)}%` }} />
                            </div>
                            <p className="mt-3 text-xs text-subtle">{completedSteps} of {STEPS.length} sections saved</p>
                        </div>
                    </header>
                </div>
            </div>

            <div className="relative mx-auto -mt-14 max-w-6xl px-4 pb-16 sm:px-7">
                <div className="grid gap-6 lg:grid-cols-[17rem_1fr] lg:items-start">
                    <nav aria-label="Workspace setup sections" className="business-card p-3 lg:sticky lg:top-6">
                        <ol className="grid grid-cols-1 gap-1 sm:grid-cols-5 lg:grid-cols-1">
                            {STEPS.map((item) => {
                                const isComplete = onboarding.progress.completedThrough >= item.number;
                                const isCurrent = activeStep === item.number;
                                const canVisit = item.number <= onboarding.progress.currentStep;
                                const ItemIcon = item.icon;
                                return (
                                    <li key={item.number}>
                                        <button
                                            type="button"
                                            onClick={() => canVisit && setActiveStep(item.number)}
                                            disabled={!canVisit || saving}
                                            aria-current={isCurrent ? "step" : undefined}
                                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                                isCurrent ? "bg-[var(--workspace-green-deep)] text-white" : "hover:bg-[var(--workspace-paper)]"
                                            }`}
                                        >
                                            <span className={`grid size-8 shrink-0 place-items-center rounded-lg text-xs font-bold ${
                                                isComplete
                                                    ? "bg-[var(--workspace-green)] text-white"
                                                    : isCurrent
                                                      ? "bg-white/15 text-white"
                                                      : "bg-[var(--workspace-paper)] text-[var(--workspace-muted)]"
                                            }`}>
                                                {isComplete && !isCurrent ? <Check size={15} aria-hidden="true" /> : <ItemIcon size={15} aria-hidden="true" />}
                                            </span>
                                            <span className="min-w-0">
                                                <span className={`block text-[10px] font-semibold uppercase tracking-wider ${isCurrent ? "text-white/70" : "text-[var(--workspace-muted)]"}`}>
                                                    Step {item.number}
                                                </span>
                                                <span className="block truncate text-sm font-semibold">{item.short}</span>
                                            </span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ol>
                    </nav>

                <form onSubmit={activeStep === 5 ? finishSetup : continueStep}>
                    <section className="business-card p-5 sm:p-8" aria-labelledby="active-step-title">
                        <div className="flex items-start gap-4 border-b border-[var(--workspace-line)] pb-6">
                            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[var(--workspace-green-wash)] text-[var(--workspace-green)]">
                                <StepIcon size={22} aria-hidden="true" />
                            </span>
                            <div className="max-w-3xl">
                                <p className="business-eyebrow">Step {activeStep} of 5</p>
                                <h2 id="active-step-title" className="business-display mt-1.5 text-2xl sm:text-3xl">
                                    {step.title}
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-[var(--workspace-muted)]">
                                    {step.description}
                                </p>
                            </div>
                        </div>

                        {activeStep === 1 && (
                            <div className="mt-7 grid gap-5 md:grid-cols-2">
                                <SectionHeading title="Organization" description="How your business appears to customers on the complaint portal and in reports." />
                                <Field label="Business / organization name" error={fieldErrors.businessName}>
                                    <input className={INPUT_CLASS} required maxLength={120} value={identity.businessName} onChange={(event) => updateIdentity("businessName", event.target.value)} />
                                </Field>
                                <Field label="Legal business name (optional)">
                                    <input className={INPUT_CLASS} maxLength={160} value={identity.legalBusinessName} onChange={(event) => updateIdentity("legalBusinessName", event.target.value)} />
                                </Field>
                                <Field label="Business website (optional)" error={fieldErrors.website}>
                                    <input className={INPUT_CLASS} type="url" placeholder="https://example.com" value={identity.website} onChange={(event) => updateIdentity("website", event.target.value)} />
                                </Field>
                                <Field label="Industry" error={fieldErrors.industry}>
                                    <select className={INPUT_CLASS} required value={identity.industry} onChange={(event) => updateIdentity("industry", event.target.value)}>
                                        <option value="">Choose an industry</option>
                                        {INDUSTRIES.map((industry) => <option key={industry} value={industry}>{industry}</option>)}
                                    </select>
                                </Field>
                                <Field label="Business size" error={fieldErrors.teamSize}>
                                    <select className={INPUT_CLASS} required value={identity.teamSize} onChange={(event) => updateIdentity("teamSize", event.target.value)}>
                                        <option value="">Choose a team size</option>
                                        {TEAM_SIZES.map((size) => <option key={size} value={size}>{size} people</option>)}
                                    </select>
                                </Field>
                                <Field label="Country" error={fieldErrors.country}>
                                    <input className={INPUT_CLASS} required maxLength={100} value={identity.country} onChange={(event) => updateIdentity("country", event.target.value)} />
                                </Field>
                                <Field label="Time zone" hint="Use an IANA time zone, for example Asia/Karachi." error={fieldErrors.timezone}>
                                    <input className={INPUT_CLASS} required placeholder="Asia/Karachi" value={identity.timezone} onChange={(event) => updateIdentity("timezone", event.target.value)} />
                                </Field>
                                <div className="border-t border-[var(--workspace-line)] pt-6 md:col-span-2">
                                    <SectionHeading title="Primary contact" description="The person responsible for complaint operations. Escalation and account notices go here." />
                                </div>
                                <Field label="Primary business email" error={fieldErrors.primaryEmail}>
                                    <input className={INPUT_CLASS} required type="email" maxLength={254} value={identity.primaryEmail} onChange={(event) => updateIdentity("primaryEmail", event.target.value)} />
                                </Field>
                                <Field label="Primary contact name" error={fieldErrors.primaryContactName}>
                                    <input className={INPUT_CLASS} required maxLength={120} value={identity.primaryContactName} onChange={(event) => updateIdentity("primaryContactName", event.target.value)} />
                                </Field>
                                <Field label="Business phone" error={fieldErrors.phone}>
                                    <input className={INPUT_CLASS} required type="tel" maxLength={30} value={identity.phone} onChange={(event) => updateIdentity("phone", event.target.value)} />
                                </Field>
                                <div className="border-t border-[var(--workspace-line)] pt-6 md:col-span-2">
                                    <SectionHeading title="Brand" description="Shown on your public complaint portal and customer tracking pages." />
                                </div>
                                <div className="md:col-span-2">
                                    <Field label="Business logo URL (optional)" hint="Use a trusted HTTPS image URL. File uploads are not enabled in this workspace.">
                                        <input className={INPUT_CLASS} type="url" placeholder="https://example.com/logo.png" value={identity.logoUrl} onChange={(event) => updateIdentity("logoUrl", event.target.value)} />
                                    </Field>
                                </div>
                            </div>
                        )}

                        {activeStep === 2 && (
                            <div className="mt-7 space-y-7">
                                <div>
                                    <div className="flex flex-wrap items-end justify-between gap-3">
                                        <div>
                                            <h3 className="text-sm font-bold">Team structure</h3>
                                            <p className="mt-1 text-xs text-[var(--workspace-muted)]">Create each complaint-handling team, choose its lead, and plan how many people work at each level.</p>
                                        </div>
                                        <button type="button" className="business-button-secondary min-h-10" onClick={() => updateOperations("teams", [...operations.teams, { name: "", description: "", leadUserId: null, roleLevels: [{ role: "MANAGER", count: 1 }, { role: "AGENT", count: 2 }], isActive: true }])}>
                                            <Plus size={15} aria-hidden="true" /> Add team
                                        </button>
                                    </div>
                                    {fieldErrors.teams && <p className="mt-2 text-xs text-[var(--workspace-rust)]" role="alert">{fieldErrors.teams}</p>}
                                    <div className="mt-4 space-y-3">
                                        {operations.teams.length === 0 && (
                                            <p className="rounded-xl border border-dashed border-[var(--workspace-line)] p-5 text-center text-xs text-[var(--workspace-muted)]">No teams yet. Add your first team to start assigning complaints.</p>
                                        )}
                                        {operations.teams.map((team, index) => {
                                            const headcount = (team.roleLevels ?? []).reduce((total, level) => total + level.count, 0);
                                            return (
                                                <div key={team.id ?? `team-${index}`} className={`rounded-xl border border-[var(--workspace-line)] p-4 ${team.isActive ? "bg-white" : "bg-[var(--workspace-paper)] opacity-70"}`}>
                                                    <div className="grid gap-3 md:grid-cols-[1fr_1.2fr_1fr_auto]">
                                                        <div>
                                                            <label htmlFor={`team-name-${index}`} className="text-xs font-semibold">Team name</label>
                                                            <input id={`team-name-${index}`} className={INPUT_CLASS} maxLength={80} placeholder="e.g. Billing support" value={team.name} disabled={!team.isActive} onChange={(event) => updateTeamRow(index, { name: event.target.value })} />
                                                            {fieldErrors[`team-${index}`] && <p className="mt-1 text-xs text-[var(--workspace-rust)]" role="alert">{fieldErrors[`team-${index}`]}</p>}
                                                        </div>
                                                        <div>
                                                            <label htmlFor={`team-description-${index}`} className="text-xs font-semibold">Description (optional)</label>
                                                            <input id={`team-description-${index}`} className={INPUT_CLASS} maxLength={500} value={team.description} disabled={!team.isActive} onChange={(event) => updateTeamRow(index, { description: event.target.value })} />
                                                        </div>
                                                        <div>
                                                            <label htmlFor={`team-lead-${index}`} className="text-xs font-semibold">Team lead</label>
                                                            <select id={`team-lead-${index}`} className={INPUT_CLASS} value={team.leadUserId ?? ""} disabled={!team.isActive} onChange={(event) => updateTeamRow(index, { leadUserId: event.target.value || null })}>
                                                                <option value="">Choose a lead</option>
                                                                {onboarding.users.map((user) => <option key={user.id} value={user.id}>{user.fullName} · {formatRole(user.role)}</option>)}
                                                            </select>
                                                        </div>
                                                        <button type="button" className="mt-5 grid size-10 place-items-center rounded-lg border border-[var(--workspace-line)] text-[var(--workspace-muted)] hover:text-[var(--workspace-rust)]" aria-label={team.id ? (team.isActive ? `Deactivate ${team.name}` : `Reactivate ${team.name}`) : `Remove ${team.name || "new team"}`} onClick={() => {
                                                            if (!team.id) {
                                                                updateOperations("teams", operations.teams.filter((_, itemIndex) => itemIndex !== index));
                                                                return;
                                                            }
                                                            updateTeamRow(index, { isActive: !team.isActive });
                                                            if (team.isActive && operations.primaryTeamId === team.id) updateOperations("primaryTeamId", null);
                                                        }}>
                                                            {team.id ? <Power size={16} aria-hidden="true" /> : <Trash2 size={16} aria-hidden="true" />}
                                                        </button>
                                                    </div>
                                                    <div className="mt-4 border-t border-[var(--workspace-line)] pt-4">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-xs font-semibold">Roles by level</p>
                                                            <p className="text-xs text-[var(--workspace-muted)]">{headcount} {headcount === 1 ? "person" : "people"} planned</p>
                                                        </div>
                                                        <div className="mt-2 grid gap-2 sm:grid-cols-3">
                                                            {TEAM_ROLE_LEVELS.map((level) => {
                                                                const count = team.roleLevels?.find((item) => item.role === level.role)?.count ?? 0;
                                                                return (
                                                                    <label key={level.role} htmlFor={`team-${index}-${level.role}`} className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 ${count > 0 ? "border-[var(--workspace-green)] bg-[var(--workspace-green-wash)]" : "border-[var(--workspace-line)]"}`}>
                                                                        <span className="min-w-0">
                                                                            <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--workspace-green)]">Level {level.level}</span>
                                                                            <span className="block text-sm font-semibold">{level.label}</span>
                                                                            <span className="block text-[11px] leading-4 text-[var(--workspace-muted)]">{level.hint}</span>
                                                                        </span>
                                                                        <input id={`team-${index}-${level.role}`} type="number" min={0} max={500} inputMode="numeric" aria-label={`${level.label} count for ${team.name || "this team"}`} className="w-16 rounded-lg border border-[var(--workspace-line)] bg-white px-2 py-1.5 text-center text-sm outline-none focus:border-[var(--workspace-green)]" value={count} disabled={!team.isActive} onChange={(event) => setRoleCount(team, index, level.role, Number(event.target.value))} />
                                                                    </label>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="grid gap-5 border-t border-[var(--workspace-line)] pt-6 md:grid-cols-2">
                                    <SectionHeading title="Service hours & SLA targets" description="BCIP uses these to calculate due times, flag breaches and trigger escalations." />
                                    <Field label="Primary complaint team" hint="If you’ve just created a team, save this step first; it will then be available here.">
                                        <select className={INPUT_CLASS} value={operations.primaryTeamId ?? ""} onChange={(event) => updateOperations("primaryTeamId", event.target.value || null)}>
                                            <option value="">No default team</option>
                                            {operations.teams.filter((teamOption) => teamOption.isActive && teamOption.id).map((teamOption) => <option key={teamOption.id} value={teamOption.id}>{teamOption.name}</option>)}
                                        </select>
                                    </Field>
                                    <Field label="Default priority">
                                        <select className={INPUT_CLASS} value={operations.defaultPriority} onChange={(event) => updateOperations("defaultPriority", event.target.value as BusinessPriority)}>
                                            {PRIORITIES.map((priority) => <option key={priority} value={priority}>{formatRole(priority)}</option>)}
                                        </select>
                                    </Field>
                                    <Field label="Working days" error={fieldErrors.workingDays} labelable={false}>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {WEEKDAYS.map((day) => {
                                                const checked = operations.workingDays.includes(day);
                                                return (
                                                    <label key={day} className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold ${checked ? "border-[var(--workspace-green)] bg-[var(--workspace-green-wash)]" : "border-[var(--workspace-line)] bg-white"}`}>
                                                        <input type="checkbox" checked={checked} className="accent-[var(--workspace-green)]" onChange={() => updateOperations("workingDays", checked ? operations.workingDays.filter((item) => item !== day) : [...operations.workingDays, day])} />
                                                        {day.slice(0, 3)}
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </Field>
                                    <Field label="Working hours" error={fieldErrors.workingHours} labelable={false}>
                                        <div className="mt-2 grid grid-cols-2 gap-3">
                                            <input aria-label="Working hours start" type="time" className={INPUT_CLASS} value={operations.workingHourStart} onChange={(event) => updateOperations("workingHourStart", event.target.value)} />
                                            <input aria-label="Working hours end" type="time" className={INPUT_CLASS} value={operations.workingHourEnd} onChange={(event) => updateOperations("workingHourEnd", event.target.value)} />
                                        </div>
                                    </Field>
                                    <Field label="First response target (minutes)" hint={formatDuration(operations.defaultResponseTargetMinutes) && `Customers get a first reply within ${formatDuration(operations.defaultResponseTargetMinutes)}.`} error={fieldErrors.responseTarget}>
                                        <input type="number" min={1} max={525600} className={INPUT_CLASS} value={operations.defaultResponseTargetMinutes} onChange={(event) => updateOperations("defaultResponseTargetMinutes", Number(event.target.value))} />
                                    </Field>
                                    <Field label="Resolution target (minutes)" hint={formatDuration(operations.defaultResolutionTargetMinutes) && `Complaints should be resolved within ${formatDuration(operations.defaultResolutionTargetMinutes)}.`} error={fieldErrors.resolutionTarget}>
                                        <input type="number" min={1} max={525600} className={INPUT_CLASS} value={operations.defaultResolutionTargetMinutes} onChange={(event) => updateOperations("defaultResolutionTargetMinutes", Number(event.target.value))} />
                                    </Field>
                                    <Field label="Escalation threshold (minutes)" hint={formatDuration(operations.escalationThresholdMinutes) && `Unresolved complaints escalate after ${formatDuration(operations.escalationThresholdMinutes)}.`} error={fieldErrors.escalationTarget}>
                                        <input type="number" min={1} max={525600} className={INPUT_CLASS} value={operations.escalationThresholdMinutes} onChange={(event) => updateOperations("escalationThresholdMinutes", Number(event.target.value))} />
                                    </Field>
                                </div>
                            </div>
                        )}

                        {activeStep === 3 && (
                            <div className="mt-7 grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
                                <div>
                                    <div className="flex flex-wrap items-end justify-between gap-3">
                                        <div>
                                            <h3 className="text-sm font-bold">Complaint categories</h3>
                                            <p className="mt-1 text-xs text-[var(--workspace-muted)]">Inactive categories remain on existing complaint history.</p>
                                        </div>
                                        <button type="button" className="business-button-secondary min-h-10" onClick={() => updateIntelligence((current) => ({ ...current, categories: [...current.categories, { name: "", description: "", defaultPriority: "MEDIUM", isActive: true }] }))}>
                                            <Plus size={15} aria-hidden="true" /> Add category
                                        </button>
                                    </div>
                                    {fieldErrors.categories && <p className="mt-2 text-xs text-[var(--workspace-rust)]" role="alert">{fieldErrors.categories}</p>}
                                    <div className="mt-4 space-y-3">
                                        {intelligence.categories.map((category, index) => (
                                            <div key={category.id ?? `category-${index}`} className={`rounded-xl border border-[var(--workspace-line)] p-4 ${category.isActive ? "bg-white" : "bg-[var(--workspace-paper)] opacity-70"}`}>
                                                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                                                    <div>
                                                        <label htmlFor={`category-name-${index}`} className="text-xs font-semibold">Category name</label>
                                                        <input id={`category-name-${index}`} className={INPUT_CLASS} maxLength={80} value={category.name} disabled={!category.isActive} onChange={(event) => updateIntelligence((current) => ({ ...current, categories: current.categories.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item) }))} />
                                                        {fieldErrors[`category-${index}`] && <p className="mt-1 text-xs text-[var(--workspace-rust)]" role="alert">{fieldErrors[`category-${index}`]}</p>}
                                                    </div>
                                                    <div>
                                                        <label htmlFor={`category-priority-${index}`} className="text-xs font-semibold">Default priority</label>
                                                        <select id={`category-priority-${index}`} className={INPUT_CLASS} value={category.defaultPriority} onChange={(event) => updateIntelligence((current) => ({ ...current, categories: current.categories.map((item, itemIndex) => itemIndex === index ? { ...item, defaultPriority: event.target.value as BusinessPriority } : item) }))}>
                                                            {PRIORITIES.map((priority) => <option key={priority} value={priority}>{formatRole(priority)}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="mt-3 flex items-center justify-between gap-3">
                                                    <input aria-label={`Description for ${category.name || "new category"}`} className={`${INPUT_CLASS} mt-0`} maxLength={500} placeholder="Description (optional)" value={category.description} disabled={!category.isActive} onChange={(event) => updateIntelligence((current) => ({ ...current, categories: current.categories.map((item, itemIndex) => itemIndex === index ? { ...item, description: event.target.value } : item) }))} />
                                                    <button type="button" className="shrink-0 rounded-lg border border-[var(--workspace-line)] px-3 py-2 text-xs font-semibold text-[var(--workspace-muted)] hover:text-[var(--workspace-rust)]" onClick={() => updateIntelligence((current) => ({ ...current, categories: category.id ? current.categories.map((item, itemIndex) => itemIndex === index ? { ...item, isActive: !item.isActive } : item) : current.categories.filter((_, itemIndex) => itemIndex !== index) }))}>
                                                        {category.id ? (category.isActive ? "Deactivate" : "Reactivate") : "Remove"}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-bold">AI-assisted recommendations</h3>
                                    <p className="mt-1 text-xs leading-5 text-[var(--workspace-muted)]">These features assist your team. People review recommendations and make the decisions.</p>
                                    <div className="mt-4 divide-y divide-[var(--workspace-line)] rounded-xl border border-[var(--workspace-line)] bg-white px-4">
                                        {([
                                            ["categorizationEnabled", "Category suggestions"],
                                            ["sentimentEnabled", "Sentiment estimation"],
                                            ["prioritySuggestionEnabled", "Priority recommendations"],
                                            ["similarityDetectionEnabled", "Similar complaint candidates"],
                                            ["responseSuggestionEnabled", "Response recommendations"],
                                            ["summaryEnabled", "Complaint summaries"],
                                        ] as const).map(([key, label]) => {
                                            const needsUpgrade =
                                                (key === "responseSuggestionEnabled" && lacksResponseAi) ||
                                                (key === "similarityDetectionEnabled" && lacksDuplicateAi);
                                            return (
                                                <label key={key} className="flex min-h-14 items-center justify-between gap-4 py-3 text-sm font-medium">
                                                    <span className="flex flex-wrap items-center gap-2">
                                                        {label}
                                                        {needsUpgrade && (
                                                            <Link href="/business/upgrade" className="rounded-full bg-[var(--workspace-green-wash)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--workspace-green)] hover:underline">
                                                                Professional
                                                            </Link>
                                                        )}
                                                    </span>
                                                    <input type="checkbox" className="size-4 accent-[var(--workspace-green)]" checked={intelligence.ai[key]} onChange={(event) => updateIntelligence((current) => ({ ...current, ai: { ...current.ai, [key]: event.target.checked } }))} />
                                                </label>
                                            );
                                        })}
                                    </div>
                                    {(lacksResponseAi || lacksDuplicateAi) && (
                                        <p className="mt-3 text-xs leading-5 text-[var(--workspace-muted)]">
                                            Features marked Professional are saved now and switch on automatically when you upgrade.
                                        </p>
                                    )}
                                    <p className="mt-3 rounded-xl bg-[var(--workspace-green-wash)] p-4 text-xs leading-5 text-[var(--workspace-ink)]">
                                        AI provides reviewable suggestions. It does not independently approve refunds, close complaints, or make decisions on behalf of your team.
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeStep === 4 && (
                            <div className="mt-7 space-y-8">
                                <div>
                                    <h3 className="text-sm font-bold">Current team</h3>
                                    <p className="mt-1 text-xs text-[var(--workspace-muted)]">Roles are managed by BCIP. Assign members to the departments and teams configured in the previous step.</p>
                                    {fieldErrors.members && <p className="mt-2 text-xs text-[var(--workspace-rust)]" role="alert">{fieldErrors.members}</p>}
                                    {onboarding.users.length === 0 ? (
                                        <p className="mt-4 rounded-xl bg-[var(--workspace-paper)] p-4 text-sm text-[var(--workspace-muted)]">No active team accounts are available.</p>
                                    ) : (
                                        <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--workspace-line)]">
                                            <table className="w-full min-w-[42rem] text-left text-sm">
                                                <thead className="bg-[var(--workspace-paper)] text-xs text-[var(--workspace-muted)]">
                                                    <tr><th className="px-4 py-3 font-semibold">Team member</th><th className="px-4 py-3 font-semibold">Role</th><th className="px-4 py-3 font-semibold">Department</th><th className="px-4 py-3 font-semibold">Team</th></tr>
                                                </thead>
                                                <tbody className="divide-y divide-[var(--workspace-line)]">
                                                    {onboarding.users.map((user) => {
                                                        const membership = team.members.find((member) => member.userId === user.id) ?? { userId: user.id, departmentId: user.departmentId, teamId: user.teamId };
                                                        const assignedDepartment = onboarding.departments.find((department) => department.id === membership.departmentId);
                                                        const assignedTeam = onboarding.teams.find((teamOption) => teamOption.id === membership.teamId);
                                                        return (
                                                            <tr key={user.id}>
                                                                <td className="px-4 py-3"><span className="block font-semibold">{user.fullName}</span><span className="text-xs text-[var(--workspace-muted)]">{user.email}</span></td>
                                                                <td className="px-4 py-3 text-xs">{formatRole(user.role)}</td>
                                                                <td className="px-4 py-3">
                                                                    <select aria-label={`Department for ${user.fullName}`} className="w-full rounded-lg border border-[var(--workspace-line)] bg-white px-2 py-2 text-xs" value={membership.departmentId ?? ""} onChange={(event) => updateTeam((current) => ({ ...current, members: [...current.members.filter((member) => member.userId !== user.id), { userId: user.id, departmentId: event.target.value || null, teamId: membership.teamId }] }))}>
                                                                        <option value="">Unassigned</option>
                                                                        {assignedDepartment && !assignedDepartment.isActive && <option value={assignedDepartment.id} disabled>{assignedDepartment.name} (inactive)</option>}
                                                                        {onboarding.departments.filter((department) => department.isActive).map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
                                                                    </select>
                                                                    {fieldErrors[`department-${user.id}`] && <p className="mt-1 text-[10px] text-[var(--workspace-rust)]" role="alert">{fieldErrors[`department-${user.id}`]}</p>}
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <select aria-label={`Team for ${user.fullName}`} className="w-full rounded-lg border border-[var(--workspace-line)] bg-white px-2 py-2 text-xs" value={membership.teamId ?? ""} onChange={(event) => updateTeam((current) => ({ ...current, members: [...current.members.filter((member) => member.userId !== user.id), { userId: user.id, departmentId: membership.departmentId, teamId: event.target.value || null }] }))}>
                                                                        <option value="">Unassigned</option>
                                                                        {assignedTeam && !assignedTeam.isActive && <option value={assignedTeam.id} disabled>{assignedTeam.name} (inactive)</option>}
                                                                        {onboarding.teams.filter((teamOption) => teamOption.isActive).map((teamOption) => <option key={teamOption.id} value={teamOption.id}>{teamOption.name}</option>)}
                                                                    </select>
                                                                    {fieldErrors[`team-${user.id}`] && <p className="mt-1 text-[10px] text-[var(--workspace-rust)]" role="alert">{fieldErrors[`team-${user.id}`]}</p>}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>

                                <div className="grid gap-6 border-t border-[var(--workspace-line)] pt-6 lg:grid-cols-[1fr_0.9fr]">
                                    <div>
                                        <h3 className="text-sm font-bold">Invite a teammate</h3>
                                        <p className="mt-1 text-xs leading-5 text-[var(--workspace-muted)]">We’ll send a one-time invitation that expires in seven days. Business administrator and platform administrator roles cannot be assigned here.</p>
                                        <div className="mt-4 rounded-xl border border-[var(--workspace-line)] p-4">
                                            <Field label="Work email address">
                                                <input className={INPUT_CLASS} type="email" required maxLength={254} value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} />
                                            </Field>
                                            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                                <Field label="Role">
                                                    <select className={INPUT_CLASS} value={inviteRole} onChange={(event) => setInviteRole(event.target.value as typeof inviteRole)}>
                                                        <option value="AGENT">Agent</option>
                                                        <option value="MANAGER">Manager</option>
                                                        <option value="ESCALATION_AGENT">Escalation agent</option>
                                                    </select>
                                                </Field>
                                                <Field label="Department (optional)">
                                                    <select className={INPUT_CLASS} value={inviteDepartmentId} onChange={(event) => setInviteDepartmentId(event.target.value)}>
                                                        <option value="">No department</option>
                                                        {onboarding.departments.filter((department) => department.isActive).map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
                                                    </select>
                                                </Field>
                                            </div>
                                            <button type="button" disabled={inviting || !inviteEmail.trim()} onClick={() => void sendInvitation()} className="business-button-secondary mt-4 w-full sm:w-auto">
                                                {inviting ? <LoaderCircle size={15} className="animate-spin" aria-hidden="true" /> : <Send size={15} aria-hidden="true" />}
                                                {inviting ? "Sending invitation…" : "Send invitation"}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold">Pending invitations</h3>
                                        {onboarding.invitations.length === 0 ? (
                                            <p className="mt-3 rounded-xl bg-[var(--workspace-paper)] p-4 text-sm leading-6 text-[var(--workspace-muted)]">There are no pending invitations.</p>
                                        ) : (
                                            <ul className="mt-3 divide-y divide-[var(--workspace-line)] rounded-xl border border-[var(--workspace-line)] px-4">
                                                {onboarding.invitations.map((invitation) => (
                                                    <li key={invitation.id} className="py-3">
                                                        <span className="block truncate text-sm font-semibold">{invitation.email}</span>
                                                        <span className="mt-1 block text-xs text-[var(--workspace-muted)]">{formatRole(invitation.role)}{invitation.department ? ` · ${invitation.department.name}` : ""} · Expires {formatDate(invitation.expiresAt)}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeStep === 5 && (
                            <div className="mt-7 grid gap-8 xl:grid-cols-[0.85fr_1.15fr]">
                                <div className="space-y-5">
                                    <Field label="Workspace display name" error={fieldErrors.workspaceDisplayName}>
                                        <input className={INPUT_CLASS} maxLength={100} value={workspace.workspaceDisplayName} onChange={(event) => updateWorkspace((current) => ({ ...current, workspaceDisplayName: event.target.value }))} />
                                    </Field>
                                    <Field label="Brand color" hint="Choose a six-digit hex color." labelable={false}>
                                        <div className="mt-2 flex gap-3">
                                            <input type="color" aria-label="Choose a brand color" className="h-12 w-14 rounded-lg border border-[var(--workspace-line)] bg-white p-1" value={workspace.primaryColor} onChange={(event) => updateWorkspace((current) => ({ ...current, primaryColor: event.target.value }))} />
                                            <input aria-label="Brand color hex value" className={`${INPUT_CLASS} mt-0`} maxLength={7} value={workspace.primaryColor} onChange={(event) => updateWorkspace((current) => ({ ...current, primaryColor: event.target.value }))} />
                                        </div>
                                    </Field>
                                    <Field label="Date format">
                                        <select className={INPUT_CLASS} value={workspace.dateFormat} onChange={(event) => updateWorkspace((current) => ({ ...current, dateFormat: event.target.value as typeof current.dateFormat }))}>
                                            <option value="MMM d, yyyy">Nov 12, 2026</option>
                                            <option value="dd/MM/yyyy">12/11/2026</option>
                                            <option value="MM/dd/yyyy">11/12/2026</option>
                                            <option value="yyyy-MM-dd">2026-11-12</option>
                                        </select>
                                    </Field>
                                    <Field label="Default complaint list">
                                        <select className={INPUT_CLASS} value={workspace.defaultComplaintView} onChange={(event) => updateWorkspace((current) => ({ ...current, defaultComplaintView: event.target.value as typeof current.defaultComplaintView }))}>
                                            <option value="inbox">Inbox</option>
                                            <option value="table">Table</option>
                                        </select>
                                    </Field>
                                    <Field label="Dashboard period">
                                        <select className={INPUT_CLASS} value={workspace.defaultDashboardPeriod} onChange={(event) => updateWorkspace((current) => ({ ...current, defaultDashboardPeriod: event.target.value as typeof current.defaultDashboardPeriod }))}>
                                            <option value="7d">Last 7 days</option>
                                            <option value="30d">Last 30 days</option>
                                            <option value="90d">Last 90 days</option>
                                        </select>
                                    </Field>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-sm font-bold">Notifications</h3>
                                        <div className="mt-3 divide-y divide-[var(--workspace-line)] rounded-xl border border-[var(--workspace-line)] bg-white px-4">
                                            {([
                                                ["newComplaint", "New complaint"],
                                                ["highPriority", "High-priority complaint"],
                                                ["escalation", "Complaint escalation"],
                                                ["assignment", "Team assignment"],
                                                ["weeklySummary", "Weekly summary"],
                                                ["email", "Email notifications"],
                                                ["inApp", "In-app notifications"],
                                            ] as const).map(([key, label]) => (
                                                <label key={key} className="flex min-h-14 items-center justify-between gap-4 py-3 text-sm font-medium">
                                                    {label}
                                                    <input type="checkbox" className="size-4 accent-[var(--workspace-green)]" checked={workspace.notifications[key]} onChange={(event) => updateWorkspace((current) => ({ ...current, notifications: { ...current.notifications, [key]: event.target.checked } }))} />
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-bold">Review before you submit</h3>
                                        <p className="mt-1 text-xs leading-5 text-[var(--workspace-muted)]">Select a section to revisit it. Submitting opens your complaint portal and dashboard.</p>
                                        <div className="mt-3 space-y-3">
                                            {[
                                                ["Business profile", identity.businessName, STEPS[0].number],
                                                ["Operations & SLAs", `${operations.teams.filter((teamItem) => teamItem.isActive).length} teams · first reply ${formatDuration(operations.defaultResponseTargetMinutes) || "not set"}`, STEPS[1].number],
                                                ["Complaint intelligence", `${intelligence.categories.filter((category) => category.isActive).length} active categories`, STEPS[2].number],
                                                ["Team", `${onboarding.users.length} active members · ${onboarding.invitations.length} pending invitations`, STEPS[3].number],
                                                ["Workspace", workspace.workspaceDisplayName, STEPS[4].number],
                                            ].map(([label, detail, stepNumber]) => (
                                                <button key={label} type="button" onClick={() => setActiveStep(stepNumber as StepNumber)} className="flex w-full items-center justify-between gap-4 rounded-xl border border-[var(--workspace-line)] bg-white p-4 text-left transition hover:border-[var(--workspace-green)]">
                                                    <span className="min-w-0"><span className="block text-xs font-semibold text-[var(--workspace-muted)]">{label}</span><span className="mt-1 block truncate text-sm font-bold">{detail}</span></span>
                                                    <CheckCircle2 size={18} className={onboarding.progress.completedThrough >= Number(stepNumber) ? "shrink-0 text-[var(--workspace-green)]" : "shrink-0 text-[var(--workspace-muted)]"} aria-hidden="true" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {(submitError || notice) && (
                            <div className={`mt-6 rounded-xl border p-4 text-sm leading-6 ${submitError ? "border-[var(--workspace-rust)]/30 bg-[var(--workspace-rust-wash)] text-[var(--workspace-rust)]" : "border-[var(--workspace-green)]/25 bg-[var(--workspace-green-wash)] text-[var(--workspace-ink)]"}`} role={submitError ? "alert" : "status"}>
                                {submitError || notice}
                            </div>
                        )}

                        <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--workspace-line)] pt-6">
                            <div>
                                {activeStep > 1 && (
                                    <button type="button" disabled={saving} onClick={() => { setActiveStep((activeStep - 1) as StepNumber); setFieldErrors({}); setSubmitError(""); setNotice(""); }} className="business-button-secondary">
                                        <ArrowLeft size={15} aria-hidden="true" /> Back
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-wrap justify-end gap-3">
                                <button type="button" disabled={saving} onClick={() => void persistStep(activeStep)} className="business-button-secondary">
                                    {saving && <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />}
                                    Save progress
                                </button>
                                <button type="submit" disabled={saving} className="business-button-primary">
                                    {saving ? <LoaderCircle size={15} className="animate-spin" aria-hidden="true" /> : null}
                                    {activeStep === 5 ? "Submit & launch workspace" : "Save & continue"}
                                    {!saving && <ArrowRight size={15} aria-hidden="true" />}
                                </button>
                            </div>
                        </footer>
                    </section>
                    <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-[var(--workspace-muted)]">
                        <CircleHelp size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
                        You can leave and return later. Saved progress stays with your business workspace.
                    </p>
                </form>
                </div>
            </div>
        </main>
    );
}
