import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { BaseDashboardLayout } from '@/components/layout/BaseDashboardLayout';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export const metadata = { title: 'Profile — Lunavia' };

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect('/login');
    const t = await getTranslations('Guide.Profile');

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { verificationSubmission: true, role: true },
    });

    if (!user) redirect('/login');

    const verificationStatus = user.kycStatus || 'NOT_STARTED';
    const plan = user.plan || 'FREE';
    const planExpiresAt = user.planExpiresAt;

    const [completedToursCount, avgRating, totalReviews] = await Promise.all([
        prisma.serviceRequest.count({ where: { assignedGuideId: user.id, status: { in: ['COMPLETED', 'CLOSED'] } } }),
        prisma.tourFeedback.aggregate({
            where: { request: { assignedGuideId: user.id }, role: 'TOUR_OPERATOR' },
            _avg: { rating: true },
            _count: { rating: true }
        }),
        prisma.tourFeedback.count({ where: { request: { assignedGuideId: user.id } } })
    ]);

    const verif = {
        NOT_STARTED: { color: 'bg-gray-100 text-gray-600', icon: '○', label: t('verification.notStarted') },
        PENDING: { color: 'bg-amber-100 text-amber-700', icon: '⏳', label: t('verification.underReview') },
        APPROVED: { color: 'bg-emerald-100 text-emerald-700', icon: '✓', label: t('verification.verified') },
        REJECTED: { color: 'bg-red-100 text-red-700', icon: '✕', label: t('verification.rejected') },
    }[verificationStatus] || { color: 'bg-gray-100 text-gray-600', icon: '○', label: verificationStatus };

    // Parse payout info
    let hasPayout = false;
    try { if (user.paymentInfo) { JSON.parse(user.paymentInfo); hasPayout = true; } } catch {}

    return (
        <BaseDashboardLayout
            header={
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
                    <p className="text-sm text-gray-500 mt-0.5">{t('subtitle')}</p>
                </div>
            }
        >
            <div className="max-w-3xl mx-auto space-y-6">
                {/* ── Profile Header ────────────────────── */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="h-20 bg-gradient-to-r from-emerald-500 to-teal-600" />
                    <div className="px-6 pb-6 -mt-10">
                        <div className="flex items-end gap-5">
                            <div className="h-20 w-20 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center text-2xl font-bold text-emerald-600 shrink-0 overflow-hidden relative">
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
                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">{plan} Plan</span>
                                    {planExpiresAt && (
                                        <span className="text-[10px] text-gray-400">{t('planExpires', { date: formatDate(planExpiresAt) })}</span>
                                    )}
                                </div>
                            </div>
                            <div className="text-right hidden sm:block pb-1">
                                <div className="text-3xl font-bold text-emerald-600">{user.trustScore}</div>
                                <div className="text-[10px] text-gray-400 uppercase tracking-wide">{t('trustScore')}</div>
                            </div>
                        </div>
                    </div>

                    {/* Verification CTA */}
                    {verificationStatus === 'NOT_STARTED' && (
                        <div className="mx-6 mb-6 flex items-center gap-3 bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                            <span className="text-lg">🛡️</span>
                            <div className="flex-1 text-sm text-emerald-700">{t('alerts.verifyCta')}</div>
                            <a href="/dashboard/guide/verification" className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition">{t('alerts.verifyBtn')}</a>
                        </div>
                    )}
                    {verificationStatus === 'REJECTED' && (
                        <div className="mx-6 mb-6 flex items-center gap-3 bg-red-50 rounded-xl p-3 border border-red-100">
                            <span className="text-lg">⚠️</span>
                            <div className="flex-1 text-sm text-red-700">{t('alerts.rejectedCta')}</div>
                            <a href="/dashboard/guide/verification" className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition">{t('alerts.resubmitBtn')}</a>
                        </div>
                    )}

                    {/* In-house Contract Status */}
                    {user.affiliatedOperatorId && user.contractStatus === 'PENDING' && !user.contractDocumentUrl && (
                        <div className="mx-6 mb-6 flex items-center gap-3 bg-blue-50 rounded-xl p-3 border border-blue-100">
                            <span className="text-lg">📄</span>
                            <div className="flex-1 text-sm text-blue-700">
                                {t('alerts.linkContractCta')}
                            </div>
                            <a href="/dashboard/guide/contract" className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition">{t('alerts.uploadContractBtn')}</a>
                        </div>
                    )}
                    {user.affiliatedOperatorId && user.contractStatus === 'PENDING' && user.contractDocumentUrl && (
                        <div className="mx-6 mb-6 flex items-center gap-3 bg-amber-50 rounded-xl p-3 border border-amber-100">
                            <span className="text-lg">⏳</span>
                            <div className="flex-1 text-sm text-amber-700">
                                {t('alerts.contractPending')}
                            </div>
                        </div>
                    )}
                    {user.affiliatedOperatorId && user.contractStatus === 'APPROVED' && (
                        <div className="mx-6 mb-6 flex items-center gap-3 bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                            <span className="text-lg">✅</span>
                            <div className="flex-1 text-sm text-emerald-700">
                                {t('alerts.contractApproved')}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Quick Stats ────────────────────────── */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { value: completedToursCount, label: t('stats.completedTours'), color: 'text-emerald-600' },
                        { value: avgRating._avg.rating ? avgRating._avg.rating.toFixed(1) : '—', label: t('stats.avgRating'), color: 'text-amber-600' },
                        { value: totalReviews, label: t('stats.reviews'), color: 'text-purple-600' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                            <div className="text-[11px] text-gray-400 mt-1">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* ── Navigation Cards ───────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link href="/dashboard/guide/portfolio" className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-lg group-hover:bg-blue-100 transition">🌍</div>
                            <div>
                                <h3 className="font-semibold text-gray-900">{t('nav.portfolio')}</h3>
                                <p className="text-xs text-gray-500">{t('nav.portfolioDesc')}</p>
                            </div>
                        </div>
                        <div className="mt-4 text-xs font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">{t('nav.portfolioBtn')}</div>
                    </Link>

                    <Link href="/dashboard/guide/profile/edit" className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-emerald-300 hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center text-lg group-hover:bg-emerald-100 transition">📝</div>
                            <div>
                                <h3 className="font-semibold text-gray-900">{t('nav.editProfile')}</h3>
                                <p className="text-xs text-gray-500">{t('nav.editProfileDesc')}</p>
                            </div>
                        </div>
                        <div className="mt-4 text-xs font-semibold text-emerald-600 group-hover:translate-x-1 transition-transform">{t('nav.editProfileBtn')}</div>
                    </Link>

                    <Link href="/dashboard/guide/profile/trust" className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-amber-300 hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center text-lg group-hover:bg-amber-100 transition">📊</div>
                            <div>
                                <h3 className="font-semibold text-gray-900">{t('nav.trustScore')}</h3>
                                <p className="text-xs text-gray-500">{t('nav.trustScoreDesc')}</p>
                            </div>
                        </div>
                        <div className="mt-4 text-xs font-semibold text-amber-600 group-hover:translate-x-1 transition-transform">{t('nav.trustScoreBtn')}</div>
                    </Link>

                    <Link href="/dashboard/guide/profile/security" className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-lg group-hover:bg-blue-100 transition">🔐</div>
                            <div>
                                <h3 className="font-semibold text-gray-900">{t('nav.security')}</h3>
                                <p className="text-xs text-gray-500">{t('nav.securityDesc')}</p>
                            </div>
                        </div>
                        <div className="mt-4 text-xs font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">{t('nav.securityBtn')}</div>
                    </Link>

                    <Link href="/dashboard/guide/settings" className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-purple-300 hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center text-lg group-hover:bg-purple-100 transition">🏦</div>
                            <div>
                                <h3 className="font-semibold text-gray-900">{t('nav.payout')}</h3>
                                <p className="text-xs text-gray-500">{hasPayout ? t('nav.payoutDescSet') : t('nav.payoutDescUnset')}</p>
                            </div>
                        </div>
                        <div className="mt-4 text-xs font-semibold text-purple-600 group-hover:translate-x-1 transition-transform">{t('nav.payoutBtn')}</div>
                    </Link>
                </div>
            </div>
        </BaseDashboardLayout>
    );
}
