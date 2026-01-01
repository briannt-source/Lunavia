-- CreateEnum
DO $$ BEGIN
 CREATE TYPE "ContractTemplateCategory" AS ENUM ('TOUR_GUIDE_STANDARD', 'TOUR_GUIDE_PREMIUM', 'STANDBY_SERVICE', 'IN_HOUSE_EMPLOYMENT', 'CUSTOM');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- CreateTable: ContractTemplate
CREATE TABLE IF NOT EXISTS "contract_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "ContractTemplateCategory" NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "variables" JSONB NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contract_templates_pkey" PRIMARY KEY ("id")
);

-- AlterTable: Add new columns to contracts
ALTER TABLE "contracts" 
  ADD COLUMN IF NOT EXISTS "templateId" TEXT,
  ADD COLUMN IF NOT EXISTS "templateContent" TEXT,
  ADD COLUMN IF NOT EXISTS "operatorSignatureUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "operatorSignedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "operatorSignedIp" TEXT,
  ADD COLUMN IF NOT EXISTS "version" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "renewalReminderSent" BOOLEAN NOT NULL DEFAULT false;

-- Migrate existing template data to templateContent (only if template column exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'template') THEN
        UPDATE "contracts" SET "templateContent" = "template" WHERE "template" IS NOT NULL AND "templateContent" IS NULL;
    END IF;
END $$;

-- Drop old template column (after migration)
ALTER TABLE "contracts" DROP COLUMN IF EXISTS "template";

-- AddForeignKey for templateId (only if not exists)
DO $$ BEGIN
 ALTER TABLE "contracts" ADD CONSTRAINT "contracts_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "contract_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- AlterTable: Add e-signature columns to contract_acceptances
ALTER TABLE "contract_acceptances"
  ADD COLUMN IF NOT EXISTS "signatureUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "signedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "signedIp" TEXT,
  ADD COLUMN IF NOT EXISTS "rejectedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;

-- CreateTable: ContractHistory
CREATE TABLE IF NOT EXISTS "contract_history" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "changedBy" TEXT,
    "changeNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contract_history_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey (only if not exists)
DO $$ BEGIN
 ALTER TABLE "contract_history" ADD CONSTRAINT "contract_history_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "contract_history_contractId_idx" ON "contract_history"("contractId");

-- Insert default contract templates
INSERT INTO "contract_templates" ("id", "name", "category", "description", "content", "variables", "isActive", "version", "createdAt", "updatedAt")
VALUES 
  (
    'template-tour-guide-standard',
    'Tour Guide Contract (Standard)',
    'TOUR_GUIDE_STANDARD',
    'Standard contract template for tour guide services',
    'HỢP ĐỒNG DỊCH VỤ HƯỚNG DẪN DU LỊCH

Tour: {{tour.title}}
Mã Tour: {{tour.code}}
Ngày bắt đầu: {{tour.startDate}}
Ngày kết thúc: {{tour.endDate}}
Thành phố: {{tour.city}}
Số lượng khách: {{tour.pax}}

Hướng dẫn viên: {{guide.name}}
Email: {{guide.email}}

Điều khoản:
1. Hướng dẫn viên cam kết thực hiện dịch vụ theo đúng lịch trình và yêu cầu của tour.
2. Mức thù lao: {{price}} VND
3. Thanh toán sẽ được thực hiện sau khi tour hoàn thành và báo cáo được nộp.
4. Hướng dẫn viên chịu trách nhiệm về chất lượng dịch vụ và sự hài lòng của khách hàng.

Ký bởi:
Tour Operator: {{operator.name}}
Ngày: {{contract.createdAt}}

Hướng dẫn viên: {{guide.name}}
Ngày: {{acceptance.signedAt}}',
    '{"tour.title": "Tour title", "tour.code": "Tour code", "tour.startDate": "Tour start date", "tour.endDate": "Tour end date", "tour.city": "Tour city", "tour.pax": "Number of passengers", "guide.name": "Guide name", "guide.email": "Guide email", "operator.name": "Operator name", "price": "Payment amount", "contract.createdAt": "Contract creation date", "acceptance.signedAt": "Acceptance date"}'::jsonb,
    true,
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'template-standby-service',
    'Standby Service Contract',
    'STANDBY_SERVICE',
    'Contract template for standby guide services',
    'HỢP ĐỒNG DỊCH VỤ STANDBY

Ngày yêu cầu: {{standby.requiredDate}}
Ngân sách: {{standby.budget}} VND
Phí standby: {{standby.standbyFee}} VND

Hướng dẫn viên: {{guide.name}}

Điều khoản:
1. Hướng dẫn viên sẵn sàng thực hiện dịch vụ trong ngày yêu cầu.
2. Nếu được gọi, hướng dẫn viên sẽ nhận thanh toán theo thỏa thuận.
3. Nếu không được gọi, hướng dẫn viên vẫn nhận phí standby.

Ký bởi:
Tour Operator: {{operator.name}}
Ngày: {{contract.createdAt}}

Hướng dẫn viên: {{guide.name}}
Ngày: {{acceptance.signedAt}}',
    '{"standby.requiredDate": "Required date", "standby.budget": "Total budget", "standby.standbyFee": "Standby fee", "guide.name": "Guide name", "operator.name": "Operator name", "contract.createdAt": "Contract creation date", "acceptance.signedAt": "Acceptance date"}'::jsonb,
    true,
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
ON CONFLICT ("id") DO NOTHING;

