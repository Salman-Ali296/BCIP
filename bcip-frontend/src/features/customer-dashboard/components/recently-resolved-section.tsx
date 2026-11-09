"use client";

import { useState } from "react";
import { CheckCircle2, Star, Check } from "lucide-react";
import type { CustomerComplaint } from "../types";

interface RecentlyResolvedSectionProps {
    resolvedComplaints: CustomerComplaint[];
    onViewDetails: (complaint: CustomerComplaint) => void;
    onOpenFeedbackModal: (complaint: CustomerComplaint) => void;
    onSubmitInlineFeedback?: (complaintId: string, rating: number, comment: string) => void;
}

export function RecentlyResolvedSection({
    resolvedComplaints,
    onViewDetails,
    onOpenFeedbackModal,
    onSubmitInlineFeedback,
}: RecentlyResolvedSectionProps) {
    const [ratingMap, setRatingMap] = useState<Record<string, number>>({});
    const [commentMap, setCommentMap] = useState<Record<string, string>>({});
    const [submittedFeedback, setSubmittedFeedback] = useState<Record<string, boolean>>({});

    const handleStarClick = (complaintId: string, rating: number) => {
        setRatingMap((prev) => ({ ...prev, [complaintId]: rating }));
    };

    const handleCommentChange = (complaintId: string, comment: string) => {
        setCommentMap((prev) => ({ ...prev, [complaintId]: comment }));
    };

    const handleSubmitFeedback = (complaintId: string) => {
        const rating = ratingMap[complaintId] || 5;
        const comment = commentMap[complaintId] || "";
        onSubmitInlineFeedback?.(complaintId, rating, comment);
        setSubmittedFeedback((prev) => ({ ...prev, [complaintId]: true }));
    };

    if (resolvedComplaints.length === 0) {
        return null;
    }

    return (
        <section aria-labelledby="recently-resolved-heading" className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 id="recently-resolved-heading" className="text-lg font-bold tracking-tight text-slate-900">
                        Recently Resolved
                    </h3>
                    <p className="text-xs text-slate-500">Inquiries successfully concluded by our support teams</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    {resolvedComplaints.length} Closed
                </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {resolvedComplaints.map((item) => {
                    const hasFeedback = Boolean(item.feedback) || submittedFeedback[item.id];
                    const currentRating = ratingMap[item.id] || (item.feedback ? item.feedback.rating : 0);

                    return (
                        <div
                            key={item.id}
                            className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:border-slate-300"
                        >
                            <div>
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-xs font-bold text-slate-700">
                                            {item.id}
                                        </span>
                                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                                            {item.category}
                                        </span>
                                    </div>
                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                                        Resolved
                                    </span>
                                </div>

                                <h4 className="mt-2.5 text-sm font-semibold text-slate-900">
                                    {item.subject}
                                </h4>
                                <p className="mt-1 text-xs text-slate-500">
                                    Resolved on {item.lastUpdate}
                                </p>

                                {/* CSAT Feedback Section */}
                                {!hasFeedback ? (
                                    <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50/50 p-3.5">
                                        <p className="text-xs font-semibold text-slate-800">
                                            How was your experience?
                                        </p>
                                        <div className="mt-2 flex items-center gap-1.5" role="radiogroup" aria-label="Resolution rating">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => handleStarClick(item.id, star)}
                                                    className="p-1 text-slate-300 hover:text-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500 transition-colors"
                                                    aria-label={`${star} of 5 stars`}
                                                >
                                                    <Star
                                                        className={`h-5 w-5 ${
                                                            star <= currentRating
                                                                ? "fill-amber-400 text-amber-400"
                                                                : "text-slate-300"
                                                        }`}
                                                    />
                                                </button>
                                            ))}
                                            {currentRating > 0 && (
                                                <span className="ml-2 text-xs font-medium text-amber-800">
                                                    {currentRating}/5 Stars
                                                </span>
                                            )}
                                        </div>

                                        {currentRating > 0 && (
                                            <div className="mt-3 space-y-2">
                                                <input
                                                    type="text"
                                                    placeholder="Tell us what we could improve (optional)..."
                                                    value={commentMap[item.id] || ""}
                                                    onChange={(e) => handleCommentChange(item.id, e.target.value)}
                                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleSubmitFeedback(item.id)}
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition"
                                                >
                                                    Submit Feedback
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-2 text-xs text-emerald-800">
                                        <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                                        <span>Thank you! Feedback received ({currentRating || item.feedback?.rating || 5}/5 stars).</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                                <span className="text-[11px] text-slate-500">Ref: {item.referenceNumber || item.id}</span>
                                <div className="flex items-center gap-2">
                                    {!hasFeedback && currentRating === 0 && (
                                        <button
                                            type="button"
                                            onClick={() => onOpenFeedbackModal(item)}
                                            className="text-xs font-semibold text-amber-700 hover:text-amber-800 hover:underline"
                                        >
                                            Rate Resolution
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => onViewDetails(item)}
                                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
