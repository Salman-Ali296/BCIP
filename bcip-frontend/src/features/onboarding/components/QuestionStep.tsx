'use client';

import { Button } from '@/components/ui/button';
import { isVisible } from '../config';
import type { Answers, OtherText, Screen } from '../types';
import { ChoiceGroup } from './ChoiceGroup';

type Props = {
  screen: Screen;
  answers: Answers;
  otherText: OtherText;
  onAnswer: (questionId: string, value: string[]) => void;
  onOtherText: (questionId: string, text: string) => void;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
  isLast: boolean;
  saving: boolean;
  error: string;
};

/** Replaces Step3AboutYou, Step4Company and Step5Goals. Content comes from SCREENS. */
export function QuestionStep({
  screen, answers, otherText, onAnswer, onOtherText, onBack, onNext, onSkip, isLast, saving, error,
}: Props) {
  const questions = screen.questions.filter((q) => isVisible(q, answers));
  const canContinue = questions.every((q) => !q.required || (answers[q.id]?.length ?? 0) > 0);

  return (
    <div>
      <div className="mb-8 text-center">
        <h2 className="mb-2 text-2xl font-bold text-slate-900">{screen.heading}</h2>
        <p className="text-slate-500">{screen.subheading}</p>
      </div>

      {questions.map((q) => (
        <ChoiceGroup
          key={q.id}
          question={q}
          value={answers[q.id] ?? []}
          otherText={otherText[q.id] ?? ''}
          onChange={(v) => onAnswer(q.id, v)}
          onOtherChange={(t) => onOtherText(q.id, t)}
        />
      ))}

      {error && (
        <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="outline" onClick={onBack} disabled={saving}>← Back</Button>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={onSkip}
            disabled={saving}
            className="text-sm text-slate-500 hover:text-slate-700 disabled:opacity-50"
          >
            Skip for now
          </button>
          <Button onClick={onNext} disabled={!canContinue || saving} loading={saving} size="lg">
            {isLast ? 'Go to my dashboard →' : 'Next →'}
          </Button>
        </div>
      </div>
    </div>
  );
}
