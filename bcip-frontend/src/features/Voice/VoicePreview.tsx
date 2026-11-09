'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Field, inputCls } from '@/components/ui';
import { CATEGORIES, type Classification } from '@/types/complaint';
import { classify, clearDraft, createComplaint, loadDraft, saveDraft, transcribeVoice } from '@/lib/api/complaints';
import { getVoice } from '@/lib/voiceStore';

const ACCOUNT_EMAIL = 'customer@example.com'; // mock session
const tiles = (c: Classification) => [['Category', c.category], ['Priority', c.priority], ['Sentiment', c.sentiment]] as const;

export function VoiceReview() {
  const router = useRouter();
  const voice = useMemo(() => getVoice(), []);
  const url = useMemo(() => (voice ? URL.createObjectURL(voice.blob) : null), [voice]);
  const [text, setText] = useState('');
  const [cls, setCls] = useState<Classification | null>(null);
  const [editCat, setEditCat] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!voice) { router.replace('/support/report/voice'); return; }
    const d = loadDraft<{ email: string; phone: string }>('voice');
    if (d) { setEmail(d.email); setPhone(d.phone); }
    transcribeVoice(voice.blob)
      .then((t) => { setText(t); return classify(t); })
      .then(setCls)
      .catch((transcriptionError: unknown) => {
        setError(transcriptionError instanceof Error ? transcriptionError.message : 'Unable to transcribe this recording.');
      });
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [voice, url, router]);

  async function submit() {
    if (!/^\S+@\S+\.\S+$/.test(email)) return setEmailErr('Enter a valid email address.');
    if (!cls) return;
    setBusy(true);
    setError('');
    try {
      const c = await createComplaint({ channel: 'voice', description: text, email, phone: phone || undefined, ...cls });
      clearDraft('voice');
      router.push(`/support/submitted/${c.id}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to submit your complaint.');
    } finally {
      setBusy(false);
    }
  }

  if (!voice) return null;
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-10">
      <p className="text-sm text-slate-500">Customer Support / Report a problem / Voice complaint / Review</p>
      <h1 className="text-3xl font-bold">Review your complaint</h1>
      <p className="text-slate-600">We&rsquo;ve converted your voice message into a complaint. Please review the details before sending it.</p>
      <Card className="space-y-6">
        <section><h2 className="mb-2 font-semibold">Your voice message</h2>{url && <audio controls src={url} className="w-full" />}</section>
        <section className="space-y-2">
          <div className="flex items-center justify-between"><h2 className="font-semibold">Here&rsquo;s what we heard</h2><span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">Mock transcript</span></div>
          <textarea aria-label="Transcript" className={`${inputCls} h-28`} value={text} placeholder="Converting your recording…" onChange={(e) => setText(e.target.value)} onBlur={() => text && classify(text).then((c) => setCls((p) => ({ ...c, ...(p && editCat ? { category: p.category } : {}) })))} />
          <p className="text-xs text-slate-500">This local demo uses a sample transcript. Replace it with your complaint before submitting.</p>
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        </section>
        <section className="space-y-2" aria-live="polite">
          <div className="flex items-center justify-between"><h2 className="font-semibold">What we understood</h2><button type="button" className="text-sm text-blue-600" onClick={() => setEditCat((v) => !v)}>Change category</button></div>
          {cls ? (
            <div className="grid gap-3 sm:grid-cols-3">
              {tiles(cls).map(([k, v]) => <div key={k} className="rounded-lg border p-3 text-sm"><p className="text-xs text-slate-500">{k}</p><p className="font-semibold capitalize">{v}</p></div>)}
            </div>
          ) : <p className="text-sm text-slate-500">Analyzing…</p>}
          {editCat && cls && <select aria-label="Category" className={inputCls} value={cls.category} onChange={(e) => setCls({ ...cls, category: e.target.value })}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>}
        </section>
        <section className="grid gap-4 border-t pt-5 sm:grid-cols-2">
          <h2 className="font-semibold sm:col-span-2">Where should we send updates?</h2>
          <Field label="Email address" error={emailErr}>
            <input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} />
            <button type="button" className="mt-1 text-xs text-blue-600" onClick={() => setEmail(ACCOUNT_EMAIL)}>Use my account email</button>
          </Field>
          <Field label="Phone number (optional)"><input type="tel" className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+92 3XX XXXXXXX" /></Field>
        </section>
      </Card>
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.push('/support/report/voice')}>Back to recording</Button>
        <div className="flex items-center gap-2">
          <span role="status" className="text-xs text-slate-500">{msg}</span>
          <Button variant="outline" onClick={() => { saveDraft('voice', { email, phone }); setMsg('Draft saved'); }}>Save draft</Button>
          <Button disabled={busy || !text || !cls} onClick={submit}>{busy ? 'Submitting…' : 'Submit complaint'}</Button>
        </div>
      </div>
    </div>
  );
}
