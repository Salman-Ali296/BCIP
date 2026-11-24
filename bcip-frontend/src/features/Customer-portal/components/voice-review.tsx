"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mic } from "lucide-react";
import { clearVoiceDraft, getVoiceDraft, setVoiceDraft } from "@/features/Customer-portal/voice-store";
import { createComplaint } from "@/features/Customer-portal/api/portal-api";

export function VoiceReview() {
  const router = useRouter();
  const voice = getVoiceDraft();
  const [transcript, setTranscript] = useState(voice?.transcript ?? "");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const audioUrl = useMemo(() => (voice ? URL.createObjectURL(voice.blob) : null), [voice]);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  if (!voice) {
    return (
      <main className="min-h-screen bg-wash px-4 py-12 text-ink">
        <section className="mx-auto max-w-xl rounded-3xl border border-line bg-white p-8 text-center">
          <h1 className="text-xl font-bold">Recording not found</h1>
          <p className="mt-2 text-sm text-muted">Record a new complaint before reviewing it.</p>
          <Link href="/support/report/voice" className="mt-6 inline-block rounded-xl bg-ink px-5 py-3 text-sm font-bold">
            Record again
          </Link>
        </section>
      </main>
    );
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please provide a valid email address.");
      return;
    }
    if (!transcript.trim()) {
      setError("Please enter or confirm the transcript before submitting.");
      return;
    }

    setBusy(true);
    try {
      setVoiceDraft({ ...voice, transcript: transcript.trim() });
      const complaint = await createComplaint({
        channel: "voice",
        description: transcript.trim(),
        email: email.trim(),
      });
      clearVoiceDraft();
      router.push(`/support/track/${complaint.trackingId}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to submit the voice complaint.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-wash px-4 py-12 text-ink">
      <form onSubmit={submit} className="mx-auto max-w-xl space-y-6 rounded-3xl border border-line bg-white p-8 shadow-2xl">
        <Link href="/support/report/voice" className="inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-ink">
          <ArrowLeft className="h-4 w-4" />
          Record again
        </Link>

        <div>
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-lilac text-brand">
            <Mic className="h-6 w-6" />
          </span>
          <h1 className="mt-4 text-2xl font-black">Review your recording</h1>
          <p className="mt-1 text-sm text-muted">
            {Math.floor(voice.duration / 60)}:{String(voice.duration % 60).padStart(2, "0")} recorded
          </p>
        </div>

        {audioUrl && <audio controls src={audioUrl} className="w-full" />}

        <div className="space-y-2">
          <label htmlFor="voice-transcript" className="text-xs font-bold uppercase tracking-wider text-ink-soft">
            Transcript
          </label>
          <textarea
            id="voice-transcript"
            value={transcript}
            onChange={(event) => setTranscript(event.target.value)}
            rows={6}
            maxLength={1200}
            placeholder="Type or confirm what you said..."
            className="w-full rounded-xl border border-line bg-wash p-3 text-sm text-ink placeholder-faint focus:border-brand focus:outline-none"
            aria-describedby="voice-transcript-status"
          />
          <p id="voice-transcript-status" aria-live="polite" className="text-right text-xs text-subtle">
            {transcript.length}/1200
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="voice-email" className="text-xs font-bold uppercase tracking-wider text-ink-soft">
            Email
          </label>
          <input
            id="voice-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-line bg-wash px-3 py-3 text-sm text-ink placeholder-faint focus:border-brand focus:outline-none"
          />
        </div>

        {error && <p className="text-sm text-danger" role="alert">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-ink py-3 text-sm font-bold text-white hover:bg-brand disabled:opacity-50"
        >
          {busy ? "Submitting..." : "Submit voice complaint"}
        </button>
      </form>
    </main>
  );
}