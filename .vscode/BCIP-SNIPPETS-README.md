# BCIP backend VS Code snippets

These snippets are workspace snippets scoped to TypeScript. The snippet file is
at the BCIP workspace root in `.vscode/bcip-backend.code-snippets`, so it is
loaded when this repository root is open in VS Code.

## Use

1. Open the BCIP repository root as the VS Code workspace.
2. Open a TypeScript file, type a prefix, then press `Tab` (or choose the
   matching IntelliSense item).
3. Use `Tab` to move through placeholders and `Shift+Tab` to go backwards.
4. If the snippets do not appear after a workspace configuration change, run
   **Developer: Reload Window** once.

Workspace settings enable Tab completion and snippet suggestions. VS Code
snippets do not expand solely from typing the last character: the editor still
needs the Tab/Enter acceptance action. The existing settings also show
suggestions while typing in TypeScript comments and strings.

## Prefix catalog

| Prefix | Generates |
|---|---|
| `bc-controller-async` (`bccontroller`) | Async Express controller with tenant check, service call, JSON success response, and `next(error)` |
| `bc-controller-public` (`bcpubliccontroller`) | Public controller without assumed authentication or tenant context |
| `bc-auth-controller` (`bcauthcontroller`) | `AuthController` method using a Zod DTO, `authService`, `ApiResponse`, and BCIP validation-error mapping |
| `bc-service` (`bcservice`) | Service class with the common `config/database` Prisma client, structured logging, and centralized database errors |
| `bc-route-protected` (`bcroute`) | Protected complaint route with auth → tenant → roles → plan feature middleware |
| `bc-route-public` (`bcpublicroute`) | Public tracking-style route with a rate limiter and controller forwarding |
| `bc-auth-route` (`bcauthroute`) | Auth route using the existing controller `.bind()` pattern |
| `bc-auth-roles` (`bcrole`) | Existing authentication, optional tenant, and `requireRoles` middleware order |
| `bc-tenant-middleware` (`bctenant`) | Tenant context from the authenticated user and mismatched-header rejection |
| `bc-auth-require-roles` (`bcauth`) | `requireRoles()` middleware call |
| `bc-validation-zod` (`bcvalidate`) | Zod request parsing and `Errors.validation` field details |
| `bc-validation-complaint` (`bccomplaintvalidate`) | Complaint status, priority, and assignee validation from Prisma enums |
| `bc-prisma-paginated` (`bcpagination`, `bcprismafind`) | Complaint query and count with tenant filter and 1–100 page limit |
| `bc-prisma-find-tenant` (`bcprismaone`) | Complaint lookup constrained by ID and tenant ID |
| `bc-complaint-create` (`bccomplaintcreate`) | Complaint creation using actual required fields and lifecycle enums |
| `bc-prisma-create` (`bcprismacreate`) | Tenant-owned complaint create operation |
| `bc-prisma-update-tenant` (`bcprismaupdate`) | Atomic `updateMany` constrained by complaint ID and tenant |
| `bc-prisma-delete-tenant` (`bcprismadelete`) | Atomic tenant-scoped complaint deletion; deletion is not currently exposed by a complaint route |
| `bc-prisma-transaction` (`bctransaction`) | Callback transaction with tenant-scoped complaint existence check |
| `bc-workflow-status` (`bcstatus`) | Existing tenant-checked status service call, which records `StatusHistory` |
| `bc-workflow-escalate` (`bcescalate`) | Call the existing tenant-scoped complaint escalation service |
| `bc-complaint-track` (`bctracking`) | Public lookup by the unique tracking ID |
| `bc-complaint-feedback` (`bcfeedback`) | CSAT feedback upsert through the complaint's unique relation |
| `bc-complaint-service-create` (`bccomplaintservice`) | Existing `ComplaintService.createComplaint` input contract |
| `bc-ai-predict` (`bcai`) | AI prediction followed by tenant-scoped persistence of actual result fields |
| `bc-ai-client` (`bcaiservice`) | Existing FastAPI `/api/v1/analyze` payload and response-shape validation |
| `bc-business-onboarding` (`bconboarding`) | Authenticated onboarding step controller call |
| `bc-employee-invite` (`bcinvite`) | Existing invitation service call; service owns role, tenant, plan, audit, and email checks |
| `bc-trial-access` (`bctrial`) | Existing subscription/trial entitlement lookup |
| `bc-billing-demo-checkout` (`bcdemocheckout`) | Existing development-only demo checkout service call |
| `bc-billing-usage` (`bcusage`) | Existing quota reservation inside a caller-owned Prisma transaction |
| `bc-complaint-upload` (`bcupload`) | Existing Multer memory storage and file-size/type limits |
| `bc-email-send` (`bcemail`) | Existing verification-code email call |
| `bc-audit-log` (`bcaudit`) | `AuditLog` creation through a Prisma transaction client |
| `bc-error` (`bcerror`) | Centralized `Errors.*` factory usage |
| `bc-response-success` (`bcresponse`) | Standard `{ success, data, message }` response |
| `bc-response-api` (`bcapiresponse`) | Existing `ApiResponse.success` helper |
| `bc-log` (`bclog`) | Structured Pino info log without complaint text or secrets |
| `bc-auth-session-cookie` (`bcsessioncookie`) | Existing HttpOnly auth-session cookie helper |
| `bc-analytics-dashboard` (`bcdashboard`) | Delegate to the implemented business dashboard controller |
| `bc-ai-suggest-response` | Existing AI response-suggestion call with supported tones |
| `bc-api-health` (`bchealth`) | Existing public `/health` endpoint body |
| `bc-api-mount` (`bcapiroutes`) | Existing versioned API router mounts |
| `bc-config-env-validation` (`bcenv`) | Existing manual environment validation style |
| `bc-test-unit` (`bctest`) | Built-in `node:test` unit-test structure |
| `bc-test-http` (`bcapitest`) | HTTP integration-test structure using `createApp`, Node server, and `fetch` |

