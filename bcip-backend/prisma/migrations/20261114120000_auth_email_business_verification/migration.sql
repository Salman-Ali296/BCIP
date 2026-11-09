ALTER TABLE "tenants"
    ADD COLUMN "businessVerified" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "users"
    ADD COLUMN "emailVerificationSentAt" TIMESTAMP(3);
