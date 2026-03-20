import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { InvoiceService } from "@/domain/services/invoice.service";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/finance/invoice/[txId]
 * Get invoice data for a wallet transaction or invoice ID
 * Used by the /invoice/[txId] page
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ txId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { txId } = await params;

    // First try to find by invoice ID
    const invoiceById = await InvoiceService.getInvoiceById(txId);
    if (invoiceById) {
      // Check access: must be issuer or recipient
      if (
        invoiceById.issuerId !== session.user.id &&
        invoiceById.recipientId !== session.user.id &&
        session.user.role !== "ADMIN" &&
        session.user.role !== "SUPER_ADMIN"
      ) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }

      return NextResponse.json(formatInvoiceResponse(invoiceById));
    }

    // Fall back to building invoice from wallet transaction
    const transaction = await prisma.walletTransaction.findUnique({
      where: { id: txId },
      include: {
        wallet: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                role: true,
                profile: { select: { name: true } },
                company: {
                  select: {
                    name: true,
                    address: true,
                    businessLicenseNumber: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // Access check
    if (
      transaction.wallet.userId !== session.user.id &&
      session.user.role !== "ADMIN" &&
      session.user.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const user = transaction.wallet.user;
    const userName = user?.profile?.name || user?.email || "N/A";

    return NextResponse.json({
      invoiceNumber: `TXN-${transaction.id.slice(-8).toUpperCase()}`,
      transactionId: transaction.id,
      type: transaction.type,
      amount: transaction.amount,
      status: "COMPLETED",
      description: transaction.reason,
      createdAt: transaction.createdAt,
      processedAt: transaction.createdAt,
      currency: "VND",
      operator: {
        name: user?.company?.name || userName,
        email: user?.email || "N/A",
        legalAddress: user?.company?.address || null,
        licenseNumber: user?.company?.businessLicenseNumber || null,
      },
      tour: null,
      guide: null,
      platformFee: null,
      guidePayout: null,
    });
  } catch (error: any) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

function formatInvoiceResponse(invoice: any) {
  return {
    invoiceNumber: invoice.invoiceNumber,
    transactionId: invoice.paymentId || invoice.id,
    type: invoice.invoiceType,
    amount: invoice.totalAmount,
    status: invoice.status,
    description: invoice.notes,
    createdAt: invoice.createdAt,
    processedAt: invoice.paidAt,
    currency: "VND",
    operator: {
      name: invoice.issuer?.profile?.name || invoice.issuer?.email || "N/A",
      email: invoice.issuer?.email || "N/A",
      legalAddress: null,
      licenseNumber: null,
    },
    tour: invoice.tour
      ? {
          id: invoice.tour.id,
          title: invoice.tour.title,
          location: invoice.tour.location || "",
          province: invoice.tour.province || null,
          startTime: invoice.tour.startDate,
          endTime: invoice.tour.endDate,
          totalPayout: invoice.totalAmount,
        }
      : null,
    guide: invoice.recipient
      ? {
          name: invoice.recipient?.profile?.name || invoice.recipient?.email,
          email: invoice.recipient?.email,
        }
      : null,
    platformFee: invoice.subtotal !== invoice.totalAmount
      ? invoice.totalAmount - invoice.subtotal
      : null,
    guidePayout: invoice.subtotal,
  };
}
