"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Star, ThumbsUp, ThumbsDown } from "lucide-react";
import { submitFeedback } from "@/lib/api/complaints";

export function FeedbackForm({ id, onDone }: { id: string; onDone: () => void }) {
  const router = useRouter();
  const [resolved, setResolved] = useState(true);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>(["Quick SLA Response", "Satisfactory Outcome"]);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const TAGS = [
    "Quick SLA Response",
    "Professional Specialist",
    "Fair Remedy / Credit",
    "Clear Communication",
    "Satisfactory Outcome",
  ];

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  async function send() {
    setBusy(true);
    setError("");
    try {
      const fullComment = [
        selectedTags.length > 0 ? `Tags: ${selectedTags.join(", ")}` : "",
        comment,
      ]
        .filter(Boolean)
        .join(" | ");

      await submitFeedback(id, { resolved, rating, comment: fullComment || undefined });
      onDone();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Unable to submit your feedback."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6 pt-2">
      {/* Resolved Confirmation */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
          Did this action resolve your grievance?
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setResolved(true)}
            className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
              resolved
                ? "border-emerald-500 bg-emerald-950/30 text-white"
                : "border-slate-800 bg-slate-950/50 text-slate-400 hover:text-white"
            }`}
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                resolved ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-400"
              }`}
            >
              <ThumbsUp className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-bold text-white">Yes, fully resolved</p>
              <p className="text-[11px] text-slate-400">Remedy was completed to our satisfaction</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setResolved(false)}
            className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
              !resolved
                ? "border-amber-500 bg-amber-950/30 text-white"
                : "border-slate-800 bg-slate-950/50 text-slate-400 hover:text-white"
            }`}
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                !resolved ? "bg-amber-500 text-white" : "bg-slate-800 text-slate-400"
              }`}
            >
              <ThumbsDown className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-bold text-white">Not completely resolved</p>
              <p className="text-[11px] text-slate-400">Additional assistance is still required</p>
            </div>
          </button>
        </div>
      </div>

      {/* Star Rating Suite */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
          Rate Support Experience ({hoverRating || rating} / 5 Stars)
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className="p-1 transition-transform hover:scale-110 focus:outline-none"
            >
              <Star
                className={`h-7 w-7 ${
                  star <= (hoverRating || rating)
                    ? "fill-amber-400 text-amber-400 drop-shadow-md"
                    : "text-slate-700"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Feedback Pills */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
          What contributed to your rating?
        </label>
        <div className="flex flex-wrap gap-2">
          {TAGS.map((tag) => {
            const active = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "border-blue-500 bg-blue-500/20 text-blue-300"
                    : "border-slate-800 bg-slate-950/50 text-slate-400 hover:text-slate-200"
                }`}
              >
                {active && "✓ "}
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Optional Note */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
          Additional Comments for Management (Optional)
        </label>
        <textarea
          rows={3}
          maxLength={400}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share feedback on how we can improve our resolution timeline..."
          className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 p-3.5 text-xs text-slate-100 placeholder-slate-500 shadow-inner focus:border-blue-500 focus:outline-none"
        />
      </div>

      {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}

      {/* Submit Action */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push("/support")}
          className="rounded-xl border border-slate-700 hover:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          Skip for Now
        </button>

        <button
          type="button"
          disabled={busy}
          onClick={send}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
        >
          {busy ? "Submitting..." : "Submit Quality Rating"}
        </button>
      </div>
    </div>
  );
}
