"use client";

import { useState } from "react";
import { Users, Search, Phone, Mail, ShieldAlert, ArrowRight, Building2, User } from "lucide-react";
import { ENTERPRISE_COMPLAINTS } from "@/features/enterprise/mock-data";

export default function BusinessCustomersPage() {
    const [search, setSearch] = useState("");
    const [tierFilter, setTierFilter] = useState("ALL");

    // Gather unique customers from complaints
    const customers = Array.from(
        new Map(ENTERPRISE_COMPLAINTS.map((c) => [c.customer.id, c.customer])).values()
    );

    const filtered = customers.filter((cust) => {
        if (tierFilter !== "ALL" && cust.tier !== tierFilter) return false;
        if (search.trim()) {
            const q = search.toLowerCase();
            return (
                cust.name.toLowerCase().includes(q) ||
                cust.email.toLowerCase().includes(q) ||
                cust.accountNumber.toLowerCase().includes(q)
            );
        }
        return true;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
                <div>
                    <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800">
                        Customer Intelligence
                    </span>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                        Enterprise Customer Directory
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Track dispute frequency, account tiers, and contact records across verified clients.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search customers..."
                            className="rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                    <select
                        value={tierFilter}
                        onChange={(e) => setTierFilter(e.target.value)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700"
                    >
                        <option value="ALL">All Account Tiers</option>
                        <option value="VIP Enterprise">VIP Enterprise</option>
                        <option value="Preferred">Preferred</option>
                        <option value="Standard">Standard</option>
                    </select>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((cust) => {
                    const custComplaints = ENTERPRISE_COMPLAINTS.filter((c) => c.customer.id === cust.id);

                    return (
                        <div
                            key={cust.id}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4 hover:border-blue-200 transition"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 font-bold text-slate-800 text-sm">
                                        {cust.name.split(" ").map((n) => n[0]).join("")}
                                    </span>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900">{cust.name}</h3>
                                        <span className="font-mono text-[11px] text-slate-400">{cust.accountNumber}</span>
                                    </div>
                                </div>
                                <span
                                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                        cust.tier === "VIP Enterprise"
                                            ? "bg-purple-100 text-purple-900"
                                            : cust.tier === "Preferred"
                                            ? "bg-blue-100 text-blue-900"
                                            : "bg-slate-100 text-slate-700"
                                    }`}
                                >
                                    {cust.tier}
                                </span>
                            </div>

                            <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                                <div className="flex items-center gap-2">
                                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                                    <span>{cust.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                                    <span>{cust.phone}</span>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                                <span className="text-slate-500">
                                    Active Cases: <strong className="text-slate-900">{custComplaints.length}</strong>
                                </span>
                                <button
                                    type="button"
                                    onClick={() => (window.location.href = "/business/inbox")}
                                    className="font-bold text-blue-600 hover:underline"
                                >
                                    View In Inbox →
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}