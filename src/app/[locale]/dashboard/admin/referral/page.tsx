import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export const metadata = { title: 'Referral System — Lunavia' };

export default async function AdminReferralPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect('/login');

    const userRole = session.user.role;
    if (!['SUPER_ADMIN', 'OPS', 'FINANCE'].includes(userRole)) redirect('/dashboard');

    // Fetch referral data
    const [referrals, referralCount] = await Promise.all([
        prisma.userReferral.findMany({
            take: 50,
            orderBy: { createdAt: 'desc' },
            include: {
                referrer: { select: { id: true, name: true, email: true } },
                referred: { select: { id: true, name: true, email: true, createdAt: true } },
            },
        }),
        prisma.userReferral.count(),
    ]);

    // Compute top referrers from fetched data
    const referrerCounts: Record<string, { count: number; name: string; email: string }> = {};
    for (const ref of referrals) {
        const id = ref.referrerUserId;
        if (!referrerCounts[id]) {
            referrerCounts[id] = { count: 0, name: ref.referrer?.name || 'Unnamed', email: ref.referrer?.email || '' };
        }
        referrerCounts[id].count++;
    }
    const topReferrers = Object.entries(referrerCounts)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 10);
    const topReferrerName = topReferrers[0]?.[1]?.name || topReferrers[0]?.[1]?.email || 'None yet';
    const topReferrerCount = topReferrers[0]?.[1]?.count || 0;

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Referral System</h1>
                <p className="text-sm text-gray-500 mt-1">Track referral signups and top referrers.</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Referrals</div>
                    <div className="text-3xl font-black text-gray-900 mt-1">{referralCount}</div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Unique Referrers</div>
                    <div className="text-3xl font-black text-gray-900 mt-1">{topReferrers.length}</div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Top Referrer</div>
                    <div className="text-lg font-bold text-gray-900 mt-1 truncate">{topReferrerName}</div>
                    {topReferrerCount > 0 && (
                        <div className="text-xs text-indigo-600 font-semibold mt-0.5">{topReferrerCount} referrals</div>
                    )}
                </div>
            </div>

            {/* Top Referrers */}
            {topReferrers.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <h2 className="text-sm font-bold text-gray-900 mb-4">🏆 Top Referrers</h2>
                    <div className="space-y-3">
                        {topReferrers.map(([id, data], i) => (
                            <div key={id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                <div className="flex items-center gap-3">
                                    <span className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
                                        i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-500'
                                    }`}>
                                        {i + 1}
                                    </span>
                                    <div>
                                        <div className="text-sm font-semibold text-gray-900">{data.name}</div>
                                        <div className="text-xs text-gray-500">{data.email}</div>
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-indigo-600">{data.count} referrals</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Referrals Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-sm font-bold text-gray-900">Recent Referrals</h2>
                </div>
                {referrals.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm">No referrals recorded yet.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="text-left px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Referrer</th>
                                    <th className="text-left px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">New User</th>
                                    <th className="text-left px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {referrals.map((ref: any) => (
                                    <tr key={ref.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                        <td className="px-6 py-3">
                                            <div className="font-semibold text-gray-900">{ref.referrer?.name || 'Unnamed'}</div>
                                            <div className="text-xs text-gray-500">{ref.referrer?.email}</div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="font-semibold text-gray-900">{ref.referred?.name || 'Unnamed'}</div>
                                            <div className="text-xs text-gray-500">{ref.referred?.email}</div>
                                        </td>
                                        <td className="px-6 py-3 text-gray-500">
                                            {new Date(ref.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
