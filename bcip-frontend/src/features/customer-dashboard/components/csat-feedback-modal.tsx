"use client";

import { useState } from "react";
import { X, Star, CheckCircle2 } from "lucide-react";
import type { CustomerComplaint } from "../types";

interface CsatFeedbackModalProps {
    complaint: CustomerComplaint | null;
    isOpen: boolean;
    onClose: () => void;
    onSubmitFeedback: (complaintId: string, rating: number, comment: string) => void;
}

export function CsatFeedbackModal({
    complaint,
    isOpen,
    onClose,
    onSubmitFeedback,
}: CsatFeedbackModalProps) {
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submitted, setSubmitted] = useState(false);

    if (!isOpen || !complaint) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmitFeedback(complaint.id, rating, comment);
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setComment("");
            onClose();
        }, 1200);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
            aria-labelledby="csat-modal-title"
        >
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                    <div>
                        <span className="font-mono text-xs text-slate-500">{complaint.id}</span>
                        <h3 id="csat-modal-title" className="text-base font-bold text-slate-900">
                            Resolution Feedback
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

                {submitted ? (
                    <div className="p-8 text-center">
                        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                            <CheckCircle2 className="h-8 w-8" />
                        </div>
                        <h4 className="mt-4 text-lg font-bold text-slate-900">Thank you!</h4>
                        <p className="mt-1 text-sm text-slate-600">
                            Your feedback helps us continuously improve our resolution speed and care.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <p className="text-sm text-slate-600">
                            How satisfied are you with the resolution of:
                            <br />
                            <strong className="text-slate-900">{complaint.subject}</strong>
                        </p>

                        <div className="flex flex-col items-center justify-center py-2">
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => {
                                    const activeVal = hoverRating || rating;
                                    return (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="p-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500 rounded-md transition"
                                            aria-label={`${star} stars`}
                                        >
                                            <Star
                                                className={`h-7 w-7 transition-colors ${
                                                    star <= activeVal
                                                        ? "fill-amber-400 text-amber-400"
                                                        : "text-slate-200"
                                                }`}
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                            <span className="mt-2 text-xs font-semibold text-slate-600">
                                {rating === 5 && "Excellent resolution"}
                                {rating === 4 && "Good experience"}
                                {rating === 3 && "Acceptable"}
                                {rating === 2 && "Needs improvement"}
                                {rating === 1 && "Unsatisfactory"}
                            </span>
                        </div>

                        <div>
                            <label htmlFor="csat-comment" className="block text-xs font-semibold text-slate-700">
                                Tell us what we could improve (optional)
                            </label>
                            <textarea
                                id="csat-comment"
                                rows={3}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Share thoughts on resolution speed, communication, or clarity..."
                                className="mt-1.5 w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                Skip
                            </button>
                            <button
                                type="submit"
                                className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
                            >
                                Submit Feedback
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
