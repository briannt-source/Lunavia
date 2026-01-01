-- Add unique constraints to Company table
-- This migration adds unique constraints to prevent duplicate company information

-- Add unique constraint for email (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'companies_email_key'
    ) THEN
        CREATE UNIQUE INDEX "companies_email_key" ON "companies"("email") WHERE "email" IS NOT NULL;
    END IF;
END $$;

-- Add unique constraint for businessLicenseNumber (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'companies_businessLicenseNumber_key'
    ) THEN
        CREATE UNIQUE INDEX "companies_businessLicenseNumber_key" ON "companies"("businessLicenseNumber") WHERE "businessLicenseNumber" IS NOT NULL;
    END IF;
END $$;

-- Add unique constraint for travelLicenseNumber (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'companies_travelLicenseNumber_key'
    ) THEN
        CREATE UNIQUE INDEX "companies_travelLicenseNumber_key" ON "companies"("travelLicenseNumber") WHERE "travelLicenseNumber" IS NOT NULL;
    END IF;
END $$;



