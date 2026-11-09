"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock, HelpCircle, Search, ShieldCheck, Sparkles } from "lucide-react";

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
    <div className="min-h-screen bg-[#0d1526] text-slate-100 py-16 px-4 sm:px-6 lg:px-8 font-sans flex items-center justify-center">
      <div className="w-full max-w-xl space-y-8">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <Link
            href="/support"
            className="inline-flex items-center gap-1.5 hover:text-white transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Support Center
          </Link>
          <span className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Live Audit Ledger
          </span>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 sm:p-10 shadow-2xl backdrop-blur-md space-y-8">
          <div className="text-center space-y-3">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20">
              <Search className="h-7 w-7" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Track Incident & SLA Status
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
              Enter your unique tracking code to inspect real-time milestone logs, specialist assignments,
              and resolution offers.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Incident Tracking ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="e.g. BCIP-9042 or BCIP-9038"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 py-3.5 pl-4 pr-12 font-mono text-sm uppercase text-slate-100 placeholder-slate-500 shadow-inner focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                  type="submit"
                  disabled={!id.trim()}
                  className="absolute right-2 top-2 rounded-xl bg-blue-600 hover:bg-blue-500 p-2 text-white shadow-md transition disabled:opacity-40"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={!id.trim()}
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/30 transition disabled:opacity-40"
            >
              Inspect Live Progress
            </button>
          </form>

          {/* Quick Demo Incidents */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Or inspect live enterprise demo incidents:
            </span>
            <div className="grid gap-2 sm:grid-cols-2">
              {DEMO_IDS.map((demo) => (
                <button
                  key={demo.id}
                  type="button"
                  onClick={() => router.push(`/support/track/${demo.id}`)}
                  className="flex flex-col rounded-xl border border-slate-800 bg-slate-950/40 p-3 text-left hover:border-blue-500/50 hover:bg-slate-800/60 transition group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-blue-400 group-hover:underline">
                      {demo.id}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">{demo.status}</span>
                  </div>
                  <span className="text-[11px] text-slate-300 truncate mt-1">{demo.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
            <Link href="/support/report" className="hover:text-white transition">
              Need to file a new report?
            </Link>
            <Link href="/support/report/voice" className="text-purple-400 hover:underline">
              Use Voice Assistant
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
