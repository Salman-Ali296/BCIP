"use client";

import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";

export default function BillingCanceledPage() {
  return (
    <div className="mx-auto max-w-lg py-12 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-500">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h1 className="mt-5 text-2xl font-bold tracking-tight text-[#101d30]">
        Checkout Cancelled
      </h1>
      <p className="mt-2 text-sm text-[#5e6b7d]">
        No charges were made to your account. You can retry checkout anytime or contact our support team.
      </p>

      <div className="mt-8 flex justify-center gap-3">
        <Link
          href="/pricing"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#2454d6] px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-[#1b43b4]"
        >
          <ArrowLeft className="h-4 w-4" />
          Review Plans
        </Link>
        <Link
          href="/support"
          className="inline-flex min-h-11 items-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Contact Support
        </Link>
      </div>
    </div>
  );
}
