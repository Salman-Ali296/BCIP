CREATE TABLE "business_plans" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "audience" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "monthlyPriceCents" INTEGER,
    "annualPriceCents" INTEGER,
    "complaintLimit" INTEGER,
    "teamMemberLimit" INTEGER,
    "aiAnalysisLimit" INTEGER,
    "storageLimitMb" INTEGER,
    "retentionDays" INTEGER,
    "features" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_plans_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "business_subscriptions" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "billingCycle" TEXT,
    "paymentProvider" TEXT,
    "providerReference" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "nextBillingDate" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "canceledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "usage_records" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "metric" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usage_records_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "subscription_history" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "previousPlan" TEXT,
    "newPlan" TEXT,
    "action" TEXT NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "performedById" TEXT,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_history_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "business_plans_slug_key" ON "business_plans"("slug");
CREATE INDEX "business_plans_isActive_isPublic_displayOrder_idx" ON "business_plans"("isActive", "isPublic", "displayOrder");
CREATE UNIQUE INDEX "business_subscriptions_providerReference_key" ON "business_subscriptions"("providerReference");
CREATE INDEX "business_subscriptions_tenantId_status_idx" ON "business_subscriptions"("tenantId", "status");
CREATE INDEX "business_subscriptions_planId_idx" ON "business_subscriptions"("planId");
CREATE INDEX "business_subscriptions_tenantId_createdAt_idx" ON "business_subscriptions"("tenantId", "createdAt");
CREATE UNIQUE INDEX "usage_records_tenantId_metric_periodStart_key" ON "usage_records"("tenantId", "metric", "periodStart");
CREATE INDEX "usage_records_tenantId_periodStart_periodEnd_idx" ON "usage_records"("tenantId", "periodStart", "periodEnd");
CREATE INDEX "usage_records_subscriptionId_metric_idx" ON "usage_records"("subscriptionId", "metric");
CREATE INDEX "subscription_history_tenantId_createdAt_idx" ON "subscription_history"("tenantId", "createdAt");
CREATE INDEX "subscription_history_action_effectiveDate_idx" ON "subscription_history"("action", "effectiveDate");

ALTER TABLE "business_subscriptions"
    ADD CONSTRAINT "business_subscriptions_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "business_subscriptions"
    ADD CONSTRAINT "business_subscriptions_planId_fkey"
    FOREIGN KEY ("planId") REFERENCES "business_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "usage_records"
    ADD CONSTRAINT "usage_records_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "usage_records"
    ADD CONSTRAINT "usage_records_subscriptionId_fkey"
    FOREIGN KEY ("subscriptionId") REFERENCES "business_subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "subscription_history"
    ADD CONSTRAINT "subscription_history_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "business_plans" (
    "id", "slug", "name", "audience", "description", "currency",
    "monthlyPriceCents", "annualPriceCents", "complaintLimit", "teamMemberLimit",
    "aiAnalysisLimit", "storageLimitMb", "retentionDays", "features",
    "isActive", "isPublic", "displayOrder", "updatedAt"
) VALUES
(
    'plan_starter', 'starter', 'Starter', 'For small businesses getting organized',
    'A practical starting point for managing customer complaints and responses.',
    'USD', 1900, 18240, 200, 3, 100, 2048, 90,
    '{"complaint_management":true,"complaint_portal":true,"resolution_management":true}'::jsonb,
    true, true, 1, CURRENT_TIMESTAMP
),
(
    'plan_professional', 'growth', 'Professional', 'For growing support teams',
    'More capacity for teams building a consistent service operation.',
    'USD', 4900, 47040, 1000, 10, 1000, 10240, 365,
    '{"complaint_management":true,"complaint_portal":true,"resolution_management":true}'::jsonb,
    true, true, 2, CURRENT_TIMESTAMP
),
(
    'plan_business_growth', 'business', 'Business Growth', 'For established operations',
    'Expanded capacity and coordination for larger complaint operations.',
    'USD', 9900, 95040, 5000, 25, 5000, 51200, 730,
    '{"complaint_management":true,"complaint_portal":true,"resolution_management":true}'::jsonb,
    true, true, 3, CURRENT_TIMESTAMP
),
(
    'plan_enterprise', 'enterprise', 'Enterprise', 'For large organizations with custom needs',
    'Discuss custom capacity and commercial terms with our team.',
    'USD', NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    '{"complaint_management":true,"complaint_portal":true,"resolution_management":true}'::jsonb,
    true, true, 4, CURRENT_TIMESTAMP
);

