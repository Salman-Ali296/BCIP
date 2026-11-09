import type { Metadata } from "next";
import Link from "next/link";
import { BCIP_CONTACT_EMAIL } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Review the terms and conditions governing access to and use of Business Complaint Intelligence Platform.",
};

const lastUpdated = "October 13, 2026";

const sections = [
  {
    title: "1. Introduction and Acceptance",
    content: (
      <>
        <p>
          Welcome to Business Complaint Intelligence Platform
          (&quot;BCIP,&quot; &quot;Company,&quot; &quot;we,&quot;
          &quot;us,&quot; or &quot;our&quot;). These Terms of Service
          (&quot;Terms&quot;) govern your access to and use of the BCIP website,
          application, and associated services (collectively, the
          &quot;Service&quot;).
        </p>
        <p>
          By accessing or using the Service, you agree to these Terms. If you
          do not agree, you must not use the Service.
        </p>
        <p>
          If you use BCIP on behalf of a company or other organization, you
          represent that you are authorized to act on its behalf. In that
          situation, &quot;you&quot; may refer to both you and the organization,
          as appropriate.
        </p>
      </>
    ),
  },
  {
    title: "2. Eligibility and Accounts",
    content: (
      <>
        <p>
          You must be legally permitted to use the Service under the laws
          applicable to you. If you access BCIP on behalf of an organization,
          you must have the authority required to accept these Terms.
        </p>
        <p>
          Certain features may require an account. When creating or maintaining
          an account, you agree to provide accurate information and keep it
          reasonably up to date.
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Provide truthful registration and account information.</li>
          <li>Do not impersonate another person or misrepresent your affiliation.</li>
          <li>Do not create accounts for unauthorized or fraudulent purposes.</li>
          <li>Use only the account and permissions assigned to you.</li>
        </ul>
        <p>
          We may restrict or suspend accounts where reasonably necessary to
          protect the Service, its users, or the rights of others, subject to
          applicable law and any applicable contractual obligations.
        </p>
      </>
    ),
  },
  {
    title: "3. Account Security and Responsibilities",
    content: (
      <>
        <p>
          You are responsible for taking reasonable steps to protect your
          account credentials and for activities carried out through your
          account, subject to applicable law.
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Keep passwords and authentication credentials confidential.</li>
          <li>Do not share accounts where individual accounts are required.</li>
          <li>Notify us promptly if you suspect unauthorized account access.</li>
          <li>
            Do not attempt to bypass authentication, permissions, or other
            access controls.
          </li>
        </ul>
        <p>
          Organizations using BCIP are responsible for assigning appropriate
          permissions to their authorized users and ensuring that those users
          comply with these Terms.
        </p>
      </>
    ),
  },
  {
    title: "4. Acceptable Use",
    content: (
      <>
        <p>
          You agree to use the Service lawfully and in a manner that does not
          compromise its security, availability, or integrity.
        </p>
        <p>You must not:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Use the Service to violate applicable laws or regulations.</li>
          <li>
            Submit fraudulent, knowingly false, unlawful, or deliberately
            misleading complaints.
          </li>
          <li>
            Upload malicious code, harmful files, or content intended to
            compromise systems or users.
          </li>
          <li>
            Attempt unauthorized access to accounts, data, infrastructure, or
            other organizations&apos; workspaces.
          </li>
          <li>
            Interfere with the operation, performance, or security of the
            Service.
          </li>
          <li>
            Scrape, copy, or extract information through unauthorized methods
            or in violation of applicable rights.
          </li>
          <li>
            Reverse engineer or attempt to derive source code from the Service
            except where applicable law permits such activity.
          </li>
          <li>
            Use the Service to infringe intellectual property, privacy, or
            other legal rights.
          </li>
          <li>
            Misuse automated features or attempt to manipulate AI-generated
            analysis.
          </li>
        </ul>
        <p>
          We may investigate suspected misuse and take proportionate action
          where permitted by law.
        </p>
      </>
    ),
  },
  {
    title: "5. Complaints and User-Submitted Content",
    content: (
      <>
        <p>
          BCIP may allow users to submit complaints, descriptions, attachments,
          feedback, and supporting evidence (&quot;User Content&quot;).
        </p>
        <p>When submitting User Content, you agree that:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            You will provide information that is accurate to the best of your
            knowledge.
          </li>
          <li>
            You will not knowingly submit unlawful, deceptive, threatening, or
            defamatory material.
          </li>
          <li>
            You have the rights or permissions necessary to submit any
            documents, images, or other materials you upload.
          </li>
          <li>
            You will avoid including unnecessary sensitive personal
            information belonging to yourself or others.
          </li>
        </ul>
        <p>
          You retain any rights you hold in your User Content. You grant BCIP
          the limited rights reasonably necessary to host, store, display,
          process, and transmit that content to operate the Service, handle
          complaints, provide requested features, and meet applicable legal
          obligations.
        </p>
        <p>
          This permission does not transfer ownership of your content to BCIP.
          Content handling remains subject to our{" "}
          <Link
            href="/privacy"
            className="font-medium text-cyan-700 underline decoration-cyan-300 underline-offset-4 hover:text-cyan-900"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </>
    ),
  },
  {
    title: "6. Organization Workspaces and Permissions",
    content: (
      <>
        <p>
          BCIP may provide organization-specific workspaces for businesses to
          manage complaints, review operational information, and collaborate
          with authorized personnel.
        </p>
        <p>
          Access to complaint records and related information depends on the
          features, permissions, and organization settings implemented in the
          Service.
        </p>
        <p>Organizations are responsible for:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Managing authorized users and their access permissions.</li>
          <li>
            Ensuring they have an appropriate basis to submit and process
            personal information through BCIP.
          </li>
          <li>
            Handling complaints and customer information in accordance with
            applicable laws and their own obligations.
          </li>
          <li>
            Reviewing information before sharing it with individuals who do
            not need access to it.
          </li>
        </ul>
        <p>
          Organizations must not attempt to access another organization&apos;s
          private data without authorization.
        </p>
      </>
    ),
  },
  {
    title: "7. AI-Assisted Features and Outputs",
    content: (
      <>
        <p>
          BCIP may offer AI-assisted features for complaint classification,
          sentiment analysis, urgency assessment, duplicate detection,
          summarization, trend analysis, and recommendations.
        </p>
        <p>
          These features generate outputs based on available information and
          the capabilities of the underlying systems. AI-generated outputs may
          contain errors, omissions, or unsuitable recommendations.
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            AI outputs are intended to assist users and do not replace
            appropriate human judgment.
          </li>
          <li>
            Users should independently verify important findings and
            recommendations before acting on them.
          </li>
          <li>
            BCIP does not guarantee that automated classifications, priorities,
            predictions, or summaries will always be accurate or complete.
          </li>
          <li>
            Organizations remain responsible for their operational decisions
            and how they use the outputs.
          </li>
        </ul>
        <p>
          AI functionality may depend on third-party services. Availability
          and processing arrangements may therefore be affected by the
          relevant provider&apos;s systems and applicable terms.
        </p>
      </>
    ),
  },
  {
    title: "8. Intellectual Property",
    content: (
      <>
        <p>
          Subject to applicable law, the Service and its original software,
          design, branding, documentation, and associated materials are owned
          by or licensed to BCIP and are protected by applicable intellectual
          property laws.
        </p>
        <p>
          Except as expressly permitted by these Terms or applicable law, you
          may not copy, modify, distribute, sell, sublicense, or commercially
          exploit protected parts of the Service without prior authorization.
        </p>
        <p>
          These Terms do not transfer ownership of BCIP intellectual property
          to you. Any rights not expressly granted remain with their respective
          owners.
        </p>
        <p>
          You remain responsible for ensuring that your use of User Content
          and third-party materials does not violate another person&apos;s
          rights.
        </p>
      </>
    ),
  },
  {
    title: "9. Fees, Payments, and Subscriptions",
    content: (
      <>
        <p>
          If paid plans, subscriptions, or other paid features are introduced,
          the applicable prices, billing periods, payment conditions, and
          cancellation rules will be presented before the relevant purchase
          where required by law.
        </p>
        <p>
          Unless expressly stated in an applicable order or service agreement,
          these Terms do not establish a particular price, subscription
          structure, billing model, or refund entitlement.
        </p>
        <p>
          Any applicable payment, renewal, cancellation, tax, and refund
          conditions will be governed by the terms presented at purchase and
          any separate agreement between BCIP and the relevant organization.
        </p>
      </>
    ),
  },
  {
    title: "10. Service Availability and Changes",
    content: (
      <>
        <p>
          We aim to provide a useful and reliable Service, but we do not
          guarantee that the Service will always be uninterrupted, available,
          error-free, or compatible with every device or environment.
        </p>
        <p>
          We may modify, update, suspend, or discontinue parts of the Service
          for maintenance, security, technical, operational, or legal reasons,
          subject to applicable law and contractual commitments.
        </p>
        <p>
          We will provide notice of material changes or interruptions where
          required by law or applicable agreements.
        </p>
      </>
    ),
  },
  {
    title: "11. Third-Party Services and Links",
    content: (
      <>
        <p>
          The Service may integrate with or link to third-party services,
          infrastructure, or websites. Those services may be governed by their
          own terms and privacy policies.
        </p>
        <p>
          We do not control third-party services and are not responsible for
          their independent content, availability, or practices, except where
          responsibility cannot lawfully be excluded.
        </p>
        <p>
          Your use of third-party services may also be subject to the terms
          you agree to with those providers.
        </p>
      </>
    ),
  },
  {
    title: "12. Privacy and Data Protection",
    content: (
      <>
        <p>
          Our collection and processing of personal information are described
          in the{" "}
          <Link
            href="/privacy"
            className="font-medium text-cyan-700 underline decoration-cyan-300 underline-offset-4 hover:text-cyan-900"
          >
            Privacy Policy
          </Link>
          .
        </p>
        <p>
          By using the Service, you acknowledge that you have had the
          opportunity to review that policy. Where applicable law requires
          consent for a particular processing activity, this acknowledgment
          does not replace the separate consent that may be required.
        </p>
        <p>
          Organizations using BCIP must ensure that their collection and
          submission of personal information through the Service comply with
          their applicable legal obligations.
        </p>
      </>
    ),
  },
  {
    title: "13. Disclaimers",
    content: (
      <>
        <p>
          To the extent permitted by applicable law, the Service is provided
          on an &quot;as available&quot; basis. We do not warrant that the
          Service will meet every user&apos;s requirements or that every
          result produced by the Service will be accurate, complete, or
          suitable for a specific purpose.
        </p>
        <p>
          The Service provides complaint management and intelligence support.
          It does not, by itself, guarantee that a complaint will be resolved,
          that a business will take a particular action, or that a
          recommendation will produce a particular outcome.
        </p>
        <p>
          Nothing in these Terms excludes a warranty, right, or remedy that
          cannot legally be excluded or limited under applicable law.
        </p>
      </>
    ),
  },
  {
    title: "14. Limitation of Liability",
    content: (
      <>
        <p>
          To the maximum extent permitted by applicable law, BCIP will not be
          liable for indirect, incidental, special, consequential, or punitive
          losses arising from use of, or inability to use, the Service,
          including loss of profits, business opportunities, or data, where
          such exclusion is legally permitted.
        </p>
        <p>
          Nothing in these Terms excludes or limits liability where doing so
          would be unlawful. Any applicable liability limits must be
          interpreted in accordance with the law governing the relevant
          relationship and any applicable written agreement.
        </p>
        <p>
          The final liability provisions should be reviewed by qualified legal
          counsel before the Service is offered commercially.
        </p>
      </>
    ),
  },
  {
    title: "15. Suspension and Termination",
    content: (
      <>
        <p>
          You may stop using the Service at any time. If account closure is
          supported, you may use the available account controls or contact us
          for assistance.
        </p>
        <p>
          We may suspend or terminate access where reasonably necessary to
          address a security risk, suspected unlawful activity, material
          violation of these Terms, or a requirement imposed by law.
        </p>
        <p>
          Where appropriate and legally permitted, we will seek to provide
          notice of material restrictions and an opportunity to address the
          relevant issue.
        </p>
        <p>
          Following termination, certain information may remain in backups or
          be retained where required for legal compliance, security, dispute
          resolution, or other lawful purposes, as described in the Privacy
          Policy.
        </p>
      </>
    ),
  },
  {
    title: "16. Changes to These Terms",
    content: (
      <>
        <p>
          We may revise these Terms to reflect changes to the Service,
          operational practices, or applicable legal requirements.
        </p>
        <p>
          When updated Terms are published, we will revise the
          &quot;Last updated&quot; date. Where required by law, we will provide
          additional notice or obtain renewed agreement before relevant
          changes take effect.
        </p>
        <p>
          Your continued use of the Service after revised Terms become
          effective may constitute acceptance only where permitted by
          applicable law. Where affirmative acceptance is required, continued
          use alone will not replace it.
        </p>
      </>
    ),
  },
  {
    title: "17. Governing Law and Disputes",
    content: (
      <>
        <p>
          These Terms are subject to the applicable laws governing the
          relationship between BCIP and the relevant user or organization.
        </p>
        <p>
          The appropriate governing law, courts, and dispute-resolution
          procedures must be confirmed before publication, taking into account
          the legal entity operating BCIP, its contractual arrangements, and
          applicable mandatory laws.
        </p>
        <p>
          Nothing in these Terms removes rights or protections that cannot
          legally be waived.
        </p>
      </>
    ),
  },
  {
    title: "18. General Provisions",
    content: (
      <>
        <p>
          If any provision of these Terms is held to be unenforceable, the
          remaining provisions will continue to apply to the extent permitted
          by law.
        </p>
        <p>
          A failure to enforce a provision does not automatically waive the
          right to enforce it later.
        </p>
        <p>
          These Terms, together with any applicable order form or written
          agreement and the Privacy Policy, describe the relevant terms
          governing use of the Service. If a separate written agreement
          conflicts with these Terms, the conflict will be resolved according
          to the terms of that agreement and applicable law.
        </p>
      </>
    ),
  },
  {
    title: "19. Contact Us",
    content: (
      <>
        <p>
          If you have questions about these Terms of Service, contact us:
        </p>
        <p>
          <strong>Email:</strong>{" "}
          <a
            href={`mailto:${BCIP_CONTACT_EMAIL}`}
            className="font-medium text-cyan-700 underline decoration-cyan-300 underline-offset-4 transition hover:text-cyan-900"
          >
            {BCIP_CONTACT_EMAIL}
          </a>
        </p>
      </>
    ),
  },
];

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-700 sm:px-6 lg:px-8">
      <article className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-sm sm:px-10 sm:py-12 lg:px-14">
        <header className="mb-10 border-b border-slate-200 pb-8">
          <Link
            href="/"
            className="mb-6 inline-flex text-sm font-semibold text-cyan-700 transition hover:text-cyan-900"
          >
            ← Back to BCIP
          </Link>

          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
            Legal Information
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Terms of Service
          </h1>

          <p className="mt-4 text-sm text-slate-500">
            Last updated: {lastUpdated}
          </p>

          <p className="mt-5 max-w-3xl leading-7 text-slate-600">
            These Terms explain the rules and responsibilities that apply when
            you access or use Business Complaint Intelligence Platform.
          </p>
        </header>

        <nav
          aria-label="Terms of service contents"
          className="mb-10 rounded-xl border border-slate-200 bg-slate-50 p-5"
        >
          <h2 className="mb-4 text-base font-semibold text-slate-900">
            On this page
          </h2>

          <ol className="grid gap-2 sm:grid-cols-2">
            {sections.map((section, index) => (
              <li key={section.title}>
                <a
                  href={`#section-${index + 1}`}
                  className="text-sm text-cyan-800 underline decoration-cyan-200 underline-offset-4 transition hover:text-cyan-950"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="space-y-10">
          {sections.map((section, index) => (
            <section
              key={section.title}
              id={`section-${index + 1}`}
              aria-labelledby={`heading-${index + 1}`}
              className="scroll-mt-8 space-y-4 leading-7"
            >
              <h2
                id={`heading-${index + 1}`}
                className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl"
              >
                {section.title}
              </h2>

              <div className="space-y-4 [&_a]:break-words [&_li]:pl-1 [&_p]:text-slate-600 [&_strong]:font-semibold [&_strong]:text-slate-800">
                {section.content}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-12 border-t border-slate-200 pt-6 text-sm leading-6 text-slate-500">
          <p>
            To understand how BCIP handles personal information, read our{" "}
            <Link
              href="/privacy"
              className="font-medium text-cyan-700 underline decoration-cyan-300 underline-offset-4 hover:text-cyan-900"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </footer>
      </article>
    </main>
  );
}
