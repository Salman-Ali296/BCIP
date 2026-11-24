ALTER TABLE "tenants"
ADD COLUMN "legalName" TEXT,
ADD COLUMN "country" TEXT,
ADD COLUMN "primaryContactName" TEXT;

CREATE TABLE "business_departments" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "managerUserId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "business_departments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "business_onboarding" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "completedThrough" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 0,
    "draft" JSONB NOT NULL DEFAULT '{}'::JSONB,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "business_onboarding_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "business_invitations" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "departmentId" TEXT,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "invitedByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "business_invitations_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "users"
ADD COLUMN "departmentId" TEXT;

ALTER TABLE "tenant_settings"
ADD COLUMN "workingDays" TEXT[] NOT NULL DEFAULT ARRAY['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']::TEXT[],
ADD COLUMN "workingHourStart" TEXT NOT NULL DEFAULT '09:00',
ADD COLUMN "workingHourEnd" TEXT NOT NULL DEFAULT '17:00',
ADD COLUMN "defaultResponseTargetMinutes" INTEGER NOT NULL DEFAULT 120,
ADD COLUMN "defaultResolutionTargetMinutes" INTEGER NOT NULL DEFAULT 2880,
ADD COLUMN "escalationThresholdMinutes" INTEGER NOT NULL DEFAULT 60,
ADD COLUMN "defaultPriority" "Priority" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN "primaryTeamId" TEXT,
ADD COLUMN "categorizationEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "sentimentEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "prioritySuggestionEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "similarityDetectionEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "responseSuggestionEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "summaryEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "newComplaintNotification" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "highPriorityNotification" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "escalationNotification" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "assignmentNotification" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "weeklySummary" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "workspaceDisplayName" TEXT,
ADD COLUMN "primaryColor" TEXT NOT NULL DEFAULT '#6334a3',
ADD COLUMN "dateFormat" TEXT NOT NULL DEFAULT 'MMM d, yyyy',
ADD COLUMN "defaultComplaintView" TEXT NOT NULL DEFAULT 'inbox',
ADD COLUMN "defaultDashboardPeriod" TEXT NOT NULL DEFAULT '30d';

CREATE UNIQUE INDEX "business_departments_tenantId_name_key"
ON "business_departments"("tenantId", "name");
CREATE INDEX "business_departments_tenantId_isActive_idx"
ON "business_departments"("tenantId", "isActive");
CREATE INDEX "business_departments_managerUserId_idx"
ON "business_departments"("managerUserId");

CREATE UNIQUE INDEX "business_onboarding_tenantId_key"
ON "business_onboarding"("tenantId");
CREATE INDEX "business_onboarding_completedAt_idx"
ON "business_onboarding"("completedAt");

CREATE UNIQUE INDEX "business_invitations_tokenHash_key"
ON "business_invitations"("tokenHash");
CREATE INDEX "business_invitations_tenantId_email_acceptedAt_idx"
ON "business_invitations"("tenantId", "email", "acceptedAt");
CREATE INDEX "business_invitations_expiresAt_idx"
ON "business_invitations"("expiresAt");

ALTER TABLE "business_departments"
ADD CONSTRAINT "business_departments_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "business_departments"
ADD CONSTRAINT "business_departments_managerUserId_fkey"
FOREIGN KEY ("managerUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "business_onboarding"
ADD CONSTRAINT "business_onboarding_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "business_invitations"
ADD CONSTRAINT "business_invitations_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "business_invitations"
ADD CONSTRAINT "business_invitations_departmentId_fkey"
FOREIGN KEY ("departmentId") REFERENCES "business_departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "business_invitations"
ADD CONSTRAINT "business_invitations_invitedByUserId_fkey"
FOREIGN KEY ("invitedByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "users"
ADD CONSTRAINT "users_departmentId_fkey"
FOREIGN KEY ("departmentId") REFERENCES "business_departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "tenant_settings"
ADD CONSTRAINT "tenant_settings_primaryTeamId_fkey"
FOREIGN KEY ("primaryTeamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;
