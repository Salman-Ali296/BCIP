import type { Answers } from '@/features/onboarding/types';
import type { TourStep } from './ProductTour';

/**
 * Dashboard tour, adjusted to the onboarding answers.
 * Each `target` must exist as data-tour="..." on the dashboard.
 */
export function getDashboardTour(answers: Answers = {}): TourStep[] {
  const has = (q: string, v: string) => answers[q]?.includes(v) ?? false;
  const solo = has('teamSize', '1');

  const steps: (TourStep | false)[] = [
    {
      title: 'Welcome to your workspace 👋',
      body: 'A 1-minute tour of the main parts of BCIP. Use the buttons or ← → keys. Press Esc to skip.',
    },
    {
      target: 'nav-complaints',
      placement: 'right',
      title: 'Complaints inbox',
      body: 'Every complaint lands here, whichever channel it came from. Open one to see the full history and reply.',
    },
    {
      target: 'priority',
      title: 'Urgency score',
      body: 'Each complaint gets a score from its tone, urgent words, repeat reports and how long it has been waiting. Start from the top.',
    },
    {
      target: 'ai-tags',
      title: 'Automatic category and mood',
      body: 'BCIP tags each complaint (Billing, Delivery, Product Quality…) and flags angry customers. If a tag looks wrong, change it.',
    },
    {
      target: 'duplicates',
      title: 'Repeat issues',
      body: 'Similar complaints are grouped together, so you can fix the cause once instead of answering the same issue many times.',
    },
    {
      target: 'reply-suggestion',
      title: 'Suggested replies',
      body: 'BCIP drafts a reply for you. Read and edit it before sending — it is a starting point, not an auto-reply.',
    },
    {
      target: 'complaint-link',
      title: 'Your complaint form link',
      body: has('channels', 'whatsapp')
        ? 'Share this link with customers or put it in your WhatsApp Business profile. Submissions arrive in your inbox.'
        : 'Share this link or add it to your website. Customer submissions arrive straight in your inbox.',
    },
    {
      target: 'nav-reports',
      placement: 'right',
      title: 'Reports',
      body: 'See which issues come up most, how fast your team replies, and whether things are improving week to week.',
    },
    !solo && {
      target: 'invite-team',
      title: 'Invite your team',
      body: 'Add your agents so complaints can be assigned to the right person.',
    },
    {
      target: 'help-menu',
      title: 'You are all set',
      body: 'You can replay this tour any time from the help menu.',
    },
  ];

  return steps.filter((s): s is TourStep => Boolean(s));
}
