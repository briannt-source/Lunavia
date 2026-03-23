import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/escrow/topups — List top-up requests for admin review
 * Returns { items: TopUpRequest[], stats: { pending, approved, rejected, totalAmount } }
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
            prisma.topUpRequest.findMany({
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
            prisma.topUpRequest.count({ where: { status: "PENDING" } }),
            prisma.topUpRequest.count({ where: { status: "APPROVED" } }),
            prisma.topUpRequest.count({ where: { status: "REJECTED" } }),
            prisma.topUpRequest.aggregate({
                where: { status: "APPROVED" },
                _sum: { amount: true },
            }),
        ]);

        const items = requests.map((r) => {
            // Try to parse customAccountInfo for bank details
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
                proofUrl: bankInfo.proofUrl || bankInfo.proof_url || null,
                paymentReference: r.method || null,
                notes: bankInfo.notes || null,
                status: r.status,
                reviewedBy: null,
                reviewedByEmail: null,
                reviewedAt: r.processedAt?.toISOString() || null,
                rejectionReason: null,
                internalNotes: r.adminNotes || null,
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
        console.error("[admin/escrow/topups] Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
