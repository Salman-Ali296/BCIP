"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, CreditCard, Download, Receipt, Shield } from "lucide-react";

export default function CustomerBillingPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#101d30]">Billing & Subscription</h1>
        <p className="mt-1 text-sm text-[#5e6b7d]">
          Review your current plan, payment methods, and invoice history.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Plan</span>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
              Active
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold text-[#101d30]">Enterprise Dedicated</p>
          <p className="mt-1 text-xs text-[#5e6b7d]">Renews on the 1st of every calendar month.</p>
          <div className="mt-6 border-t border-slate-100 pt-4">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#2454d6] hover:underline"
            >
              Explore plan options <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Payment Method</span>
            <CreditCard className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-4 text-sm font-semibold text-[#101d30]">Corporate ACH / Wire</p>
          <p className="mt-1 text-xs text-[#5e6b7d]">Net 30 automated invoicing via finance portal.</p>
          <div className="mt-6 border-t border-slate-100 pt-4">
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
              <Shield className="h-3.5 w-3.5 text-emerald-600" /> Verified business billing profile
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Invoicing Contact</span>
            <Receipt className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-4 text-sm font-semibold text-[#101d30]">billing-ops@acme-global.com</p>
          <p className="mt-1 text-xs text-[#5e6b7d]">Invoices and receipts delivered automatically.</p>
          <div className="mt-6 border-t border-slate-100 pt-4">
            <Link href="/customer/settings" className="text-xs font-bold text-[#2454d6] hover:underline">
              Update billing contact
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <h2 className="text-base font-semibold text-[#101d30]">Recent Statements & Invoices</h2>
        <p className="mt-1 text-xs text-[#5e6b7d]">Download historical invoices for accounting reconciliation.</p>

        <div className="mt-4 divide-y divide-slate-100 border-t border-slate-100">
          {[
            { id: "INV-2026-009", date: "Sep 01, 2026", amount: "$1,850.00", status: "Paid" },
            { id: "INV-2026-008", date: "Aug 01, 2026", amount: "$1,850.00", status: "Paid" },
            { id: "INV-2026-007", date: "Jul 01, 2026", amount: "$1,850.00", status: "Paid" },
          ].map((inv) => (
            <div key={inv.id} className="flex items-center justify-between py-3.5 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-mono font-semibold text-[#101d30]">{inv.id}</span>
                <span className="text-slate-500">{inv.date}</span>
                <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">
                  <CheckCircle2 className="h-3 w-3" /> {inv.status}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono font-semibold text-[#101d30]">{inv.amount}</span>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Download className="h-3 w-3" /> PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
