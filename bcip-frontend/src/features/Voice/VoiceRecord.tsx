'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Card } from '@/components/ui';
import { setVoice } from '@/lib/voiceStore';

const MAX = 180;
const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
type State = 'idle' | 'recording' | 'paused' | 'done';

export function VoiceRecorder() {
  const router = useRouter();
  const rec = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [state, setState] = useState<State>('idle');
  const [secs, setSecs] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [error, setError] = useState('');
  const url = useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob]);
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);

  const stopTimer = () => { if (timer.current) clearInterval(timer.current); };
  const startTimer = () => { stopTimer(); timer.current = setInterval(() => setSecs((s) => s + 1), 1000); };

  useEffect(() => () => { stopTimer(); rec.current?.stream.getTracks().forEach((t) => t.stop()); }, []);
  useEffect(() => { if (secs >= MAX && state === 'recording') stop(); }, [secs, state]); // eslint-disable-line react-hooks/exhaustive-deps

  async function start() {
    setError('');
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') return setError('Voice recording is not supported in this browser. Use the text form instead.');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const r = new MediaRecorder(stream);
      chunks.current = [];
      r.ondataavailable = (e) => chunks.current.push(e.data);
      r.onstop = () => { setBlob(new Blob(chunks.current, { type: r.mimeType })); stream.getTracks().forEach((t) => t.stop()); };
      r.start();
      rec.current = r;
      setSecs(0); setBlob(null); setState('recording'); startTimer();
    } catch {
      setError('Microphone access was denied. Allow it in your browser settings or use the text form.');
    }
  }
  function stop() { rec.current?.stop(); stopTimer(); setState('done'); }
  function togglePause() {
    if (state === 'recording') { rec.current?.pause(); stopTimer(); setState('paused'); }
    else { rec.current?.resume(); startTimer(); setState('recording'); }
  }
  function discard() {
    const r = rec.current;
    if (r && r.state !== 'inactive') { r.onstop = null; r.stop(); r.stream.getTracks().forEach((t) => t.stop()); }
    stopTimer(); setBlob(null); setSecs(0); setState('idle');
  }
  async function rerecord() { discard(); await start(); }
  function next() { if (!blob) return; setVoice({ blob, duration: secs }); router.push('/support/report/voice/review'); }

  const live = state === 'recording' || state === 'paused';
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      <p className="text-sm text-slate-500">Customer Support / Report a problem / Voice complaint</p>
      <h1 className="text-3xl font-bold">Tell us what happened</h1>
      <p className="text-slate-600">Explain your problem using your voice. We&rsquo;ll convert it to text so you can review it before submitting.</p>
      <Card className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col items-center gap-3 rounded-xl bg-blue-50 p-8 text-center">
            <button type="button" onClick={live ? stop : start} disabled={state === 'done'} aria-label={live ? 'Stop recording' : 'Start recording'}
              className={`grid h-20 w-20 place-items-center rounded-full text-3xl text-white focus-visible:ring-4 focus-visible:ring-blue-300 disabled:opacity-50 ${live ? 'bg-red-600' : 'bg-blue-600'}`}>{live ? '\u25A0' : '\uD83C\uDF99'}</button>
            <p className="font-semibold">{state === 'idle' ? 'Tap to start recording' : state === 'recording' ? 'Recording\u2026 tap to stop' : state === 'paused' ? 'Paused' : 'Recording saved'}</p>
            <p className="text-xs text-slate-500">You can pause, review and re-record before submitting.</p>
            {url && <audio controls src={url} className="w-full" />}
          </div>
          <div className="space-y-4 text-sm">
            <div className="rounded-xl bg-blue-50 p-5"><p className="font-semibold">Your speech will appear here</p><p className="text-slate-600">Once we finish converting your voice to text.</p></div>
            <p className="font-semibold">Tips for a better recording</p>
            <ul className="list-disc space-y-1 pl-5 text-slate-600">
              <li>Speak in a clear and calm voice</li><li>Try to record in a quiet place</li><li>Keep your recording under 3 minutes</li><li>Include details like order ID, dates, and the issue</li>
            </ul>
          </div>
        </div>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <span role="timer" className="rounded-lg bg-slate-100 px-3 py-2 text-sm">{fmt(secs)} / {fmt(MAX)}</span>
          <div className="flex gap-2">
            <Button variant="outline" disabled={!live} onClick={togglePause}>{state === 'paused' ? 'Resume' : 'Pause'}</Button>
            <Button variant="danger" disabled={state === 'idle'} onClick={discard}>Delete</Button>
            <Button variant="outline" disabled={state === 'idle'} onClick={rerecord}>Re-record</Button>
          </div>
        </div>
      </Card>
      <div className="flex items-center justify-between">
        <Link href="/support/report" className="text-sm">Back</Link>
        <Button disabled={!blob} onClick={next}>Review &amp; submit complaint</Button>
      </div>
    </div>
  );
}
