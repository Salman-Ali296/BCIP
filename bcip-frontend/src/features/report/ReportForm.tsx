"use client";

import { useMemo, useState, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BrainCircuit,
  FileText,
  Mic,
  MicOff,
  Paperclip,
  ShieldCheck,
  Sparkles,
  Upload,
  Volume2,
  X,
  Zap,
} from "lucide-react";
import {
  clearDraft,
  createComplaint,
  getDraftSnapshot,
  saveDraft,
  subscribeToDraft,
} from "@/features/Customer-portal/api/portal-api";

const MAX = 1200;
const MAX_FILE = 10 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "application/pdf"];
const ACCOUNT_EMAIL = "enterprise.client@acmecorp.com";

const CATEGORIES = [
  "Billing & Invoicing",
  "Logistics & Delivery",
  "Product Quality & Defects",
  "Technical & Service Outage",
  "Customer Service & SLA",
  "Other Grievance",
];

type Form = {
  description: string;
  category: string;
  orderRef: string;
  email: string;
  companyName: string;
};

const emptyForm: Form = {
  description: "",
  category: "Billing & Invoicing",
  orderRef: "",
  email: "",
  companyName: "",
};

const subscribe = (onChange: () => void) => subscribeToDraft("text", onChange);
const getSnapshot = () => getDraftSnapshot("text");
const getServerSnapshot = () => null;

