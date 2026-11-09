'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { SignupFormData } from '../types';

interface Props {
  formData: SignupFormData;
  updateFormData: (data: Partial<SignupFormData>) => void;
  onNext: () => void;
}

export default function Step1Organization({ formData, updateFormData, onNext }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.orgName.trim()) newErrors.orgName = 'Organization name cannot be blank.';
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required.';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required.';
    if (!formData.email.trim()) newErrors.email = 'E-mail cannot be blank.';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email.';
    if (!formData.password) newErrors.password = 'Password is required.';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters.';
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      onNext();
    }
  };

  const generateUrlSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Start your 14-day free trial
        </h1>
        <p className="text-slate-500">
          Sign up for a 14-day free trial of BCIP Business now{' '}
          <span className="text-amber-600 italic">(No credit card required)</span>.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        <Input
          label="Organization name"
          name="orgName"
          placeholder="Your company name"
          value={formData.orgName}
          onChange={(e) => {
            updateFormData({
              orgName: e.target.value,
              orgUrl: generateUrlSlug(e.target.value),
            });
          }}
          error={errors.orgName}
          required
        />

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            BCIP URL
          </label>
          <div className="flex items-center border-2 border-emerald-400 rounded-lg overflow-hidden bg-emerald-50/30">
            <input
              type="text"
              value={formData.orgUrl}
              readOnly
              className="flex-1 px-4 py-3 bg-transparent text-slate-700 font-medium focus:outline-none"
            />
            <span className="px-4 py-3 text-sm text-slate-400 bg-slate-50 border-l border-slate-200">
              .app.bcip.io
            </span>
            <span className="px-3 text-emerald-500">✓</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="First name"
            name="firstName"
            placeholder="John"
            value={formData.firstName}
            onChange={(e) => updateFormData({ firstName: e.target.value })}
            error={errors.firstName}
            required
          />
          <Input
            label="Last name"
            name="lastName"
            placeholder="Doe"
            value={formData.lastName}
            onChange={(e) => updateFormData({ lastName: e.target.value })}
            error={errors.lastName}
            required
          />
        </div>

        <Input
          label="E-mail"
          name="email"
          type="email"
          placeholder="john@company.com"
          value={formData.email}
          onChange={(e) => updateFormData({ email: e.target.value })}
          error={errors.email}
          required
        />

        <Input
          label="Phone number"
          name="phone"
          type="tel"
          placeholder="+1 (555) 000-0000"
          value={formData.phone}
          onChange={(e) => updateFormData({ phone: e.target.value })}
          icon={<span>📱</span>}
        />

        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="Min. 8 characters"
          value={formData.password}
          onChange={(e) => updateFormData({ password: e.target.value })}
          error={errors.password}
          required
        />

        <div className="pt-4">
          <Button type="submit" size="lg" className="w-full">
            Continue →
          </Button>
        </div>
      </form>
    </div>
  );
}