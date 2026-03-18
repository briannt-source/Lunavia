import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/finance/omniscience
 * 
 * Access: SUPER_ADMIN, FINANCE
 * Returns: Platform ledger metrics, current escrow states, pending payouts,
 *          and top wallet balances for the Financial Omniscience Dashboard.
 */
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = session.user.role;
    if (!['SUPER_ADMIN', 'FINANCE'].includes(role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    try {
        const [
            // Wallets & Escrow
            wallets,
            walletCount,

            // Transactions
            pendingWithdrawals,
            pendingTopups,
            completedWithdrawalsMonth,
            completedTopupsMonth,

            // Platform Revenue
            subscriptionRevenueMonth,
            totalSubscriptionRevenue,
        ] = await Promise.all([
            // Top wallets by available + pending balance
            prisma.operatorWallet.findMany({
                take: 10,
                orderBy: { availableBalance: 'desc' },
                include: { operator: { select: { id: true, name: true, email: true } } },
            }),
            prisma.operatorWallet.count(),

            // Pending transactions
            prisma.escrowWithdrawRequest.aggregate({ where: { status: 'PENDING' }, _sum: { amount: true }, _count: { id: true } }),
            prisma.escrowTopUpRequest.aggregate({ where: { status: 'PENDING' }, _sum: { amount: true }, _count: { id: true } }),

            // Completed transactions this month
            prisma.escrowWithdrawRequest.aggregate({ where: { status: 'COMPLETED', createdAt: { gte: startOfMonth } }, _sum: { amount: true } }),
            prisma.escrowTopUpRequest.aggregate({ where: { status: 'COMPLETED', createdAt: { gte: startOfMonth } }, _sum: { amount: true } }),

            // Subscriptions
            prisma.subscriptionPaymentRequest.aggregate({ where: { status: 'APPROVED', approvedAt: { gte: startOfMonth } }, _sum: { amount: true } }),
            prisma.subscriptionPaymentRequest.aggregate({ where: { status: 'APPROVED' }, _sum: { amount: true } }),
        ]);

        const totalAvailable = wallets.reduce((acc, w) => acc + w.availableBalance, 0);
        const totalPending = wallets.reduce((acc, w) => acc + w.pendingBalance, 0);

        // Active Escrow Holds
        const activeEscrowHolds = await prisma.serviceRequest.findMany({
            where: { escrowStatus: 'HELD' },
            select: { id: true, title: true, totalPayout: true, escrowHeldAt: true, operator: { select: { name: true } } },
            orderBy: { escrowHeldAt: 'desc' },
            take: 15,
        });

        return NextResponse.json({
            success: true,
            data: {
                system: {
                    walletCount,
                    totalAvailableEstimated: totalAvailable,
                    totalPendingEstimated: totalPending,
                },
                pending: {
                    withdrawalsCount: pendingWithdrawals._count.id,
                    withdrawalsAmount: pendingWithdrawals._sum.amount || 0,
                    topupsCount: pendingTopups._count.id,
                    topupsAmount: pendingTopups._sum.amount || 0,
                },
                monthlyFlow: {
                    withdrawals: completedWithdrawalsMonth._sum.amount || 0,
                    topups: completedTopupsMonth._sum.amount || 0,
                    subscriptions: subscriptionRevenueMonth._sum.amount || 0,
                },
                revenue: {
                    totalSubscriptions: totalSubscriptionRevenue._sum.amount || 0,
                },
                topWallets: wallets.map(w => ({
                    id: w.id,
                    operatorName: w.operator.name || w.operator.email || 'Unknown',
                    available: w.availableBalance,
                    pending: w.pendingBalance,
                })),
                activeEscrowHolds: activeEscrowHolds.map(h => ({
                    id: h.id,
                    amount: h.totalPayout || 0,
                    title: h.title,
                    operatorName: h.operator?.name || 'Unknown',
                    heldAt: h.escrowHeldAt,
                })),
                timestamp: now.toISOString(),
            },
        });
    } catch (error: any) {
        console.error('Financial omniscience API error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
