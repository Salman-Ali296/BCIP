/** Step 1 — the only data needed to create the account. */
export type AccountForm = {
  orgName: string;
  orgSlug: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
};

/**
 * Onboarding answers keyed by question id.
 * Always an array: single-select questions store one item, multi-select store many.
 * One shape for every question = one component, one validator, one API payload.
 */
export type Answers = Record<string, string[]>;

/** Free text typed when the user picks "Other", keyed by question id. */
export type OtherText = Record<string, string>;

export type OnboardingStatus = 'in_progress' | 'completed' | 'skipped';

export type Option = {
  id: string;
  label: string;
  hint?: string;
  icon?: string;
};

export type Question = {
  id: string;
  title: string;
  options: Option[];
  multi?: boolean;
  required?: boolean;
  columns?: 2 | 3 | 4;
  /** Show a text box when "other" is selected. */
  allowOther?: boolean;
  /** Conditional question, e.g. "Which tool?" only when migrating. */
  showIf?: (answers: Answers) => boolean;
};

export type Screen = {
  id: string;
  heading: string;
  subheading: string;
  questions: Question[];
};
