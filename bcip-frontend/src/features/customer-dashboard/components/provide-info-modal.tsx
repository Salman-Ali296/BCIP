"use client";

import { useState } from "react";
import { X, UploadCloud, File, CheckCircle2 } from "lucide-react";
import type { CustomerComplaint } from "../types";

interface ProvideInfoModalProps {
    complaint: CustomerComplaint | null;
    isOpen: boolean;
    onClose: () => void;
    onSubmitInfo: (complaintId: string, text: string, fileName?: string) => void;
}

export function ProvideInfoModal({
    complaint,
    isOpen,
    onClose,
    onSubmitInfo,
}: ProvideInfoModalProps) {
    const [responseMessage, setResponseMessage] = useState("");
    const [fileName, setFileName] = useState<string | null>("bank_statement_snippet.png");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    if (!isOpen || !complaint) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            onSubmitInfo(complaint.id, responseMessage, fileName || undefined);
            setIsSubmitting(false);
            setIsSuccess(true);
            setTimeout(() => {
                setIsSuccess(false);
                setResponseMessage("");
                onClose();
            }, 1200);
        }, 500);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
            aria-labelledby="provide-info-modal-title"
        >
            <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800 uppercase">
                                Action Required
                            </span>
                            <span className="text-xs text-slate-500 font-mono">{complaint.id}</span>
                        </div>
                        <h3 id="provide-info-modal-title" className="mt-1 text-base font-bold text-slate-900">
                            {complaint.actionRequired?.title || "Provide Requested Information"}
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                        aria-label="Close modal"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {isSuccess ? (
                    <div className="p-8 text-center">
                        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                            <CheckCircle2 className="h-8 w-8" />
                        </div>
                        <h4 className="mt-4 text-lg font-bold text-slate-900">Information Submitted</h4>
                        <p className="mt-1 text-sm text-slate-600">
                            Payment Operations has been notified and will resume investigating your complaint.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs leading-relaxed text-amber-900">
                            <p className="font-semibold">{complaint.actionRequired?.requestedBy}:</p>
                            <p className="mt-0.5">{complaint.actionRequired?.description}</p>
                        </div>

                        <div>
                            <label htmlFor="info-details" className="block text-xs font-semibold text-slate-700">
                                Your note or details
                            </label>
                            <textarea
                                id="info-details"
                                rows={3}
                                required
                                value={responseMessage}
                                onChange={(e) => setResponseMessage(e.target.value)}
                                placeholder="e.g. Here is the confirmation reference number from my bank statement: REF-491203..."
                                className="mt-1.5 w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <span className="block text-xs font-semibold text-slate-700">
                                Attach file / screenshot
                            </span>
                            <div className="mt-1.5 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 p-4 text-center hover:bg-slate-50 transition cursor-pointer">
                                <UploadCloud className="h-8 w-8 text-slate-400" />
                                <p className="mt-1 text-xs font-medium text-slate-700">
                                    Click to browse or drag and drop
                                </p>
                                <p className="text-[11px] text-slate-400">PNG, JPG, PDF up to 10MB</p>
                            </div>

                            {fileName && (
                                <div className="mt-2 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
                                    <div className="flex items-center gap-2">
                                        <File className="h-4 w-4 text-blue-600" />
                                        <span className="font-medium text-slate-800">{fileName}</span>
                                    </div>
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

                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition disabled:opacity-50"
                            >
                                {isSubmitting ? "Submitting..." : "Send to Operations"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
