import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧪 Testing Tax & Invoice Management System...\n");

  try {
    // 1. Setup test users
    console.log("1️⃣ Setting up test users...");

    let operator = await prisma.user.findUnique({
      where: { email: "operator-tax@lunavia.com" },
      include: { wallet: true, profile: true },
    });

    if (!operator) {
      operator = await prisma.user.create({
        data: {
          email: "operator-tax@lunavia.com",
          password: "hashed_password",
          role: "TOUR_OPERATOR",
          profile: {
            create: {
              name: "Test Operator",
            },
          },
          wallet: {
            create: {
              balance: 10000000,
              lockedDeposit: 1000000,
            },
          },
        },
        include: { wallet: true, profile: true },
      });
    }

    let guide = await prisma.user.findUnique({
      where: { email: "guide-tax@lunavia.com" },
      include: { wallet: true, profile: true },
    });

    if (!guide) {
      guide = await prisma.user.create({
        data: {
          email: "guide-tax@lunavia.com",
          password: "hashed_password",
          role: "TOUR_GUIDE",
          profile: {
            create: {
              name: "Test Guide",
            },
          },
          wallet: {
            create: {
              balance: 1000000,
            },
          },
        },
        include: { wallet: true, profile: true },
      });
    }

    console.log(`✅ Operator: ${operator.email} (ID: ${operator.id})`);
    console.log(`✅ Guide: ${guide.email} (ID: ${guide.id})\n`);

    // 2. Test tax calculation
    console.log("2️⃣ Testing tax calculation...");
    const { TaxCalculationService } = await import("../src/domain/services/tax-calculation.service");

    // Test freelance guide
    const freelanceTax = TaxCalculationService.calculateTaxes({
      subtotal: 3000000, // 3M VND
      isFreelance: true,
    });

    console.log(`✅ Freelance Guide Tax Calculation:`);
    console.log(`   - Subtotal: ${freelanceTax.subtotal.toLocaleString("vi-VN")} VND`);
    console.log(`   - VAT (10%): ${freelanceTax.vatAmount.toLocaleString("vi-VN")} VND`);
    console.log(`   - Withholding Tax (5%): ${freelanceTax.withholdingTax.toLocaleString("vi-VN")} VND`);
    console.log(`   - Total: ${freelanceTax.totalAmount.toLocaleString("vi-VN")} VND`);
    console.log(`   - Tax Records: ${freelanceTax.taxRecords.length}\n`);

    // Test in-house guide with verified contract
    const inHouseVerifiedTax = TaxCalculationService.calculateTaxes({
      subtotal: 3000000,
      isFreelance: false,
      hasVerifiedContract: true,
    });

    console.log(`✅ In-House Guide (Verified) Tax Calculation:`);
    console.log(`   - Subtotal: ${inHouseVerifiedTax.subtotal.toLocaleString("vi-VN")} VND`);
    console.log(`   - VAT (10%): ${inHouseVerifiedTax.vatAmount.toLocaleString("vi-VN")} VND`);
    console.log(`   - Withholding Tax (0%): ${inHouseVerifiedTax.withholdingTax.toLocaleString("vi-VN")} VND`);
    console.log(`   - Total: ${inHouseVerifiedTax.totalAmount.toLocaleString("vi-VN")} VND\n`);

    // 3. Create invoice
    console.log("3️⃣ Creating invoice...");
    const { InvoiceService } = await import("../src/domain/services/invoice.service");

    const invoice = await InvoiceService.createInvoiceFromPayment({
      invoiceType: "TOUR_SERVICE",
      issuerId: operator.id,
      recipientId: guide.id,
      subtotal: 3000000,
      lineItems: [
        {
          description: "Dịch vụ hướng dẫn tour",
          quantity: 1,
          unitPrice: 3000000,
          amount: 3000000,
        },
      ],
      taxCalculation: {
        subtotal: 3000000,
        isFreelance: true,
      },
      notes: "Invoice for tour guide service",
      terms: "Payment due within 30 days",
    });

    console.log(`✅ Invoice created:`);
    console.log(`   - Invoice Number: ${invoice.invoiceNumber}`);
    console.log(`   - Type: ${invoice.invoiceType}`);
    console.log(`   - Status: ${invoice.status}`);
    console.log(`   - Subtotal: ${invoice.subtotal.toLocaleString("vi-VN")} VND`);
    console.log(`   - VAT: ${invoice.vatAmount.toLocaleString("vi-VN")} VND`);
    console.log(`   - Withholding Tax: ${invoice.withholdingTax.toLocaleString("vi-VN")} VND`);
    console.log(`   - Total: ${invoice.totalAmount.toLocaleString("vi-VN")} VND\n`);

    // 4. Get invoice with tax records
    console.log("4️⃣ Getting invoice with tax records...");
    const invoiceWithTax = await InvoiceService.getInvoiceById(invoice.id);

    console.log(`✅ Invoice details:`);
    console.log(`   - Tax Records: ${invoiceWithTax?.taxRecords.length || 0}`);
    invoiceWithTax?.taxRecords.forEach((record) => {
      console.log(`     * ${record.taxType}: ${record.taxRate}% = ${record.taxAmount.toLocaleString("vi-VN")} VND`);
    });
    console.log();

    // 5. Update invoice status
    console.log("5️⃣ Updating invoice status to PAID...");
    const updatedInvoice = await InvoiceService.updateInvoiceStatus(
      invoice.id,
      "PAID"
    );

    console.log(`✅ Invoice status updated:`);
    console.log(`   - Status: ${updatedInvoice.status}`);
    console.log(`   - Paid At: ${updatedInvoice.paidAt}\n`);

    // 6. Get invoices for user
    console.log("6️⃣ Getting invoices for guide...");
    const guideInvoices = await InvoiceService.getInvoicesForUser(guide.id);

    console.log(`✅ Found ${guideInvoices.total} invoices for guide\n`);

    // 7. Get tax records for period
    console.log("7️⃣ Getting tax records for current period...");
    const taxPeriod = TaxCalculationService.getTaxPeriod(new Date());
    const taxYear = TaxCalculationService.getTaxYear(new Date());

    const taxRecords = await InvoiceService.getTaxRecordsForPeriod(
      guide.id,
      taxPeriod,
      taxYear
    );

    console.log(`✅ Found ${taxRecords.length} tax records for period ${taxPeriod}\n`);

    console.log("✅ All tests completed successfully!\n");
    console.log("📊 Summary:");
    console.log(`   - Invoice: ${invoice.id}`);
    console.log(`   - Invoice Number: ${invoice.invoiceNumber}`);
    console.log(`   - Tax calculation: ✅`);
    console.log(`   - Invoice creation: ✅`);
    console.log(`   - Tax records: ✅`);
    console.log(`   - Invoice status update: ✅`);

  } catch (error: any) {
    console.error("❌ Test failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();

