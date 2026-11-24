'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';

// Use a real name and photo before launch. A made-up founder letter hurts trust when noticed.
const FOUNDER = { name: 'Alex Morgan', title: 'Founder, BCIP', email: 'alex@bcip.io', avatar: '' };
const SUPPORT_EMAIL = 'support@bcip.io';

type Props = { firstName: string; onNext: () => void };

/** First screen after email verification. The account exists now, so "thanks for signing up" is true. */
export default function Step2Welcome({ firstName, onNext }: Props) {
  return (
    <div className="py-8 text-center">
      <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-amber-300 to-amber-500 shadow-lg">
        {FOUNDER.avatar
          ? <Image src={FOUNDER.avatar} alt={FOUNDER.name} fill sizes="96px" unoptimized className="object-cover" />
          : <span className="text-3xl font-semibold text-white">{FOUNDER.name[0]}</span>}
      </div>

      <h2 className="mb-6 text-2xl font-bold text-slate-900">Welcome to BCIP, {firstName || 'there'} 👋</h2>

      <div className="mx-auto max-w-lg space-y-4 border-t border-slate-100 pt-6 text-left leading-relaxed text-slate-600">
        <p>Thanks for signing up. I&apos;m {FOUNDER.name.split(' ')[0]}, and I built BCIP to help businesses stop losing track of complaints.</p>
        <p>Next, 4 quick questions so we can set up your categories, channels and dashboard. You can skip them and do it later.</p>
        <p>
          Stuck on anything? Email <a className="text-emerald-700 underline" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> or
          write to me at <a className="text-emerald-700 underline" href={`mailto:${FOUNDER.email}`}>{FOUNDER.email}</a>.
        </p>
        <div className="pt-2">
          <p className="font-medium text-slate-800">{FOUNDER.name}</p>
          <p className="text-sm text-slate-500">{FOUNDER.title}</p>
        </div>
      </div>

      <div className="mt-8">
        <Button onClick={onNext} size="lg">Let&apos;s set it up →</Button>
      </div>
    </div>
  );
}
