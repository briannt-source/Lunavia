import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/finance/revenue — Revenue ledger for admin
 * 
 * Aggregates platform revenue from:
 * - Payment.platformFee (commission from tour payments)
 * - WalletTransaction with type DEBIT + reason SYSTEM_ADJUSTMENT (misc revenue)
 * 
 * Returns { items: LedgerEntry[], total, totalPages }
 */
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const role = (session.user as any).role;
        if (!["SUPER_ADMIN", "OPS", "ADMIN_SUPER_ADMIN", "ADMIN_OPS"].includes(role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "50");
        const typeFilter = searchParams.get("type");
        const skip = (page - 1) * limit;

        // Build revenue entries from Payment model (commission fees)
        const paymentWhere: any = {
            platformFee: { gt: 0 },
            status: "COMPLETED",
        };

        const [payments, paymentCount] = await Promise.all([
            prisma.payment.findMany({
                where: paymentWhere,
                include: {
                    tour: { select: { title: true } },
                    fromWallet: {
                        select: {
                            user: {
                                select: {
                                    email: true,
                                    profile: { select: { name: true } },
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.payment.count({ where: paymentWhere }),
        ]);

        // Map payments to ledger entries
        const items = payments.map((p) => {
            const revenueType = p.isFreelance ? "COMMISSION_FEE" : "COMMISSION_FEE";

            // Skip if type filter doesn't match
            if (typeFilter && typeFilter !== revenueType) return null;

            return {
                id: p.id,
                walletId: p.fromWalletId,
                operatorId: "",
                operatorEmail: p.fromWallet?.user?.email || "—",
                operatorName: p.fromWallet?.user?.profile?.name || null,
                direction: "CREDIT" as const,
                type: revenueType,
                amount: p.platformFee,
                referenceId: p.tourId || p.refId || null,
                metadata: {
                    tourTitle: p.tour?.title || null,
                    grossAmount: p.amount,
                    netAmount: p.netAmount,
                    isFreelance: p.isFreelance,
                },
                createdAt: p.createdAt.toISOString(),
            };
        }).filter(Boolean);

        const total = typeFilter ? items.length : paymentCount;
        const totalPages = Math.ceil(total / limit) || 1;

        return NextResponse.json({
            items,
            total,
            totalPages,
        });
    } catch (error: any) {
        console.error("[admin/finance/revenue] Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
