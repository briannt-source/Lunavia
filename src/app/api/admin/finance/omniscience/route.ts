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
            // Wallets
            wallets,
            walletCount,

            // Pending Transactions
            pendingWithdrawals,
            pendingTopups,

            // Completed this month
            completedWithdrawalsMonth,
            completedTopupsMonth,

            // Escrow
            activeEscrows,
        ] = await Promise.all([
            // Top wallets by balance
            prisma.wallet.findMany({
                take: 10,
                orderBy: { balance: 'desc' },
                include: { user: { select: { id: true, email: true } } },
            }),
            prisma.wallet.count(),

            // Pending withdrawals/topups
            prisma.withdrawalRequest.aggregate({ where: { status: 'PENDING' }, _sum: { amount: true }, _count: { id: true } }),
            prisma.topUpRequest.aggregate({ where: { status: 'PENDING' }, _sum: { amount: true }, _count: { id: true } }),

            // Completed this month
            prisma.withdrawalRequest.aggregate({ where: { status: 'APPROVED', createdAt: { gte: startOfMonth } }, _sum: { amount: true } }),
            prisma.topUpRequest.aggregate({ where: { status: 'APPROVED', createdAt: { gte: startOfMonth } }, _sum: { amount: true } }),

            // Active escrow accounts
            prisma.escrowAccount.findMany({
                where: { status: 'HELD' },
                select: { id: true, amount: true, tourId: true, createdAt: true, tour: { select: { title: true, operatorId: true } } },
                orderBy: { createdAt: 'desc' },
                take: 15,
            }),
        ]);

        const totalAvailable = wallets.reduce((acc, w) => acc + Number(w.balance), 0);

        return NextResponse.json({
            success: true,
            data: {
                system: {
                    walletCount,
                    totalAvailableEstimated: totalAvailable,
                },
                pending: {
                    withdrawalsCount: pendingWithdrawals._count.id,
                    withdrawalsAmount: Number(pendingWithdrawals._sum.amount || 0),
                    topupsCount: pendingTopups._count.id,
                    topupsAmount: Number(pendingTopups._sum.amount || 0),
                },
                monthlyFlow: {
                    withdrawals: Number(completedWithdrawalsMonth._sum.amount || 0),
                    topups: Number(completedTopupsMonth._sum.amount || 0),
                },
                topWallets: wallets.map(w => ({
                    id: w.id,
                    ownerEmail: w.user.email || 'Unknown',
                    available: Number(w.balance),
                })),
                activeEscrowHolds: activeEscrows.map(h => ({
                    id: h.id,
                    amount: Number(h.amount),
                    title: h.tour?.title || 'Unknown tour',
                    heldAt: h.createdAt,
                })),
                timestamp: now.toISOString(),
            },
        });
    } catch (error: any) {
        console.error('Financial omniscience API error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
