import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { BaseDashboardLayout } from '@/components/layout/BaseDashboardLayout';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export const metadata = { title: 'Profile — Lunavia' };

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect('/login');

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { verificationSubmission: true, operatorWallet: true, role: true },
    });

    if (!user) redirect('/login');

    const verificationStatus = user.kybStatus || 'NOT_STARTED';
    const plan = user.plan || 'FREE';
    const planExpiresAt = user.planExpiresAt;
    const walletBalance = user.operatorWallet?.availableBalance || 0;

    const [createdToursCount, completedToursCount, teamSize, successRate] = await Promise.all([
        prisma.serviceRequest.count({ where: { operatorId: user.id } }),
        prisma.serviceRequest.count({ where: { operatorId: user.id, status: 'COMPLETED' } }),
        prisma.teamInvitation.count({ where: { operatorId: user.id, status: 'ACCEPTED' } }),
        prisma.serviceRequest.count({ where: { operatorId: user.id, status: { in: ['COMPLETED', 'CLOSED'] } } })
            .then(async completed => {
                const total = await prisma.serviceRequest.count({
                    where: { operatorId: user.id, status: { notIn: ['DRAFT'] } }
                });
                const forceMajeureCancels = await prisma.serviceRequest.count({
                    where: { operatorId: user.id, status: 'CANCELLED', closeReason: 'FORCE_MAJEURE' }
                });
                // Fallback check: cancellationReason is used for mutual/force cancels
                const mutualForceMajeureCancels = await prisma.serviceRequest.count({
                    where: { operatorId: user.id, status: 'CANCELLED', cancellationReason: 'FORCE_MAJEURE' }
                });
                
                const validTotal = Math.max(0, total - forceMajeureCancels - mutualForceMajeureCancels);
                return validTotal > 0 ? Math.round((completed / validTotal) * 100) : 0;
            })
    ]);

    const verif = {
        NOT_STARTED: { color: 'bg-gray-100 text-gray-600', icon: '○', label: 'Not Started' },
        PENDING: { color: 'bg-amber-100 text-amber-700', icon: '⏳', label: 'Under Review' },
        APPROVED: { color: 'bg-emerald-100 text-emerald-700', icon: '✓', label: 'Verified' },
        REJECTED: { color: 'bg-red-100 text-red-700', icon: '✕', label: 'Rejected' },
    }[verificationStatus] || { color: 'bg-gray-100 text-gray-600', icon: '○', label: verificationStatus };

    return (
        <BaseDashboardLayout
            header={
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Manage your account information</p>
                </div>
            }
        >
            <div className="max-w-3xl mx-auto space-y-6">
                {/* ── Profile Header ────────────────────── */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="h-28 bg-gradient-to-r from-indigo-500 to-purple-600" />
                    <div className="px-6 pb-6 -mt-12">
                        <div className="flex items-end gap-5">
                            <div className="h-20 w-20 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center text-2xl font-bold text-indigo-600 shrink-0 overflow-hidden relative">
                                {user.avatarUrl ? (
                                    <img src={user.avatarUrl} alt={user.name || 'User'} className="h-full w-full object-cover" />
                                ) : (
                                    user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()
                                )}
                            </div>
                            <div className="min-w-0 flex-1 pb-1">
                                <h2 className="text-lg font-semibold text-gray-900 truncate">{user.name || user.email}</h2>
                                <p className="text-sm text-gray-500 truncate">{user.email}</p>
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${verif.color}`}>
                                        {verif.icon} {verif.label}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">{plan} Plan</span>
                                    {planExpiresAt && (
                                        <span className="text-[10px] text-gray-400">Expires {formatDate(planExpiresAt)}</span>
                                    )}
                                </div>
                            </div>
                            <div className="text-right hidden sm:block pb-1">
                                <div className="text-3xl font-bold text-indigo-600">{user.trustScore}</div>
                                <div className="text-[10px] text-gray-400 uppercase tracking-wide">Trust Score</div>
                            </div>
                        </div>
                    </div>

                    {/* Verification CTA */}
                    {verificationStatus === 'NOT_STARTED' && (
                        <div className="mx-6 mb-6 flex items-center gap-3 bg-indigo-50 rounded-xl p-3 border border-indigo-100">
                            <span className="text-lg">🛡️</span>
                            <div className="flex-1 text-sm text-indigo-700">Verify your account to publish tours.</div>
                            <a href="/dashboard/operator/verification" className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition">Get Verified</a>
                        </div>
                    )}
                    {verificationStatus === 'REJECTED' && (
                        <div className="mx-6 mb-6 flex items-center gap-3 bg-red-50 rounded-xl p-3 border border-red-100">
                            <span className="text-lg">⚠️</span>
                            <div className="flex-1 text-sm text-red-700">Verification rejected. Please review and resubmit.</div>
                            <a href="/dashboard/operator/verification" className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition">Resubmit</a>
                        </div>
                    )}
                </div>

                {/* ── Quick Stats ────────────────────────── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { value: createdToursCount, label: 'Tours Created', color: 'text-indigo-600' },
                        { value: completedToursCount, label: 'Completed', color: 'text-emerald-600' },
                        { value: `${successRate}%`, label: 'Success Rate', color: 'text-amber-600' },
                        { value: teamSize, label: 'Team Size', color: 'text-purple-600' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                            <div className="text-[11px] text-gray-400 mt-1">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* ── Navigation Cards ───────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link href="/dashboard/operator/portfolio" className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-lg group-hover:bg-blue-100 transition">🌍</div>
                            <div>
                                <h3 className="font-semibold text-gray-900">My Portfolio</h3>
                                <p className="text-xs text-gray-500">View and share your public profile</p>
                            </div>
                        </div>
                        <div className="mt-4 text-xs font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">View Portfolio →</div>
                    </Link>

                    <Link href="/dashboard/operator/profile/edit" className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-indigo-300 hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center text-lg group-hover:bg-indigo-100 transition">📝</div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Edit Profile</h3>
                                <p className="text-xs text-gray-500">Update your information and bio</p>
                            </div>
                        </div>
                        <div className="mt-4 text-xs font-semibold text-indigo-600 group-hover:translate-x-1 transition-transform">Edit →</div>
                    </Link>

                    <Link href="/dashboard/operator/profile/trust" className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-amber-300 hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center text-lg group-hover:bg-amber-100 transition">📊</div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Trust Score</h3>
                                <p className="text-xs text-gray-500">View your trust history graph</p>
                            </div>
                        </div>
                        <div className="mt-4 text-xs font-semibold text-amber-600 group-hover:translate-x-1 transition-transform">View →</div>
                    </Link>

                    <Link href="/dashboard/operator/profile/security" className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-emerald-300 hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center text-lg group-hover:bg-emerald-100 transition">🔐</div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Security</h3>
                                <p className="text-xs text-gray-500">Change password, manage sessions</p>
                            </div>
                        </div>
                        <div className="mt-4 text-xs font-semibold text-emerald-600 group-hover:translate-x-1 transition-transform">Manage →</div>
                    </Link>

                    <Link href="/dashboard/operator/wallet" className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-green-300 hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center text-lg group-hover:bg-green-100 transition">💰</div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Wallet</h3>
                                <p className="text-xs text-gray-500">{walletBalance.toLocaleString()} VND available</p>
                            </div>
                        </div>
                        <div className="mt-4 text-xs font-semibold text-green-600 group-hover:translate-x-1 transition-transform">Manage →</div>
                    </Link>
                </div>
            </div>
        </BaseDashboardLayout>
    );
}
