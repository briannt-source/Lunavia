-- CreateTable
CREATE TABLE IF NOT EXISTS "user_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emailNewApplication" BOOLEAN NOT NULL DEFAULT true,
    "emailApplicationStatus" BOOLEAN NOT NULL DEFAULT true,
    "emailPayment" BOOLEAN NOT NULL DEFAULT true,
    "emailTourStarted" BOOLEAN NOT NULL DEFAULT true,
    "emailTourCancelled" BOOLEAN NOT NULL DEFAULT true,
    "emailMessage" BOOLEAN NOT NULL DEFAULT true,
    "emailReportSubmitted" BOOLEAN NOT NULL DEFAULT true,
    "emailPaymentRequest" BOOLEAN NOT NULL DEFAULT true,
    "emailEmergency" BOOLEAN NOT NULL DEFAULT true,
    "inAppNotifications" BOOLEAN NOT NULL DEFAULT true,
    "language" TEXT NOT NULL DEFAULT 'vi',
    "dateFormat" TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
    "currencyDisplay" TEXT NOT NULL DEFAULT 'VND',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
    "profileVisibility" TEXT NOT NULL DEFAULT 'PUBLIC',
    "showWalletBalance" BOOLEAN NOT NULL DEFAULT false,
    "defaultTourVisibility" TEXT,
    "defaultCurrency" TEXT DEFAULT 'VND',
    "defaultMainGuideSlots" INTEGER DEFAULT 1,
    "defaultSubGuideSlots" INTEGER DEFAULT 0,
    "autoCloseToursDays" INTEGER,
    "autoApplyEnabled" BOOLEAN NOT NULL DEFAULT false,
    "minTourPrice" DOUBLE PRECISION,
    "preferredTourTypes" TEXT[],
    "autoApprovePayments" BOOLEAN NOT NULL DEFAULT false,
    "autoApproveThreshold" DOUBLE PRECISION DEFAULT 0,
    "paymentReminderDays" INTEGER DEFAULT 7,
    "defaultPaymentMethod" TEXT,
    "paymentCurrency" TEXT DEFAULT 'VND',
    "paymentSchedule" TEXT DEFAULT 'IMMEDIATE',
    "preferredPaymentMethod" TEXT,
    "autoWithdrawEnabled" BOOLEAN NOT NULL DEFAULT false,
    "autoWithdrawThreshold" DOUBLE PRECISION DEFAULT 0,
    "paymentReminderEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "user_settings_userId_key" ON "user_settings"("userId");

-- AddForeignKey
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable: Add code column to tours (nullable first, will be backfilled)
ALTER TABLE "tours" ADD COLUMN IF NOT EXISTS "code" TEXT;

-- CreateIndex for tours.code (will be unique after backfill)
CREATE UNIQUE INDEX IF NOT EXISTS "tours_code_key" ON "tours"("code") WHERE "code" IS NOT NULL;

-- AlterTable: Add code column to users (nullable first, will be backfilled)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "code" TEXT;

-- CreateIndex for users.code (will be unique after backfill)
CREATE UNIQUE INDEX IF NOT EXISTS "users_code_key" ON "users"("code") WHERE "code" IS NOT NULL;



