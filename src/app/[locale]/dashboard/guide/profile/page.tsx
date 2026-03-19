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

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            email: true,
            verifiedStatus: true,
            trustScore: true,
            createdAt: true,
            profile: { select: { fullName: true, avatarUrl: true } },
        },
    });

    if (!user) redirect('/login');

    const verificationStatus = user.verifiedStatus || 'NOT_SUBMITTED';
    const displayName = user.profile?.fullName || session.user.name || user.email;
    const initials = displayName[0]?.toUpperCase() || '?';

    // Use correct Prisma models: Application (guide applies), Review
    const [acceptedApplications, completedTours, totalReviews] = await Promise.all([
        prisma.application.count({ where: { guideId: user.id, status: 'ACCEPTED' } }),
        prisma.application.count({ where: { guideId: user.id, status: 'ACCEPTED', tour: { status: 'COMPLETED' } } }),
        prisma.review.count({ where: { subjectId: user.id } }),
    ]);

    // Get average rating from reviews
    const avgRatingResult = await prisma.review.aggregate({
        where: { subjectId: user.id },
        _avg: { rating: true },
    });
    const avgRating = avgRatingResult._avg.rating;

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
                    <div className="h-20 bg-gradient-to-r from-emerald-500 to-teal-600" />
                    <div className="px-6 pb-6 -mt-10">
                        <div className="flex items-end gap-5">
                            <div className="h-20 w-20 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center text-2xl font-bold text-emerald-600 shrink-0 overflow-hidden relative">
                                {user.profile?.avatarUrl ? (
                                    <img src={user.profile.avatarUrl} alt={displayName} className="h-full w-full object-cover" />
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
                                <div className="text-3xl font-bold text-emerald-600">{user.trustScore}</div>
                                <div className="text-[10px] text-gray-400 uppercase tracking-wide">Trust Score</div>
                            </div>
                        </div>
                    </div>

                    {verificationStatus === 'NOT_SUBMITTED' && (
                        <div className="mx-6 mb-6 flex items-center gap-3 bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                            <span className="text-lg">🛡️</span>
                            <div className="flex-1 text-sm text-emerald-700">Verify your account to apply for tours.</div>
                            <a href="/dashboard/guide/verification" className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition">Get Verified</a>
                        </div>
                    )}
                </div>

                {/* ── Quick Stats */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { value: completedTours, label: 'Completed Tours', color: 'text-emerald-600' },
                        { value: avgRating ? avgRating.toFixed(1) : '—', label: 'Avg Rating', color: 'text-amber-600' },
                        { value: totalReviews, label: 'Reviews', color: 'text-purple-600' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                            <div className="text-[11px] text-gray-400 mt-1">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* ── Navigation Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link href="/dashboard/guide/portfolio" className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-lg group-hover:bg-blue-100 transition">🌍</div>
                            <div>
                                <h3 className="font-semibold text-gray-900">My Portfolio</h3>
                                <p className="text-xs text-gray-500">View and share your public profile</p>
                            </div>
                        </div>
                        <div className="mt-4 text-xs font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">View Portfolio →</div>
                    </Link>

                    <Link href="/dashboard/guide/profile/edit" className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-emerald-300 hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center text-lg group-hover:bg-emerald-100 transition">📝</div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Edit Profile</h3>
                                <p className="text-xs text-gray-500">Update your information and bio</p>
                            </div>
                        </div>
                        <div className="mt-4 text-xs font-semibold text-emerald-600 group-hover:translate-x-1 transition-transform">Edit →</div>
                    </Link>

                    <Link href="/dashboard/guide/profile/security" className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-lg group-hover:bg-blue-100 transition">🔐</div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Security</h3>
                                <p className="text-xs text-gray-500">Change password, manage sessions</p>
                            </div>
                        </div>
                        <div className="mt-4 text-xs font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">Manage →</div>
                    </Link>

                    <Link href="/dashboard/guide/settings" className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-purple-300 hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center text-lg group-hover:bg-purple-100 transition">⚙️</div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Settings</h3>
                                <p className="text-xs text-gray-500">Notifications and preferences</p>
                            </div>
                        </div>
                        <div className="mt-4 text-xs font-semibold text-purple-600 group-hover:translate-x-1 transition-transform">Configure →</div>
                    </Link>
                </div>
            </div>
        </BaseDashboardLayout>
    );
}
