import { prisma } from "@/lib/prisma";
import { InvoiceType, InvoiceStatus } from "@prisma/client";
import { generateInvoiceNumber } from "@/lib/invoice-number-generator";
import { TaxCalculationService, TaxCalculationInput } from "./tax-calculation.service";

export interface CreateInvoiceInput {
  invoiceType: InvoiceType;
  issuerId: string;
  recipientId: string;
  tourId?: string;
  paymentId?: string;
  standbyRequestId?: string;
  subtotal: number;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
  taxCalculation: TaxCalculationInput;
  notes?: string;
  terms?: string;
  taxCode?: string;
  dueDate?: Date;
}

export class InvoiceService {
  /**
   * Create invoice from payment
   */
  static async createInvoiceFromPayment(input: CreateInvoiceInput) {
    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber();

    // Calculate taxes
    const taxCalculation = TaxCalculationService.calculateTaxes(
      input.taxCalculation
    );

    // Determine invoice type if not provided
    let invoiceType = input.invoiceType;
    if (!invoiceType) {
      if (input.tourId) {
        invoiceType = InvoiceType.TOUR_SERVICE;
      } else if (input.standbyRequestId) {
        invoiceType = InvoiceType.STANDBY_SERVICE;
      } else {
        invoiceType = InvoiceType.PLATFORM_FEE;
      }
    }

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        invoiceType,
        status: InvoiceStatus.ISSUED,
        issuerId: input.issuerId,
        recipientId: input.recipientId,
        tourId: input.tourId,
        paymentId: input.paymentId,
        standbyRequestId: input.standbyRequestId,
        subtotal: taxCalculation.subtotal,
        vatAmount: taxCalculation.vatAmount,
        withholdingTax: taxCalculation.withholdingTax,
        totalAmount: taxCalculation.totalAmount,
        lineItems: input.lineItems,
        notes: input.notes,
        terms: input.terms,
        taxCode: input.taxCode,
        dueDate: input.dueDate,
        invoiceDate: new Date(),
      },
    });

    // Create tax records
    const taxPeriod = TaxCalculationService.getTaxPeriod(new Date());
    const taxYear = TaxCalculationService.getTaxYear(new Date());

    for (const taxRecord of taxCalculation.taxRecords) {
      await prisma.taxRecord.create({
        data: {
          invoiceId: invoice.id,
          taxType: taxRecord.taxType,
          taxRate: taxRecord.taxRate,
          taxableAmount: taxRecord.taxableAmount,
          taxAmount: taxRecord.taxAmount,
          taxPeriod,
          taxYear,
        },
      });
    }

    return invoice;
  }

  /**
   * Update invoice status
   */
  static async updateInvoiceStatus(
    invoiceId: string,
    status: InvoiceStatus,
    paidAt?: Date
  ) {
    return prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status,
        paidAt: status === InvoiceStatus.PAID ? (paidAt || new Date()) : null,
      },
    });
  }

  /**
   * Get invoice by ID
   */
  static async getInvoiceById(invoiceId: string) {
    return prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        issuer: {
          include: {
            profile: true,
          },
        },
        recipient: {
          include: {
            profile: true,
          },
        },
        tour: {
          select: {
            id: true,
            title: true,
            code: true,
          },
        },
        payment: {
          select: {
            id: true,
            amount: true,
            status: true,
          },
        },
        taxRecords: true,
      },
    });
  }

  /**
   * Get invoices for user
   */
  static async getInvoicesForUser(
    userId: string,
    options?: {
      status?: InvoiceStatus;
      type?: InvoiceType;
      limit?: number;
      offset?: number;
    }
  ) {
    const where: any = {
      OR: [
        { issuerId: userId },
        { recipientId: userId },
      ],
    };

    if (options?.status) {
      where.status = options.status;
    }

    if (options?.type) {
      where.invoiceType = options.type;
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        issuer: {
          include: {
            profile: true,
          },
        },
        recipient: {
          include: {
            profile: true,
          },
        },
        tour: {
          select: {
            id: true,
            title: true,
            code: true,
          },
        },
      },
      orderBy: {
        invoiceDate: "desc",
      },
      take: options?.limit,
      skip: options?.offset,
    });

    const total = await prisma.invoice.count({ where });

    return {
      invoices,
      total,
    };
  }

  /**
   * Get tax records for period
   */
  static async getTaxRecordsForPeriod(
    userId: string,
    taxPeriod: string,
    taxYear: number
  ) {
    return prisma.taxRecord.findMany({
      where: {
        invoice: {
          OR: [
            { issuerId: userId },
            { recipientId: userId },
          ],
        },
        taxPeriod,
        taxYear,
      },
      include: {
        invoice: {
          include: {
            issuer: {
              include: {
                profile: true,
              },
            },
            recipient: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}

