# Tax & Invoice Management Design Document

## Tổng quan

Hệ thống quản lý thuế và hóa đơn tự động cho các giao dịch trên platform, đảm bảo compliance với pháp luật Việt Nam.

## Tính năng

### 1. Invoice Generation
- **Automatic Invoice:**
  - Tự động tạo hóa đơn khi payment completed
  - Invoice cho tour payments
  - Invoice cho standby payments
  - Invoice cho platform fees

- **Invoice Types:**
  - Service Invoice (Dịch vụ hướng dẫn)
  - Standby Service Invoice
  - Platform Fee Invoice
  - Combined Invoice

### 2. Tax Calculation
- **VAT (VAT):**
  - 10% VAT cho dịch vụ du lịch
  - Tính trên gross amount
  - Có thể exempt cho một số trường hợp

- **Withholding Tax (Thuế thu nhập cá nhân):**
  - 5% cho freelance guides
  - 10% cho in-house guides (nếu chưa có hợp đồng lao động)
  - 0% nếu đã có hợp đồng lao động và đã khấu trừ tại nguồn

- **Tax Records:**
  - Track tất cả tax transactions
  - Export cho báo cáo thuế
  - Monthly/Quarterly tax reports

### 3. Invoice Management
- **Invoice Details:**
  - Invoice number (unique)
  - Invoice date
  - Due date
  - Payment terms
  - Line items
  - Tax breakdown
  - Total amount

- **Invoice Status:**
  - DRAFT
  - ISSUED
  - PAID
  - CANCELLED
  - OVERDUE

### 4. Compliance
- **Legal Requirements:**
  - Invoice format theo quy định VN
  - Tax codes
  - Company information
  - Digital signature

## Database Schema

### Invoice Model
```prisma
model Invoice {
  id              String        @id @default(cuid())
  invoiceNumber   String        @unique // Format: INV-YYYYMMDD-XXXX
  invoiceType     InvoiceType
  status          InvoiceStatus @default(DRAFT)
  
  // Parties
  issuerId        String        // Operator/Platform ID
  issuer          User          @relation("InvoiceIssuers", fields: [issuerId], references: [id])
  recipientId     String        // Guide/Operator ID
  recipient       User          @relation("InvoiceRecipients", fields: [recipientId], references: [id])
  
  // Related entities
  tourId          String?
  tour            Tour?         @relation(fields: [tourId], references: [id])
  paymentId       String?       @unique
  payment         Payment?      @relation(fields: [paymentId], references: [id])
  standbyRequestId String?
  standbyRequest  StandbyRequest? @relation(fields: [standbyRequestId], references: [id])
  
  // Amounts
  subtotal        Float         // Amount before tax
  vatAmount       Float         @default(0) // VAT (10%)
  withholdingTax  Float         @default(0) // Withholding tax (5% or 10%)
  totalAmount     Float         // Total after tax
  
  // Dates
  invoiceDate     DateTime      @default(now())
  dueDate         DateTime?
  paidAt          DateTime?
  
  // Invoice details
  lineItems       Json          // Array of line items
  notes           String?       @db.Text
  terms           String?       @db.Text
  
  // Tax information
  taxCode         String?       // Mã số thuế
  taxExempt       Boolean       @default(false)
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @default(now()) @updatedAt
  
  taxRecords      TaxRecord[]
  
  @@index([issuerId])
  @@index([recipientId])
  @@index([invoiceNumber])
  @@index([status])
  @@map("invoices")
}

enum InvoiceType {
  TOUR_SERVICE      // Dịch vụ hướng dẫn tour
  STANDBY_SERVICE   // Dịch vụ standby
  PLATFORM_FEE      // Phí platform
  COMBINED          // Hóa đơn kết hợp
}

enum InvoiceStatus {
  DRAFT
  ISSUED
  PAID
  CANCELLED
  OVERDUE
}
```

### TaxRecord Model
```prisma
model TaxRecord {
  id              String        @id @default(cuid())
  invoiceId       String
  invoice         Invoice       @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  
  taxType         TaxType
  taxRate         Float         // Percentage (e.g., 10 for 10%)
  taxableAmount   Float         // Amount subject to tax
  taxAmount       Float         // Calculated tax amount
  
  // Tax period
  taxPeriod       String        // Format: YYYY-MM (e.g., "2025-01")
  taxYear         Int           // Year
  
  // Reporting
  reported        Boolean       @default(false)
  reportedAt      DateTime?
  reportId        String?       // Reference to tax report
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @default(now()) @updatedAt
  
  @@index([invoiceId])
  @@index([taxPeriod])
  @@index([taxYear])
  @@map("tax_records")
}

enum TaxType {
  VAT              // Value Added Tax (10%)
  WITHHOLDING_TAX  // Thuế thu nhập cá nhân (5% or 10%)
}
```

## Business Rules

### Invoice Generation
1. **Automatic Generation:**
   - Invoice được tạo tự động khi payment status = COMPLETED
   - Invoice number được generate unique
   - Invoice date = payment completion date

2. **Invoice Types:**
   - TOUR_SERVICE: Khi payment cho tour guide service
   - STANDBY_SERVICE: Khi payment cho standby service
   - PLATFORM_FEE: Khi platform fee được charge
   - COMBINED: Khi có nhiều loại trong một invoice

### Tax Calculation
1. **VAT (10%):**
   - Áp dụng cho tất cả dịch vụ du lịch
   - Tính trên subtotal (gross amount)
   - Có thể exempt nếu có giấy chứng nhận

2. **Withholding Tax:**
   - 5% cho freelance guides (chưa có hợp đồng lao động)
   - 10% cho in-house guides chưa verify contract
   - 0% cho in-house guides đã verify contract

3. **Tax Records:**
   - Mỗi invoice có thể có nhiều tax records
   - Track theo tax period (month/year)
   - Export cho báo cáo thuế

### Invoice Status
1. **DRAFT:** Invoice đang được tạo
2. **ISSUED:** Invoice đã được phát hành
3. **PAID:** Invoice đã được thanh toán
4. **CANCELLED:** Invoice bị hủy
5. **OVERDUE:** Invoice quá hạn thanh toán

## Implementation Plan

### Phase 1: Database & Models
1. Add Invoice model
2. Add TaxRecord model
3. Add InvoiceType and InvoiceStatus enums
4. Add TaxType enum
5. Create migration

### Phase 2: Services & Use Cases
1. InvoiceService - Generate, update, manage invoices
2. TaxCalculationService - Calculate VAT and withholding tax
3. GenerateInvoiceUseCase - Auto-generate invoice from payment
4. UpdateInvoiceStatusUseCase - Update invoice status
5. ExportTaxReportUseCase - Export tax reports

### Phase 3: Integration
1. Integrate với payment completion flow
2. Auto-generate invoice khi payment completed
3. Tax calculation tự động
4. Invoice PDF generation

### Phase 4: Test
1. Test invoice generation
2. Test tax calculation
3. Test invoice status updates
4. Test tax report export