export function ReportForm() {
  const router = useRouter();
  const draftSnapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const draft = useMemo(
    () => (draftSnapshot ? (JSON.parse(draftSnapshot) as Form) : null),
    [draftSnapshot]
  );
  const [formState, setFormState] = useState<Form | null>(null);
  const f = formState ?? draft ?? emptyForm;

  const [activeTab, setActiveTab] = useState<"text" | "voice">("text");
  const [file, setFile] = useState<File | null>(null);
  const [fileErr, setFileErr] = useState("");
  const [err, setErr] = useState<Partial<Record<keyof Form, string>>>({});
  const [busy, setBusy] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // Voice Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [voiceSeconds, setVoiceSeconds] = useState(0);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const voiceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Live AI Prediction logic
  const aiAnalysis = useMemo(() => {
    const text = f.description.toLowerCase();
    if (!text || text.length < 10) return null;

    let predictedCategory = f.category;
    let urgency: "Low" | "Medium" | "High" | "Critical" = "Medium";
    let sentiment: "Critical" | "Frustrated" | "Neutral" = "Neutral";
    let duplicateMatch: { id: string; similarity: number } | null = null;

    if (text.includes("bill") || text.includes("charg") || text.includes("refund") || text.includes("invoice") || text.includes("card")) {
      predictedCategory = "Billing & Invoicing";
      if (text.includes("twice") || text.includes("double") || text.includes("8821") || text.includes("14500")) {
        duplicateMatch = { id: "BCIP-9042", similarity: 94 };
        urgency = "Critical";
      }
    } else if (text.includes("deliver") || text.includes("delay") || text.includes("ship") || text.includes("freight") || text.includes("depot")) {
      predictedCategory = "Logistics & Delivery";
      urgency = text.includes("urgent") || text.includes("stalled") ? "High" : "Medium";
    } else if (text.includes("damage") || text.includes("broken") || text.includes("defect") || text.includes("seal")) {
      predictedCategory = "Product Quality & Defects";
      urgency = "High";
    } else if (text.includes("timeout") || text.includes("504") || text.includes("down") || text.includes("api") || text.includes("crash")) {
      predictedCategory = "Technical & Service Outage";
      urgency = "Critical";
      if (text.includes("504") || text.includes("gateway")) {
        duplicateMatch = { id: "BCIP-9038", similarity: 91 };
      }
    }

    if (text.includes("unacceptable") || text.includes("angry") || text.includes("immediately") || text.includes("legal") || text.includes("fraud")) {
      sentiment = "Critical";
      urgency = "Critical";
    } else if (text.includes("disappointed") || text.includes("failed") || text.includes("problem") || text.includes("terrible")) {
      sentiment = "Frustrated";
    }

    return { predictedCategory, urgency, sentiment, duplicateMatch };
  }, [f.description, f.category]);

  const setField =
    (k: keyof Form) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) =>
      setFormState((p) => ({ ...(p ?? f), [k]: e.target.value }));

  function pickFile(x?: File) {
    if (!x) return;
    if (!ALLOWED.includes(x.type))
      return setFileErr("Please upload a JPG, PNG, or PDF file.");
    if (x.size > MAX_FILE)
      return setFileErr("Maximum attachment file size is 10 MB.");
    setFileErr("");
    setFile(x);
  }

  // Voice Recording Handlers
  const startRecording = async () => {
    setIsRecording(true);
    setVoiceSeconds(0);
    setVoiceTranscript("");
    voiceTimerRef.current = setInterval(() => {
      setVoiceSeconds((s) => s + 1);
    }, 1000);

    // Realistic voice transcription simulator
    setTimeout(() => {
      setVoiceTranscript("We noticed a duplicate billing transaction on our enterprise subscription statement...");
    }, 2500);

    setTimeout(() => {
      setVoiceTranscript(
        "We noticed a duplicate billing transaction on our enterprise subscription statement for invoice #INV-8821. The card was charged twice and our accounts team requires an immediate refund."
      );
    }, 5000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
  };

  const applyVoiceTranscript = () => {
    if (!voiceTranscript) return;
    setFormState((p) => ({
      ...(p ?? f),
      description: voiceTranscript,
      category: "Billing & Invoicing",
    }));
    setActiveTab("text");
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const n: typeof err = {};
    if (!f.description.trim()) n.description = "Please describe what happened in detail.";
    if (!/^\S+@\S+\.\S+$/.test(f.email))
      n.email = "Please provide a valid corporate email address.";
    setErr(n);
    if (Object.keys(n).length) return;

    setBusy(true);
    try {
      const c = await createComplaint({
        channel: activeTab === "voice" ? "voice" : "text",
        description: f.description,
        email: f.email,
        orderRef: f.orderRef || undefined,
        category: f.category || undefined,
        priority: aiAnalysis?.urgency === "Critical" ? "high" : "medium",
        sentiment: aiAnalysis?.sentiment === "Critical" ? "negative" : "neutral",
      });
      clearDraft("text");
      router.push(`/support/track/${c.id}`);
    } catch (error) {
      setErr({
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while registering your complaint.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-wash text-ink py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs text-muted">
          <div className="flex items-center gap-2">
            <Link href="/support" className="hover:text-brand transition">
              Enterprise Support
            </Link>
            <span>/</span>
            <span className="text-ink font-semibold">Incident Intake Studio</span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success-soft px-2.5 py-0.5 font-mono text-[11px] text-success">
            <ShieldCheck className="h-3 w-3" />
            256-Bit Encrypted
          </span>
        </div>

        {/* Title Header */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-ink">
            Register Business Grievance
          </h1>
          <p className="mt-2 text-sm text-muted">
            Submit your incident details. Our AI pipeline categorizes, scores urgency, and attaches
            it to the senior enterprise resolution queue.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex rounded-2xl border border-line bg-white p-1.5 shadow-xl">
          <button
            type="button"
            onClick={() => setActiveTab("text")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs sm:text-sm font-bold transition ${
              activeTab === "text"
                ? "bg-ink text-white shadow-lg shadow-brand/15"
                : "text-muted hover:text-ink"
            }`}
          >
            <FileText className="h-4 w-4" />
            Structured Intake Form
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("voice")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs sm:text-sm font-bold transition ${
              activeTab === "voice"
                ? "bg-ink text-white shadow-lg shadow-brand/15"
                : "text-muted hover:text-ink"
            }`}
          >
            <Mic className="h-4 w-4" />
            AI Voice Complaint Assistant
            <span className="hidden sm:inline-block rounded-full bg-lilac px-2 py-0.5 text-[10px] text-brand">
              Zero Typing
            </span>
          </button>
        </div>

        {/* VOICE ASSISTANT TAB */}
        {activeTab === "voice" && (
          <div className="rounded-3xl border border-brand-soft bg-gradient-to-b from-lilac via-wash to-wash p-6 sm:p-10 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-lilac text-brand">
                <Volume2 className="h-6 w-6" />
              </span>
              <h2 className="text-xl font-bold text-ink">AI Voice Intake Assistant</h2>
              <p className="text-xs sm:text-sm text-ink-soft max-w-lg mx-auto">
                Speak naturally. Our speech engine transcribes your voice, parses emotional urgency,
                and generates structured complaint fields.
              </p>
            </div>

            {/* Recorder Controls */}
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`relative flex h-24 w-24 items-center justify-center rounded-full text-ink shadow-2xl transition-all duration-300 ${
                  isRecording
                    ? "bg-danger ring-8 ring-danger/20 animate-pulse"
                    : "bg-ink hover:bg-brand hover:scale-105 ring-8 ring-brand/20"
                }`}
              >
                {isRecording ? <MicOff className="h-10 w-10" /> : <Mic className="h-10 w-10" />}
              </button>

              <div className="text-center">
                <p className="font-mono text-sm font-semibold text-brand">
                  {isRecording ? `Recording Live... [${voiceSeconds}s]` : "Click to Start Speaking"}
                </p>
                <p className="text-[11px] text-muted mt-1">
                  Supports English, Urdu, and Regional Enterprise Accents
                </p>
              </div>
            </div>

            {/* Live Waveform Simulation */}
            {isRecording && (
              <div className="flex items-center justify-center gap-1.5 py-2">
                {[40, 70, 30, 90, 60, 100, 45, 80, 50, 85, 35, 75, 95, 40, 60].map((h, i) => (
                  <span
                    key={i}
                    style={{ height: `${h}%` }}
                    className="w-1.5 rounded-full bg-brand-glow animate-pulse transition-all"
                  />
                ))}
              </div>
            )}

            {/* Live Transcript Preview */}
            {voiceTranscript && (
              <div className="rounded-2xl border border-brand-soft bg-lilac-soft p-5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-brand flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    Speech-to-Text Transcription
                  </span>
                  <span className="text-success font-semibold text-[11px]">99.2% Accuracy</span>
                </div>
                <p className="text-sm text-ink leading-relaxed italic bg-ink/10 p-3 rounded-xl">
                  &ldquo;{voiceTranscript}&rdquo;
                </p>
                <button
                  type="button"
                  onClick={applyVoiceTranscript}
                  className="inline-flex items-center gap-2 rounded-xl bg-ink hover:bg-brand px-4 py-2 text-xs font-bold text-white transition shadow-md"
                >
                  Use Transcript in Intake Form
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* STRUCTURED FORM TAB */}
        {activeTab === "text" && (
          <form onSubmit={submit} className="space-y-6" noValidate>
            <div className="rounded-3xl border border-line bg-white p-6 sm:p-10 shadow-2xl space-y-6 backdrop-blur-md">
              {/* Duplicate Detection Alert Banner (Proposal Section 3.2.1) */}
              {aiAnalysis?.duplicateMatch && (
                <div className="rounded-2xl border border-warning/30 bg-warning-soft p-4.5 text-xs text-warning space-y-1.5 shadow-lg">
                  <div className="flex items-center justify-between font-bold text-warning">
                    <span className="flex items-center gap-1.5">
                      <Zap className="h-4 w-4 text-warning" />
                      Semantic Duplicate Cluster Warning ({aiAnalysis.duplicateMatch.similarity}% Match)
                    </span>
                    <span className="rounded-full bg-warning-soft px-2 py-0.5 text-[10px] text-warning">
                      Sentence-BERT
                    </span>
                  </div>
                  <p className="leading-relaxed">
                    An identical issue was reported recently under Master Cluster{" "}
                    <strong className="underline">{aiAnalysis.duplicateMatch.id}</strong>. Submitting will
                    link your account for expedited resolution and prevent redundant triage.
                  </p>
                </div>
              )}

              {/* Description Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-ink-soft">
                    Detailed Complaint Narrative <span className="text-danger">*</span>
                  </label>
                  <span className="text-[11px] font-mono text-muted">
                    {f.description.length} / {MAX}
                  </span>
                </div>
                <textarea
                  value={f.description}
                  onChange={setField("description")}
                  maxLength={MAX}
                  rows={5}
                  placeholder="Provide precise details: what occurred, when did it happen, financial impact, or affected items..."
                  className="w-full rounded-2xl border border-line bg-wash p-4 text-sm text-ink placeholder-faint shadow-inner focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
                {err.description && (
                  <p className="text-xs text-danger font-medium">{err.description}</p>
                )}
              </div>

              {/* Real-Time AI NLP Telemetry Radar */}
              {aiAnalysis && (
                <div className="rounded-2xl border border-brand-soft bg-lilac-soft p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-lilac text-brand">
                      <BrainCircuit className="h-3.5 w-3.5" />
                    </span>
                    <span className="font-bold text-brand">AI Live NLP Analysis:</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-lilac-soft px-2.5 py-1 text-[11px] font-medium text-ink-soft border border-line">
                      Category: <strong className="text-brand">{aiAnalysis.predictedCategory}</strong>
                    </span>
                    <span
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-bold border ${
                        aiAnalysis.urgency === "Critical"
                          ? "bg-danger-soft text-danger border-danger/30"
                          : "bg-warning-soft text-warning border-warning/30"
                      }`}
                    >
                      Urgency: {aiAnalysis.urgency}
                    </span>
                    <span className="rounded-lg bg-lilac-soft px-2.5 py-1 text-[11px] font-medium text-ink-soft border border-line">
                      Sentiment: <strong className="text-brand">{aiAnalysis.sentiment}</strong>
                    </span>
                  </div>
                </div>
              )}

              {/* Grid: Category & Reference */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-ink-soft">
                    Grievance Category
                  </label>
                  <select
                    value={f.category}
                    onChange={setField("category")}
                    className="w-full rounded-xl border border-line bg-wash px-3.5 py-2.5 text-sm text-ink shadow-inner focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-ink-soft">
                    Order / Invoice / Contract ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={f.orderRef}
                    onChange={setField("orderRef")}
                    placeholder="e.g. INV-8821 or MSA-9021"
                    className="w-full rounded-xl border border-line bg-wash px-3.5 py-2.5 text-sm text-ink shadow-inner focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                </div>
              </div>

              {/* Contact Email & Company Name */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-ink-soft">
                      Corporate Email <span className="text-danger">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormState((p) => ({ ...(p ?? f), email: ACCOUNT_EMAIL }))}
                      className="text-[11px] text-brand hover:underline"
                    >
                      Fill Demo Email
                    </button>
                  </div>
                  <input
                    type="email"
                    value={f.email}
                    onChange={setField("email")}
                    placeholder="your.email@company.com"
                    className="w-full rounded-xl border border-line bg-wash px-3.5 py-2.5 text-sm text-ink shadow-inner focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                  {err.email && <p className="text-xs text-danger font-medium">{err.email}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-ink-soft">
                    Company / Organization Name
                  </label>
                  <input
                    type="text"
                    value={f.companyName}
                    onChange={setField("companyName")}
                    placeholder="e.g. Apex Global Logistics"
                    className="w-full rounded-xl border border-line bg-wash px-3.5 py-2.5 text-sm text-ink shadow-inner focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                </div>
              </div>

              {/* Evidence Drag and Drop Zone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  pickFile(e.dataTransfer.files[0]);
                }}
                className="relative rounded-2xl border-2 border-dashed border-line hover:border-brand bg-wash p-6 text-center transition"
              >
                {file ? (
                  <div className="flex items-center justify-between rounded-xl bg-lilac-soft p-3 text-xs text-ink">
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-4 w-4 text-brand" />
                      <span className="font-semibold">{file.name}</span>
                      <span className="text-muted font-mono">
                        ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="text-muted hover:text-danger p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="mx-auto h-7 w-7 text-muted" />
                    <p className="text-xs font-semibold text-ink-soft">
                      Drag evidence files here or{" "}
                      <label className="text-brand hover:underline cursor-pointer">
                        browse documents
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf"
                          className="sr-only"
                          onChange={(e) => pickFile(e.target.files?.[0])}
                        />
                      </label>
                    </p>
                    <p className="text-[11px] text-subtle">
                      PDF, PNG, JPG logs, invoices, or error screenshots (Up to 10 MB)
                    </p>
                  </div>
                )}
                {fileErr && <p className="mt-2 text-xs text-danger">{fileErr}</p>}
              </div>

              {/* Form Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-line">
                <Link
                  href="/support"
                  className="rounded-xl border border-line hover:bg-lilac-soft px-4 py-2.5 text-xs font-bold text-ink-soft transition"
                >
                  Cancel
                </Link>

                <div className="flex items-center gap-3">
                  {saveMsg && (
                    <span className="text-xs text-success font-medium">{saveMsg}</span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      saveDraft("text", f);
                      setSaveMsg("Draft saved locally");
                      setTimeout(() => setSaveMsg(""), 3000);
                    }}
                    className="rounded-xl border border-line hover:bg-lilac-soft px-4 py-2.5 text-xs font-bold text-ink-soft transition"
                  >
                    Save Draft
                  </button>

                  <button
                    type="submit"
                    disabled={busy}
                    className="inline-flex items-center gap-2 rounded-xl bg-ink hover:bg-brand px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-brand/15 transition disabled:opacity-50"
                  >
                    {busy ? (
                      <>
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-line border-t-transparent" />
                        Analyzing & Registering...
                      </>
                    ) : (
                      <>
                        Submit Formal Grievance
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
