'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  onNext: () => void;
  userName: string;
}

export default function Step2Welcome({ onNext, userName }: Props) {
  return (
    <div className="text-center py-8">
      <div className="w-28 h-28 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center overflow-hidden shadow-lg">
        <span className="text-5xl">👨‍💼</span>
      </div>

      <h2 className="text-2xl font-bold text-slate-900 mb-6">
        Welcome from Alex Morgan, founder
      </h2>

      <div className="text-left max-w-lg mx-auto space-y-4 text-slate-600 leading-relaxed border-t border-slate-100 pt-6">
        <p className="text-lg">Hi {userName || 'there'} 👋</p>
        <p>My name is Alex, and I am the founder of BCIP.</p>
        <p>I want to start by saying thank you for signing up.</p>
        <p>
          We want to make it super easy for you to get started. On this page is our
          &quot;Getting Started&quot; guide that will help you set up BCIP.
        </p>
        <p>Follow the next few steps, and you are up and running.</p>

        <div className="pt-2">
          <p className="font-medium text-slate-700 mb-2">If you need any help...</p>
          <ul className="list-disc list-inside space-y-1 text-sm ml-2">
            <li>Write an e-mail to support@bcip.io, or...</li>
            <li>Write to me directly at alex@bcip.io - my inbox is always open.</li>
          </ul>
        </div>

        <p className="pt-2">Thanks again for choosing BCIP!</p>

        <div className="pt-4">
          <p className="text-3xl font-serif italic text-slate-800">Alex Morgan</p>
          <p className="text-sm text-slate-500 mt-1">Alex Morgan, founder of BCIP</p>
        </div>
      </div>

      <div className="mt-8">
        <Button onClick={onNext} size="lg">
          Let&apos;s go! 
        </Button>
      </div>
    </div>
  );
}