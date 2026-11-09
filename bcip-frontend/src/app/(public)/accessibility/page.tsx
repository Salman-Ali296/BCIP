import type { Metadata } from "next";

import { LegalPage } from "@/components/marketing/legal-page";
import { BCIP_CONTACT_EMAIL } from "@/lib/brand";

export const metadata: Metadata = {
    title: "Accessibility",
    description: "Learn about BCIP accessibility goals and how to report an issue.",
};

export default function AccessibilityPage() {
    return (
        <LegalPage
            title="Accessibility"
            description="We want customers and business teams to be able to use BCIP with clarity across devices and assistive technologies."
            sections={[
                {
                    title: "Our approach",
                    children: (
                        <p>BCIP is being designed with readable contrast, clear page structure, keyboard access and understandable interaction states in mind. The current product is still evolving, and this page is not a claim of formal conformance or independent certification.</p>
                    ),
                },
                {
                    title: "Ways to navigate",
                    children: (
                        <p>Use the main navigation and page links to move through the site. Interactive elements should be operable with a keyboard and expose their purpose to assistive technology; we continue to review the experience as features change.</p>
                    ),
                },
                {
                    title: "Report an accessibility issue",
                    children: (
                        <p>If you encounter a barrier, email <a className="font-semibold text-blue-700 hover:underline" href={`mailto:${BCIP_CONTACT_EMAIL}?subject=${encodeURIComponent("BCIP accessibility feedback")}`}>{BCIP_CONTACT_EMAIL}</a>. Please include the page, the task you were trying to complete and any assistive technology details you are comfortable sharing. Do not include sensitive complaint information.</p>
                    ),
                },
                {
                    title: "Ongoing improvements",
                    children: (
                        <p>Feedback helps us prioritise fixes and improve the experience. Organisation-specific complaint portals may also have different accessibility characteristics based on their configuration.</p>
                    ),
                },
            ]}
        />
    );
}
