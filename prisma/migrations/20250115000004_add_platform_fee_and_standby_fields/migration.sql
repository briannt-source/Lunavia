-- Add platform fee fields to payments table
ALTER TABLE "payments" 
ADD COLUMN IF NOT EXISTS "platformFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "netAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "isFreelance" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "employmentContractUrl" TEXT,
ADD COLUMN IF NOT EXISTS "standbyRequestId" TEXT;

-- Add foreign key for standbyRequestId
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'payments_standbyRequestId_fkey'
  ) THEN
    ALTER TABLE "payments" 
    ADD CONSTRAINT "payments_standbyRequestId_fkey" 
    FOREIGN KEY ("standbyRequestId") 
    REFERENCES "standby_requests"("id") 
    ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Add employment contract fields to company_members table
ALTER TABLE "company_members"
ADD COLUMN IF NOT EXISTS "employmentContractUrl" TEXT,
ADD COLUMN IF NOT EXISTS "contractVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "contractVerifiedBy" TEXT,
ADD COLUMN IF NOT EXISTS "contractVerifiedAt" TIMESTAMP(3);

-- Add standby fee and status fields to standby_requests table
ALTER TABLE "standby_requests"
ADD COLUMN IF NOT EXISTS "standbyFee" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "acceptedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "rejectedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP(3);

-- Update existing payments to calculate netAmount (if platformFee is 0, netAmount = amount)
UPDATE "payments"
SET "netAmount" = "amount" - COALESCE("platformFee", 0)
WHERE "netAmount" = 0 AND "platformFee" = 0;

