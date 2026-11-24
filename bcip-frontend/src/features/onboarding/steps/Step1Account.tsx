'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { API_URL, RESERVED_SLUGS } from '../config';
import type { AccountForm } from '../types';

const EMPTY: AccountForm = {
  orgName: '', orgSlug: '', firstName: '', lastName: '', email: '', phone: '', password: '',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9\s()-]{7,20}$/;
const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/; // 3–40 chars, no leading/trailing hyphen

export const toSlug = (s: string) =>
  s.toLowerCase()
    .normalize('NFKD').replace(/[̀-ͯ]/g, '') // é → e
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

type SlugStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';
type Errors = Partial<Record<keyof AccountForm | 'form', string>>;

const SLUG_UI: Record<SlugStatus, { text: string; tone: string; border: string }> = {
  idle: { text: '', tone: '', border: 'border-slate-200' },
  checking: { text: 'Checking…', tone: 'text-slate-400', border: 'border-slate-300' },
  available: { text: '✓ Available', tone: 'text-emerald-600', border: 'border-emerald-400' },
  taken: { text: 'Already taken', tone: 'text-red-600', border: 'border-red-400' },
  invalid: { text: '3–40 characters: lowercase letters, numbers, hyphens', tone: 'text-amber-600', border: 'border-amber-400' },
};

function validate(f: AccountForm, slugStatus: SlugStatus): Errors {
  const e: Errors = {};
  if (!f.orgName.trim()) e.orgName = 'Organization name is required.';
  if (!f.orgSlug) e.orgSlug = 'Choose a workspace URL.';
  else if (slugStatus === 'invalid') e.orgSlug = SLUG_UI.invalid.text;
  else if (slugStatus === 'taken') e.orgSlug = 'This URL is already taken.';
  if (!f.firstName.trim()) e.firstName = 'First name is required.';
  if (!f.lastName.trim()) e.lastName = 'Last name is required.';
  if (!EMAIL_RE.test(f.email.trim())) e.email = 'Enter a valid email address.';
  if (f.phone && !PHONE_RE.test(f.phone)) e.phone = 'Enter a valid phone number.';
  if (f.password.length < 8) e.password = 'Password must be at least 8 characters.';
  return e;
}

/**
 * Signup = account creation. This is the ONLY step before the account exists.
 * Everything else (welcome + questions) happens after email verification, logged in.
 */
export default function Step1Account() {
  const router = useRouter();
  const [form, setForm] = useState<AccountForm>(EMPTY);
  const [slugEdited, setSlugEdited] = useState(false);
  const [remoteSlug, setRemoteSlug] = useState<{ slug: string; status: SlugStatus }>({ slug: '', status: 'idle' });
  const slugStatus: SlugStatus = !form.orgSlug
    ? 'idle'
    : !SLUG_RE.test(form.orgSlug) || RESERVED_SLUGS.has(form.orgSlug)
      ? 'invalid'
      : remoteSlug.slug === form.orgSlug
        ? remoteSlug.status
        : 'checking';
  const [errors, setErrors] = useState<Errors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const set = (patch: Partial<AccountForm>) => setForm((f) => ({ ...f, ...patch }));

  // Debounced availability check. UX only — the backend must still enforce a unique index.
  useEffect(() => {
    const slug = form.orgSlug;
    if (!slug || !SLUG_RE.test(slug) || RESERVED_SLUGS.has(slug)) return;

    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/orgs/slug-availability?slug=${encodeURIComponent(slug)}`, {
          signal: ctrl.signal,
        });
        const data: { available: boolean } = await res.json();
        setRemoteSlug({ slug, status: data.available ? 'available' : 'taken' });
      } catch {
        if (!ctrl.signal.aborted) setRemoteSlug({ slug, status: 'idle' }); // network issue: let the server decide on submit
      }
    }, 400);
    return () => { clearTimeout(timer); ctrl.abort(); };
  }, [form.orgSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate(form, slugStatus);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, email: form.email.trim().toLowerCase() }),
      });
      if (res.status === 409) {
        // Expected body: { field: 'email' | 'orgSlug', message: string }
        const { field, message } = await res.json();
        setErrors({ [field ?? 'form']: message ?? 'Already in use.' });
        return;
      }
      if (!res.ok) throw new Error();
      router.push(`/verify-email?email=${encodeURIComponent(form.email.trim())}`);
    } catch {
      setErrors({ form: 'Something went wrong. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const slugUi = SLUG_UI[slugStatus];

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold text-slate-900">Start your 14-day free trial</h1>
        <p className="text-slate-500">
          No credit card required. <span className="text-slate-400">Takes about 1 minute.</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-2">
        <Input
          label="Organization name"
          name="orgName"
          placeholder="Your company name"
          autoComplete="organization"
          value={form.orgName}
          onChange={(e) => {
            const orgName = e.target.value;
            set(slugEdited ? { orgName } : { orgName, orgSlug: toSlug(orgName) });
          }}
          error={errors.orgName}
          required
        />

        <div className="mb-4">
          <label htmlFor="orgSlug" className="mb-1.5 block text-sm font-medium text-slate-700">
            Workspace URL
          </label>
          <div className={`flex items-center overflow-hidden rounded-lg border-2 transition-colors ${slugUi.border}`}>
            <input
              id="orgSlug"
              type="text"
              value={form.orgSlug}
              onChange={(e) => {
                setSlugEdited(true);
                set({ orgSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') });
              }}
              aria-invalid={slugStatus === 'taken' || slugStatus === 'invalid'}
              aria-describedby="orgSlug-status"
              className="min-w-0 flex-1 bg-transparent px-4 py-3 font-medium text-slate-700 focus:outline-none"
            />
            <span className="border-l border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-400">
              .app.bcip.io
            </span>
          </div>
          <p id="orgSlug-status" aria-live="polite" className={`mt-1 text-sm ${errors.orgSlug ? 'text-red-600' : slugUi.tone}`}>
            {errors.orgSlug ?? slugUi.text}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="First name" name="firstName" autoComplete="given-name"
            value={form.firstName} onChange={(e) => set({ firstName: e.target.value })}
            error={errors.firstName} required
          />
          <Input
            label="Last name" name="lastName" autoComplete="family-name"
            value={form.lastName} onChange={(e) => set({ lastName: e.target.value })}
            error={errors.lastName} required
          />
        </div>

        <Input
          label="Work email" name="email" type="email" autoComplete="email" placeholder="you@company.com"
          value={form.email} onChange={(e) => set({ email: e.target.value })}
          error={errors.email} required
        />

        <Input
          label="Phone number (optional)" name="phone" type="tel" autoComplete="tel" placeholder="+92 300 1234567"
          value={form.phone} onChange={(e) => set({ phone: e.target.value })}
          error={errors.phone}
        />

        <div>
          <Input
            label="Password" name="password" type={showPassword ? 'text' : 'password'}
            autoComplete="new-password" placeholder="At least 8 characters"
            value={form.password} onChange={(e) => set({ password: e.target.value })}
            error={errors.password} required
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="-mt-2 text-sm text-slate-500 hover:text-slate-700"
          >
            {showPassword ? 'Hide password' : 'Show password'}
          </button>
        </div>

        {errors.form && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {errors.form}
          </div>
        )}

        <div className="pt-4">
          <Button
            type="submit" size="lg" className="w-full"
            loading={submitting} disabled={submitting || slugStatus === 'checking'}
          >
            Create account →
          </Button>
        </div>
      </form>
    </div>
  );
}
