"use client";

import { useState } from "react";
import { CheckCircle2, X, ShieldCheck, ArrowRight } from "lucide-react";
import { useEnterprise } from "../context/enterprise-context";

export function ResolutionDialog() {
    const {
        resolveModalComplaintId,
        setResolveModalComplaintId,
        complaints,
        resolveComplaint,
    } = useEnterprise();

    const [resolutionCode, setResolutionCode] = useState<string>("CREDIT_WAIVER_AUTHORIZED");
    const [explanation, setExplanation] = useState<string>("");

    if (!resolveModalComplaintId) return null;

    const complaint = complaints.find((c) => c.id === resolveModalComplaintId);
    if (!complaint) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        resolveComplaint(complaint.id, resolutionCode, explanation);
        setExplanation("");
    };

    const RESOLUTION_CODES = [
        { code: "CREDIT_WAIVER_AUTHORIZED", label: "Financial Credit / Waiver Authorized", desc: "Refund, fee waiver, or courtesy balance applied" },
        { code: "REPLACEMENT_DISPATCHED", label: "Replacement / Order Fulfilled", desc: "Goods dispatched with tracking verification" },
        { code: "GATEWAY_HOLD_RELEASED", label: "Gateway Ledger Reconciled", desc: "Transaction hold lifted and merchant funds released" },
        { code: "TECHNICAL_FIX_DEPLOYED", label: "Technical Bug / Account Resolved", desc: "Biometrics reset, credentials fixed, or feature patched" },
        { code: "POLICY_EXPLANATION_ACCEPTED", label: "Policy Clarified with Customer", desc: "Customer accepted terms and resolution conditions" },
    ];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
            aria-labelledby="resolve-modal-title"
        >
            <div className="relative flex flex-col w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl border border-emerald-200">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-emerald-100 bg-emerald-50/70 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-600 text-white shadow-sm">
                            <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-emerald-800">
                                    {complaint.id}
                                </span>
                                <span className="rounded bg-emerald-100 px-2 py-0.2 text-[10px] font-bold text-emerald-900 uppercase">
                                    Official Resolution
                                </span>
                            </div>
                            <h2 id="resolve-modal-title" className="text-base font-bold text-slate-900 mt-0.5">
                                Finalize Case Settlement
                            </h2>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setResolveModalComplaintId(null)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <p className="text-xs font-semibold text-slate-700">Subject Complaint:</p>
                        <p className="text-sm font-bold text-slate-900 mt-0.5 truncate">{complaint.title}</p>
                        <p className="text-xs text-slate-500">Customer: {complaint.customer.name}</p>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Resolution Classification Code *
                        </label>
                        <div className="space-y-1.5">
                            {RESOLUTION_CODES.map((rc) => (
                                <button
                                    key={rc.code}
                                    type="button"
                                    onClick={() => setResolutionCode(rc.code)}
                                    className={`w-full p-2.5 text-left rounded-xl border transition ${
                                        resolutionCode === rc.code
                                            ? "border-emerald-600 bg-emerald-50/80 ring-1 ring-emerald-600"
                                            : "border-slate-200 hover:bg-slate-50"
                                    }`}
                                >
                                    <span className="block text-xs font-bold text-slate-900">{rc.label}</span>
                                    <span className="block text-[11px] text-slate-500">{rc.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Customer Explanation Statement *
                        </label>
                        <textarea
                            rows={3}
                            required
                            value={explanation}
                            onChange={(e) => setExplanation(e.target.value)}
                            placeholder="Detail the remedy provided and any instructions for the customer..."
                            className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setResolveModalComplaintId(null)}
                            className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!explanation.trim()}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-50"
                        >
                            <span>Confirm Case Resolution</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
