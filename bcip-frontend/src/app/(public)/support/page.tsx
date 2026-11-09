"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Headphones,
  HelpCircle,
  Mic,
  Search,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

export default function SupportHome() {
  const router = useRouter();
  const [trackQuery, setTrackQuery] = useState("");

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = trackQuery.trim();
    if (cleanId) {
      router.push(`/support/track/${cleanId}`);
    } else {
      router.push("/support/track");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white font-sans">
      {/* Top Hero Banner */}
      <div className="relative isolate overflow-hidden border-b border-slate-800/80 px-6 py-16 sm:py-24 lg:px-8">
        <div className="pointer-events-none absolute -top-40 right-0 -z-10 transform-gpu blur-3xl sm:-top-80">
          <div
            className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#3b82f6] to-[#10b981] opacity-20"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>

        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Enterprise Grievance & SLA Resolution System
          </div>

          <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Enterprise Customer Support &{" "}
            <span className="bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              Complaint Intelligence
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-lg leading-relaxed text-slate-300 max-w-2xl mx-auto">
            Submit formal complaints with automated AI triage, speak directly via our
            Voice Assistant, or track your live SLA investigation in real-time.
          </p>

          {/* Quick Tracking Search Bar */}
          <form
            onSubmit={handleTrackSubmit}
            className="mt-8 mx-auto max-w-xl flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/80 p-2 shadow-2xl backdrop-blur-md focus-within:border-blue-500 transition"
          >
            <div className="flex items-center gap-2 pl-3 flex-1">
              <Search className="h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={trackQuery}
                onChange={(e) => setTrackQuery(e.target.value)}
                placeholder="Enter Incident or Tracking ID (e.g. BCIP-9042)"
                className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2.5 text-xs font-bold text-white transition shadow-lg shadow-blue-600/30"
            >
              Track Now
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Main Interaction Cards */}
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Card 1: Standard Intake */}
          <Link
            href="/support/report"
            className="group relative flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-850/80 p-8 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:bg-slate-800"
          >
            <div>
              <span className="inline-flex rounded-2xl bg-blue-500/10 p-4 text-blue-400 ring-1 ring-blue-500/20 group-hover:scale-110 transition">
                <Sparkles className="h-7 w-7" />
              </span>
              <h2 className="mt-6 text-xl font-bold text-white group-hover:text-blue-400 transition">
                Report an Issue
              </h2>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-400">
                Submit an enriched incident report with order references, file attachments,
                and real-time AI category matching.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-2 text-xs font-bold text-blue-400">
              Launch Form Studio
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* Card 2: AI Voice Assistant */}
          <Link
            href="/support/report/voice"
            className="group relative flex flex-col justify-between rounded-3xl border border-purple-500/30 bg-gradient-to-b from-purple-950/30 to-slate-900/90 p-8 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-purple-400 hover:shadow-purple-900/20"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="inline-flex rounded-2xl bg-purple-500/10 p-4 text-purple-400 ring-1 ring-purple-500/20 group-hover:scale-110 transition">
                  <Mic className="h-7 w-7" />
                </span>
                <span className="rounded-full bg-purple-500/20 border border-purple-400/40 px-2.5 py-1 text-[11px] font-bold text-purple-300 uppercase tracking-wider">
                  AI Voice Assistant
                </span>
              </div>
              <h2 className="mt-6 text-xl font-bold text-white group-hover:text-purple-300 transition">
                Speak Your Complaint
              </h2>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-400">
                Prefer speaking over typing? Record your grievance in natural voice.
                Our NLP engine automatically transcribes, extracts urgency, and routes your case.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-2 text-xs font-bold text-purple-400">
              Start Voice Recording
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* Card 3: Live Incident Tracking */}
          <Link
            href="/support/track"
            className="group relative flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-850/80 p-8 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/50 hover:bg-slate-800"
          >
            <div>
              <span className="inline-flex rounded-2xl bg-emerald-500/10 p-4 text-emerald-400 ring-1 ring-emerald-500/20 group-hover:scale-110 transition">
                <Clock className="h-7 w-7" />
              </span>
              <h2 className="mt-6 text-xl font-bold text-white group-hover:text-emerald-400 transition">
                Track Existing Incident
              </h2>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-400">
                Check real-time milestone logs, review resolution offers, communicate with
                your assigned specialist, and rate resolution CSAT.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-2 text-xs font-bold text-emerald-400">
              Open Tracking Portal
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>
        </div>

        {/* Enterprise SLA & Governance Highlights */}
        <div className="mt-16 rounded-3xl border border-slate-800 bg-slate-900/60 p-8 sm:p-10 backdrop-blur-md">
          <div className="grid gap-6 sm:grid-cols-3 text-center sm:text-left">
            <div className="flex items-start gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <Clock className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-bold text-white text-sm">2-Hour SLA Commitment</h3>
                <p className="mt-1 text-xs text-slate-400 leading-normal">
                  Every high and critical complaint receives verified specialist assignment within 120 minutes.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-bold text-white text-sm">Human-in-the-Loop Governance</h3>
                <p className="mt-1 text-xs text-slate-400 leading-normal">
                  AI extracts intelligence, but human executives authorize every refund, repair, and decision.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                <Zap className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-bold text-white text-sm">Immutable Audit Logs</h3>
                <p className="mt-1 text-xs text-slate-400 leading-normal">
                  All timeline updates, status shifts, and interactions are timestamped for complete accountability.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

