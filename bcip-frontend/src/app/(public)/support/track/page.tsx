"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Search, ShieldCheck } from "lucide-react";

const DEMO_IDS = [
  { id: "BCIP-9042", label: "Invoice Double Charge ($14,500)", status: "Active Triage" },
  { id: "BCIP-9038", label: "API Gateway 504 Timeout", status: "Engineering" },
  { id: "BCIP-9035", label: "Pharma Cold-Chain Excursion", status: "Priority Logistics" },
  { id: "BCIP-9021", label: "Delayed Freight Consignment", status: "Resolved" },
];

export default function TrackLookup() {
  const router = useRouter();
  const [id, setId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = id.trim().toUpperCase();
    if (clean) {
      router.push(`/support/track/${clean}`);
    }
  };

  return (
    <div className="min-h-screen bg-wash text-ink py-16 px-4 sm:px-6 lg:px-8 font-sans flex items-center justify-center">
      <div className="w-full max-w-xl space-y-8">
        <div className="flex items-center justify-between text-xs text-muted">
          <Link
            href="/support"
            className="inline-flex items-center gap-1.5 hover:text-ink transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Support Center
          </Link>
          <span className="flex items-center gap-1.5 text-success font-mono text-[11px]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Live Audit Ledger
          </span>
        </div>

        <div className="rounded-3xl border border-line bg-white p-8 sm:p-10 shadow-2xl backdrop-blur-md space-y-8">
          <div className="text-center space-y-3">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-lilac text-brand ring-1 ring-brand/20">
              <Search className="h-7 w-7" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-ink">
              Track Incident & SLA Status
            </h1>
            <p className="text-xs sm:text-sm text-ink-soft max-w-sm mx-auto leading-relaxed">
              Enter your unique tracking code to inspect real-time milestone logs, specialist assignments,
              and resolution offers.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-ink-soft">
                Incident Tracking ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="e.g. BCIP-9042 or BCIP-9038"
                  className="w-full rounded-2xl border border-line bg-wash py-3.5 pl-4 pr-12 font-mono text-sm uppercase text-ink placeholder-faint shadow-inner focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
                <button
                  type="submit"
                  disabled={!id.trim()}
                  className="absolute right-2 top-2 rounded-xl bg-ink hover:bg-brand p-2 text-white shadow-md transition disabled:opacity-40"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={!id.trim()}
              className="w-full rounded-xl bg-ink hover:bg-brand py-3 text-xs font-bold text-white shadow-lg shadow-brand/15 transition disabled:opacity-40"
            >
              Inspect Live Progress
            </button>
          </form>

          {/* Quick Demo Incidents */}
          <div className="space-y-3 pt-2 border-t border-line">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider block">
              Or inspect live enterprise demo incidents:
            </span>
            <div className="grid gap-2 sm:grid-cols-2">
              {DEMO_IDS.map((demo) => (
                <button
                  key={demo.id}
                  type="button"
                  onClick={() => router.push(`/support/track/${demo.id}`)}
                  className="flex flex-col rounded-xl border border-line bg-wash p-3 text-left hover:border-brand hover:bg-lilac-soft transition group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-brand group-hover:underline">
                      {demo.id}
                    </span>
                    <span className="text-[10px] text-muted font-medium">{demo.status}</span>
                  </div>
                  <span className="text-[11px] text-ink-soft truncate mt-1">{demo.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted pt-2 border-t border-line">
            <Link href="/support/report" className="hover:text-ink transition">
              Need to file a new report?
            </Link>
            <Link href="/support/report/voice" className="text-brand hover:underline">
              Use Voice Assistant
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
