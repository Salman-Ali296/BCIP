"use client";

import { useState, useMemo, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    AlertTriangle,
    ArrowRight,
    BrainCircuit,
    CheckCircle2,
    FileText,
    Mic,
    MicOff,
    Paperclip,
    RotateCcw,
    ShieldCheck,
    Sparkles,
    Upload,
    Volume2,
    X,
    Zap,
    Clock,
    Search,
    Building2,
    Mail,
    FileCheck,
    HelpCircle,
    Info,
} from "lucide-react";
import {
    createComplaint,
    saveDraft,
    clearDraft,
    getDraftSnapshot,
    subscribeToDraft,
} from "@/features/Customer-portal/api/portal-api";

const MAX_CHARS = 1200;
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const ALLOWED_MIME = ["image/jpeg", "image/png", "application/pdf"];
const DEFAULT_ACCOUNT_EMAIL = "sarah.jenkins@apexlogistics.com";
const DEFAULT_COMPANY_NAME = "Apex Global Logistics Inc.";

const GRIEVANCE_CATEGORIES = [
    "Billing & Invoicing",
    "Logistics & Delivery",
    "Product Quality & Defects",
    "Technical & Service Outage",
    "Customer Service & SLA",
    "Contract & Account Governance",
    "Other Grievance",
];

interface FormState {
    description: string;
    category: string;
    orderRef: string;
    email: string;
    companyName: string;
}

const emptyFormState: FormState = {
    description: "",
    category: "Billing & Invoicing",
    orderRef: "",
    email: DEFAULT_ACCOUNT_EMAIL,
    companyName: DEFAULT_COMPANY_NAME,
};

const subscribe = (onChange: () => void) => subscribeToDraft("text", onChange);
const getSnapshot = () => getDraftSnapshot("text");
const getServerSnapshot = () => null;

