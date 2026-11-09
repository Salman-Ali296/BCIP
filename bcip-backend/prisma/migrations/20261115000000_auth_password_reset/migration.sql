-- AlterTable
ALTER TABLE "users"
    ADD COLUMN "passwordResetTokenHash" TEXT,
    ADD COLUMN "passwordResetExpiresAt" TIMESTAMP(3),
    ADD COLUMN "passwordResetSentAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "users_passwordResetTokenHash_idx" ON "users"("passwordResetTokenHash");
