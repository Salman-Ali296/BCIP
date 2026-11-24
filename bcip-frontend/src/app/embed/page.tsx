"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Code2,
  Copy,
  MessageSquare,
  ShieldCheck,
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
    <div className="min-h-screen bg-wash text-ink py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Navigation */}
        <div className="flex items-center justify-between text-xs text-muted">
          <Link
            href="/business/dashboard"
            className="inline-flex items-center gap-1.5 hover:text-ink transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Return to Command Center
          </Link>
          <span className="flex items-center gap-1 text-success font-mono text-[11px]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Proposal Section 3.2.2: Website Integration
          </span>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-ink">
            Embeddable Complaint Widget Studio
          </h1>
          <p className="mt-2 text-sm text-ink-soft max-w-2xl leading-relaxed">
            Integrate our AI-Powered Grievance Intake directly onto your company website or SaaS
            application with a lightweight 1-line script tag.
          </p>
        </div>

        {/* Configuration & Preview Grid */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Controls Column (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl border border-line bg-white p-6 sm:p-7 shadow-xl space-y-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-ink-soft">
                Widget Customization
              </h2>

              {/* Button Label */}
              <div className="space-y-1.5 text-xs">
                <label className="font-semibold text-ink-soft">Trigger Button Label</label>
                <input
                  type="text"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  className="w-full rounded-xl border border-line bg-wash p-2.5 text-xs text-ink focus:border-brand focus:outline-none"
                />
              </div>

              {/* Position */}
              <div className="space-y-1.5 text-xs">
                <label className="font-semibold text-ink-soft">Screen Position</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPosition("bottom-right")}
                    className={`rounded-xl border p-2 text-center font-bold transition ${
                      position === "bottom-right"
                        ? "border-brand-soft bg-lilac text-brand"
                        : "border-line bg-wash text-muted hover:text-ink"
                    }`}
                  >
                    Bottom Right
                  </button>
                  <button
                    type="button"
                    onClick={() => setPosition("bottom-left")}
                    className={`rounded-xl border p-2 text-center font-bold transition ${
                      position === "bottom-left"
                        ? "border-brand-soft bg-lilac text-brand"
                        : "border-line bg-wash text-muted hover:text-ink"
                    }`}
                  >
                    Bottom Left
                  </button>
                </div>
              </div>

              {/* Theme */}
              <div className="space-y-1.5 text-xs">
                <label className="font-semibold text-ink-soft">Modal Aesthetic Theme</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTheme("dark")}
                    className={`rounded-xl border p-2 text-center font-bold transition ${
                      theme === "dark"
                        ? "border-brand-soft bg-lilac text-brand"
                        : "border-line bg-wash text-muted hover:text-ink"
                    }`}
                  >
                    Enterprise Dark
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme("light")}
                    className={`rounded-xl border p-2 text-center font-bold transition ${
                      theme === "light"
                        ? "border-brand-soft bg-lilac text-brand"
                        : "border-line bg-wash text-muted hover:text-ink"
                    }`}
                  >
                    Corporate Light
                  </button>
                </div>
              </div>

              {/* Accent Color */}
              <div className="space-y-1.5 text-xs">
                <label className="font-semibold text-ink-soft">Brand Color</label>
                <div className="flex items-center gap-2">
                  {["#2563eb", "#7c3aed", "#059669", "#dc2626", "#ea580c"].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setAccentColor(color)}
                      style={{ backgroundColor: color }}
                      className={`h-7 w-7 rounded-full transition-transform ${
                        accentColor === color ? "scale-125 ring-2 ring-line ring-offset-2 ring-offset-slate-900" : ""
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Embed Script Code Box */}
            <div className="rounded-3xl border border-line bg-white p-6 shadow-xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-ink-soft flex items-center gap-1.5">
                  <Code2 className="h-4 w-4 text-brand" />
                  Script Snippet
                </span>
                <button
                  type="button"
                  onClick={copyScript}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-brand hover:underline"
                >
                  {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Copied" : "Copy Tag"}
                </button>
              </div>

              <pre className="rounded-2xl bg-ink p-4 font-mono text-[11px] text-brand-soft overflow-x-auto border border-ink">
                {embedScript}
              </pre>

              <p className="text-[11px] text-muted">
                Place this snippet before the closing <code className="text-ink-soft font-mono">&lt;/body&gt;</code> tag on your website.
              </p>
            </div>
          </div>

          {/* Interactive Simulation Column (7 cols) */}
          <div className="lg:col-span-7">
            <div className="relative min-h-[540px] rounded-3xl border border-line bg-gradient-to-br from-white via-wash to-wash p-8 shadow-2xl flex flex-col justify-between overflow-hidden">
              {/* Simulated Customer Website Preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-line pb-4">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-danger/80" />
                    <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                    <span className="h-3 w-3 rounded-full bg-success/80" />
                    <span className="ml-2 font-mono text-xs text-muted">
                      https://client-corp.com/store
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-subtle">Live Client Site Simulation</span>
                </div>

                <div className="space-y-3 pt-6 max-w-md">
                  <div className="h-6 w-48 rounded-lg bg-lilac-soft" />
                  <div className="h-4 w-full rounded-lg bg-lilac-soft" />
                  <div className="h-4 w-5/6 rounded-lg bg-lilac-soft" />
                  <div className="h-10 w-36 rounded-xl bg-lilac border border-brand-soft mt-6" />
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
                  className="flex items-center gap-2.5 rounded-full px-5 py-3 text-xs font-bold text-ink shadow-2xl transition hover:scale-105"
                >
                  <MessageSquare className="h-4 w-4" />
                  {buttonText}
                  <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                </button>
              </div>

              {/* Interactive Modal Drawer Simulation */}
              {isModalOpen && (
                <div
                  className={`absolute bottom-24 ${
                    position === "bottom-right" ? "right-8" : "left-8"
                  } w-80 sm:w-96 rounded-3xl border border-line bg-white p-6 shadow-2xl backdrop-blur-xl space-y-4 animate-in fade-in zoom-in-95`}
                >
                  <div className="flex items-center justify-between border-b border-line pb-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-ink" />
                      <h4 className="font-bold text-xs text-ink">Client Grievance Portal</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="text-muted hover:text-ink"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="text-[11px] text-ink-soft leading-normal">
                    Describe your issue. It will be automatically scored for urgency and routed to senior ops.
                  </p>

                  <textarea
                    rows={3}
                    placeholder="Enter issue details..."
                    className="w-full rounded-xl border border-line bg-wash p-2.5 text-xs text-ink placeholder-faint focus:outline-none"
                  />

                  <div className="flex items-center justify-between pt-1">
                    <Link
                      href="/support/report"
                      className="text-[11px] text-brand hover:underline font-semibold"
                    >
                      Full Intake Studio →
                    </Link>
                    <button
                      type="button"
                      style={{ backgroundColor: accentColor }}
                      className="rounded-xl px-4 py-2 text-xs font-bold text-ink shadow-md"
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