Legacy aliases are retained only for snippets with a corresponding verified
pattern. Unsupported aliases from the previous snippet set (such as
refresh-token, soft-delete, fine-grained permission middleware, and
complaint-response-model snippets) were removed because the backend does not
implement those contracts.

## References and import guidance

The snippet patterns were checked against:

- `bcip-backend/package.json` and `bcip-backend/tsconfig.json`
- `bcip-backend/prisma/schema.prisma` and its migrations
- `bcip-backend/src/app.ts`, `src/routes/index.ts`,
  `src/routes/complaints.ts`, and module route files
- `src/config/database.ts`, `src/config/env.ts`, and the Prisma client usages
- `src/controllers/complaintController.ts`,
  `src/modules/accounts/auth.controller.ts`,
  `src/modules/billing/billing.controller.ts`, and the dashboard controller
- `src/middleware/auth.middleware.ts`,
  `tenant.middleware.ts`, `business-plan.middleware.ts`, and `errorHandler.ts`
- `src/utils/error.ts`, `api-response.ts`, `validators.ts`, and `logger.ts`
- `src/services/complaintService.ts`, `aiService.ts`, and `emailService.ts`
- `src/modules/accounts/business-onboarding.service.ts`,
  `business-invitation.service.ts`, and `business-trial.service.ts`
- `src/modules/billing/billing.service.ts`, `usage.service.ts`,
  `business-access.service.ts`, and `business-plans.ts`
- Existing `node:test` test files under `bcip-backend/test/`

Many snippets generate code for insertion into a particular layer. Existing
imports are therefore not repeated in every method-body snippet. Add imports
from the real source module where needed, for example:

```ts
import { prisma } from '../config/database';
import { Errors } from '../utils/error';
import { logger } from '../utils/logger';
```

Adjust relative import depth to the destination file. The backend has multiple
Prisma client modules; `config/database.ts` is the common client used by most
services. The complaints DDD repository currently uses
`config/prisma.client.ts`; do not swap its dependency without checking that
module's architecture.

## Manual adjustments

- Replace all tab stops with actual feature names, IDs, values, validated
  request data, and service methods.
- Route snippets are based on the complaint route's import depth and middleware
  order. Update the controller import and route-specific limiter as necessary.
- Snippets with service/controller symbols such as `complaintService`,
  `businessOnboardingService`, `businessInvitationService`,
  `createDemoCheckout`, `getBusinessPlanAccess`, `aiService`, and
  `getBusinessDashboard` require those actual imports in the destination file.
- `bc-validation-complaint` uses generated Prisma enum types. Keep the validation
  contract aligned with the route and DTO that consume it.
