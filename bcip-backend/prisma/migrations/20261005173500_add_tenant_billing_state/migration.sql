ALTER TABLE "tenants"
    ADD COLUMN "stripeCustomerId" TEXT,
    ADD COLUMN "stripeSubscriptionId" TEXT,
    ADD COLUMN "subscriptionStatus" TEXT,
    ADD COLUMN "subscriptionPlan" TEXT,
    ADD COLUMN "subscriptionCurrentPeriodEnd" TIMESTAMP(3),
    ADD COLUMN "subscriptionCancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX "tenants_stripeCustomerId_key" ON "tenants"("stripeCustomerId");
CREATE UNIQUE INDEX "tenants_stripeSubscriptionId_key" ON "tenants"("stripeSubscriptionId");
