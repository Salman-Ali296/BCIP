export type Plan = {
  id: string;
  name: string;
  tagline: string;
  monthly: number | null; // PKR per month, null = custom pricing
  complaints: string;
  seats: string;
  featured?: boolean;
  features: string[];
};

export const TRIAL_DAYS = 14;

// Placeholder prices in PKR. Edit these to match your real pricing.
export const YEARLY_DISCOUNT = 0.2; // 20% off when billed yearly

export const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "For small shops and clinics getting complaints under control.",
    monthly: 4999,
    complaints: "300 complaints / month",
    seats: "3 team members",
    features: [
      "Embeddable Help / Complaint button",
      "Unique tracking ID for every complaint",
      "Evidence upload (images and files)",
      "AI category classification",
      "Email notifications",
      "Basic analytics dashboard",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    tagline: "For growing businesses that want AI to do the sorting.",
    monthly: 12999,
    complaints: "1,500 complaints / month",
    seats: "10 team members",
    featured: true,
    features: [
      "Everything in Starter",
      "Smart priority detection (Low to Critical)",
      "Sentiment analysis",
      "Duplicate complaint detection",
      "AI response suggestions",
      "SMS and in-app notifications",
      "Customer satisfaction feedback",
    ],
  },
  {
    id: "business",
    name: "Business",
    tagline: "For multi-branch teams that need accountability and insight.",
    monthly: 29999,
    complaints: "5,000 complaints / month",
    seats: "30 team members",
    features: [
      "Everything in Growth",
      "Escalation management with SLA rules",
      "Recurring issue detection",
      "Reputation and risk scoring",
      "Agent performance reports",
      "AI voice complaint assistant",
      "Exportable reports",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "For large organizations with custom needs.",
    monthly: null,
    complaints: "Unlimited complaints",
    seats: "Unlimited team members",
    features: [
      "Everything in Business",
      "Custom AI model configuration",
      "Dedicated onboarding and support",
      "Custom integrations and API access",
      "Priority infrastructure",
    ],
  },
];

export type ComparisonRow = {
  label: string;
  values: (string | boolean)[]; // order: starter, growth, business, enterprise
};

export const comparison: ComparisonRow[] = [
  { label: "Complaints per month", values: ["300", "1,500", "5,000", "Unlimited"] },
  { label: "Team members", values: ["3", "10", "30", "Unlimited"] },
  { label: "Website complaint button", values: [true, true, true, true] },
  { label: "Tracking ID and status page", values: [true, true, true, true] },
  { label: "AI category classification", values: [true, true, true, true] },
  { label: "Priority detection", values: [false, true, true, true] },
  { label: "Sentiment analysis", values: [false, true, true, true] },
  { label: "Duplicate detection", values: [false, true, true, true] },
  { label: "AI response suggestions", values: [false, true, true, true] },
  { label: "Email notifications", values: [true, true, true, true] },
  { label: "SMS notifications", values: [false, true, true, true] },
  { label: "Escalation and SLA rules", values: [false, false, true, true] },
  { label: "Recurring issue detection", values: [false, false, true, true] },
  { label: "Reputation and risk score", values: [false, false, true, true] },
  { label: "AI voice assistant", values: [false, false, true, true] },
  { label: "Custom AI configuration", values: [false, false, false, true] },
];

export const faqs = [
  {
    q: "Do I need a credit card to start the trial?",
    a: "No. The 14-day trial is free and needs no card. You only add payment details if you decide to continue.",
  },
  {
    q: "What happens when the 14 days end?",
    a: "Your account moves to read-only so nothing is lost. Pick a plan any time to switch it back on. Your complaints and settings are kept for 30 days.",
  },
  {
    q: "Can I change plans later?",
    a: "Yes. You can upgrade or downgrade whenever you like. Upgrades apply immediately and downgrades apply from the next billing cycle.",
  },
  {
    q: "What if I go over my monthly complaint limit?",
    a: "We will notify you before you reach the limit. Complaints are never dropped; you can upgrade or add a top-up pack.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "Bank transfer, JazzCash, Easypaisa and cards. Yearly plans save 20%.",
  },
];

export function formatPKR(n: number) {
  return "PKR " + n.toLocaleString("en-PK");
}
