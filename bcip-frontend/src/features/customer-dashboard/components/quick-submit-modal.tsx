"use client";

import { useState } from "react";
import {
    X,
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
    UploadCloud,
    ShieldCheck,
} from "lucide-react";
import type { ComplaintCategory, CustomerComplaint } from "../types";

interface QuickSubmitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmitSuccess: (newComplaint: CustomerComplaint) => void;
}

const CATEGORIES: { id: ComplaintCategory; label: string; desc: string }[] = [
    { id: "Payment", label: "Payment & Billing", desc: "Charged incorrectly, duplicate debits, checkout timeout" },
    { id: "Delivery", label: "Delivery & Courier", desc: "Delayed shipment, missing parcel, tracking discrepancies" },
    { id: "Refund", label: "Refund Request", desc: "Refund status, returned items, disputed restocking fees" },
    { id: "Product", label: "Product & Quality", desc: "Defective item, incorrect version, transit damage" },
    { id: "Account", label: "Account & Warranty", desc: "Warranty claim, login issues, subscription changes" },
    { id: "Service", label: "Customer Service", desc: "Service dissatisfaction, unresolved prior ticket" },
];

export function QuickSubmitModal({
    isOpen,
    onClose,
    onSubmitSuccess,
}: QuickSubmitModalProps) {
    // 8-step progressive flow:
    // Step 1: Subject
    // Step 2: Description
    // Step 3: Category
    // Step 4: Attachments
    // Step 5: Relevant Reference / Order Number
    // Step 6: Preferred Contact Information
    // Step 7: Review
    // Step 8: Submission Confirmation
    const [step, setStep] = useState(1);

    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState<ComplaintCategory>("Payment");
    const [orderRef, setOrderRef] = useState("");
    const [contactEmail, setContactEmail] = useState("alex.morgan@example.com");
    const [contactPhone, setContactPhone] = useState("+1 (555) 392-8810");
    const [fileName, setFileName] = useState<string | null>("receipt_screenshot.png");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleNext = () => {
        if (step < 7) {
            setStep((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep((prev) => prev - 1);
        }
    };

    const handleSubmit = () => {
        setIsSubmitting(true);
        setTimeout(() => {
            const newId = `BCIP-${Math.floor(10500 + Math.random() * 500)}`;
            const created: CustomerComplaint = {
                id: newId,
                subject: subject || "Issue with recent service transaction",
                description: description || "Details provided during customer intake.",
                category,
                status: "Open",
                priority: category === "Payment" ? "High" : "Medium",
                submittedDate: "Just now",
                lastUpdate: "Just now",
                assignedTeam: `${category} Operations`,
                referenceNumber: orderRef || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
                currentProgressStep: 0,
                whatHappensNext: {
                    summary: `Your complaint is registered with ${category} Operations.`,
                    details: "Automated triage is verifying order reference and routing to an available specialist.",
                    expectedNextUpdate: "Within 2 hours",
                },
                aiTransparency: {
                    categoryNote: `Automatically categorised as ${category}.`,
                    priorityNote: "Marked standard queue response.",
                    patternNote: "Registered into priority intake ledger.",
                },
                timeline: [
                    {
                        id: `t-${Date.now()}`,
                        title: "Complaint submitted",
                        description: "Received via customer self-service workspace.",
                        timestamp: "Just now",
                        date: "Today",
                        actor: "customer",
                        actorName: "Alex Morgan",
                    },
                ],
                messages: [
                    {
                        id: `m-${Date.now()}`,
                        sender: "customer",
                        senderName: "Alex Morgan",
                        content: description || subject,
                        timestamp: "Just now",
                    },
                ],
                attachments: fileName
                    ? [
                          {
                              id: `att-${Date.now()}`,
                              name: fileName,
                              size: "420 KB",
                              type: "image/png",
                              uploadedAt: "Just now",
                          },
                      ]
                    : [],
            };

            onSubmitSuccess(created);
            setIsSubmitting(false);
            setStep(8); // Step 8: Confirmed
        }, 700);
    };

    const handleClose = () => {
        setStep(1);
        setSubject("");
        setDescription("");
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
            aria-labelledby="submit-modal-title"
        >
            <div className="relative flex flex-col w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                                Guided Complaint Intake
                            </span>
                            {step <= 7 && (
                                <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800">
                                    Step {step} of 7
                                </span>
                            )}
                        </div>
                        <h2 id="submit-modal-title" className="text-base font-bold text-slate-900 mt-0.5">
                            Submit a Complaint
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Step Progress Bar */}
                {step <= 7 && (
                    <div className="h-1.5 w-full bg-slate-100">
                        <div
                            className="h-full bg-blue-600 transition-all duration-300"
                            style={{ width: `${(step / 7) * 100}%` }}
                        />
                    </div>
                )}

                {/* Step Body */}
                <div className="p-6">
                    {/* Step 1: Subject */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">1. What is your complaint about?</h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    Summarize the primary issue clearly in one sentence.
                                </p>
                            </div>
                            <input
                                type="text"
                                autoFocus
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="e.g. Payment deducted but order was not confirmed"
                                className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                            <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                                💡 <strong>Tip:</strong> Mention specific actions that went wrong, such as payment timeout, delayed parcel, or wrong item.
                            </div>
                        </div>
                    )}

                    {/* Step 2: Description */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">2. Describe what happened</h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    Provide exact dates, what you expected, and what actually occurred.
                                </p>
                            </div>
                            <textarea
                                rows={4}
                                autoFocus
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe the incident in detail so our specialists can investigate immediately..."
                                className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                    )}

                    {/* Step 3: Category */}
                    {step === 3 && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">3. Select the best category</h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    This ensures your issue is directly routed to the specialized department.
                                </p>
                            </div>
                            <div className="grid gap-2 sm:grid-cols-2">
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setCategory(cat.id)}
                                        className={`flex flex-col text-left p-3 rounded-xl border transition ${
                                            category === cat.id
                                                ? "border-blue-600 bg-blue-50/70 ring-1 ring-blue-600"
                                                : "border-slate-200 hover:border-slate-300 bg-white"
                                        }`}
                                    >
                                        <span className="text-xs font-bold text-slate-900">{cat.label}</span>
                                        <span className="text-[11px] text-slate-500 mt-0.5">{cat.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 4: Attachments */}
                    {step === 4 && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">4. Supporting documentation & proof</h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    Upload screenshots, receipts, invoices, or damaged packaging photos.
                                </p>
                            </div>
                            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 p-6 text-center hover:bg-slate-50 transition cursor-pointer">
                                <UploadCloud className="h-8 w-8 text-slate-400" />
                                <p className="mt-1 text-xs font-semibold text-slate-800">
                                    Click to select evidence files
                                </p>
                                <p className="text-[11px] text-slate-500">PDF, JPG, PNG up to 15MB</p>
                            </div>
                            {fileName && (
                                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
                                    <span className="font-medium text-slate-800">{fileName}</span>
                                    <button
                                        type="button"
                                        onClick={() => setFileName(null)}
                                        className="text-slate-400 hover:text-rose-600"
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 5: Relevant Reference Number */}
                    {step === 5 && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">5. Reference or Order Number</h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    Helps our operations team instantly query database transaction records.
                                </p>
                            </div>
                            <input
                                type="text"
                                autoFocus
                                value={orderRef}
                                onChange={(e) => setOrderRef(e.target.value)}
                                placeholder="e.g. ORD-981240 or TXN-44129"
                                className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                            <p className="text-[11px] text-slate-500">
                                If you don&apos;t have an order number, you can leave this blank.
                            </p>
                        </div>
                    )}

                    {/* Step 6: Preferred Contact Information */}
                    {step === 6 && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">6. Preferred contact details</h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    Where should our support team notify you of progress updates?
                                </p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700">Notification Email</label>
                                <input
                                    type="email"
                                    value={contactEmail}
                                    onChange={(e) => setContactEmail(e.target.value)}
                                    className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700">Phone for urgent updates (optional)</label>
                                <input
                                    type="tel"
                                    value={contactPhone}
                                    onChange={(e) => setContactPhone(e.target.value)}
                                    className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 7: Review */}
                    {step === 7 && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">7. Review your complaint</h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    Confirm the details before submitting to the operations queue.
                                </p>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2.5 text-xs">
                                <div>
                                    <span className="text-slate-400 uppercase font-semibold">Subject:</span>
                                    <p className="text-slate-900 font-bold">{subject || "No subject specified"}</p>
                                </div>
                                <div>
                                    <span className="text-slate-400 uppercase font-semibold">Category:</span>
                                    <p className="text-slate-900 font-medium">{category}</p>
                                </div>
                                <div>
                                    <span className="text-slate-400 uppercase font-semibold">Reference:</span>
                                    <p className="text-slate-900 font-medium">{orderRef || "Not provided"}</p>
                                </div>
                                <div>
                                    <span className="text-slate-400 uppercase font-semibold">Description:</span>
                                    <p className="text-slate-700">{description || "No description provided."}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                                <span>Encrypted and logged in BCIP Customer Portal with tamper-evident audit.</span>
                            </div>
                        </div>
                    )}

                    {/* Step 8: Success State */}
                    {step === 8 && (
                        <div className="py-6 text-center space-y-3">
                            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                                <CheckCircle2 className="h-8 w-8" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Complaint Submitted Successfully</h3>
                            <p className="text-xs text-slate-600 max-w-sm mx-auto">
                                Your case has been registered. You can track all progress, milestones, and responses
                                directly on this dashboard.
                            </p>
                            <button
                                type="button"
                                onClick={handleClose}
                                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-slate-800"
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                {step <= 7 && (
                    <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-6 py-4">
                        <button
                            type="button"
                            disabled={step === 1}
                            onClick={handleBack}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Back
                        </button>

                        {step < 7 ? (
                            <button
                                type="button"
                                onClick={handleNext}
                                disabled={step === 1 && !subject.trim()}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                Continue
                                <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                        ) : (
                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={handleSubmit}
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm disabled:opacity-50"
                            >
                                {isSubmitting ? "Submitting..." : "Submit Complaint"}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
