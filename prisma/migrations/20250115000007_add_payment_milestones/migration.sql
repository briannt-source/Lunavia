-- CreateEnum
DO $$ BEGIN
 CREATE TYPE "MilestoneStatus" AS ENUM ('PENDING', 'REQUESTED', 'APPROVED', 'REJECTED', 'PAID', 'AUTO_RELEASED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "payment_milestones" (
    "id" TEXT NOT NULL,
    "tourId" TEXT NOT NULL,
    "guideId" TEXT NOT NULL,
    "applicationId" TEXT,
    "assignmentId" TEXT,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "milestone1Amount" DOUBLE PRECISION NOT NULL,
    "milestone2Amount" DOUBLE PRECISION NOT NULL,
    "milestone3Amount" DOUBLE PRECISION NOT NULL,
    "milestone1Status" "MilestoneStatus" NOT NULL DEFAULT 'PENDING',
    "milestone1RequestedAt" TIMESTAMP(3),
    "milestone1PaidAt" TIMESTAMP(3),
    "milestone1PaymentId" TEXT,
    "milestone2Status" "MilestoneStatus" NOT NULL DEFAULT 'PENDING',
    "milestone2RequestedAt" TIMESTAMP(3),
    "milestone2PaidAt" TIMESTAMP(3),
    "milestone2PaymentId" TEXT,
    "milestone3Status" "MilestoneStatus" NOT NULL DEFAULT 'PENDING',
    "milestone3RequestedAt" TIMESTAMP(3),
    "milestone3PaidAt" TIMESTAMP(3),
    "milestone3PaymentId" TEXT,
    "autoReleaseEnabled" BOOLEAN NOT NULL DEFAULT false,
    "autoReleaseHours" INTEGER NOT NULL DEFAULT 24,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_milestones_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey (only if not exists)
DO $$ BEGIN
 ALTER TABLE "payment_milestones" ADD CONSTRAINT "payment_milestones_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "tours"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "payment_milestones" ADD CONSTRAINT "payment_milestones_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "payment_milestones" ADD CONSTRAINT "payment_milestones_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "payment_milestones" ADD CONSTRAINT "payment_milestones_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "assignments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "payment_milestones" ADD CONSTRAINT "payment_milestones_milestone1PaymentId_fkey" FOREIGN KEY ("milestone1PaymentId") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "payment_milestones" ADD CONSTRAINT "payment_milestones_milestone2PaymentId_fkey" FOREIGN KEY ("milestone2PaymentId") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "payment_milestones" ADD CONSTRAINT "payment_milestones_milestone3PaymentId_fkey" FOREIGN KEY ("milestone3PaymentId") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- CreateIndex (only if not exists)
CREATE UNIQUE INDEX IF NOT EXISTS "payment_milestones_tourId_guideId_key" ON "payment_milestones"("tourId", "guideId");

CREATE INDEX IF NOT EXISTS "payment_milestones_tourId_idx" ON "payment_milestones"("tourId");

CREATE INDEX IF NOT EXISTS "payment_milestones_guideId_idx" ON "payment_milestones"("guideId");

-- Add paymentMilestoneId to escrow_accounts
ALTER TABLE "escrow_accounts" ADD COLUMN IF NOT EXISTS "paymentMilestoneId" TEXT;

-- AddForeignKey (only if not exists)
DO $$ BEGIN
 ALTER TABLE "escrow_accounts" ADD CONSTRAINT "escrow_accounts_paymentMilestoneId_fkey" FOREIGN KEY ("paymentMilestoneId") REFERENCES "payment_milestones"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "escrow_accounts_paymentMilestoneId_idx" ON "escrow_accounts"("paymentMilestoneId");

