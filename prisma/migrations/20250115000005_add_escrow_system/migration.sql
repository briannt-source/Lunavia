-- Create EscrowStatus enum (only if not exists)
DO $$ BEGIN
 CREATE TYPE "EscrowStatus" AS ENUM ('PENDING', 'LOCKED', 'RELEASED', 'REFUNDED', 'CANCELLED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create EscrowAccount model (only if not exists)
CREATE TABLE IF NOT EXISTS "escrow_accounts" (
  "id" TEXT NOT NULL,
  "operatorId" TEXT NOT NULL,
  "guideId" TEXT NOT NULL,
  "tourId" TEXT,
  "standbyRequestId" TEXT,
  "amount" DOUBLE PRECISION NOT NULL,
  "platformFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "netAmount" DOUBLE PRECISION NOT NULL,
  "status" "EscrowStatus" NOT NULL DEFAULT 'PENDING',
  "lockedAt" TIMESTAMP(3),
  "releasedAt" TIMESTAMP(3),
  "refundedAt" TIMESTAMP(3),
  "cancelledAt" TIMESTAMP(3),
  "releaseReason" TEXT,
  "refundReason" TEXT,
  "cancelledReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "escrow_accounts_pkey" PRIMARY KEY ("id")
);

-- Create indexes (only if not exists)
CREATE INDEX IF NOT EXISTS "escrow_accounts_operatorId_idx" ON "escrow_accounts"("operatorId");
CREATE INDEX IF NOT EXISTS "escrow_accounts_guideId_idx" ON "escrow_accounts"("guideId");
CREATE INDEX IF NOT EXISTS "escrow_accounts_tourId_idx" ON "escrow_accounts"("tourId");
CREATE INDEX IF NOT EXISTS "escrow_accounts_status_idx" ON "escrow_accounts"("status");

-- Add foreign keys (only if not exists)
DO $$ BEGIN
 ALTER TABLE "escrow_accounts" ADD CONSTRAINT "escrow_accounts_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "escrow_accounts" ADD CONSTRAINT "escrow_accounts_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "escrow_accounts" ADD CONSTRAINT "escrow_accounts_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "tours"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "escrow_accounts" ADD CONSTRAINT "escrow_accounts_standbyRequestId_fkey" FOREIGN KEY ("standbyRequestId") REFERENCES "standby_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Add escrowAccountId to Payment model
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "escrowAccountId" TEXT;

-- Add foreign key for escrowAccountId (only if not exists)
DO $$ BEGIN
 ALTER TABLE "payments" ADD CONSTRAINT "payments_escrowAccountId_fkey" FOREIGN KEY ("escrowAccountId") REFERENCES "escrow_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create index for escrowAccountId
CREATE INDEX IF NOT EXISTS "payments_escrowAccountId_idx" ON "payments"("escrowAccountId");

