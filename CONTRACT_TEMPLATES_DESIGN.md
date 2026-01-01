# Contract Templates & E-Signature Design Document

## Tổng quan

Hệ thống Contract Templates & E-Signature cung cấp standard contracts, e-signature với legal validity, và contract management system.

## Tính năng

### 1. Contract Templates
- **Standard Templates:**
  - Tour Guide Contract (Standard)
  - Tour Guide Contract (Premium)
  - Standby Service Contract
  - In-House Employment Contract
  - Custom templates

- **Template Features:**
  - Variable placeholders ({{tour.title}}, {{guide.name}}, {{price}}, etc.)
  - Legal compliance check
  - Version control
  - Template categories

### 2. E-Signature System
- **Digital Signature:**
  - Signature capture (drawing or upload)
  - IP address tracking
  - Timestamp
  - Legal validity proof
  - Signature storage

- **Signature Verification:**
  - Verify signature authenticity
  - Track signature history
  - Legal compliance

### 3. Contract Management
- **Contract History:**
  - Version tracking
  - Change log
  - Terms comparison

- **Renewal Reminders:**
  - Auto-reminders before expiration
  - Renewal workflow
  - Contract expiration tracking

## Database Schema

### ContractTemplate Model
```prisma
model ContractTemplate {
  id          String   @id @default(cuid())
  name        String
  category    ContractTemplateCategory
  description String?  @db.Text
  content     String   @db.Text // Template with variables
  variables   Json     // Available variables and their descriptions
  isActive    Boolean  @default(true)
  version     Int      @default(1)
  createdBy   String?  // Admin user ID
  createdAt   DateTime @default(now())
  updatedAt   DateTime @default(now()) @updatedAt
  
  contracts   Contract[]
  
  @@map("contract_templates")
}

enum ContractTemplateCategory {
  TOUR_GUIDE_STANDARD
  TOUR_GUIDE_PREMIUM
  STANDBY_SERVICE
  IN_HOUSE_EMPLOYMENT
  CUSTOM
}
```

### Enhanced Contract Model
```prisma
model Contract {
  id              String   @id @default(cuid())
  tourId          String   @unique
  tour            Tour     @relation(fields: [tourId], references: [id])
  templateId      String?  // If created from template
  template        ContractTemplate? @relation(fields: [templateId], references: [id])
  title           String
  content         String   @db.Text // Final content with variables replaced
  templateContent String?  @db.Text // Original template content
  
  // E-Signature
  operatorSignatureUrl String? // URL to operator's signature image
  operatorSignedAt     DateTime?
  operatorSignedIp     String?
  
  // Contract metadata
  version         Int      @default(1)
  isActive        Boolean  @default(true)
  expiresAt       DateTime? // Contract expiration date
  renewalReminderSent Boolean @default(false)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @default(now()) @updatedAt
  
  acceptances     ContractAcceptance[]
  history         ContractHistory[]
  
  @@map("contracts")
}
```

### Enhanced ContractAcceptance Model
```prisma
model ContractAcceptance {
  id         String         @id @default(cuid())
  contractId String
  contract   Contract       @relation(fields: [contractId], references: [id], onDelete: Cascade)
  guideId    String
  guide      User           @relation(fields: [guideId], references: [id], onDelete: Cascade)
  status     ContractStatus @default(NOT_VIEWED)
  
  // E-Signature
  signatureUrl String? // URL to guide's signature image
  signedAt     DateTime?
  signedIp     String?
  
  viewedAt   DateTime?
  acceptedAt DateTime?
  rejectedAt DateTime?
  rejectionReason String? @db.Text
  
  createdAt  DateTime       @default(now())
  updatedAt  DateTime       @default(now()) @updatedAt
  
  @@unique([contractId, guideId])
  @@map("contract_acceptances")
}
```

### ContractHistory Model
```prisma
model ContractHistory {
  id         String   @id @default(cuid())
  contractId String
  contract   Contract @relation(fields: [contractId], references: [id], onDelete: Cascade)
  version    Int
  content    String   @db.Text
  changedBy  String?  // User ID who made changes
  changeNote String?  @db.Text
  createdAt  DateTime @default(now())
  
  @@index([contractId])
  @@map("contract_history")
}
```

## Business Rules

### Contract Creation
1. **From Template:**
   - Operator selects template
   - System replaces variables with actual values
   - Operator can customize before finalizing

2. **Custom Contract:**
   - Operator creates from scratch
   - Must include required legal clauses
   - Admin review for compliance (optional)

### E-Signature
1. **Operator Signature:**
   - Operator signs when creating contract
   - Signature captured (drawing or upload)
   - IP address and timestamp recorded

2. **Guide Signature:**
   - Guide signs when accepting contract
   - Signature captured
   - IP address and timestamp recorded
   - Legal validity proof generated

### Contract Acceptance
1. **View Contract:**
   - Guide must view contract before accepting
   - Track viewing time (minimum X seconds)

2. **Accept Contract:**
   - Guide provides e-signature
   - Contract becomes legally binding
   - Both parties receive signed copy

### Contract Management
1. **Version Control:**
   - Track all contract changes
   - Maintain history
   - Compare versions

2. **Renewal Reminders:**
   - Send reminder X days before expiration
   - Auto-create renewal contract
   - Track renewal history

## Implementation Plan

### Phase 1: Database & Models
1. Add ContractTemplate model
2. Enhance Contract model với e-signature fields
3. Enhance ContractAcceptance với e-signature
4. Add ContractHistory model
5. Create migration

### Phase 2: Services & Use Cases
1. ContractTemplateService - Manage templates
2. ContractService - Create, update contracts
3. ESignatureService - Handle signatures
4. CreateContractFromTemplateUseCase
5. SignContractUseCase
6. AcceptContractWithSignatureUseCase
7. ContractRenewalService

### Phase 3: Integration
1. Integrate với tour creation
2. Signature capture UI
3. Contract PDF generation
4. Renewal reminder cron job

### Phase 4: Test
1. Test template creation
2. Test contract creation from template
3. Test e-signature flow
4. Test contract acceptance
5. Test renewal reminders

