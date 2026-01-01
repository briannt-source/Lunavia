-- Enhance Dispute System Migration
-- Adds new fields, enums, and DisputeTimeline model

-- Add new enum values to DisputeStatus
ALTER TYPE "DisputeStatus" ADD VALUE IF NOT EXISTS 'ESCALATED';
ALTER TYPE "DisputeStatus" ADD VALUE IF NOT EXISTS 'APPEALED';

-- Create DisputeResolution enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'DisputeResolution') THEN
        CREATE TYPE "DisputeResolution" AS ENUM ('FULL_REFUND', 'PARTIAL_REFUND', 'FULL_PAYMENT', 'PARTIAL_PAYMENT', 'NO_ACTION');
    END IF;
END $$;

-- Add new columns to disputes table
ALTER TABLE "disputes" 
ADD COLUMN IF NOT EXISTS "tourId" TEXT,
ADD COLUMN IF NOT EXISTS "applicationId" TEXT,
ADD COLUMN IF NOT EXISTS "paymentId" TEXT,
ADD COLUMN IF NOT EXISTS "escrowAccountId" TEXT,
ADD COLUMN IF NOT EXISTS "resolution" "DisputeResolution",
ADD COLUMN IF NOT EXISTS "resolutionAmount" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "resolutionNotes" TEXT,
ADD COLUMN IF NOT EXISTS "escalatedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "escalatedBy" TEXT,
ADD COLUMN IF NOT EXISTS "resolvedBy" TEXT,
ADD COLUMN IF NOT EXISTS "appealId" TEXT;

-- Add foreign key constraints (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'disputes_tourId_fkey') THEN
        ALTER TABLE "disputes" ADD CONSTRAINT "disputes_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "tours"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'disputes_applicationId_fkey') THEN
        ALTER TABLE "disputes" ADD CONSTRAINT "disputes_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'disputes_paymentId_fkey') THEN
        ALTER TABLE "disputes" ADD CONSTRAINT "disputes_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'disputes_escrowAccountId_fkey') THEN
        ALTER TABLE "disputes" ADD CONSTRAINT "disputes_escrowAccountId_fkey" FOREIGN KEY ("escrowAccountId") REFERENCES "escrow_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'disputes_appealId_fkey') THEN
        ALTER TABLE "disputes" ADD CONSTRAINT "disputes_appealId_fkey" FOREIGN KEY ("appealId") REFERENCES "disputes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS "disputes_tourId_idx" ON "disputes"("tourId");
CREATE INDEX IF NOT EXISTS "disputes_applicationId_idx" ON "disputes"("applicationId");
CREATE INDEX IF NOT EXISTS "disputes_paymentId_idx" ON "disputes"("paymentId");
CREATE INDEX IF NOT EXISTS "disputes_escrowAccountId_idx" ON "disputes"("escrowAccountId");
CREATE INDEX IF NOT EXISTS "disputes_status_idx" ON "disputes"("status");

-- Drop and recreate DisputeTimeline table if it exists with wrong schema
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dispute_timelines') THEN
        DROP TABLE IF EXISTS "dispute_timelines" CASCADE;
    END IF;
END $$;

-- Create DisputeTimeline table
CREATE TABLE "dispute_timelines" (
  "id" TEXT NOT NULL,
  "disputeId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "actorId" TEXT,
  "details" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "dispute_timelines_pkey" PRIMARY KEY ("id")
);

-- Add foreign key for DisputeTimeline
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dispute_timelines_disputeId_fkey') THEN
        ALTER TABLE "dispute_timelines" ADD CONSTRAINT "dispute_timelines_disputeId_fkey" FOREIGN KEY ("disputeId") REFERENCES "disputes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dispute_timelines_actorId_fkey') THEN
        ALTER TABLE "dispute_timelines" ADD CONSTRAINT "dispute_timelines_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Create indexes for DisputeTimeline
CREATE INDEX IF NOT EXISTS "dispute_timelines_disputeId_idx" ON "dispute_timelines"("disputeId");
CREATE INDEX IF NOT EXISTS "dispute_timelines_createdAt_idx" ON "dispute_timelines"("createdAt");

