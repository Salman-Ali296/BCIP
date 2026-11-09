'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createComplaint } from '@/features/complaints/api/complaint-api';

type ComplaintCategory =
  | 'Product Issue'
  | 'Service Quality'
  | 'Billing Problem'
  | 'Delivery Delay'
  | 'Technical Support'
  | 'Feature Request'
  | 'Other';

type ComplaintPriority = 'low' | 'medium' | 'high' | 'urgent';

interface ComplaintFormData {
  title: string;
  description: string;
  category: ComplaintCategory | '';
  priority: ComplaintPriority;
}

interface FieldErrors {
  title?: string;
  description?: string;
  category?: string;
  priority?: string;
}

const CATEGORIES: ComplaintCategory[] = [
  'Product Issue',
  'Service Quality',
  'Billing Problem',
  'Delivery Delay',
  'Technical Support',
  'Feature Request',
  'Other',
];

const PRIORITIES: Array<{
  id: ComplaintPriority;
  label: string;
  description: string;
  className: string;
  activeClassName: string;
}> = [
  {
    id: 'low',
    label: 'Low',
    description: 'General issue',
    className: 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',
    activeClassName: 'border-slate-500 bg-slate-50 text-slate-800 ring-2 ring-slate-200',
  },
  {
    id: 'medium',
    label: 'Medium',
    description: 'Needs attention',
    className: 'border-slate-200 bg-white text-slate-600 hover:border-blue-300',
    activeClassName: 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-200',
  },
  {
    id: 'high',
    label: 'High',
    description: 'Needs quick action',
    className: 'border-slate-200 bg-white text-slate-600 hover:border-amber-300',
    activeClassName: 'border-amber-500 bg-amber-50 text-amber-700 ring-2 ring-amber-200',
  },
  {
    id: 'urgent',
    label: 'Urgent',
    description: 'Immediate attention',
    className: 'border-slate-200 bg-white text-slate-600 hover:border-red-300',
    activeClassName: 'border-red-500 bg-red-50 text-red-700 ring-2 ring-red-200',
  },
];

const INITIAL_FORM: ComplaintFormData = {
  title: '',
  description: '',
  category: '',
  priority: 'medium',
};

const MIN_TITLE_LENGTH = 5;
const MAX_TITLE_LENGTH = 150;
const MIN_DESCRIPTION_LENGTH = 20;
const MAX_DESCRIPTION_LENGTH = 5000;

function validateForm(form: ComplaintFormData): FieldErrors {
  const errors: FieldErrors = {};

  const title = form.title.trim();
  const description = form.description.trim();

  if (!title) {
    errors.title = 'Complaint title is required.';
  } else if (title.length < MIN_TITLE_LENGTH) {
    errors.title = `Title must contain at least ${MIN_TITLE_LENGTH} characters.`;
  } else if (title.length > MAX_TITLE_LENGTH) {
    errors.title = `Title cannot exceed ${MAX_TITLE_LENGTH} characters.`;
  }

  if (!description) {
    errors.description = 'Please describe the complaint.';
  } else if (description.length < MIN_DESCRIPTION_LENGTH) {
    errors.description = `Description must contain at least ${MIN_DESCRIPTION_LENGTH} characters.`;
  } else if (description.length > MAX_DESCRIPTION_LENGTH) {
    errors.description = `Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters.`;
  }

  if (!form.category) {
    errors.category = 'Please select a complaint category.';
  }

  return errors;
}

