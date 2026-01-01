-- CreateEnum
DO $$ BEGIN
 CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'FLAGGED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- AlterTable: Add new columns to reviews table
ALTER TABLE "reviews" 
  ADD COLUMN IF NOT EXISTS "professionalismRating" INTEGER,
  ADD COLUMN IF NOT EXISTS "communicationRating" INTEGER,
  ADD COLUMN IF NOT EXISTS "punctualityRating" INTEGER,
  ADD COLUMN IF NOT EXISTS "knowledgeRating" INTEGER,
  ADD COLUMN IF NOT EXISTS "overallRating" INTEGER,
  ADD COLUMN IF NOT EXISTS "photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS "isVerified" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "canEdit" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "editDeadline" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "isFlagged" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "flaggedBy" TEXT,
  ADD COLUMN IF NOT EXISTS "flaggedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "flagReason" TEXT,
  ADD COLUMN IF NOT EXISTS "reviewedBy" TEXT,
  ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "reviewNote" TEXT,
  ADD COLUMN IF NOT EXISTS "response" TEXT,
  ADD COLUMN IF NOT EXISTS "responseBy" TEXT,
  ADD COLUMN IF NOT EXISTS "respondedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "editedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Migrate existing data: Set overallRating from rating, and set status to APPROVED (only if rating column exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'rating') THEN
        UPDATE "reviews" 
        SET 
          "overallRating" = COALESCE("rating", 5),
          "professionalismRating" = COALESCE("rating", 5),
          "communicationRating" = COALESCE("rating", 5),
          "punctualityRating" = COALESCE("rating", 5),
          "knowledgeRating" = COALESCE("rating", 5),
          "status" = 'APPROVED',
          "isVerified" = true
        WHERE "rating" IS NOT NULL;
    ELSE
        -- If rating column doesn't exist, set default values
        UPDATE "reviews" 
        SET 
          "overallRating" = 5,
          "professionalismRating" = 5,
          "communicationRating" = 5,
          "punctualityRating" = 5,
          "knowledgeRating" = 5,
          "status" = 'APPROVED',
          "isVerified" = true
        WHERE "overallRating" IS NULL;
    END IF;
END $$;

-- Make overallRating required (after migration) - only if columns don't have NOT NULL constraint
DO $$ 
BEGIN
    -- Check and set NOT NULL only if column allows NULL
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'overallRating' AND is_nullable = 'YES') THEN
        UPDATE "reviews" SET "overallRating" = 5 WHERE "overallRating" IS NULL;
        ALTER TABLE "reviews" ALTER COLUMN "overallRating" SET NOT NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'professionalismRating' AND is_nullable = 'YES') THEN
        UPDATE "reviews" SET "professionalismRating" = 5 WHERE "professionalismRating" IS NULL;
        ALTER TABLE "reviews" ALTER COLUMN "professionalismRating" SET NOT NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'communicationRating' AND is_nullable = 'YES') THEN
        UPDATE "reviews" SET "communicationRating" = 5 WHERE "communicationRating" IS NULL;
        ALTER TABLE "reviews" ALTER COLUMN "communicationRating" SET NOT NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'punctualityRating' AND is_nullable = 'YES') THEN
        UPDATE "reviews" SET "punctualityRating" = 5 WHERE "punctualityRating" IS NULL;
        ALTER TABLE "reviews" ALTER COLUMN "punctualityRating" SET NOT NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'knowledgeRating' AND is_nullable = 'YES') THEN
        UPDATE "reviews" SET "knowledgeRating" = 5 WHERE "knowledgeRating" IS NULL;
        ALTER TABLE "reviews" ALTER COLUMN "knowledgeRating" SET NOT NULL;
    END IF;
END $$;

-- Drop old rating column (after migration)
ALTER TABLE "reviews" DROP COLUMN IF EXISTS "rating";

-- CreateIndex
CREATE INDEX IF NOT EXISTS "reviews_reviewerId_idx" ON "reviews"("reviewerId");
CREATE INDEX IF NOT EXISTS "reviews_subjectId_idx" ON "reviews"("subjectId");
CREATE INDEX IF NOT EXISTS "reviews_tourId_idx" ON "reviews"("tourId");
CREATE INDEX IF NOT EXISTS "reviews_status_idx" ON "reviews"("status");
CREATE INDEX IF NOT EXISTS "reviews_isVerified_idx" ON "reviews"("isVerified");

