import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { BaseDashboardLayout } from '@/components/layout/BaseDashboardLayout';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const metadata = { title: 'Profile — Lunavia' };

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect('/login');

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                email: true,
                verifiedStatus: true,
                trustScore: true,
                createdAt: true,
                profile: { select: { name: true, photoUrl: true } },
                wallet: { select: { balance: true } },
            },
        });

        if (!user) redirect('/login');

        const verificationStatus = user.verifiedStatus || 'NOT_SUBMITTED';
        const displayName = user.profile?.name || (session.user as any).name || user.email;
        const initials = displayName[0]?.toUpperCase() || '?';
        const walletBalance = user.wallet?.balance || 0;

        // Use correct Prisma models: Tour (has operatorId), CompanyMember
        let createdToursCount = 0;
        let completedToursCount = 0;
        let teamSize = 0;
        try {
            [createdToursCount, completedToursCount, teamSize] = await Promise.all([
                prisma.tour.count({ where: { operatorId: user.id } }),
                prisma.tour.count({ where: { operatorId: user.id, status: 'COMPLETED' } }),
                prisma.company.findUnique({ where: { operatorId: user.id }, select: { _count: { select: { members: true } } } }).then(c => c?._count?.members || 0),
            ]);
        } catch { /* Stats unavailable — graceful fallback */ }

        const totalActive = await prisma.tour.count({ 
            where: { operatorId: user.id, status: { notIn: ['DRAFT'] } } 
        }).catch(() => 0);
        const successRate = totalActive > 0 ? Math.round((completedToursCount / totalActive) * 100) : 0;

        const verif = {
            NOT_SUBMITTED: { color: 'bg-gray-100 text-gray-600', icon: '○', label: 'Not Started' },
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
                    {/* ── Profile Header */}
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                        <div className="h-28 bg-gradient-to-r from-indigo-500 to-purple-600" />
                        <div className="px-6 pb-6 -mt-12">
                            <div className="flex items-end gap-5">
                                <div className="h-20 w-20 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center text-2xl font-bold text-indigo-600 shrink-0 overflow-hidden relative">
                                    {user.profile?.photoUrl ? (
                                        <img src={user.profile.photoUrl} alt={displayName} className="h-full w-full object-cover" />
                                    ) : (
                                        initials
                                    )}
                                </div>
                                <div className="min-w-0 flex-1 pb-1">
                                    <h2 className="text-lg font-semibold text-gray-900 truncate">{displayName}</h2>
                                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${verif.color}`}>
                                            {verif.icon} {verif.label}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right hidden sm:block pb-1">
                                    <div className="text-3xl font-bold text-indigo-600">{user.trustScore}</div>
                                    <div className="text-[10px] text-gray-400 uppercase tracking-wide">Trust Score</div>
                                </div>
                            </div>
                        </div>

                        {verificationStatus === 'NOT_SUBMITTED' && (
                            <div className="mx-6 mb-6 flex items-center gap-3 bg-indigo-50 rounded-xl p-3 border border-indigo-100">
                                <span className="text-lg">🛡️</span>
                                <div className="flex-1 text-sm text-indigo-700">Verify your account to publish tours.</div>
                                <a href="/dashboard/operator/verification" className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition">Get Verified</a>
                            </div>
                        )}
                    </div>

                    {/* ── Quick Stats */}
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

                    {/* ── Navigation Cards */}
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
                                    <p className="text-xs text-gray-500">{Number(walletBalance).toLocaleString()} VND available</p>
                                </div>
                            </div>
                            <div className="mt-4 text-xs font-semibold text-green-600 group-hover:translate-x-1 transition-transform">Manage →</div>
                        </Link>
                    </div>
                </div>
            </BaseDashboardLayout>
        );
    } catch (error) {
        console.error('[Profile Page Error]', error);
        return (
            <BaseDashboardLayout
                header={
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Manage your account information</p>
                    </div>
                }
            >
                <div className="max-w-lg mx-auto text-center py-16">
                    <div className="text-5xl mb-4">⚠️</div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to load profile</h2>
                    <p className="text-sm text-gray-500 mb-6">There was an issue loading your profile data. Please try refreshing the page.</p>
                    <a href="/dashboard/operator/profile" className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition">Reload Page</a>
                </div>
            </BaseDashboardLayout>
        );
    }
}
