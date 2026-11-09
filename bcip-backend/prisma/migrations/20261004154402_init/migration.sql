-- CreateIndex
CREATE INDEX "complaints_tenantId_aiCategory_idx" ON "complaints"("tenantId", "aiCategory");

-- CreateIndex
CREATE INDEX "complaints_tenantId_aiSentiment_idx" ON "complaints"("tenantId", "aiSentiment");

-- CreateIndex
CREATE INDEX "complaints_tenantId_aiPriority_idx" ON "complaints"("tenantId", "aiPriority");
