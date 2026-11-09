---
applyTo: "bcip-frontend/**"
---
# bcip-frontend

## Context
Customer-facing portal of BCIP, a multi-tenant SaaS for SMBs. Customers submit complaints (text or voice), get a tracking ID, track status, read the business response, and leave feedback. Categorization, urgency, sentiment and duplicate detection belong to the backend and AI services. The frontend displays their results and never reimplements them.

## Scope and stack
- Work only inside bcip-frontend. Do not edit bcip-backend, bcip-ai-services, bcip-models or bcip-docs.
- Next.js App Router, TypeScript strict. Check package.json for versions and use the styling and form libraries already installed. Add no dependency without asking.

## Structure
- src/features/<name>/{components,hooks,types}; shared UI in src/components/ui.
- All data access goes through typed functions in src/lib/api/*. No fetch in components or hooks.
- Complaint types (category, urgency, status) come from the API contract. Do not invent enum values.
- Match existing patterns before creating new ones.

## Components
- Server Components by default. "use client" only for interactivity (forms, voice recorder, polling).
- Every async view has loading, empty and error states. Show readable messages, never raw API errors or stack traces.
- Mobile-first; must work on desktop and mobile browsers.
- Tenant name, logo and theme come from config, never hardcoded.

## Complaint flows
- Forms: validate on the client with the existing libs, and map server validation errors to fields. Disable submit while pending to prevent duplicate complaints.
- Evidence upload: restrict file type and size, show per-file errors, allow removal before submit.
- Voice: request mic permission only on user action. If denied or unsupported, fall back to text input. Always show the transcript for the user to edit and confirm before submitting. Stop all media tracks on unmount.
- Tracking: the tracking ID is the only lookup key. Validate input, and show the same "not found" message for invalid and unknown IDs. Poll status at a fixed interval and stop on a final status or unmount.

## Accessibility
Semantic HTML, labelled inputs, aria-live for status and transcript updates, keyboard operable, visible focus.

## Code quality
- No `any`, no dead code, no lorem ipsum. Comments only for non-obvious logic.
- Never log complaint text or tracking IDs. No secrets in client code; NEXT_PUBLIC_ variables hold non-secret values only.