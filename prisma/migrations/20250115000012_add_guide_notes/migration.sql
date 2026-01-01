-- Add guideNotes column to tours table
ALTER TABLE "tours" 
  ADD COLUMN IF NOT EXISTS "guideNotes" TEXT;

-- Add comment
COMMENT ON COLUMN "tours"."guideNotes" IS 'Notes/notices dành riêng cho tour guide';

