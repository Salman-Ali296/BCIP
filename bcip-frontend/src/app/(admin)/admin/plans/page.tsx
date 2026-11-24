"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import {
    AdminPlan,
    AdminSubscription,
    createAdminPlan,
    getAdminPlans,
    getAdminSubscriptions,
    setAdminPlanStatus,
    updateAdminPlan,
} from "@/lib/api/admin";

type PlanFields = Omit<AdminPlan, "id" | "_count">;

const FEATURE_LABELS: Record<string, string> = {
    complaint_management: "Complaint inbox and tracking",
    complaint_portal: "Customer complaint portal",
    resolution_management: "Response and resolution management",
    analytics: "Business analytics and trends",
    reports: "Reports and customer history",
    escalations: "Escalations and service coordination",
    knowledge_resources: "Knowledge resources",
    team_management: "Teams and workspace settings",
};

const emptyPlan: PlanFields = {
    slug: "",
    name: "",
    audience: "",
    description: "",
    currency: "USD",
    monthlyPriceCents: 0,
    annualPriceCents: 0,
    complaintLimit: null,
    teamMemberLimit: null,
    aiAnalysisLimit: null,
    storageLimitMb: null,
    retentionDays: null,
    features: {},
    isActive: true,
    isPublic: true,
    displayOrder: 5,
};

function messageFromError(error: unknown): string {
    return error instanceof Error ? error.message : "The request could not be completed.";
}

function numberField(value: number | null, onChange: (value: number | null) => void) {
    return (
        <input
            type="number"
            min="0"
            value={value ?? ""}
            onChange={(event) => {
                const nextValue = event.target.value;
                onChange(nextValue === "" ? null : Number(nextValue));
            }}
            className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white"
        />
    );
}

