-- AlterEnum
ALTER TYPE "TourStatus" ADD VALUE 'CLOSED';

-- AlterTable
ALTER TABLE "tour_reports" ADD COLUMN     "paymentDueAt" TIMESTAMP(3),
ADD COLUMN     "paymentLockedAmount" DOUBLE PRECISION,
ADD COLUMN     "paymentLockedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "emergency_reports" (
    "id" TEXT NOT NULL,
    "tourId" TEXT NOT NULL,
    "guideId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "operatorResponse" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "emergency_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_cancellations" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "cancelledBy" TEXT NOT NULL,
    "reason" TEXT,
    "penaltyAmount" DOUBLE PRECISION,
    "penaltyApplied" BOOLEAN NOT NULL DEFAULT false,
    "cancelledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_cancellations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "application_cancellations_applicationId_key" ON "application_cancellations"("applicationId");

-- AddForeignKey
ALTER TABLE "emergency_reports" ADD CONSTRAINT "emergency_reports_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "tours"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_reports" ADD CONSTRAINT "emergency_reports_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_cancellations" ADD CONSTRAINT "application_cancellations_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
