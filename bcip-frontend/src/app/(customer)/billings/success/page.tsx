"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function BillingSuccessPage() {
  return (
    <div className="mx-auto max-w-lg py-12 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
        <CheckCircle2 className="h-8 w-8" />
      </div>
      <h1 className="mt-5 text-2xl font-bold tracking-tight text-[#101d30]">
        Subscription Updated
      </h1>
      <p className="mt-2 text-sm text-[#5e6b7d]">
        Your plan has been successfully activated. A confirmation receipt has been sent to your billing email.
      </p>

      <div className="mt-8 flex justify-center gap-3">
        <Link
          href="/customer/dashboard"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#2454d6] px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-[#1b43b4]"
        >
          Return to Portal
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/billings"
          className="inline-flex min-h-11 items-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          View Billing
        </Link>
      </div>
    </div>
  );
}
