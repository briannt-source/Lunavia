import { prisma } from "@/lib/prisma";

/**
 * Generate unique invoice number
 * Format: INV-YYYYMMDD-XXXX
 * Example: INV-20250115-0001
 */
export async function generateInvoiceNumber(): Promise<string> {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const datePrefix = `${year}${month}${day}`;
  const baseCode = `INV-${datePrefix}`;

  // Find the highest sequence number for today
  const todayInvoices = await prisma.invoice.findMany({
    where: {
      invoiceNumber: {
        startsWith: baseCode,
      },
    },
    orderBy: {
      invoiceNumber: "desc",
    },
    take: 1,
  });

  let sequence = 1;
  if (todayInvoices.length > 0) {
    const lastNumber = todayInvoices[0].invoiceNumber;
    const lastSequence = parseInt(lastNumber.split("-")[2] || "0");
    sequence = lastSequence + 1;
  }

  const number = `${baseCode}-${String(sequence).padStart(4, "0")}`;

  // Double check uniqueness
  const existing = await prisma.invoice.findUnique({
    where: { invoiceNumber: number },
  });

  if (existing) {
    return generateInvoiceNumberWithSequence(baseCode, sequence + 1);
  }

  return number;
}

/**
 * Generate invoice number with specific sequence number
 */
async function generateInvoiceNumberWithSequence(
  baseCode: string,
  sequence: number
): Promise<string> {
  const number = `${baseCode}-${String(sequence).padStart(4, "0")}`;

  const existing = await prisma.invoice.findUnique({
    where: { invoiceNumber: number },
  });

  if (existing) {
    return generateInvoiceNumberWithSequence(baseCode, sequence + 1);
  }

  return number;
}

