import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { CopyButton } from "@/components/ui/copy-button";
import { tenant } from "@/config/tenant";

export default async function SubmittedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-wash text-ink py-16 px-4 sm:px-6 lg:px-8 font-sans flex items-center justify-center">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-3">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-success-soft text-success ring-1 ring-success/20">
            <CheckCircle2 className="h-8 w-8" />
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-ink">
            Incident Registered & Verified
          </h1>
          <p className="text-sm text-ink-soft max-w-lg mx-auto leading-relaxed">
            Your grievance has been successfully received by the {tenant.name} operations team and
            processed through our AI NLP intake pipeline.
          </p>
        </div>

        {/* Tracking Code Card */}
        <div className="rounded-3xl border border-line bg-white p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand-soft bg-lilac-soft p-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand">
                Official Incident Tracking Code
              </p>
              <p className="mt-1 font-mono text-2xl font-black text-ink">{id}</p>
            </div>
            <div className="flex items-center gap-2">
              <CopyButton text={id} />
              <Link
                href={`/support/track/${id}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-ink hover:bg-brand px-4 py-2 text-xs font-bold text-white shadow-md transition"
              >
                Track Status
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Next Steps List */}
          <div className="space-y-4 pt-2 border-t border-line">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
              Next Operational Steps
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3 rounded-xl bg-wash p-3.5 border border-line">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-lilac text-brand font-bold">
                  1
                </span>
                <div>
                  <strong className="text-ink block font-semibold">AI NLP Triage & Semantic Indexing</strong>
                  <p className="text-muted mt-0.5">
                    Urgency score, emotional sentiment, and category tags have been generated.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-wash p-3.5 border border-line">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-success-soft text-success font-bold">
                  2
                </span>
                <div>
                  <strong className="text-ink block font-semibold">Specialist Assignment (SLA Active)</strong>
                  <p className="text-muted mt-0.5">
                    A dedicated Level-2 specialist is assigned to review the evidence and formulate corrective action.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-wash p-3.5 border border-line">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-lilac text-brand font-bold">
                  3
                </span>
                <div>
                  <strong className="text-ink block font-semibold">Formal Resolution Notification</strong>
                  <p className="text-muted mt-0.5">
                    You will receive direct notification via corporate email when remedial measures are proposed.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-line">
            <Link
              href="/support"
              className="text-xs font-semibold text-muted hover:text-ink transition"
            >
              ← Return to Support Portal
            </Link>

            <Link
              href={`/support/track/${id}`}
              className="inline-flex items-center gap-2 rounded-xl bg-ink hover:bg-brand px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-brand/15 transition"
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
