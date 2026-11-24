"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Search } from "lucide-react";
import { useEnterprise } from "@/features/enterprise/context/enterprise-context";

export default function BusinessCustomersPage() {
    const router = useRouter();
    const {
        complaints,
        setSelectedComplaintId,
        setActiveQueue,
        isLoadingComplaints,
        complaintsError,
        refreshComplaints,
    } = useEnterprise();
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"ALL" | "OPEN" | "REPEAT">("ALL");

    // One card per customer email, built from the complaints they've filed.
    const customers = useMemo(() => {
        const byEmail = new Map<
            string,
            { name: string; email: string; total: number; open: number; latestId: string; latestTitle: string }
        >();
        for (const complaint of complaints) {
            const key = complaint.customer.email || complaint.customer.id;
            const isOpen = complaint.status !== "RESOLVED" && complaint.status !== "CLOSED";
            const existing = byEmail.get(key);
            if (existing) {
                existing.total += 1;
                existing.open += isOpen ? 1 : 0;
            } else {
                byEmail.set(key, {
                    name: complaint.customer.name,
                    email: complaint.customer.email,
                    total: 1,
                    open: isOpen ? 1 : 0,
                    latestId: complaint.id,
                    latestTitle: complaint.title,
                });
            }
        }
        return Array.from(byEmail.values()).sort((a, b) => b.open - a.open || b.total - a.total);
    }, [complaints]);

    const filtered = customers.filter((customer) => {
        if (filter === "OPEN" && customer.open === 0) return false;
        if (filter === "REPEAT" && customer.total < 2) return false;
        if (search.trim()) {
            const q = search.toLowerCase();
            return customer.name.toLowerCase().includes(q) || customer.email.toLowerCase().includes(q);
        }
        return true;
    });

    const repeatCount = customers.filter((customer) => customer.total > 1).length;

    function openLatest(id: string) {
        setActiveQueue("ALL");
        setSelectedComplaintId(id);
        router.push("/business/inbox");
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
                <div>
                    <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800">Customers</span>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                        People who have complained
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        {customers.length} {customers.length === 1 ? "customer" : "customers"}
                        {repeatCount > 0 ? `, ${repeatCount} with more than one complaint` : ""}. Repeat complainers are
                        often the first sign of a problem that wasn&apos;t really fixed.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Name or email"
                            aria-label="Search customers"
                            className="rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as typeof filter)}
                        aria-label="Filter customers"
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700"
                    >
                        <option value="ALL">Everyone</option>
                        <option value="OPEN">With an open complaint</option>
                        <option value="REPEAT">Complained more than once</option>
                    </select>
                </div>
            </div>

            {isLoadingComplaints ? (
                <p className="text-sm text-slate-500" role="status">Loading customers…</p>
            ) : complaintsError ? (
                <div className="text-sm text-slate-500" role="alert">
                    <p>{complaintsError}</p>
                    <button type="button" onClick={refreshComplaints} className="mt-2 font-semibold text-slate-800 underline underline-offset-4">
                        Try again
                    </button>
                </div>
            ) : filtered.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                    {customers.length === 0
                        ? "No customers yet. They appear here after their first complaint."
                        : "No customers match that search."}
                </p>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((customer) => (
                        <div
                            key={customer.email || customer.latestId}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4 hover:border-blue-200 transition"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-3">
                                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 font-bold uppercase text-slate-800 text-sm">
                                        {customer.name.slice(0, 2)}
                                    </span>
                                    <div className="min-w-0">
                                        <h3 className="truncate text-sm font-bold text-slate-900">{customer.name}</h3>
                                        <span className="flex items-center gap-1.5 truncate text-[11px] text-slate-500">
                                            <Mail className="h-3 w-3 shrink-0" aria-hidden="true" />
                                            {customer.email || "No email"}
                                        </span>
                                    </div>
                                </div>
                                {customer.total > 1 && (
                                    <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-900">
                                        Repeat
                                    </span>
                                )}
                            </div>

                            <p className="border-t border-slate-100 pt-3 text-xs text-slate-600 line-clamp-2">
                                Latest: {customer.latestTitle}
                            </p>

                            <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                                <span className="text-slate-500">
                                    <strong className="text-slate-900">{customer.open}</strong> open ·{" "}
                                    <strong className="text-slate-900">{customer.total}</strong> total
                                </span>
                                <button
                                    type="button"
                                    onClick={() => openLatest(customer.latestId)}
                                    className="font-bold text-blue-600 hover:underline"
                                >
                                    Open latest →
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
