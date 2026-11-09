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

const industries = [
  { id: 'ecommerce', title: 'E-commerce', subtitle: 'Selling goods online', icon: '🛍️' },
  { id: 'saas', title: 'SaaS', subtitle: 'Software-as-a-Service', icon: '🤩' },
  { id: 'agency', title: 'Agency', subtitle: 'Digital / marketing agency', icon: '' },
  { id: 'service', title: 'Service', subtitle: 'Travel, cleaning, booking', icon: '🧑‍💼' },
  { id: 'hospitality', title: 'Hospitality', subtitle: 'Experience, Hotel, Restaurant', icon: '🏨' },
  { id: 'other', title: 'Other', subtitle: 'Please let us know', icon: '⭐' },
];

const teamSizes = [
  { id: 'only_me', title: 'Only me' },
  { id: '2-5', title: '2-5' },
  { id: '6-10', title: '6-10' },
  { id: '10+', title: '10+' },
];

export default function Step4Company({ formData, updateFormData, onNext, onBack }: Props) {
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
          What does your company/organization do? 🗺️
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {industries.map((industry) => (
            <Card
              key={industry.id}
              title={industry.title}
              subtitle={industry.subtitle}
              icon={industry.icon}
              selected={formData.industry === industry.id}
              onClick={() => updateFormData({ industry: industry.id })}
            />
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          What is your customer support team size? 👥
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {teamSizes.map((size) => (
            <Card
              key={size.id}
              title={size.title}
              selected={formData.teamSize === size.id}
              onClick={() => updateFormData({ teamSize: size.id })}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>← Back</Button>
        <Button onClick={onNext} disabled={!formData.industry || !formData.teamSize}>
          Next →
        </Button>
      </div>
    </div>
  );
}