export function CustomerSubmitComplaint() {
    const router = useRouter();
    const draftSnapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    const savedDraft = useMemo(
        () => (draftSnapshot ? (JSON.parse(draftSnapshot) as FormState) : null),
        [draftSnapshot]
    );

    const [formState, setFormState] = useState<FormState | null>(null);
    const currentForm = formState ?? savedDraft ?? emptyFormState;

    const [activeTab, setActiveTab] = useState<"text" | "voice" | "track">("text");
    const [file, setFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState("");
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [draftStatus, setDraftStatus] = useState("");
    const [submittedTrackingId, setSubmittedTrackingId] = useState<string | null>(null);

    // Voice recording states
    const [isRecording, setIsRecording] = useState(false);
    const [recordingSeconds, setRecordingSeconds] = useState(0);
    const [voiceTranscript, setVoiceTranscript] = useState("");
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Quick track lookup state
    const [lookupId, setLookupId] = useState("");

    // Real-time AI NLP Extraction Analysis
    const aiIntelligence = useMemo(() => {
        const text = currentForm.description.toLowerCase();
        if (!text || text.length < 12) return null;

        let predictedCat = currentForm.category;
        let urgency: "Low" | "Medium" | "High" | "Critical" = "Medium";
        let sentiment: "Critical" | "Frustrated" | "Neutral" = "Neutral";
        let duplicateCluster: { id: string; title: string; matchScore: number } | null = null;

        if (
            text.includes("bill") ||
            text.includes("charg") ||
            text.includes("invoice") ||
            text.includes("refund") ||
            text.includes("card") ||
            text.includes("overcharg")
        ) {
            predictedCat = "Billing & Invoicing";
            if (text.includes("twice") || text.includes("double") || text.includes("inv-8821") || text.includes("deduct")) {
                duplicateCluster = {
                    id: "BCIP-9042",
                    title: "Double-Billed Enterprise Subscription (3DS Gateway)",
                    matchScore: 94,
                };
                urgency = "Critical";
            }
        } else if (
            text.includes("deliver") ||
            text.includes("ship") ||
            text.includes("delay") ||
            text.includes("freight") ||
            text.includes("transit")
        ) {
            predictedCat = "Logistics & Delivery";
            urgency = text.includes("urgent") || text.includes("stalled") ? "High" : "Medium";
        } else if (
            text.includes("damage") ||
            text.includes("broken") ||
            text.includes("defect") ||
            text.includes("spec")
        ) {
            predictedCat = "Product Quality & Defects";
            urgency = "High";
        } else if (
            text.includes("timeout") ||
            text.includes("504") ||
            text.includes("api") ||
            text.includes("outage") ||
            text.includes("down")
        ) {
            predictedCat = "Technical & Service Outage";
            urgency = "Critical";
            if (text.includes("504") || text.includes("gateway")) {
                duplicateCluster = {
                    id: "BCIP-8055",
                    title: "Corporate API Gateway 504 Timeout Cluster",
                    matchScore: 91,
                };
            }
        }

        if (
            text.includes("unacceptable") ||
            text.includes("legal") ||
            text.includes("fraud") ||
            text.includes("breach") ||
            text.includes("emergency")
        ) {
            sentiment = "Critical";
            urgency = "Critical";
        } else if (
            text.includes("disappointed") ||
            text.includes("poor") ||
            text.includes("escalate") ||
            text.includes("failed")
        ) {
            sentiment = "Frustrated";
        }

        return { predictedCat, urgency, sentiment, duplicateCluster };
    }, [currentForm.description, currentForm.category]);

    const handleFieldChange =
        (field: keyof FormState) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            setFormState((prev) => ({ ...(prev ?? currentForm), [field]: e.target.value }));
            if (errors[field]) {
                setErrors((prev) => ({ ...prev, [field]: undefined }));
            }
        };

    const handleFileSelect = (selected?: File) => {
        if (!selected) return;
        if (!ALLOWED_MIME.includes(selected.type)) {
            setFileError("Supported formats: PDF, PNG, JPG.");
            return;
        }
        if (selected.size > MAX_FILE_SIZE) {
            setFileError("Attachment exceeds maximum allowed size (15 MB).");
            return;
        }
        setFileError("");
        setFile(selected);
    };

    // Voice recording simulation
    const startAudioRecording = () => {
        setIsRecording(true);
        setRecordingSeconds(0);
        setVoiceTranscript("");

        timerIntervalRef.current = setInterval(() => {
            setRecordingSeconds((prev) => {
                if (prev >= 180) {
                    stopAudioRecording();
                    return 180;
                }
                return prev + 1;
            });
        }, 1000);

        // Realistic progressive speech-to-text simulation
        setTimeout(() => {
            setVoiceTranscript(
                "We noticed an unexpected duplicate transaction on our enterprise invoicing statement..."
            );
        }, 2200);

        setTimeout(() => {
            setVoiceTranscript(
                "We noticed an unexpected duplicate transaction on our enterprise invoicing statement for invoice #INV-8821. Our procurement account was debited twice without authorized approval, and we require immediate refund and SLA reconciliation."
            );
        }, 4800);
    };

    const stopAudioRecording = () => {
        setIsRecording(false);
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
        }
    };

    const resetRecording = () => {
        stopAudioRecording();
        setRecordingSeconds(0);
        setVoiceTranscript("");
    };

    const applyVoiceTranscriptToForm = () => {
        if (!voiceTranscript) return;
        setFormState((prev) => ({
            ...(prev ?? currentForm),
            description: voiceTranscript,
            category: "Billing & Invoicing",
            orderRef: "INV-8821",
        }));
        setActiveTab("text");
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: typeof errors = {};

        if (!currentForm.description.trim()) {
            newErrors.description = "Please describe the incident narrative in detail.";
        } else if (currentForm.description.trim().length < 15) {
            newErrors.description = "Please provide at least 15 characters describing what occurred.";
        }

        if (!currentForm.email.trim() || !/^\S+@\S+\.\S+$/.test(currentForm.email)) {
            newErrors.email = "Please specify a valid corporate email address.";
        }

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        setIsSubmitting(true);
        try {
            const complaint = await createComplaint({
                channel: activeTab === "voice" ? "voice" : "text",
                description: currentForm.description.trim(),
                email: currentForm.email.trim(),
                orderRef: currentForm.orderRef.trim() || undefined,
                category: currentForm.category || "Billing & Invoicing",
                priority: aiIntelligence?.urgency === "Critical" ? "high" : "medium",
                sentiment: aiIntelligence?.sentiment === "Critical" ? "negative" : "neutral",
            });

            clearDraft("text");
            setSubmittedTrackingId(complaint.trackingId || complaint.id);
        } catch (error) {
            setErrors({
                description:
                    error instanceof Error
                        ? error.message
                        : "An unexpected error occurred while registering your grievance.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Format seconds as mm:ss
    const formatTime = (sec: number) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    // If successfully submitted, show enterprise confirmation receipt
    if (submittedTrackingId) {
        return (
            <div className="mx-auto max-w-2xl py-8">
                <div className="rounded-3xl border border-emerald-500/30 bg-white p-8 sm:p-10 shadow-xl text-center space-y-6">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-8 ring-emerald-500/10">
                        <CheckCircle2 className="h-8 w-8" />
                    </div>

                    <div className="space-y-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 px-3 py-1 text-xs font-bold text-emerald-800">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Formal Grievance Registered & Timestamped
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                            Incident Case Active
                        </h2>
                        <p className="text-sm text-slate-600 max-w-md mx-auto">
                            Your complaint has entered the enterprise SLA queue. Our specialized resolution team
                            has received automated dispatch.
                        </p>
                    </div>

                    {/* Tracking ID Badge */}
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-2 text-left">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                            <span className="font-semibold uppercase tracking-wider">Enterprise Tracking ID</span>
                            <span className="font-mono text-emerald-600 font-bold">2-Hour SLA Active</span>
                        </div>
                        <p className="text-2xl font-black font-mono text-slate-900 tracking-wider">
                            {submittedTrackingId}
                        </p>
                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200 text-xs">
                            <div>
                                <span className="text-slate-400">Assigned Team:</span>
                                <p className="font-semibold text-slate-700">Payments & Billing Operations</p>
                            </div>
                            <div>
                                <span className="text-slate-400">Target Response:</span>
                                <p className="font-semibold text-slate-700">Within 120 Minutes</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => router.push("/customer/dashboard")}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition"
                        >
                            View in Customer Dashboard
                            <ArrowRight className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setSubmittedTrackingId(null);
                                setFormState(emptyFormState);
                            }}
                            className="w-full sm:w-auto rounded-xl border border-slate-300 hover:bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 transition"
                        >
                            Submit Another Incident
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            {/* Top Breadcrumb & SLA Assurance Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-5">
                <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <Link href="/customer/dashboard" className="hover:text-blue-600 transition">
                            Customer Portal
                        </Link>
                        <span>/</span>
                        <span className="text-slate-800">Submit Grievance</span>
                    </div>
                    <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                        Register Business Grievance
                    </h1>
                    <p className="mt-1 text-xs sm:text-sm text-slate-600">
                        Submit incident details with automated AI classification, or record your statement
                        directly with our zero-typing Voice Assistant.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 font-mono text-xs font-semibold text-emerald-800">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                        256-Bit Encrypted SLA
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        <Clock className="h-3.5 w-3.5" />
                        2-Hour Initial Response Guarantee
                    </span>
                </div>
            </div>

            {/* Mode Selector Tabs (Matches Screenshot 2) */}
            <div className="flex flex-wrap rounded-2xl border border-slate-200 bg-slate-100/80 p-1.5 shadow-sm">
                <button
                    type="button"
                    onClick={() => setActiveTab("text")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs sm:text-sm font-bold transition ${
                        activeTab === "text"
                            ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                            : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                    }`}
                >
                    <FileText className="h-4 w-4" />
                    Structured Intake Form
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab("voice")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs sm:text-sm font-bold transition ${
                        activeTab === "voice"
                            ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                            : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                    }`}
                >
                    <Mic className="h-4 w-4" />
                    AI Voice Complaint Assistant
                    <span className="hidden md:inline-block rounded-full bg-purple-200/40 px-2 py-0.5 text-[10px] text-purple-100">
                        Zero Typing
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab("track")}
                    className={`flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs sm:text-sm font-bold transition ${
                        activeTab === "track"
                            ? "bg-slate-900 text-white shadow-md"
                            : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                    }`}
                >
                    <Search className="h-4 w-4" />
                    Track Incident & SLA
                </button>
            </div>

            {/* TAB 1: STRUCTURED INTAKE FORM (Screenshot 2) */}
            {activeTab === "text" && (
                <form onSubmit={handleFormSubmit} className="space-y-6" noValidate>
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-9 shadow-sm space-y-6">
                        {/* Duplicate Detection Alert Banner (Matches Screenshot 2) */}
                        {aiIntelligence?.duplicateCluster && (
                            <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 space-y-1.5 shadow-sm">
                                <div className="flex items-center justify-between font-bold text-amber-950">
                                    <span className="flex items-center gap-2">
                                        <Zap className="h-4 w-4 text-amber-600" />
                                        Semantic Duplicate Cluster Warning ({aiIntelligence.duplicateCluster.matchScore}% Match)
                                    </span>
                                    <span className="rounded-full bg-amber-200/80 px-2.5 py-0.5 text-[10px] font-mono font-bold text-amber-900">
                                        NLP Pattern Detection
                                    </span>
                                </div>
                                <p className="leading-relaxed text-amber-800">
                                    An identical issue pattern has been reported under Master Incident{" "}
                                    <strong className="underline">{aiIntelligence.duplicateCluster.id}</strong> (
                                    {aiIntelligence.duplicateCluster.title}). Submitting will automatically link your grievance
                                    to the priority engineering escalation.
                                </p>
                            </div>
                        )}

                        {/* Detailed Narrative Input */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                    Detailed Complaint Narrative <span className="text-rose-500">*</span>
                                </label>
                                <span className="text-[11px] font-mono text-slate-500">
                                    {currentForm.description.length} / {MAX_CHARS}
                                </span>
                            </div>
                            <textarea
                                value={currentForm.description}
                                onChange={handleFieldChange("description")}
                                maxLength={MAX_CHARS}
                                rows={5}
                                placeholder="Provide precise details: what occurred, when did it happen, financial impact, or affected items..."
                                className="w-full rounded-2xl border border-slate-300 bg-slate-50/50 p-4 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                            />
                            {errors.description && (
                                <p className="text-xs text-rose-500 font-semibold">{errors.description}</p>
                            )}
                        </div>

                        {/* Real-time AI NLP Telemetry Radar (Matches Screenshot 2) */}
                        {aiIntelligence && (
                            <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                                <div className="flex items-center gap-2">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white">
                                        <BrainCircuit className="h-4 w-4" />
                                    </span>
                                    <div>
                                        <span className="font-bold text-blue-950">AI Live NLP Analysis:</span>
                                        <span className="block text-[11px] text-blue-700">
                                            Semantic urgency and department routing calculated in real-time
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="rounded-lg bg-white px-3 py-1 text-[11px] font-medium text-slate-800 border border-slate-200 shadow-xs">
                                        Category: <strong className="text-blue-600">{aiIntelligence.predictedCat}</strong>
                                    </span>
                                    <span
                                        className={`rounded-lg px-3 py-1 text-[11px] font-bold border ${
                                            aiIntelligence.urgency === "Critical"
                                                ? "bg-rose-100 text-rose-800 border-rose-300"
                                                : "bg-amber-100 text-amber-800 border-amber-300"
                                        }`}
                                    >
                                        Urgency: {aiIntelligence.urgency}
                                    </span>
                                    <span className="rounded-lg bg-white px-3 py-1 text-[11px] font-medium text-slate-800 border border-slate-200 shadow-xs">
                                        Sentiment: <strong className="text-purple-700">{aiIntelligence.sentiment}</strong>
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Grievance Category & Reference Grid */}
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                    Grievance Category
                                </label>
                                <select
                                    value={currentForm.category}
                                    onChange={handleFieldChange("category")}
                                    className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                >
                                    {GRIEVANCE_CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                    Order / Invoice / Contract ID (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={currentForm.orderRef}
                                    onChange={handleFieldChange("orderRef")}
                                    placeholder="e.g. INV-8821 or MSA-9021"
                                    className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>
                        </div>

                        {/* Corporate Email & Organization Grid */}
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                        Corporate Email <span className="text-rose-500">*</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setFormState((prev) => ({
                                                ...(prev ?? currentForm),
                                                email: DEFAULT_ACCOUNT_EMAIL,
                                            }))
                                        }
                                        className="text-[11px] font-semibold text-blue-600 hover:underline"
                                    >
                                        Use Verified Email
                                    </button>
                                </div>
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={currentForm.email}
                                        onChange={handleFieldChange("email")}
                                        placeholder="your.email@company.com"
                                        className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-xs text-rose-500 font-semibold">{errors.email}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                    Company / Organization Name
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={currentForm.companyName}
                                        onChange={handleFieldChange("companyName")}
                                        placeholder="e.g. Apex Global Logistics"
                                        className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Drag-and-Drop Evidence Upload Area (Matches Screenshot 2) */}
                        <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                handleFileSelect(e.dataTransfer.files[0]);
                            }}
                            className="relative rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/60 p-6 text-center transition"
                        >
                            {file ? (
                                <div className="flex items-center justify-between rounded-xl bg-white p-3 text-xs text-slate-700 border border-slate-200 shadow-xs">
                                    <div className="flex items-center gap-2">
                                        <Paperclip className="h-4 w-4 text-blue-600" />
                                        <span className="font-semibold text-slate-900">{file.name}</span>
                                        <span className="text-slate-500 font-mono">
                                            ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFile(null)}
                                        className="text-slate-400 hover:text-rose-600 p-1 transition"
                                        title="Remove file"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Upload className="mx-auto h-8 w-8 text-slate-400" />
                                    <p className="text-xs font-semibold text-slate-800">
                                        Drag evidence files here or{" "}
                                        <label className="text-blue-600 hover:underline cursor-pointer">
                                            browse documents
                                            <input
                                                type="file"
                                                accept=".jpg,.jpeg,.png,.pdf"
                                                className="sr-only"
                                                onChange={(e) => handleFileSelect(e.target.files?.[0])}
                                            />
                                        </label>
                                    </p>
                                    <p className="text-[11px] text-slate-500">
                                        PDF, PNG, JPG logs, invoices or email screenshots (Up to 15 MB)
                                    </p>
                                </div>
                            )}
                            {fileError && <p className="mt-2 text-xs text-rose-500 font-semibold">{fileError}</p>}
                        </div>

                        {/* Action Buttons (Matches Screenshot 2) */}
                        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
                            <button
                                type="button"
                                onClick={() => router.push("/customer/dashboard")}
                                className="rounded-xl border border-slate-300 hover:bg-slate-100 px-5 py-2.5 text-xs font-bold text-slate-700 transition"
                            >
                                Cancel
                            </button>

                            <div className="flex items-center gap-3">
                                {draftStatus && (
                                    <span className="text-xs text-emerald-600 font-semibold">{draftStatus}</span>
                                )}
                                <button
                                    type="button"
                                    onClick={() => {
                                        saveDraft("text", currentForm);
                                        setDraftStatus("Draft saved locally");
                                        setTimeout(() => setDraftStatus(""), 3000);
                                    }}
                                    className="rounded-xl border border-slate-300 hover:bg-slate-100 px-5 py-2.5 text-xs font-bold text-slate-700 transition"
                                >
                                    Save Draft
                                </button>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-7 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            Dispatching Incident...
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

            {/* TAB 2: AI VOICE COMPLAINT ASSISTANT (Matches Screenshot 3) */}
            {activeTab === "voice" && (
                <div className="space-y-6">
                    <div className="rounded-3xl border border-purple-200 bg-gradient-to-b from-purple-50/50 via-white to-white p-6 sm:p-10 shadow-sm space-y-8">
                        <div>
                            <div className="flex items-center gap-2 text-xs font-semibold text-purple-700">
                                <span>Customer Support</span>
                                <span>/</span>
                                <span>Report a problem</span>
                                <span>/</span>
                                <span className="text-purple-950 font-bold">Voice complaint</span>
                            </div>
                            <h2 className="mt-2 text-3xl font-black text-slate-900 tracking-tight">
                                Tell us what happened
                            </h2>
                            <p className="mt-1 text-sm text-slate-600">
                                Explain your problem using your voice. We&apos;ll convert it to text so you can review it
                                before submitting.
                            </p>
                        </div>

                        {/* Interactive Recording Studio (Screenshot 3 Left & Right Card) */}
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Left Card: Microphone & Audio Controller */}
                            <div className="flex flex-col items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/60 p-8 text-center space-y-6">
                                <div className="space-y-2">
                                    <button
                                        type="button"
                                        onClick={isRecording ? stopAudioRecording : startAudioRecording}
                                        className={`relative mx-auto flex h-24 w-24 items-center justify-center rounded-full text-white shadow-xl transition-all duration-300 ${
                                            isRecording
                                                ? "bg-rose-600 ring-8 ring-rose-500/20 animate-pulse scale-105"
                                                : "bg-blue-600 hover:bg-blue-700 hover:scale-105 ring-8 ring-blue-500/10"
                                        }`}
                                        title={isRecording ? "Stop recording" : "Tap to start recording"}
                                    >
                                        {isRecording ? <MicOff className="h-10 w-10" /> : <Mic className="h-10 w-10" />}
                                    </button>
                                    <h3 className="text-base font-bold text-slate-900">
                                        {isRecording ? "Listening to your grievance..." : "Tap to start recording"}
                                    </h3>
                                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                                        You can pause, review, and re-record before submitting.
                                    </p>
                                </div>

                                {/* Timer & Action Controls */}
                                <div className="w-full space-y-4 pt-4 border-t border-slate-200">
                                    <div className="text-center">
                                        <span className="font-mono text-sm font-bold text-slate-800 bg-white px-3 py-1 rounded-lg border border-slate-200">
                                            {formatTime(recordingSeconds)} / 03:00
                                        </span>
                                    </div>

                                    {/* Waveform indicator if recording */}
                                    {isRecording && (
                                        <div className="flex items-center justify-center gap-1.5 h-8">
                                            {[30, 60, 40, 90, 70, 100, 50, 80, 60, 95, 45, 75, 85].map((h, i) => (
                                                <span
                                                    key={i}
                                                    style={{ height: `${h}%` }}
                                                    className="w-1.5 rounded-full bg-purple-600 animate-pulse transition-all"
                                                />
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-center gap-2">
                                        {isRecording ? (
                                            <button
                                                type="button"
                                                onClick={stopAudioRecording}
                                                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                                            >
                                                Pause
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={startAudioRecording}
                                                className="rounded-xl border border-blue-300 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition"
                                            >
                                                Record
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={resetRecording}
                                            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                                        >
                                            Delete
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                resetRecording();
                                                startAudioRecording();
                                            }}
                                            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                                        >
                                            Re-record
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Right Card: Speech Transcription & Tips (Screenshot 3 Right) */}
                            <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 space-y-6">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-bold text-slate-900 flex items-center gap-1.5">
                                            <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                                            Your speech will appear here
                                        </span>
                                        {voiceTranscript && (
                                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                                99.2% Accuracy
                                            </span>
                                        )}
                                    </div>

                                    {voiceTranscript ? (
                                        <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-4 text-xs text-slate-800 leading-relaxed italic">
                                            &ldquo;{voiceTranscript}&rdquo;
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-400 italic">
                                            Once you start speaking, our NLP engine will convert your audio into
                                            verified enterprise text in real time.
                                        </p>
                                    )}

                                    {/* Tips for a better recording */}
                                    <div className="pt-4 border-t border-slate-100 space-y-2">
                                        <h4 className="text-xs font-bold text-slate-700">Tips for a better recording:</h4>
                                        <ul className="text-xs text-slate-500 space-y-1.5 list-disc pl-4">
                                            <li>Speak in a clear and calm voice</li>
                                            <li>Try to record in a quiet room</li>
                                            <li>Keep your grievance statement under 3 minutes</li>
                                            <li>Include key identifiers like invoice numbers, dates, and amounts</li>
                                        </ul>
                                    </div>
                                </div>

                                {voiceTranscript && (
                                    <button
                                        type="button"
                                        onClick={applyVoiceTranscriptToForm}
                                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 py-2.5 text-xs font-bold text-white shadow-md transition"
                                    >
                                        Use Transcript in Intake Form
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Bottom navigation buttons */}
                        <div className="flex items-center justify-between pt-4 border-t border-purple-100">
                            <button
                                type="button"
                                onClick={() => setActiveTab("text")}
                                className="rounded-xl border border-slate-300 hover:bg-slate-100 px-5 py-2.5 text-xs font-bold text-slate-700 transition"
                            >
                                Back to Form Studio
                            </button>

                            <button
                                type="button"
                                disabled={!voiceTranscript}
                                onClick={applyVoiceTranscriptToForm}
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-2.5 text-xs font-bold text-white shadow-md transition disabled:opacity-40"
                            >
                                Review & Submit Complaint
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: TRACK INCIDENT & SLA STATUS (Matches Screenshot 5) */}
            {activeTab === "track" && (
                <div className="mx-auto max-w-2xl space-y-6">
                    <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm space-y-6 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                            <Search className="h-7 w-7" />
                        </div>

                        <div className="space-y-1">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                Track Incident & SLA Status
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                                Enter your unique tracking code to inspect real-time milestone logs, specialist assignments,
                                and resolution offers.
                            </p>
                        </div>

                        {/* Search Input Box */}
                        <div className="space-y-3">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={lookupId}
                                    onChange={(e) => setLookupId(e.target.value)}
                                    placeholder="e.g. BCIP-9042 or BCIP-9055"
                                    className="w-full rounded-2xl border border-slate-300 bg-slate-50/70 p-4 pr-12 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (lookupId.trim()) {
                                            router.push(`/customer/dashboard`);
                                        }
                                    }}
                                    className="absolute right-2.5 top-2.5 rounded-xl bg-blue-600 p-2 text-white hover:bg-blue-700 transition"
                                >
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={() => router.push("/customer/dashboard")}
                                className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 py-3 text-xs font-bold text-white shadow-md shadow-blue-600/30 transition"
                            >
                                Inspect Live Progress
                            </button>
                        </div>

                        {/* Demo Incidents Quick Inspection (Screenshot 5) */}
                        <div className="pt-6 border-t border-slate-100 space-y-3 text-left">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Or Inspect Live Enterprise Demo Incidents:
                            </p>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setLookupId("BCIP-9042");
                                        router.push("/customer/dashboard");
                                    }}
                                    className="rounded-xl border border-slate-200 bg-slate-50 p-3 hover:border-blue-500 hover:bg-blue-50/50 text-left transition group"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-xs font-bold text-blue-600">BCIP-9042</span>
                                        <span className="text-[10px] text-slate-500">Airbus Wings</span>
                                    </div>
                                    <p className="text-xs text-slate-700 font-medium mt-1 truncate">
                                        Double Invoiced Charge ($14,500)
                                    </p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setLookupId("BCIP-8055");
                                        router.push("/customer/dashboard");
                                    }}
                                    className="rounded-xl border border-slate-200 bg-slate-50 p-3 hover:border-blue-500 hover:bg-blue-50/50 text-left transition group"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-xs font-bold text-blue-600">BCIP-8055</span>
                                        <span className="text-[10px] text-slate-500">Engineering</span>
                                    </div>
                                    <p className="text-xs text-slate-700 font-medium mt-1 truncate">
                                        API Gateway 504 Timeout
                                    </p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setLookupId("BCIP-9019");
                                        router.push("/customer/dashboard");
                                    }}
                                    className="rounded-xl border border-slate-200 bg-slate-50 p-3 hover:border-blue-500 hover:bg-blue-50/50 text-left transition group"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-xs font-bold text-blue-600">BCIP-9019</span>
                                        <span className="text-[10px] text-slate-500">Priority Logistics</span>
                                    </div>
                                    <p className="text-xs text-slate-700 font-medium mt-1 truncate">
                                        Pharma Cold-Chain Excursion
                                    </p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setLookupId("BCIP-8021");
                                        router.push("/customer/dashboard");
                                    }}
                                    className="rounded-xl border border-slate-200 bg-slate-50 p-3 hover:border-blue-500 hover:bg-blue-50/50 text-left transition group"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-xs font-bold text-blue-600">BCIP-8021</span>
                                        <span className="text-[10px] text-slate-500">Contract</span>
                                    </div>
                                    <p className="text-xs text-slate-700 font-medium mt-1 truncate">
                                        Delayed SLA Breached Case
                                    </p>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
