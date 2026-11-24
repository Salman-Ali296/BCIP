'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL, SCREENS, pruneAnswers } from './config';
import { QuestionStep } from './components/QuestionStep';
import Step2Welcome from './steps/Step2Welcome';
import type { Answers, OnboardingStatus, OtherText } from './types';

type Props = {
  firstName: string;
  /** Pass saved answers so a user who left halfway resumes where they were. */
  initialAnswers?: Answers;
  initialOtherText?: OtherText;
};

/**
 * Post-login onboarding: Welcome → SCREENS → /dashboard (the product tour starts there).
 * Answers are saved after every screen, so nothing is lost if the user closes the tab.
 */
export default function OnboardingWizard({ firstName, initialAnswers = {}, initialOtherText = {} }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0 = welcome, 1..N = SCREENS
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [otherText, setOtherText] = useState<OtherText>(initialOtherText);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const total = SCREENS.length;
  const screen = SCREENS[step - 1];

  const save = async (status: OnboardingStatus) => {
    const res = await fetch(`${API_URL}/onboarding`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...pruneAnswers(answers, otherText), status }),
    });
    if (!res.ok) throw new Error(`Save failed: ${res.status}`);
  };

  const next = async () => {
    const isLast = step === total;
    setError('');
    setSaving(true);
    try {
      await save(isLast ? 'completed' : 'in_progress');
      if (isLast) router.replace('/dashboard');
      else setStep((s) => s + 1);
    } catch {
      setError('Could not save your answers. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  const skip = async () => {
    setSaving(true);
    try { await save('skipped'); } catch { /* skipping must never block the user */ }
    router.replace('/dashboard');
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      {step > 0 && (
        <div className="mb-8">
          <div className="mb-2 flex justify-between text-xs text-slate-500">
            <span>Step {step} of {total}</span>
            <span>{Math.round((step / total) * 100)}%</span>
          </div>
          <div
            className="h-1.5 overflow-hidden rounded-full bg-slate-100"
            role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={step}
          >
            <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${(step / total) * 100}%` }} />
          </div>
        </div>
      )}

      {step === 0 ? (
        <Step2Welcome firstName={firstName} onNext={() => setStep(1)} />
      ) : (
        <QuestionStep
          key={screen.id}
          screen={screen}
          answers={answers}
          otherText={otherText}
          onAnswer={(id, value) => setAnswers((a) => ({ ...a, [id]: value }))}
          onOtherText={(id, text) => setOtherText((o) => ({ ...o, [id]: text }))}
          onBack={() => setStep((s) => s - 1)}
          onNext={next}
          onSkip={skip}
          isLast={step === total}
          saving={saving}
          error={error}
        />
      )}
    </div>
  );
}
