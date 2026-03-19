import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function OperatorInsightsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect('/login');

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { verificationStatus: true }
    });

    // Verification Gate
    const isVerified = user?.verificationStatus === 'APPROVED';

    if (!isVerified) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-900">Operations Insights</h1>
                <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 mb-4">
                        <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Analytics Locked</h2>
                    <p className="text-gray-600 max-w-md mx-auto mb-6">
                        Complete your account verification to access detailed operational analytics, revenue reports, and trust scores.
                    </p>
                    <a href="/dashboard/operator/verification" className="inline-flex items-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700">
                        Complete Verification
                    </a>
                </div>
            </div>
        );
    }

    // Fetch Metrics using Tour model
    const operatorId = session.user.id;

    const [completedTours, totalTours] = await Promise.all([
        prisma.tour.count({ where: { operatorId, status: 'COMPLETED' } }),
        prisma.tour.count({ where: { operatorId } })
    ]);

    // Calculate total payouts from payments
    const totalPayments = await prisma.payment.aggregate({
        where: { tour: { operatorId }, status: 'COMPLETED' },
        _sum: { amount: true }
    });

    const completionRate = totalTours > 0 ? ((completedTours / totalTours) * 100).toFixed(1) : 0;
    const spentAmount = totalPayments._sum.amount || 0;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Operations Insights</h1>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-2 font-medium text-gray-500">Total Payouts</h3>
                    <p className="text-3xl font-bold text-gray-900">{Number(spentAmount).toLocaleString()} ₫</p>
                    <div className="text-xs text-gray-400 mt-2">Paid to guides</div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-2 font-medium text-gray-500">Completion Rate</h3>
                    <p className="text-3xl font-bold text-gray-900">{completionRate}%</p>
                    <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: `${completionRate}%` }} />
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-2 font-medium text-gray-500">Total Tours</h3>
                    <p className="text-3xl font-bold text-gray-900">{totalTours}</p>
                    <div className="text-xs text-gray-400 mt-2">{completedTours} completed</div>
                </div>
            </div>
        </div>
    );
}
