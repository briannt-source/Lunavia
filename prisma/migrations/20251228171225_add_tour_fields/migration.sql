-- AlterTable
ALTER TABLE "tours" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'VND',
ADD COLUMN     "durationHours" INTEGER,
ADD COLUMN     "files" TEXT[],
ALTER COLUMN "priceMain" DROP NOT NULL,
ALTER COLUMN "priceSub" DROP NOT NULL;
