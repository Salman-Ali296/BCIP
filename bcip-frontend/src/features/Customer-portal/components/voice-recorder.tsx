"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mic, Square } from "lucide-react";
import { setVoiceDraft } from "@/features/Customer-portal/voice-store";

export function VoiceRecorder() {
  const router = useRouter();
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (
        recorderRef.current &&
        recorderRef.current.state !== "inactive"
      ) {
        recorderRef.current.onstop = null;
        recorderRef.current.stop();
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const stopRecording = () => {
    if (!recorderRef.current) return;
    recorderRef.current.stop();
  };

  const startRecording = async () => {
    setError("");

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("Voice recording is not supported by this browser. Please use text reporting.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        const duration = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000));
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setVoiceDraft({ blob, duration, transcript: "" });
        setRecording(false);
        setSeconds(duration);
        router.push("/support/report/voice/review");
      };

      startedAtRef.current = Date.now();
      setSeconds(0);
      setRecording(true);
      recorder.start();
      timerRef.current = setInterval(() => {
        setSeconds(Math.round((Date.now() - startedAtRef.current) / 1000));
      }, 250);
    } catch {
      setError("Microphone access was denied or unavailable. Please allow microphone access or use text reporting.");
    }
  };

  return (
    <main className="min-h-screen bg-wash px-4 py-12 text-ink">
      <section className="mx-auto max-w-xl rounded-3xl border border-line bg-white p-8 shadow-2xl">
        <Link
          href="/support/report"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to report
        </Link>

        <div className="mt-8 text-center">
          <span
            className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${
              recording
                ? "animate-pulse bg-danger-soft text-danger ring-4 ring-danger/20"
                : "bg-lilac text-brand ring-1 ring-brand/20"
            }`}
            aria-hidden="true"
          >
            {recording ? <Square className="h-8 w-8 fill-current" /> : <Mic className="h-8 w-8" />}
          </span>
          <h1 className="mt-5 text-2xl font-black">Record your complaint</h1>
          <p className="mt-2 text-sm text-muted" aria-live="polite">
            {recording
              ? `Recording: ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`
              : "Tap start and describe what happened."}
          </p>
        </div>

        {error && (
          <p className="mt-6 rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger" role="alert">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={recording ? stopRecording : startRecording}
          className={`mt-8 w-full rounded-xl py-3 text-sm font-bold text-ink transition ${
            recording ? "bg-danger hover:bg-danger" : "bg-ink hover:bg-brand"
          }`}
        >
          {recording ? "Stop and review" : "Start recording"}
        </button>

        <Link
          href="/support/report"
          className="mt-4 block text-center text-sm font-semibold text-muted hover:text-ink"
        >
          Continue with text instead
        </Link>
      </section>
    </main>
  );
}