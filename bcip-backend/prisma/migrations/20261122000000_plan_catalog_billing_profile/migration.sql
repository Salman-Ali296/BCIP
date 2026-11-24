-- Billing contact and invoice address for paid plans.
CREATE TABLE "business_billing_profiles" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "billingEmail" TEXT NOT NULL,
    "phone" TEXT,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "taxId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_billing_profiles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "business_billing_profiles_tenantId_key" ON "business_billing_profiles"("tenantId");

ALTER TABLE "business_billing_profiles"
    ADD CONSTRAINT "business_billing_profiles_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Three-tier public catalog: Starter, Professional (slug "growth") and Enterprise.
-- Yearly prices equal ten monthly payments (two months free).
INSERT INTO "business_plans" (
    "id", "slug", "name", "audience", "description", "currency",
    "monthlyPriceCents", "annualPriceCents", "complaintLimit", "teamMemberLimit",
    "aiAnalysisLimit", "storageLimitMb", "retentionDays", "features",
    "isActive", "isPublic", "displayOrder", "updatedAt"
) VALUES
(
    'plan_starter', 'starter', 'Starter', 'Small businesses',
    'Capture, triage and resolve customer complaints with AI assistance from day one.',
    'USD', 2900, 29000, 500, 5, 500, 5120, 180,
    '{"complaint_management":true,"complaint_portal":true,"resolution_management":true,"csat_feedback":true,"ai_triage":true,"duplicate_detection":false,"ai_response_suggestions":false,"team_management":true,"escalations":false,"knowledge_resources":false,"analytics":false,"reports":false,"audit_logs":false,"custom_branding":false,"api_access":false,"priority_support":false}'::jsonb,
    true, true, 1, CURRENT_TIMESTAMP
),
(
    'plan_professional', 'growth', 'Professional', 'Growing support teams',
    'SLA-driven complaint operations with escalations, AI response drafting and analytics.',
    'USD', 7900, 79000, 3000, 25, 3000, 25600, 730,
    '{"complaint_management":true,"complaint_portal":true,"resolution_management":true,"csat_feedback":true,"ai_triage":true,"duplicate_detection":true,"ai_response_suggestions":true,"team_management":true,"escalations":true,"knowledge_resources":true,"analytics":true,"reports":true,"audit_logs":false,"custom_branding":false,"api_access":false,"priority_support":false}'::jsonb,
    true, true, 2, CURRENT_TIMESTAMP
),
(
    'plan_enterprise', 'enterprise', 'Enterprise', 'Multi-department organizations',
    'Unlimited complaint operations with governance, white-label branding and priority support.',
    'USD', 24900, 249000, NULL, NULL, NULL, 256000, NULL,
    '{"complaint_management":true,"complaint_portal":true,"resolution_management":true,"csat_feedback":true,"ai_triage":true,"duplicate_detection":true,"ai_response_suggestions":true,"team_management":true,"escalations":true,"knowledge_resources":true,"analytics":true,"reports":true,"audit_logs":true,"custom_branding":true,"api_access":true,"priority_support":true}'::jsonb,
    true, true, 3, CURRENT_TIMESTAMP
)
ON CONFLICT ("slug") DO UPDATE SET
    "name" = EXCLUDED."name",
    "audience" = EXCLUDED."audience",
    "description" = EXCLUDED."description",
    "currency" = EXCLUDED."currency",
    "monthlyPriceCents" = EXCLUDED."monthlyPriceCents",
    "annualPriceCents" = EXCLUDED."annualPriceCents",
    "complaintLimit" = EXCLUDED."complaintLimit",
    "teamMemberLimit" = EXCLUDED."teamMemberLimit",
    "aiAnalysisLimit" = EXCLUDED."aiAnalysisLimit",
    "storageLimitMb" = EXCLUDED."storageLimitMb",
    "retentionDays" = EXCLUDED."retentionDays",
    "features" = EXCLUDED."features",
    "isActive" = true,
    "isPublic" = true,
    "displayOrder" = EXCLUDED."displayOrder",
    "updatedAt" = CURRENT_TIMESTAMP;

-- Retire Business Growth from the public catalog. Existing workspaces on it keep
-- Professional-level entitlements and can still renew.
UPDATE "business_plans"
SET "isPublic" = false,
    "displayOrder" = 9,
    "features" = '{"complaint_management":true,"complaint_portal":true,"resolution_management":true,"csat_feedback":true,"ai_triage":true,"duplicate_detection":true,"ai_response_suggestions":true,"team_management":true,"escalations":true,"knowledge_resources":true,"analytics":true,"reports":true,"audit_logs":false,"custom_branding":false,"api_access":false,"priority_support":false}'::jsonb,
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" = 'business';
