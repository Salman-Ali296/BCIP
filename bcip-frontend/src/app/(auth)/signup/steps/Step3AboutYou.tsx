'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { SignupFormData } from '../types';

interface Props {
  formData: SignupFormData;
  updateFormData: (data: Partial<SignupFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const sources = [
  { id: 'search', title: 'Search engine', subtitle: 'Google, Bing, etc.', icon: '🔍' },
  { id: 'social', title: 'Social medias', subtitle: 'Facebook, LinkedIn, X, etc.', icon: '📣' },
  { id: 'referral', title: 'Referral', subtitle: 'Friend, family, colleague, etc.', icon: '🤝' },
  { id: 'sales', title: 'Contact by sales team', subtitle: 'Did we call you?', icon: '' },
  { id: 'other', title: 'Other', subtitle: 'Please let us know', icon: '⭐' },
];

const roles = [
  { id: 'founder', title: 'Founder / CEO', icon: '👔' },
  { id: 'support_manager', title: 'Support manager', icon: '🎯' },
  { id: 'support_agent', title: 'Support agent', icon: '💬' },
  { id: 'other', title: 'Other', icon: '' },
];

export default function Step3AboutYou({ formData, updateFormData, onNext, onBack }: Props) {
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
          Where did you hear about us? 💡
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sources.map((source) => (
            <Card
              key={source.id}
              title={source.title}
              subtitle={source.subtitle}
              icon={source.icon}
              selected={formData.source === source.id}
              onClick={() => updateFormData({ source: source.id })}
            />
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          What is your role? 👤
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {roles.map((role) => (
            <Card
              key={role.id}
              title={role.title}
              icon={role.icon}
              selected={formData.role === role.id}
              onClick={() => updateFormData({ role: role.id })}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>← Back</Button>
        <Button onClick={onNext} disabled={!formData.source || !formData.role}>
          Next →
        </Button>
      </div>
    </div>
  );
}