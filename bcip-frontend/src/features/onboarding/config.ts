import type { Answers, OtherText, Screen } from './types';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api';

/** Subdomains a customer must never be able to claim. */
export const RESERVED_SLUGS = new Set([
  'www', 'api', 'app', 'admin', 'dashboard', 'login', 'signup', 'auth', 'support',
  'help', 'mail', 'status', 'docs', 'blog', 'static', 'assets', 'cdn', 'bcip',
]);

/**
 * Every onboarding question lives here. Adding, removing or reordering a
 * question is a config change — no new component, no new step file.
 */
export const SCREENS: Screen[] = [
  {
    id: 'you',
    heading: 'Tell us about you',
    subheading: 'Takes under a minute. We use this to set up your workspace.',
    questions: [
      {
        id: 'role',
        title: 'What is your role?',
        required: true,
        allowOther: true,
        options: [
          { id: 'owner', label: 'Owner / Founder', icon: '👔' },
          { id: 'manager', label: 'Operations or support manager', icon: '🎯' },
          { id: 'agent', label: 'Support agent', icon: '💬' },
          { id: 'other', label: 'Other', icon: '⭐' },
        ],
      },
      {
        id: 'source',
        title: 'Where did you hear about us?',
        allowOther: true,
        options: [
          { id: 'search', label: 'Search engine', hint: 'Google, Bing', icon: '🔍' },
          { id: 'social', label: 'Social media', hint: 'Facebook, Instagram, LinkedIn', icon: '📣' },
          { id: 'referral', label: 'Referral', hint: 'Friend or colleague', icon: '🤝' },
          { id: 'sales', label: 'Our team contacted you', icon: '📞' },
          { id: 'other', label: 'Other', icon: '⭐' },
        ],
      },
    ],
  },
  {
    id: 'business',
    heading: 'Tell us about your business',
    subheading: 'This sets your default categories and reports.',
    questions: [
      {
        id: 'industry',
        title: 'What does your business do?',
        required: true,
        allowOther: true,
        options: [
          { id: 'ecommerce', label: 'E-commerce', hint: 'Online store', icon: '🛍️' },
          { id: 'retail', label: 'Retail', hint: 'Shops and outlets', icon: '🏪' },
          { id: 'food', label: 'Restaurant / food delivery', icon: '🍔' },
          { id: 'services', label: 'Services', hint: 'Salon, clinic, travel, cleaning', icon: '🧰' },
          { id: 'saas', label: 'Software / SaaS', icon: '💻' },
          { id: 'other', label: 'Other', icon: '⭐' },
        ],
      },
      {
        id: 'teamSize',
        title: 'How many people handle complaints?',
        required: true,
        columns: 4,
        options: [
          { id: '1', label: 'Just me' },
          { id: '2-5', label: '2–5' },
          { id: '6-15', label: '6–15' },
          { id: '16+', label: '16+' },
        ],
      },
      {
        id: 'volume',
        title: 'Roughly how many complaints per month?',
        required: true,
        columns: 4,
        options: [
          { id: 'lt50', label: 'Under 50' },
          { id: '50-200', label: '50–200' },
          { id: '200-1000', label: '200–1,000' },
          { id: '1000+', label: '1,000+' },
        ],
      },
    ],
  },
  {
    id: 'channels',
    heading: 'Where do complaints come from?',
    subheading: 'We will suggest which channels to connect first.',
    questions: [
      {
        id: 'channels',
        title: 'Channels your customers use',
        multi: true,
        required: true,
        allowOther: true,
        options: [
          { id: 'whatsapp', label: 'WhatsApp', icon: '🟢' },
          { id: 'phone', label: 'Phone calls', icon: '📞' },
          { id: 'email', label: 'Email', icon: '✉️' },
          { id: 'social', label: 'Facebook / Instagram DMs', icon: '📱' },
          { id: 'website', label: 'Website form', icon: '🌐' },
          { id: 'in_person', label: 'In person', icon: '🏬' },
          { id: 'other', label: 'Other', icon: '⭐' },
        ],
      },
      {
        id: 'languages',
        title: 'Languages customers write in',
        multi: true,
        required: true,
        columns: 3,
        options: [
          { id: 'en', label: 'English' },
          { id: 'roman_ur', label: 'Roman Urdu' },
          { id: 'ur', label: 'Urdu script', hint: 'AI support is limited for now' },
        ],
      },
    ],
  },
  {
    id: 'goals',
    heading: 'What do you want from BCIP?',
    subheading: 'We will put the most useful features first on your dashboard.',
    questions: [
      {
        id: 'setup',
        title: 'How are you handling complaints today?',
        required: true,
        options: [
          { id: 'none', label: 'No system yet', hint: 'Starting fresh' },
          { id: 'sheets', label: 'Excel / Google Sheets' },
          { id: 'inbox', label: 'Shared inbox or WhatsApp only' },
          { id: 'tool', label: 'Another helpdesk tool' },
          { id: 'exploring', label: 'Just exploring' },
        ],
      },
      {
        id: 'currentTool',
        title: 'Which tool are you using?',
        required: true,
        columns: 3,
        allowOther: true,
        showIf: (a) => a.setup?.includes('tool') ?? false,
        options: [
          { id: 'zendesk', label: 'Zendesk' },
          { id: 'freshdesk', label: 'Freshdesk' },
          { id: 'zoho', label: 'Zoho Desk' },
          { id: 'hubspot', label: 'HubSpot' },
          { id: 'intercom', label: 'Intercom' },
          { id: 'other', label: 'Other' },
        ],
      },
      {
        id: 'goals',
        title: 'What matters most?',
        multi: true,
        required: true,
        options: [
          { id: 'centralize', label: 'All complaints in one place' },
          { id: 'prioritize', label: 'Know which complaints are urgent' },
          { id: 'faster', label: 'Reply faster' },
          { id: 'duplicates', label: 'Spot repeat issues' },
          { id: 'insights', label: 'Reports on what customers complain about' },
          { id: 'ai_replies', label: 'AI-drafted replies' },
        ],
      },
    ],
  },
];

export const isVisible = (q: Screen['questions'][number], a: Answers) => !q.showIf || q.showIf(a);

/** Drops answers to hidden questions and "Other" text that no longer applies. */
export function pruneAnswers(answers: Answers, other: OtherText) {
  const cleanAnswers: Answers = {};
  const cleanOther: OtherText = {};
  for (const q of SCREENS.flatMap((s) => s.questions)) {
    const value = answers[q.id];
    if (!value?.length || !isVisible(q, answers)) continue;
    cleanAnswers[q.id] = value;
    if (value.includes('other') && other[q.id]?.trim()) cleanOther[q.id] = other[q.id].trim();
  }
  return { answers: cleanAnswers, otherText: cleanOther };
}
