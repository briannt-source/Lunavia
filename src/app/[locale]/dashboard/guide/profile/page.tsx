import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { BaseDashboardLayout } from '@/components/layout/BaseDashboardLayout';
import { prisma } from '@/lib/prisma';
import { Link } from '@/navigation';
import { GuideReliabilityDomain } from '@/domain/execution/GuideReliabilityDomain';

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
            },
        });

        if (!user) redirect('/login');

        const verificationStatus = user.verifiedStatus || 'NOT_SUBMITTED';
        const displayName = user.profile?.name || user.email;
        const initials = displayName[0]?.toUpperCase() || '?';

        // Use correct Prisma models: Application (guide applies), Review
        let completedTours = 0;
        let totalReviews = 0;
        let avgRating: number | null = null;
        try {
            const [, completed, reviews] = await Promise.all([
                prisma.application.count({ where: { guideId: user.id, status: 'ACCEPTED' } }),
                prisma.application.count({ where: { guideId: user.id, status: 'ACCEPTED', tour: { status: 'COMPLETED' } } }),
                prisma.review.count({ where: { subjectId: user.id } }),
            ]);
            completedTours = completed;
            totalReviews = reviews;

            const avgRatingResult = await prisma.review.aggregate({
                where: { subjectId: user.id },
                _avg: { overallRating: true },
            });
            avgRating = avgRatingResult._avg?.overallRating ?? null;
        } catch { /* Stats unavailable — graceful fallback */ }

        // Fetch reliability score from domain service
        let reliabilityScore = 100;
        try {
            const reliabilityStats = await GuideReliabilityDomain.getGuideReliabilityStats(user.id);
            reliabilityScore = reliabilityStats.reliabilityScore;
        } catch { /* Reliability unavailable — default to 100 */ }

        const verif = {
            NOT_SUBMITTED: { color: 'bg-gray-100 text-gray-600', icon: '○', label: 'Not Started' },
            PENDING: { color: 'bg-amber-100 text-amber-700', icon: '⏳', label: 'Under Review' },
            APPROVED: { color: 'bg-green-100 text-green-700', icon: '✓', label: 'Verified' },
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
                        <div className="h-20 bg-gradient-to-r from-slate-100 to-slate-200" />
                        <div className="px-6 pb-6 -mt-10">
                            <div className="flex items-end gap-5">
                                <div className="h-20 w-20 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center text-2xl font-bold text-lunavia-primary shrink-0 overflow-hidden relative">
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
                                <div className="text-right hidden sm:flex gap-5 pb-1">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-lunavia-primary">{user.trustScore}</div>
                                        <div className="text-[10px] text-gray-500 uppercase tracking-wide">Trust Score</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-emerald-600">{reliabilityScore}</div>
                                        <div className="text-[10px] text-gray-500 uppercase tracking-wide">Reliability</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {verificationStatus === 'NOT_SUBMITTED' && (
                            <div className="mx-6 mb-6 flex items-center gap-3 bg-lunavia-primary-light rounded-xl p-3 border border-lunavia-muted">
                                <span className="text-lg">🛡️</span>
                                <div className="flex-1 text-sm text-lunavia-primary">Verify your account to apply for tours.</div>
                                <a href="/dashboard/guide/verification" className="px-3 py-1.5 bg-lunavia-primary text-white text-xs font-medium rounded-lg hover:bg-lunavia-primary-hover transition">Get Verified</a>
                            </div>
                        )}
                    </div>

                    {/* ── Quick Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { value: completedTours, label: 'Completed Tours', color: 'text-green-600' },
                            { value: avgRating ? avgRating.toFixed(1) : '—', label: 'Avg Rating', color: 'text-amber-600' },
                            { value: totalReviews, label: 'Reviews', color: 'text-lunavia-accent' },
                            { value: reliabilityScore, label: 'Reliability', color: 'text-emerald-600' },
                        ].map((stat, i) => (
                            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                                <div className="text-[11px] text-gray-400 mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* ── Navigation Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link href="/dashboard/guide/portfolio" className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-lunavia-primary/30 hover:shadow-md transition-all">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-lg bg-lunavia-primary-light flex items-center justify-center text-lg group-hover:bg-lunavia-muted/30 transition">🌍</div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">My Portfolio</h3>
                                    <p className="text-xs text-gray-500">View and share your public profile</p>
                                </div>
                            </div>
                            <div className="mt-4 text-xs font-semibold text-lunavia-primary group-hover:translate-x-1 transition-transform">View Portfolio →</div>
                        </Link>

                        <Link href="/dashboard/guide/profile/edit" className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-green-300 hover:shadow-md transition-all">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center text-lg group-hover:bg-green-100 transition">📝</div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Edit Profile</h3>
                                    <p className="text-xs text-gray-500">Update your information and bio</p>
                                </div>
                            </div>
                            <div className="mt-4 text-xs font-semibold text-green-600 group-hover:translate-x-1 transition-transform">Edit →</div>
                        </Link>
                    </div>
                </div>
            </BaseDashboardLayout>
        );
    } catch (error) {
        console.error('[Guide Profile Page Error]', error);
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
                    <a href="/dashboard/guide/profile" className="px-4 py-2 bg-lunavia-primary text-white text-sm font-medium rounded-lg hover:bg-lunavia-primary-hover transition">Reload Page</a>
                </div>
            </BaseDashboardLayout>
        );
    }
}
