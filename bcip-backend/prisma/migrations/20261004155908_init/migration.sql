-- DropForeignKey
ALTER TABLE "ai_processing" DROP CONSTRAINT "ai_processing_tenantId_fkey";

-- AlterTable
ALTER TABLE "business_trials" ADD COLUMN     "planType" TEXT,
ADD COLUMN     "primaryGoal" TEXT;

-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "source" TEXT,
ADD COLUMN     "teamSize" TEXT;

-- CreateTable
CREATE TABLE "tenant_metrics" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "totalComplaints" INTEGER NOT NULL DEFAULT 0,
    "pendingComplaints" INTEGER NOT NULL DEFAULT 0,
    "inProgressCount" INTEGER NOT NULL DEFAULT 0,
    "resolvedComplaints" INTEGER NOT NULL DEFAULT 0,
    "avgResolutionHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenant_metrics_tenantId_key" ON "tenant_metrics"("tenantId");

-- CreateIndex
CREATE INDEX "tenant_metrics_tenantId_idx" ON "tenant_metrics"("tenantId");

-- CreateIndex
CREATE INDEX "ai_processing_tenantId_idx" ON "ai_processing"("tenantId");

-- AddForeignKey
ALTER TABLE "ai_processing" ADD CONSTRAINT "ai_processing_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_metrics" ADD CONSTRAINT "tenant_metrics_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