export default function NewComplaintPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<ComplaintFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const titleLength = formData.title.length;
  const descriptionLength = formData.description.length;

  const isFormValid = useMemo(() => {
    return (
      formData.title.trim().length >= MIN_TITLE_LENGTH &&
      formData.title.trim().length <= MAX_TITLE_LENGTH &&
      formData.description.trim().length >= MIN_DESCRIPTION_LENGTH &&
      formData.description.trim().length <= MAX_DESCRIPTION_LENGTH &&
      Boolean(formData.category)
    );
  }, [formData]);

  const updateField = <K extends keyof ComplaintFormData>(
    field: K,
    value: ComplaintFormData[K],
  ) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));

    if (submitError) {
      setSubmitError('');
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (loading) return;

    const validationErrors = validateForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setSubmitError('');

    try {
      const complaint = await createComplaint({
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: formData.priority,
      });

      if (!complaint?.id) {
        throw new Error('The complaint was created but no complaint ID was returned.');
      }

      router.push(`/dashboard/complaints/${complaint.id}`);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to submit your complaint. Please try again.';

      setSubmitError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (loading) return;
    router.back();
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="mb-8">
        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span aria-hidden="true">←</span>
          Back to complaints
        </button>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Submit a complaint
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Tell us what happened. Our system will analyze your complaint,
            determine its priority, and route it to the appropriate team.
          </p>
        </div>
      </header>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="space-y-8 p-6 sm:p-8">
          {/* Title */}
          <section>
            <div className="mb-2 flex items-center justify-between gap-4">
              <label
                htmlFor="complaint-title"
                className="text-sm font-semibold text-slate-800"
              >
                Complaint title
                <span className="ml-1 text-red-500" aria-hidden="true">
                  *
                </span>
              </label>

              <span
                className={`text-xs ${
                  titleLength > MAX_TITLE_LENGTH
                    ? 'text-red-600'
                    : 'text-slate-400'
                }`}
              >
                {titleLength}/{MAX_TITLE_LENGTH}
              </span>
            </div>

            <input
              id="complaint-title"
              name="title"
              type="text"
              value={formData.title}
              onChange={(event) =>
                updateField('title', event.target.value)
              }
              maxLength={MAX_TITLE_LENGTH}
              autoComplete="off"
              placeholder="Briefly describe the issue"
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? 'title-error' : undefined}
              className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 ${
                errors.title
                  ? 'border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                  : 'border-slate-200 bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
              }`}
            />

            {errors.title && (
              <p
                id="title-error"
                role="alert"
                className="mt-2 text-xs font-medium text-red-600"
              >
                {errors.title}
              </p>
            )}
          </section>

          {/* Category */}
          <section>
            <div className="mb-3">
              <label className="text-sm font-semibold text-slate-800">
                Complaint category
                <span className="ml-1 text-red-500" aria-hidden="true">
                  *
                </span>
              </label>

              <p className="mt-1 text-xs text-slate-500">
                Select the category that best describes your issue.
              </p>
            </div>

            <div
              role="radiogroup"
              aria-label="Complaint category"
              className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
            >
              {CATEGORIES.map((category) => {
                const selected = formData.category === category;

                return (
                  <button
                    key={category}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => updateField('category', category)}
                    className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all ${
                      selected
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-100'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            {errors.category && (
              <p
                role="alert"
                className="mt-2 text-xs font-medium text-red-600"
              >
                {errors.category}
              </p>
            )}
          </section>

          {/* Priority */}
          <section>
            <div className="mb-3">
              <label className="text-sm font-semibold text-slate-800">
                Priority
              </label>

              <p className="mt-1 text-xs text-slate-500">
                You can indicate how urgent the issue feels. BCIP can
                recalculate priority using its AI and business rules.
              </p>
            </div>

            <div
              role="radiogroup"
              aria-label="Complaint priority"
              className="grid grid-cols-2 gap-3 sm:grid-cols-4"
            >
              {PRIORITIES.map((priority) => {
                const selected = formData.priority === priority.id;

                return (
                  <button
                    key={priority.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => updateField('priority', priority.id)}
                    className={`rounded-xl border px-3 py-3 text-left transition-all ${
                      selected
                        ? priority.activeClassName
                        : priority.className
                    }`}
                  >
                    <span className="block text-sm font-semibold">
                      {priority.label}
                    </span>

                    <span className="mt-1 block text-[11px] leading-4 opacity-75">
                      {priority.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Description */}
          <section>
            <div className="mb-2 flex items-center justify-between gap-4">
              <label
                htmlFor="complaint-description"
                className="text-sm font-semibold text-slate-800"
              >
                Describe the issue
                <span className="ml-1 text-red-500" aria-hidden="true">
                  *
                </span>
              </label>

              <span
                className={`text-xs ${
                  descriptionLength > MAX_DESCRIPTION_LENGTH
                    ? 'text-red-600'
                    : 'text-slate-400'
                }`}
              >
                {descriptionLength}/{MAX_DESCRIPTION_LENGTH}
              </span>
            </div>

            <textarea
              id="complaint-description"
              name="description"
              value={formData.description}
              onChange={(event) =>
                updateField('description', event.target.value)
              }
              maxLength={MAX_DESCRIPTION_LENGTH}
              rows={7}
              placeholder="Explain what happened, when it happened, and how it affected you..."
              aria-invalid={Boolean(errors.description)}
              aria-describedby={
                errors.description
                  ? 'description-error'
                  : 'description-help'
              }
              className={`w-full resize-none rounded-xl border px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition-all placeholder:text-slate-400 ${
                errors.description
                  ? 'border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                  : 'border-slate-200 bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
              }`}
            />

            {errors.description ? (
              <p
                id="description-error"
                role="alert"
                className="mt-2 text-xs font-medium text-red-600"
              >
                {errors.description}
              </p>
            ) : (
              <p
                id="description-help"
                className="mt-2 text-xs text-slate-400"
              >
                Include relevant details such as order numbers, dates,
                previous support interactions, or financial impact.
              </p>
            )}
          </section>

          {/* System information */}
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
            <div className="flex gap-3">
              <div
                className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm text-indigo-700"
                aria-hidden="true"
              >
                AI
              </div>

              <div>
                <h2 className="text-sm font-semibold text-indigo-900">
                  What happens after submission?
                </h2>

                <p className="mt-1 text-xs leading-5 text-indigo-700">
                  BCIP will analyze your complaint, identify its category and
                  sentiment, evaluate priority, check for similar complaints,
                  and route it to the appropriate business team.
                </p>
              </div>
            </div>
          </div>

          {/* Error */}
          {submitError && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-4"
            >
              <p className="text-sm font-semibold text-red-800">
                Unable to submit complaint
              </p>

              <p className="mt-1 text-sm text-red-600">
                {submitError}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <footer className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="text-xs text-slate-400">
            Fields marked with <span className="text-red-500">*</span> are
            required.
          </p>

          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              loading={loading}
              disabled={loading || !isFormValid}
              size="lg"
              className="w-full min-w-40 sm:w-auto"
            >
              {loading ? 'Submitting...' : 'Submit complaint'}
            </Button>
          </div>
        </footer>
      </form>
    </main>
  );
}