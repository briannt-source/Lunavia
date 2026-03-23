import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/escrow/withdrawals — List withdrawal requests for admin review
 * Returns { items: WithdrawRequest[], stats: { pending, approved, rejected, totalAmount } }
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
        const statusFilter = searchParams.get("status");

        const where: any = {};
        if (statusFilter && ["PENDING", "APPROVED", "REJECTED"].includes(statusFilter)) {
            where.status = statusFilter;
        }

        const [requests, pendingCount, approvedCount, rejectedCount, totalApproved] = await Promise.all([
            prisma.withdrawalRequest.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            profile: { select: { name: true } },
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                take: 200,
            }),
            prisma.withdrawalRequest.count({ where: { status: "PENDING" } }),
            prisma.withdrawalRequest.count({ where: { status: "APPROVED" } }),
            prisma.withdrawalRequest.count({ where: { status: "REJECTED" } }),
            prisma.withdrawalRequest.aggregate({
                where: { status: "APPROVED" },
                _sum: { amount: true },
            }),
        ]);

        const items = requests.map((r) => {
            // Parse customAccountInfo for bank details
            let bankInfo: any = {};
            if (r.customAccountInfo) {
                try {
                    bankInfo = typeof r.customAccountInfo === "string"
                        ? JSON.parse(r.customAccountInfo)
                        : r.customAccountInfo;
                } catch { /* ignore */ }
            }

            return {
                id: r.id,
                operatorId: r.userId,
                operatorEmail: r.user?.email || "—",
                operatorName: r.user?.profile?.name || null,
                amount: r.amount,
                currency: "VND",
                bankName: bankInfo.bankName || bankInfo.bank_name || r.method || "—",
                accountNumber: bankInfo.accountNumber || bankInfo.account_number || "—",
                accountName: r.accountOwnerName || bankInfo.accountName || bankInfo.account_name || "—",
                status: r.status,
                reviewedBy: null,
                reviewedByEmail: null,
                reviewedAt: r.processedAt?.toISOString() || null,
                rejectionReason: null,
                internalNotes: r.adminNotes || null,
                proofUrl: bankInfo.proofUrl || bankInfo.proof_url || null,
                createdAt: r.createdAt.toISOString(),
            };
        });

        return NextResponse.json({
            items,
            stats: {
                pending: pendingCount,
                approved: approvedCount,
                rejected: rejectedCount,
                totalAmount: totalApproved._sum.amount || 0,
            },
        });
    } catch (error: any) {
        console.error("[admin/escrow/withdrawals] Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