INSERT INTO "business_subscriptions" (
    "id", "tenantId", "planId", "status", "paymentProvider", "providerReference",
    "startDate", "endDate", "cancelAtPeriodEnd", "createdAt", "updatedAt"
)
SELECT
    'subscription_migrated_' || tenant."id",
    tenant."id",
    plan."id",
    tenant."subscriptionStatus",
    CASE WHEN tenant."stripeSubscriptionId" IS NULL THEN 'demo' ELSE 'stripe' END,
    tenant."stripeSubscriptionId",
    tenant."createdAt",
    tenant."subscriptionCurrentPeriodEnd",
    tenant."subscriptionCancelAtPeriodEnd",
    tenant."createdAt",
    CURRENT_TIMESTAMP
FROM "tenants" AS tenant
JOIN "business_plans" AS plan ON plan."slug" = tenant."subscriptionPlan"
WHERE tenant."subscriptionStatus" IN ('active', 'trialing', 'demo_active')
ON CONFLICT ("providerReference") DO NOTHING;

INSERT INTO "subscription_history" (
    "id", "tenantId", "newPlan", "action", "effectiveDate", "createdAt"
)
SELECT
    'history_migrated_' || tenant."id",
    tenant."id",
    tenant."subscriptionPlan",
    'MIGRATED',
    tenant."createdAt",
    CURRENT_TIMESTAMP
FROM "tenants" AS tenant
WHERE tenant."subscriptionStatus" IN ('active', 'trialing', 'demo_active')
  AND tenant."subscriptionPlan" IS NOT NULL;

INSERT INTO "usage_records" (
    "id", "tenantId", "metric", "quantity", "periodStart", "periodEnd", "updatedAt"
)
SELECT
    'usage_complaints_' || complaint."tenantId" || '_' || TO_CHAR(DATE_TRUNC('month', CURRENT_TIMESTAMP), 'YYYYMM'),
    complaint."tenantId",
    'complaints',
    COUNT(*)::INTEGER,
    DATE_TRUNC('month', CURRENT_TIMESTAMP),
    DATE_TRUNC('month', CURRENT_TIMESTAMP) + INTERVAL '1 month',
    CURRENT_TIMESTAMP
FROM "complaints" AS complaint
WHERE complaint."createdAt" >= DATE_TRUNC('month', CURRENT_TIMESTAMP)
  AND complaint."createdAt" < DATE_TRUNC('month', CURRENT_TIMESTAMP) + INTERVAL '1 month'
GROUP BY complaint."tenantId";

INSERT INTO "usage_records" (
    "id", "tenantId", "metric", "quantity", "periodStart", "periodEnd", "updatedAt"
)
SELECT
    'usage_ai_' || complaint."tenantId" || '_' || TO_CHAR(DATE_TRUNC('month', CURRENT_TIMESTAMP), 'YYYYMM'),
    complaint."tenantId",
    'ai_analyses',
    COUNT(*)::INTEGER,
    DATE_TRUNC('month', CURRENT_TIMESTAMP),
    DATE_TRUNC('month', CURRENT_TIMESTAMP) + INTERVAL '1 month',
    CURRENT_TIMESTAMP
FROM "complaints" AS complaint
WHERE complaint."aiProcessed" = true
  AND complaint."createdAt" >= DATE_TRUNC('month', CURRENT_TIMESTAMP)
  AND complaint."createdAt" < DATE_TRUNC('month', CURRENT_TIMESTAMP) + INTERVAL '1 month'
GROUP BY complaint."tenantId";