- The AI persistence snippet requires `Sentiment`, `Priority`, and `Errors`
  imports. The service currently returns fallback heuristics with
  `wasProcessed: false` when the Python AI request fails; do not describe that
  result as a successful model analysis.
- The safe delete snippet demonstrates a tenant-scoped Prisma operation only.
  The current complaint API does not expose complaint deletion; review retention
  and audit requirements before adding such behavior.
- `bc-billing-demo-checkout` is development-only. It is not a production payment
  or Stripe checkout implementation.
- `bc-api-mount` includes `/notifications`, but the current notification router
  is empty.

## Function inventory and coverage

See [BCIP-BACKEND-FUNCTION-INVENTORY.md](./BCIP-BACKEND-FUNCTION-INVENTORY.md)
for the source function inventory, route/schema/test coverage, and gaps. It
lists named functions and methods with source locations and signatures. The
mapping below connects representative existing functions to snippet prefixes.

### Representative function-to-snippet mapping

| Existing source function or pattern | Prefix |
|---|---|
| `createComplaint`, `listComplaints`, `getComplaint`, `updateComplaintStatus` in `src/controllers/complaintController.ts` | `bc-controller-async`, `bc-validation-zod`, `bc-prisma-find-tenant`, `bc-workflow-status` |
| `trackComplaint`, `submitCSATFeedback`, `uploadComplaintFiles`, `getAIResponseSuggestion`, `escalateComplaint` | `bc-complaint-track`, `bc-complaint-feedback`, `bc-complaint-upload`, `bc-ai-suggest-response`, `bc-workflow-escalate` |
| `AuthController.register`, `login`, `verifyEmail`, `forgotPassword`, `resetPassword` | `bc-auth-controller`, `bc-auth-route`, `bc-auth-session-cookie` |
| `authMiddleware`, `requireRoles`, `tenantMiddleware`, `requireBusinessFeature` | `bc-auth-roles`, `bc-auth-require-roles`, `bc-tenant-middleware`, `bc-route-protected` |
| `ComplaintService.createComplaint`, `listComplaints`, `updateStatus`, `submitCSATFeedback`, `escalateComplaint` | `bc-complaint-service-create`, `bc-prisma-paginated`, `bc-workflow-status`, `bc-complaint-feedback`, `bc-workflow-escalate` |
| `AIService.predict`, `suggestResponse`, Python `/api/v1/analyze` request mapping | `bc-ai-predict`, `bc-ai-suggest-response`, `bc-ai-client` |
| `BusinessOnboardingService.saveStep`, `BusinessInvitationService.create`, `getBusinessPlanAccess` | `bc-business-onboarding`, `bc-employee-invite`, `bc-trial-access` |
| `createDemoCheckout`, `reserveUsageWithinTransaction` | `bc-billing-demo-checkout`, `bc-billing-usage`, `bc-prisma-transaction` |
| `EmailService.sendVerificationCode`, `logger.info`, `ApiResponse.success`, `Errors.*` | `bc-email-send`, `bc-log`, `bc-response-api`, `bc-error` |
| `createApp` health route, versioned router mounts, `node:test` integration tests | `bc-api-health`, `bc-api-mount`, `bc-test-unit`, `bc-test-http` |

## Implemented versus absent functionality

Verified implemented areas include JWT/Firebase authentication, email
verification and reset flows, role and tenant middleware, public and protected
complaint operations, AI/NLP analysis and suggested responses, business
onboarding/invitations/trials, Stripe and development billing flows, usage
entitlements, administration, analytics, email delivery, file uploads, logging,
and integration/unit tests.

The source does not currently implement a refresh-token/session model,
soft-delete field, fine-grained permission middleware, complaint-response
model, background job/queue processor, or notification endpoints. The
`notification.routes.ts` file is only an empty router; `utils/async-handler.ts`
is empty; and `middleware/error.middleware.ts` documents itself as dead code.
Do not use a snippet to imply these features exist.

## Extending the library

Add a uniquely named snippet entry with `scope: "typescript"`, a unique
`prefix`, a concise `description`, and a `body` array. Before adding it, verify
its models/fields in `schema.prisma`, imports and helper names in source, and
middleware order in the mounted route. Parse the snippet file as JSON and check
for duplicate names/prefixes after editing.
