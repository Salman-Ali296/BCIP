ALTER TABLE "tenants"
ADD COLUMN "complaintChannel" TEXT,
ADD COLUMN "channelConfiguredAt" TIMESTAMP(3),
ADD COLUMN "onboardingCompletedAt" TIMESTAMP(3);

UPDATE "tenants" AS tenant
SET "complaintChannel" = trial."complaintChannel",
    "channelConfiguredAt" = trial."channelConfiguredAt",
    "onboardingCompletedAt" = trial."onboardingCompletedAt"
FROM "business_trials" AS trial
WHERE trial."tenantId" = tenant."id";

ALTER TABLE "business_trials"
DROP COLUMN "complaintChannel",
DROP COLUMN "channelConfiguredAt",
DROP COLUMN "onboardingCompletedAt";
