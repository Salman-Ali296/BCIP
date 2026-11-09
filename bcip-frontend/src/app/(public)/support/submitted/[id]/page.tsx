import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, Copy, ShieldCheck, Sparkles } from "lucide-react";
import { CopyButton } from "@/components/ui/copy-button";
import { tenant } from "@/config/tenant";

export default async function SubmittedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-[#0d1526] text-slate-100 py-16 px-4 sm:px-6 lg:px-8 font-sans flex items-center justify-center">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-3">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30">
            <CheckCircle2 className="h-8 w-8" />
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Incident Registered & Verified
          </h1>
          <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
            Your grievance has been successfully received by the {tenant.name} operations team and
            processed through our AI NLP intake pipeline.
          </p>
        </div>

        {/* Tracking Code Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-blue-500/30 bg-blue-950/20 p-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-300">
                Official Incident Tracking Code
              </p>
              <p className="mt-1 font-mono text-2xl font-black text-white">{id}</p>
            </div>
            <div className="flex items-center gap-2">
              <CopyButton text={id} />
              <Link
                href={`/support/track/${id}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-bold text-white shadow-md transition"
              >
                Track Status
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Next Steps List */}
          <div className="space-y-4 pt-2 border-t border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Next Operational Steps
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3 rounded-xl bg-slate-950/50 p-3.5 border border-slate-800">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400 font-bold">
                  1
                </span>
                <div>
                  <strong className="text-white block font-semibold">AI NLP Triage & Semantic Indexing</strong>
                  <p className="text-slate-400 mt-0.5">
                    Urgency score, emotional sentiment, and category tags have been generated.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-slate-950/50 p-3.5 border border-slate-800">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-bold">
                  2
                </span>
                <div>
                  <strong className="text-white block font-semibold">Specialist Assignment (SLA Active)</strong>
                  <p className="text-slate-400 mt-0.5">
                    A dedicated Level-2 specialist is assigned to review the evidence and formulate corrective action.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-slate-950/50 p-3.5 border border-slate-800">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400 font-bold">
                  3
                </span>
                <div>
                  <strong className="text-white block font-semibold">Formal Resolution Notification</strong>
                  <p className="text-slate-400 mt-0.5">
                    You will receive direct notification via corporate email when remedial measures are proposed.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
            <Link
              href="/support"
              className="text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              ← Return to Support Portal
            </Link>

            <Link
              href={`/support/track/${id}`}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 transition"
            >
              Open Live Tracking View
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
