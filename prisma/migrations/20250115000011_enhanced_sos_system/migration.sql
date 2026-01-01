-- CreateEnums
DO $$ BEGIN
 CREATE TYPE "EmergencyType" AS ENUM ('SOS', 'EMERGENCY', 'INCIDENT', 'SAFETY_CHECK');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "EmergencySeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "EmergencyStatus" AS ENUM ('PENDING', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "CheckInStatus" AS ENUM ('SAFE', 'NEEDS_ATTENTION', 'MISSED', 'EMERGENCY');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- AlterTable: Enhance emergency_reports
ALTER TABLE "emergency_reports"
  ADD COLUMN IF NOT EXISTS "type" "EmergencyType" NOT NULL DEFAULT 'EMERGENCY',
  ADD COLUMN IF NOT EXISTS "severity" "EmergencySeverity" NOT NULL DEFAULT 'MEDIUM',
  ADD COLUMN IF NOT EXISTS "status" "EmergencyStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "locationAccuracy" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "respondedBy" TEXT,
  ADD COLUMN IF NOT EXISTS "respondedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "resolvedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "resolvedBy" TEXT,
  ADD COLUMN IF NOT EXISTS "resolutionNotes" TEXT,
  ADD COLUMN IF NOT EXISTS "escalated" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "escalatedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "escalatedBy" TEXT,
  ADD COLUMN IF NOT EXISTS "escalationLevel" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "contactsNotified" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Migrate existing data
UPDATE "emergency_reports" 
SET 
  "type" = CASE 
    WHEN "type" = 'SOS' THEN 'SOS'::"EmergencyType"
    WHEN "type" = 'EMERGENCY' THEN 'EMERGENCY'::"EmergencyType"
    WHEN "type" = 'INCIDENT' THEN 'INCIDENT'::"EmergencyType"
    ELSE 'EMERGENCY'::"EmergencyType"
  END,
  "severity" = CASE 
    WHEN "severity" = 'LOW' THEN 'LOW'::"EmergencySeverity"
    WHEN "severity" = 'MEDIUM' THEN 'MEDIUM'::"EmergencySeverity"
    WHEN "severity" = 'HIGH' THEN 'HIGH'::"EmergencySeverity"
    WHEN "severity" = 'CRITICAL' THEN 'CRITICAL'::"EmergencySeverity"
    ELSE 'MEDIUM'::"EmergencySeverity"
  END,
  "status" = CASE 
    WHEN "status" = 'PENDING' THEN 'PENDING'::"EmergencyStatus"
    WHEN "status" = 'ACKNOWLEDGED' THEN 'ACKNOWLEDGED'::"EmergencyStatus"
    WHEN "status" = 'RESOLVED' THEN 'RESOLVED'::"EmergencyStatus"
    ELSE 'PENDING'::"EmergencyStatus"
  END
WHERE "type" IS NULL OR "severity" IS NULL OR "status" IS NULL;

-- Note: Old columns are now typed enums, no need to drop

-- CreateTable: SafetyCheckIn
CREATE TABLE IF NOT EXISTS "safety_check_ins" (
    "id" TEXT NOT NULL,
    "emergencyReportId" TEXT,
    "tourId" TEXT NOT NULL,
    "guideId" TEXT NOT NULL,
    "status" "CheckInStatus" NOT NULL DEFAULT 'SAFE',
    "location" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "notes" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "checkedInAt" TIMESTAMP(3),
    "missed" BOOLEAN NOT NULL DEFAULT false,
    "missedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "safety_check_ins_pkey" PRIMARY KEY ("id")
);

-- CreateTable: EmergencyContact
CREATE TABLE IF NOT EXISTS "emergency_contacts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "relationship" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emergency_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "emergency_reports_tourId_idx" ON "emergency_reports"("tourId");
CREATE INDEX IF NOT EXISTS "emergency_reports_guideId_idx" ON "emergency_reports"("guideId");
CREATE INDEX IF NOT EXISTS "emergency_reports_status_idx" ON "emergency_reports"("status");
CREATE INDEX IF NOT EXISTS "emergency_reports_severity_idx" ON "emergency_reports"("severity");
CREATE INDEX IF NOT EXISTS "emergency_reports_createdAt_idx" ON "emergency_reports"("createdAt");
CREATE INDEX IF NOT EXISTS "safety_check_ins_tourId_idx" ON "safety_check_ins"("tourId");
CREATE INDEX IF NOT EXISTS "safety_check_ins_guideId_idx" ON "safety_check_ins"("guideId");
CREATE INDEX IF NOT EXISTS "safety_check_ins_scheduledAt_idx" ON "safety_check_ins"("scheduledAt");
CREATE INDEX IF NOT EXISTS "safety_check_ins_missed_idx" ON "safety_check_ins"("missed");
CREATE INDEX IF NOT EXISTS "emergency_contacts_userId_idx" ON "emergency_contacts"("userId");

-- AddForeignKey
DO $$ BEGIN
 ALTER TABLE "safety_check_ins" ADD CONSTRAINT "safety_check_ins_emergencyReportId_fkey" FOREIGN KEY ("emergencyReportId") REFERENCES "emergency_reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
 ALTER TABLE "safety_check_ins" ADD CONSTRAINT "safety_check_ins_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "tours"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "safety_check_ins" ADD CONSTRAINT "safety_check_ins_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "emergency_contacts" ADD CONSTRAINT "emergency_contacts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