export default function PlansAdminPage() {
    const [plans, setPlans] = useState<AdminPlan[]>([]);
    const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
    const [drafts, setDrafts] = useState<Record<string, AdminPlan>>({});
    const [newPlan, setNewPlan] = useState<PlanFields>(emptyPlan);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [savingNew, setSavingNew] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [loadedPlans, loadedSubscriptions] = await Promise.all([
                getAdminPlans(),
                getAdminSubscriptions(),
            ]);
            setPlans(loadedPlans);
            setDrafts(Object.fromEntries(loadedPlans.map((plan) => [plan.id, plan])));
            setSubscriptions(loadedSubscriptions);
        } catch (loadError: unknown) {
            setError(messageFromError(loadError));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let current = true;
        Promise.all([getAdminPlans(), getAdminSubscriptions()])
            .then(([loadedPlans, loadedSubscriptions]) => {
                if (!current) return;
                setPlans(loadedPlans);
                setDrafts(Object.fromEntries(loadedPlans.map((plan) => [plan.id, plan])));
                setSubscriptions(loadedSubscriptions);
            })
            .catch((loadError: unknown) => {
                if (current) setError(messageFromError(loadError));
            })
            .finally(() => {
                if (current) setLoading(false);
            });
        return () => {
            current = false;
        };
    }, []);

    function updateDraft(id: string, patch: Partial<AdminPlan>) {
        setDrafts((current) => ({
            ...current,
            [id]: { ...current[id], ...patch },
        }));
    }

    function updateNewPlan(patch: Partial<PlanFields>) {
        setNewPlan((current) => ({ ...current, ...patch }));
    }

    async function savePlan(id: string) {
        const draft = drafts[id];
        if (!draft) return;
        const fields: Partial<Omit<AdminPlan, "id" | "_count">> = {
            name: draft.name,
            audience: draft.audience,
            description: draft.description,
            currency: draft.currency,
            monthlyPriceCents: draft.monthlyPriceCents,
            annualPriceCents: draft.annualPriceCents,
            complaintLimit: draft.complaintLimit,
            teamMemberLimit: draft.teamMemberLimit,
            aiAnalysisLimit: draft.aiAnalysisLimit,
            storageLimitMb: draft.storageLimitMb,
            retentionDays: draft.retentionDays,
            features: draft.features,
            isPublic: draft.isPublic,
            displayOrder: draft.displayOrder,
        };
        setSavingId(id);
        setError(null);
        setNotice(null);
        try {
            const updated = await updateAdminPlan(id, fields);
            setPlans((current) => current.map((plan) => plan.id === id ? updated : plan));
            setDrafts((current) => ({ ...current, [id]: updated }));
            setNotice(`${updated.name} was saved.`);
        } catch (saveError: unknown) {
            setError(messageFromError(saveError));
        } finally {
            setSavingId(null);
        }
    }

    async function togglePlan(plan: AdminPlan) {
        if (
            plan.isActive &&
            !window.confirm(
                "Hide this plan from new selections? Existing subscriptions will retain their current entitlements.",
            )
        ) {
            return;
        }
        setError(null);
        try {
            const updated = await setAdminPlanStatus(plan.id, !plan.isActive);
            setPlans((current) => current.map((item) => item.id === plan.id ? updated : item));
            setDrafts((current) => ({ ...current, [plan.id]: updated }));
            setNotice(
                updated.isActive
                    ? `${updated.name} is available for new selections.`
                    : `${updated.name} is hidden from new selections; existing subscriptions are preserved.`,
            );
        } catch (statusError: unknown) {
            setError(messageFromError(statusError));
        }
    }

    async function handleCreatePlan(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSavingNew(true);
        setError(null);
        setNotice(null);
        try {
            const created = await createAdminPlan(newPlan);
            setPlans((current) => [...current, created].sort((a, b) => a.displayOrder - b.displayOrder));
            setDrafts((current) => ({ ...current, [created.id]: created }));
            setNewPlan(emptyPlan);
            setNotice(`${created.name} was created.`);
        } catch (createError: unknown) {
            setError(messageFromError(createError));
        } finally {
            setSavingNew(false);
        }
    }

    function featureCheckboxes(
        values: Record<string, boolean>,
        onChange: (features: Record<string, boolean>) => void,
    ) {
        return (
            <div className="grid gap-2 sm:grid-cols-2">
                {Object.entries(FEATURE_LABELS).map(([feature, label]) => (
                    <label key={feature} className="flex items-center gap-2 text-sm text-slate-300">
                        <input
                            type="checkbox"
                            checked={values[feature] === true}
                            onChange={(event) => onChange({ ...values, [feature]: event.target.checked })}
                            className="size-4 accent-cyan-400"
                        />
                        {label}
                    </label>
                ))}
            </div>
        );
    }

    return (
        <main className="space-y-8 p-5 text-white sm:p-8">
            <header>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">
                    Subscription configuration
                </p>
                <h1 className="mt-2 text-3xl font-semibold">Plans & billing</h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                    Prices and quotas below are configurable demonstration defaults, not approved
                    commercial terms. Changing a displayed price does not reconfigure a Stripe Price.
                    Live checkout remains disabled until the Stripe amount matches this catalog.
                </p>
            </header>

            {error && <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-200">{error}</p>}
            {notice && <p role="status" className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-200">{notice}</p>}

            <section aria-labelledby="plans-heading">
                <h2 id="plans-heading" className="mb-4 text-xl font-semibold">Plan catalog</h2>
                {loading ? (
                    <p role="status" className="text-sm text-slate-400">Loading plans…</p>
                ) : plans.length === 0 ? (
                    <p className="text-sm text-slate-400">No plans are configured.</p>
                ) : (
                    <div className="grid gap-4 xl:grid-cols-2">
                        {plans.map((plan) => {
                            const draft = drafts[plan.id] ?? plan;
                            return (
                                <article key={plan.id} className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <h3 className="text-lg font-semibold">{plan.name}</h3>
                                            <p className="text-xs text-slate-400">{plan.slug} · {plan._count?.subscriptions ?? 0} subscriptions</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => void togglePlan(plan)}
                                                className="rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold hover:bg-white/5"
                                            >
                                                {plan.isActive ? "Deactivate" : "Activate"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => void savePlan(plan.id)}
                                                disabled={savingId === plan.id}
                                                className="rounded-lg bg-cyan-500 px-3 py-2 text-xs font-bold text-slate-950 disabled:opacity-50"
                                            >
                                                {savingId === plan.id ? "Saving…" : "Save changes"}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                        <label className="text-xs text-slate-400">Plan name
                                            <input value={draft.name} onChange={(event) => updateDraft(plan.id, { name: event.target.value })} className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white" />
                                        </label>
                                        <label className="text-xs text-slate-400">Audience
                                            <input value={draft.audience} onChange={(event) => updateDraft(plan.id, { audience: event.target.value })} className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white" />
                                        </label>
                                        <label className="text-xs text-slate-400">Currency
                                            <input value={draft.currency} maxLength={3} onChange={(event) => updateDraft(plan.id, { currency: event.target.value.toUpperCase() })} className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm uppercase text-white" />
                                        </label>
                                        <label className="text-xs text-slate-400">Monthly price (cents)
                                            {numberField(draft.monthlyPriceCents, (value) => updateDraft(plan.id, { monthlyPriceCents: value }))}
                                        </label>
                                        <label className="text-xs text-slate-400">Annual price (cents)
                                            {numberField(draft.annualPriceCents, (value) => updateDraft(plan.id, { annualPriceCents: value }))}
                                        </label>
                                        <label className="text-xs text-slate-400">Complaints / month
                                            {numberField(draft.complaintLimit, (value) => updateDraft(plan.id, { complaintLimit: value }))}
                                        </label>
                                        <label className="text-xs text-slate-400">Team members
                                            {numberField(draft.teamMemberLimit, (value) => updateDraft(plan.id, { teamMemberLimit: value }))}
                                        </label>
                                        <label className="text-xs text-slate-400">AI analyses / month
                                            {numberField(draft.aiAnalysisLimit, (value) => updateDraft(plan.id, { aiAnalysisLimit: value }))}
                                        </label>
                                        <label className="text-xs text-slate-400">Storage (MB)
                                            {numberField(draft.storageLimitMb, (value) => updateDraft(plan.id, { storageLimitMb: value }))}
                                        </label>
                                        <label className="text-xs text-slate-400">Retention (days)
                                            {numberField(draft.retentionDays, (value) => updateDraft(plan.id, { retentionDays: value }))}
                                        </label>
                                    </div>
                                    <label className="mt-3 block text-xs text-slate-400">Plan description
                                        <textarea value={draft.description} onChange={(event) => updateDraft(plan.id, { description: event.target.value })} rows={2} className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white" />
                                    </label>
                                    <fieldset className="mt-4">
                                        <legend className="mb-2 text-xs font-semibold text-slate-300">Implemented feature entitlements</legend>
                                        {featureCheckboxes(draft.features, (features) => updateDraft(plan.id, { features }))}
                                    </fieldset>
                                    <label className="mt-4 flex items-center gap-2 text-sm text-slate-300">
                                        <input type="checkbox" checked={draft.isPublic} onChange={(event) => updateDraft(plan.id, { isPublic: event.target.checked })} className="size-4 accent-cyan-400" />
                                        Visible on the public pricing page
                                    </label>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>

            <section aria-labelledby="create-plan-heading" className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
                <h2 id="create-plan-heading" className="text-xl font-semibold">Create a plan</h2>
                <p className="mt-1 text-sm text-slate-400">New plans are not automatically connected to live Stripe checkout.</p>
                <form onSubmit={(event) => void handleCreatePlan(event)} className="mt-4 grid gap-3 sm:grid-cols-2">
                    <label className="text-xs text-slate-400">Slug
                        <input required pattern="[a-z0-9]+(-[a-z0-9]+)*" value={newPlan.slug} onChange={(event) => updateNewPlan({ slug: event.target.value })} className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white" />
                    </label>
                    <label className="text-xs text-slate-400">Plan name
                        <input required value={newPlan.name} onChange={(event) => updateNewPlan({ name: event.target.value })} className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white" />
                    </label>
                    <label className="text-xs text-slate-400">Description
                        <input required value={newPlan.description} onChange={(event) => updateNewPlan({ description: event.target.value })} className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white" />
                    </label>
                    <label className="text-xs text-slate-400">Audience
                        <input required value={newPlan.audience} onChange={(event) => updateNewPlan({ audience: event.target.value })} className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white" />
                    </label>
                    <label className="text-xs text-slate-400">Monthly price (cents)
                        {numberField(newPlan.monthlyPriceCents, (value) => updateNewPlan({ monthlyPriceCents: value }))}
                    </label>
                    <label className="text-xs text-slate-400">Annual price (cents)
                        {numberField(newPlan.annualPriceCents, (value) => updateNewPlan({ annualPriceCents: value }))}
                    </label>
                    <label className="text-xs text-slate-400">Complaints / month
                        {numberField(newPlan.complaintLimit, (value) => updateNewPlan({ complaintLimit: value }))}
                    </label>
                    <label className="text-xs text-slate-400">Team members
                        {numberField(newPlan.teamMemberLimit, (value) => updateNewPlan({ teamMemberLimit: value }))}
                    </label>
                    <label className="text-xs text-slate-400">AI analyses / month
                        {numberField(newPlan.aiAnalysisLimit, (value) => updateNewPlan({ aiAnalysisLimit: value }))}
                    </label>
                    <label className="text-xs text-slate-400">Storage (MB)
                        {numberField(newPlan.storageLimitMb, (value) => updateNewPlan({ storageLimitMb: value }))}
                    </label>
                    <label className="text-xs text-slate-400">Retention (days)
                        {numberField(newPlan.retentionDays, (value) => updateNewPlan({ retentionDays: value }))}
                    </label>
                    <label className="text-xs text-slate-400">Currency
                        <input required maxLength={3} value={newPlan.currency} onChange={(event) => updateNewPlan({ currency: event.target.value.toUpperCase() })} className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm uppercase text-white" />
                    </label>
                    <fieldset className="sm:col-span-2">
                        <legend className="mb-2 text-xs font-semibold text-slate-300">Implemented feature entitlements</legend>
                        {featureCheckboxes(newPlan.features, (features) => updateNewPlan({ features }))}
                    </fieldset>
                    <button type="submit" disabled={savingNew} className="w-fit rounded-lg bg-cyan-500 px-4 py-2 text-sm font-bold text-slate-950 disabled:opacity-50">
                        {savingNew ? "Creating…" : "Create plan"}
                    </button>
                </form>
            </section>

            <section aria-labelledby="subscriptions-heading">
                <h2 id="subscriptions-heading" className="mb-4 text-xl font-semibold">Recent subscriptions</h2>
                <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/70">
                    <table className="w-full min-w-[640px] text-left text-sm">
                        <thead className="border-b border-white/10 text-xs uppercase text-slate-400">
                            <tr><th className="p-4">Business</th><th className="p-4">Plan</th><th className="p-4">Status</th><th className="p-4">Provider</th><th className="p-4">Started</th></tr>
                        </thead>
                        <tbody>
                            {subscriptions.map((subscription) => (
                                <tr key={subscription.id} className="border-b border-white/5 last:border-0">
                                    <td className="p-4">{subscription.tenant.name}<span className="block text-xs text-slate-400">{subscription.tenant.email}</span></td>
                                    <td className="p-4">{subscription.plan.name}</td>
                                    <td className="p-4">{subscription.status}</td>
                                    <td className="p-4">{subscription.paymentProvider ?? "—"}</td>
                                    <td className="p-4">{new Date(subscription.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                            {subscriptions.length === 0 && (
                                <tr><td colSpan={5} className="p-4 text-slate-400">No subscription history yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <button type="button" onClick={() => void loadData()} className="mt-3 text-sm font-semibold text-cyan-300 underline underline-offset-4">
                    Refresh billing data
                </button>
            </section>
        </main>
    );
}
