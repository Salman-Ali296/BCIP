import type { Metadata } from "next";
import Link from "next/link";
import { BCIP_CONTACT_EMAIL } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how Business Complaint Intelligence Platform collects, uses, stores, and protects personal information.",
};

const lastUpdated = "October 13, 2026";

const sections = [
  {
    title: "1. Introduction",
    content: (
      <>
        <p>
          This Privacy Policy describes the policies and procedures of
          Business Complaint Intelligence Platform (&quot;BCIP,&quot;
          &quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or
          &quot;our&quot;) regarding the collection, use, storage, and
          disclosure of your information when you use our website and services
          (the &quot;Service&quot;).
        </p>
        <p>
          We use personal information to provide, maintain, and improve the
          Service. Where required by applicable law, we process personal
          information only when an appropriate legal basis exists, including
          consent where consent is required.
        </p>
        <p>
          This policy should reflect BCIP&apos;s actual data practices and
          applicable legal obligations. Please review it before publishing.
        </p>
      </>
    ),
  },
  {
    title: "2. Interpretation and Definitions",
    content: (
      <>
        <h3 className="text-lg font-semibold text-slate-900">
          Interpretation
        </h3>
        <p>
          Words with capitalized initial letters have the meanings defined
          below. These definitions apply whether the words appear in singular
          or plural form.
        </p>

        <h3 className="text-lg font-semibold text-slate-900">Definitions</h3>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Account:</strong> A unique account created to access the
            Service or its features.
          </li>
          <li>
            <strong>Affiliate:</strong> An entity that controls, is controlled
            by, or is under common control with another entity.
          </li>
          <li>
            <strong>Company:</strong> Business Complaint Intelligence Platform,
            also referred to as &quot;BCIP,&quot; &quot;we,&quot;
            &quot;us,&quot; or &quot;our.&quot;
          </li>
          <li>
            <strong>Cookies:</strong> Small files stored on a device by a
            website to support functionality and other purposes.
          </li>
          <li>
            <strong>Country:</strong> Pakistan.
          </li>
          <li>
            <strong>Device:</strong> A device capable of accessing the Service,
            such as a computer, smartphone, or tablet.
          </li>
          <li>
            <strong>Personal Data:</strong> Information relating to an
            identified or identifiable individual.
          </li>
          <li>
            <strong>Service:</strong> The BCIP website, application, and
            associated features made available to users.
          </li>
          <li>
            <strong>Service Provider:</strong> A third party that processes
            information on our behalf to support or improve the Service.
          </li>
          <li>
            <strong>Usage Data:</strong> Information collected automatically
            through use of the Service or its infrastructure.
          </li>
          <li>
            <strong>User:</strong> An individual who accesses or uses the
            Service.
          </li>
          <li>
            <strong>Website:</strong> The official BCIP website, hosted at the
            domain configured for the deployed application.
          </li>
          <li>
            <strong>You:</strong> The individual accessing the Service or the
            organization on whose behalf that individual is acting.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "3. Information We Collect",
    content: (
      <>
        <h3 className="text-lg font-semibold text-slate-900">
          Personal Information
        </h3>
        <p>
          Depending on the features you use, we may collect information that
          identifies you or can reasonably be associated with you, including:
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Email address.</li>
          <li>First and last name.</li>
          <li>Phone number, if provided.</li>
          <li>Organization and account information.</li>
          <li>Information included in complaints, feedback, and support requests.</li>
          <li>
            Attachments, evidence, and other information you voluntarily submit.
          </li>
        </ul>

        <h3 className="text-lg font-semibold text-slate-900">Usage Data</h3>
        <p>
          Depending on the Service&apos;s configuration, we may collect
          technical and diagnostic information, such as your IP address,
          browser type, operating system, pages visited, access timestamps,
          session duration, and error information.
        </p>

        <h3 className="text-lg font-semibold text-slate-900">
          Information You Submit
        </h3>
        <p>
          Complaint submissions may contain information about a transaction,
          product, service, interaction, or other matter you report. Please
          avoid submitting sensitive personal information unless it is
          necessary for handling your complaint and the Service supports its
          appropriate processing.
        </p>
      </>
    ),
  },
  {
    title: "4. Cookies and Tracking Technologies",
    content: (
      <>
        <p>
          Our website may use cookies or similar technologies to maintain
          sessions, support account security, remember preferences, and
          understand how the Service is used. The specific technologies used
          depend on the application&apos;s implementation.
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Essential cookies:</strong> Support functions necessary for
            the website or requested features to operate.
          </li>
          <li>
            <strong>Preference cookies:</strong> Remember settings such as
            language or display preferences, if implemented.
          </li>
          <li>
            <strong>Analytics technologies:</strong> Help evaluate website
            usage where such tools are enabled.
          </li>
        </ul>
        <p>
          You can manage cookies through your browser settings. Where
          applicable law requires consent for non-essential cookies, they
          should be used only in accordance with the applicable consent
          requirements.
        </p>
        <p>
          We do not claim to use specific analytics, session-replay, or
          advertising technologies unless they have actually been configured
          for BCIP.
        </p>
      </>
    ),
  },
  {
    title: "5. How We Use Personal Data",
    content: (
      <>
        <p>Subject to applicable law and our actual practices, information may be used to:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Provide, operate, and maintain the Service.</li>
          <li>Create and manage user accounts.</li>
          <li>Receive, organize, classify, and track complaints.</li>
          <li>Communicate complaint updates and respond to support requests.</li>
          <li>Provide AI-assisted complaint analysis and insights.</li>
          <li>Protect accounts, investigate suspicious activity, and prevent misuse.</li>
          <li>Diagnose technical issues and improve performance.</li>
          <li>Meet applicable legal obligations and resolve disputes.</li>
          <li>
            Communicate product updates or marketing information where
            permitted by law and, when required, with your consent.
          </li>
        </ul>
        <p>
          We do not treat this list as permission to use personal information
          for unrelated purposes without an appropriate legal basis.
        </p>
      </>
    ),
  },
  {
    title: "6. AI-Assisted Processing",
    content: (
      <>
        <p>
          BCIP is designed to support complaint intelligence and management.
          Depending on the features enabled, submitted complaint information
          may be processed using automated or AI-assisted techniques.
        </p>
        <p>These features may support tasks such as:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Complaint categorization and classification.</li>
          <li>Sentiment and urgency analysis.</li>
          <li>Identification of potentially duplicate complaints.</li>
          <li>Summarization and analysis of complaint trends.</li>
          <li>Suggested responses, priorities, or corrective actions.</li>
        </ul>
        <p>
          AI-generated results may be incomplete, inaccurate, or unsuitable
          for a particular situation. Authorized users should review important
          outputs before relying on them for operational decisions.
        </p>
        <p>
          Complaint information may be sent to an external AI provider when
          required by an enabled feature. Before deployment, BCIP&apos;s actual
          AI providers, data flows, retention arrangements, and applicable
          provider terms must be documented accurately.
        </p>
        <p>
          We should not claim that submitted information is never used to train
          AI models, or that AI processing is entirely local, unless those
          statements have been verified for the deployed system and its
          providers.
        </p>
      </>
    ),
  },
  {
    title: "7. Sharing and Disclosure of Information",
    content: (
      <>
        <p>
          We may disclose personal information in circumstances consistent
          with this policy and applicable law, including:
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Service providers:</strong> Vendors that help operate,
            host, secure, or support the Service.
          </li>
          <li>
            <strong>AI and infrastructure providers:</strong> Providers
            involved in processing information for enabled features.
          </li>
          <li>
            <strong>Authorized organization users:</strong> Relevant complaint
            information may be made available to authorized personnel within
            the organization responsible for handling a complaint.
          </li>
          <li>
            <strong>Legal requirements:</strong> Authorities or other parties
            where disclosure is required by law or valid legal process.
          </li>
          <li>
            <strong>Business transactions:</strong> Parties involved in a
            merger, acquisition, restructuring, or transfer of business assets,
            subject to applicable legal requirements.
          </li>
          <li>
            <strong>With your consent:</strong> Other disclosures where you
            have provided the consent required by law.
          </li>
        </ul>
        <p>
          We should identify actual third-party providers and their roles
          before publishing this policy. We do not represent that BCIP uses
          Mouseflow, Freshdesk, Google Places, or any other particular vendor
          unless that integration is actually present.
        </p>
      </>
    ),
  },
  {
    title: "8. Text Messages and Electronic Communications",
    content: (
      <>
        <p>
          If BCIP supports email, SMS, or other notifications, contact
          information may be used to deliver account alerts, complaint status
          updates, security notifications, and support communications.
        </p>
        <p>
          Marketing communications, if offered, will be sent in accordance
          with applicable law and any required consent. You can opt out of
          marketing communications using the unsubscribe method provided or
          by contacting us.
        </p>
        <p>
          SMS-specific terms, including opt-in procedures, message frequency,
          carrier charges, and STOP or HELP instructions, should be published
          only when an SMS messaging service has been implemented and the
          relevant requirements have been verified.
        </p>
      </>
    ),
  },
  {
    title: "9. Data Retention",
    content: (
      <>
        <p>
          We retain personal information for as long as reasonably necessary
          for the purposes described in this policy, subject to applicable
          legal, contractual, security, and operational requirements.
        </p>
        <p>
          Retention periods may differ for account information, complaint
          records, attachments, support correspondence, security logs, and
          diagnostic data. The appropriate period depends on the purpose of
          processing and the requirements applicable to the relevant data.
        </p>
        <p>
          We may retain certain information for longer where necessary to
          comply with legal obligations, resolve disputes, investigate
          security incidents, or establish or defend legal claims.
        </p>
        <p>
          Where appropriate and technically feasible, information may be
          deleted or anonymized when it is no longer required. Residual copies
          may remain in backups until they are removed according to the
          applicable backup-retention process.
        </p>
        <p>
          Specific retention periods should be published only after they have
          been established and verified against BCIP&apos;s actual data
          retention and backup procedures.
        </p>
      </>
    ),
  },
  {
    title: "10. International Data Transfers",
    content: (
      <>
        <p>
          Depending on the hosting infrastructure and service providers used,
          your information may be processed in Pakistan or other countries
          where we or our providers operate.
        </p>
        <p>
          Data protection laws may differ between jurisdictions. Where
          required by applicable law, appropriate safeguards will be used for
          international transfers of personal information.
        </p>
        <p>
          The locations in which BCIP data is processed should be confirmed
          against the deployed hosting environment and the terms of relevant
          service providers.
        </p>
      </>
    ),
  },
  {
    title: "11. Security of Personal Data",
    content: (
      <>
        <p>
          We take reasonable steps appropriate to the Service to protect
          personal information against unauthorized access, alteration,
          disclosure, or destruction.
        </p>
        <p>
          The safeguards applied depend on the system&apos;s implementation
          and may include access controls, authentication, secure
          communications, input validation, and security monitoring where
          configured.
        </p>
        <p>
          No method of transmission over the Internet or electronic storage is
          completely secure. We therefore cannot guarantee absolute security.
        </p>
      </>
    ),
  },
  {
    title: "12. Your Privacy Rights",
    content: (
      <>
        <p>
          Depending on your location and applicable law, you may have rights
          concerning your personal information, including the right to:
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Request access to personal information we hold about you.</li>
          <li>Request correction of inaccurate or incomplete information.</li>
          <li>Request deletion of information, subject to legal exceptions.</li>
          <li>Object to or request restriction of certain processing.</li>
          <li>Withdraw consent where processing relies on your consent.</li>
          <li>Request a copy of information where a right to data portability applies.</li>
          <li>Complain to a competent data protection authority, where applicable.</li>
        </ul>
        <p>
          To make a privacy request, contact us using the email address
          provided below. We may need to verify your identity before
          responding. Some requests may be limited by legal obligations or
          other lawful grounds for retaining information.
        </p>
      </>
    ),
  },
  {
    title: "13. Children's Privacy",
    content: (
      <>
        <p>
          BCIP is intended for business and organizational use and is not
          directed toward children. We do not knowingly collect personal
          information from children in circumstances where such collection
          would violate applicable law.
        </p>
        <p>
          If you believe a child has provided personal information to us,
          contact us so we can assess the circumstances and take appropriate
          action in accordance with applicable law.
        </p>
        <p>
          Any minimum age or parental-consent requirements must be determined
          based on the laws applicable to the relevant user and processing
          activity.
        </p>
      </>
    ),
  },
  {
    title: "14. Third-Party Websites",
    content: (
      <>
        <p>
          The Service may contain links to websites or services operated by
          third parties. We do not control those third parties and are not
          responsible for their content, privacy policies, or practices.
        </p>
        <p>
          We encourage you to review the privacy policy of any third-party
          website you visit.
        </p>
      </>
    ),
  },
  {
    title: "15. Changes to This Privacy Policy",
    content: (
      <>
        <p>
          We may update this Privacy Policy from time to time to reflect
          changes to the Service, our data practices, or applicable legal
          requirements.
        </p>
        <p>
          When changes are published, we will update the date shown at the top
          of this page. Where required by applicable law, we will provide
          additional notice or obtain consent before implementing relevant
          changes.
        </p>
        <p>
          We encourage you to review this policy periodically.
        </p>
      </>
    ),
  },
  {
    title: "16. Contact Us",
    content: (
      <>
        <p>
          If you have questions about this Privacy Policy or wish to make a
          privacy-related request, contact us:
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

export default function PrivacyPolicyPage() {
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
            Privacy Policy
          </h1>

          <p className="mt-4 text-sm text-slate-500">
            Last updated: {lastUpdated}
          </p>

          <p className="mt-5 max-w-3xl leading-7 text-slate-600">
            This policy explains how Business Complaint Intelligence Platform
            collects, uses, processes, and protects personal information when
            you use our website and services.
          </p>
        </header>

        <nav
          aria-label="Privacy policy contents"
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

              <div className="space-y-4 [&_a]:break-words [&_h3]:mb-2 [&_h3]:mt-6 [&_li]:pl-1 [&_p]:text-slate-600 [&_strong]:font-semibold [&_strong]:text-slate-800">
                {section.content}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-12 border-t border-slate-200 pt-6 text-sm leading-6 text-slate-500">
          <p>
            For information about the rules governing use of BCIP, read our{" "}
            <Link
              href="/terms"
              className="font-medium text-cyan-700 underline decoration-cyan-300 underline-offset-4 hover:text-cyan-900"
            >
              Terms of Service
            </Link>
            .
          </p>
        </footer>
      </article>
    </main>
  );
}