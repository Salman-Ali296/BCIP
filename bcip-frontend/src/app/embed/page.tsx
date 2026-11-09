"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Code2,
  Copy,
  ExternalLink,
  HelpCircle,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

export default function EmbedWidgetPage() {
  const [buttonText, setButtonText] = useState("Report an Issue");
  const [position, setPosition] = useState<"bottom-right" | "bottom-left">("bottom-right");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [accentColor, setAccentColor] = useState("#2563eb");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const embedScript = `<!-- BCIP Enterprise Complaint Widget Integration -->
<script
  src="https://cdn.bcip-platform.com/v1/widget.js"
  data-tenant-id="tenant_enterprise_core"
  data-button-text="${buttonText}"
  data-position="${position}"
  data-theme="${theme}"
  data-accent="${accentColor}"
  async>
</script>`;

  const copyScript = async () => {
    try {
      await navigator.clipboard.writeText(embedScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1526] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Navigation */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <Link
            href="/business/dashboard"
            className="inline-flex items-center gap-1.5 hover:text-white transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Return to Command Center
          </Link>
          <span className="flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Proposal Section 3.2.2: Website Integration
          </span>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Embeddable Complaint Widget Studio
          </h1>
          <p className="mt-2 text-sm text-slate-300 max-w-2xl leading-relaxed">
            Integrate our AI-Powered Grievance Intake directly onto your company website or SaaS
            application with a lightweight 1-line script tag.
          </p>
        </div>

        {/* Configuration & Preview Grid */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Controls Column (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-7 shadow-xl space-y-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                Widget Customization
              </h2>

              {/* Button Label */}
              <div className="space-y-1.5 text-xs">
                <label className="font-semibold text-slate-300">Trigger Button Label</label>
                <input
                  type="text"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/70 p-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Position */}
              <div className="space-y-1.5 text-xs">
                <label className="font-semibold text-slate-300">Screen Position</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPosition("bottom-right")}
                    className={`rounded-xl border p-2 text-center font-bold transition ${
                      position === "bottom-right"
                        ? "border-blue-500 bg-blue-500/20 text-blue-300"
                        : "border-slate-800 bg-slate-950/40 text-slate-400 hover:text-white"
                    }`}
                  >
                    Bottom Right
                  </button>
                  <button
                    type="button"
                    onClick={() => setPosition("bottom-left")}
                    className={`rounded-xl border p-2 text-center font-bold transition ${
                      position === "bottom-left"
                        ? "border-blue-500 bg-blue-500/20 text-blue-300"
                        : "border-slate-800 bg-slate-950/40 text-slate-400 hover:text-white"
                    }`}
                  >
                    Bottom Left
                  </button>
                </div>
              </div>

              {/* Theme */}
              <div className="space-y-1.5 text-xs">
                <label className="font-semibold text-slate-300">Modal Aesthetic Theme</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTheme("dark")}
                    className={`rounded-xl border p-2 text-center font-bold transition ${
                      theme === "dark"
                        ? "border-purple-500 bg-purple-500/20 text-purple-300"
                        : "border-slate-800 bg-slate-950/40 text-slate-400 hover:text-white"
                    }`}
                  >
                    Enterprise Dark
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme("light")}
                    className={`rounded-xl border p-2 text-center font-bold transition ${
                      theme === "light"
                        ? "border-blue-500 bg-blue-500/20 text-blue-300"
                        : "border-slate-800 bg-slate-950/40 text-slate-400 hover:text-white"
                    }`}
                  >
                    Corporate Light
                  </button>
                </div>
              </div>

              {/* Accent Color */}
              <div className="space-y-1.5 text-xs">
                <label className="font-semibold text-slate-300">Brand Color</label>
                <div className="flex items-center gap-2">
                  {["#2563eb", "#7c3aed", "#059669", "#dc2626", "#ea580c"].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setAccentColor(color)}
                      style={{ backgroundColor: color }}
                      className={`h-7 w-7 rounded-full transition-transform ${
                        accentColor === color ? "scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900" : ""
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Embed Script Code Box */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Code2 className="h-4 w-4 text-blue-400" />
                  Script Snippet
                </span>
                <button
                  type="button"
                  onClick={copyScript}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-400 hover:underline"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Copied" : "Copy Tag"}
                </button>
              </div>

              <pre className="rounded-2xl bg-black/60 p-4 font-mono text-[11px] text-blue-200 overflow-x-auto border border-slate-800">
                {embedScript}
              </pre>

              <p className="text-[11px] text-slate-400">
                Place this snippet before the closing <code className="text-slate-300 font-mono">&lt;/body&gt;</code> tag on your website.
              </p>
            </div>
          </div>

          {/* Interactive Simulation Column (7 cols) */}
          <div className="lg:col-span-7">
            <div className="relative min-h-[540px] rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-black p-8 shadow-2xl flex flex-col justify-between overflow-hidden">
              {/* Simulated Customer Website Preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                    <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                    <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 font-mono text-xs text-slate-400">
                      https://client-corp.com/store
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">Live Client Site Simulation</span>
                </div>

                <div className="space-y-3 pt-6 max-w-md">
                  <div className="h-6 w-48 rounded-lg bg-slate-800/80" />
                  <div className="h-4 w-full rounded-lg bg-slate-800/40" />
                  <div className="h-4 w-5/6 rounded-lg bg-slate-800/40" />
                  <div className="h-10 w-36 rounded-xl bg-blue-600/30 border border-blue-500/30 mt-6" />
                </div>
              </div>

              {/* Floating Widget Trigger Button */}
              <div
                className={`absolute bottom-8 ${
                  position === "bottom-right" ? "right-8" : "left-8"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setIsModalOpen(!isModalOpen)}
                  style={{ backgroundColor: accentColor }}
                  className="flex items-center gap-2.5 rounded-full px-5 py-3 text-xs font-bold text-white shadow-2xl transition hover:scale-105"
                >
                  <MessageSquare className="h-4 w-4" />
                  {buttonText}
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                </button>
              </div>

              {/* Interactive Modal Drawer Simulation */}
              {isModalOpen && (
                <div
                  className={`absolute bottom-24 ${
                    position === "bottom-right" ? "right-8" : "left-8"
                  } w-80 sm:w-96 rounded-3xl border border-slate-700 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl space-y-4 animate-in fade-in zoom-in-95`}
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                      <h4 className="font-bold text-xs text-white">Client Grievance Portal</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-normal">
                    Describe your issue. It will be automatically scored for urgency and routed to senior ops.
                  </p>

                  <textarea
                    rows={3}
                    placeholder="Enter issue details..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                  />

                  <div className="flex items-center justify-between pt-1">
                    <Link
                      href="/support/report"
                      className="text-[11px] text-blue-400 hover:underline font-semibold"
                    >
                      Full Intake Studio →
                    </Link>
                    <button
                      type="button"
                      style={{ backgroundColor: accentColor }}
                      className="rounded-xl px-4 py-2 text-xs font-bold text-white shadow-md"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
