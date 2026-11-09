'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { SignupFormData } from '../types';

interface Props {
  formData: SignupFormData;
  updateFormData: (data: Partial<SignupFormData>) => void;
  onBack: () => void;
  onSubmit: () => void;
  loading: boolean;
  error: string;
}

const plans = [
  { id: 'scratch', title: 'Start from scratch', subtitle: 'Right now is the best time to prioritize your support.' },
  { id: 'outlook', title: 'Migrate from Outlook', subtitle: "If you're using a shared Outlook, Gmail or similar today." },
  { id: 'another_tool', title: 'Migrate from another tool', subtitle: 'Are you using another helpdesk/livechat solution today?' },
  { id: 'looking', title: 'Just looking around', subtitle: 'Great support always wins. We hope you like what you see.' },
];

const goals = [
  { id: 'get_started', title: 'Get started with customer support' },
  { id: 'gather', title: 'Gather all our support in one place' },
  { id: 'improve', title: 'Improve our support response times' },
  { id: 'optimize', title: 'Optimize our customer service with AI' },
  { id: 'other', title: 'Other' },
];

export default function Step5Goals({ formData, updateFormData, onBack, onSubmit, loading, error }: Props) {
  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Tell us about you and your team
        </h2>
        <p className="text-slate-500">
          The more we get to know you, the better we can help you.
        </p>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          What are you planning to do? 🎯
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              title={plan.title}
              subtitle={plan.subtitle}
              selected={formData.plan === plan.id}
              onClick={() => updateFormData({ plan: plan.id })}
            />
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          What do you hope to get out of BCIP? 
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {goals.map((goal) => (
            <Card
              key={goal.id}
              title={goal.title}
              selected={formData.goal === goal.id}
              onClick={() => updateFormData({ goal: goal.id })}
            />
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} disabled={loading}>← Back</Button>
        <Button
          onClick={onSubmit}
          disabled={!formData.plan || !formData.goal || loading}
          size="lg"
          loading={loading}
        >
          Create Account & Start Free Trial 🚀
        </Button>
      </div>
    </div>
  );
}