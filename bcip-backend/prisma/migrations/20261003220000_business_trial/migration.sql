CREATE TABLE "business_trials" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "acceptedByUserId" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "termsVersion" TEXT NOT NULL DEFAULT '14-day-free-trial-v1',
    "complaintChannel" TEXT NOT NULL DEFAULT 'WEB_PORTAL',
    "channelConfiguredAt" TIMESTAMP(3),
    "onboardingCompletedAt" TIMESTAMP(3),

    CONSTRAINT "business_trials_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "business_trials_tenantId_key" ON "business_trials"("tenantId");
CREATE INDEX "business_trials_expiresAt_idx" ON "business_trials"("expiresAt");

ALTER TABLE "business_trials"
ADD CONSTRAINT "business_trials_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "business_trials"
ADD CONSTRAINT "business_trials_acceptedByUserId_fkey"
FOREIGN KEY ("acceptedByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
