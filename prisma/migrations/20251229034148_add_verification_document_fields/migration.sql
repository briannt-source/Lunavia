-- AlterTable
ALTER TABLE "verifications" ADD COLUMN     "idDocumentUrl" TEXT,
ADD COLUMN     "licenseUrl" TEXT,
ADD COLUMN     "photoUrl" TEXT,
ADD COLUMN     "proofOfAddressUrl" TEXT,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "travelLicenseUrl" TEXT;
