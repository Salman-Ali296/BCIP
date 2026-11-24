ALTER TABLE "business_trials"
ADD COLUMN "plan" TEXT;

UPDATE "business_trials"
SET "plan" = 'business';

ALTER TABLE "business_trials"
ALTER COLUMN "plan" SET DEFAULT 'starter',
ALTER COLUMN "plan" SET NOT NULL;
