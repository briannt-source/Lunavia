import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const metadata = { title: 'Feedback Viewer — Lunavia Admin' };

export default async function AdminFeedbackViewer({
    searchParams,
}: {
    searchParams: { role?: string; rating?: string; range?: string; severity?: string };
}) {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect('/login');

    const user = session.user;
    // Only SUPER_ADMIN or OPS can view feedback
    if (!['SUPER_ADMIN', 'OPS'].includes(user.role)) {
        return <div className="p-8 text-center text-red-600">Unauthorized Access</div>;
    }

    const roleFilter = searchParams.role;
    const ratingFilter = searchParams.rating ? parseInt(searchParams.rating) : undefined;
    const range = searchParams.range || '30d';

    const threshold = new Date();
    const now = new Date();
    switch (range) {
        case '7d': threshold.setDate(now.getDate() - 7); break;
        case '30d': threshold.setDate(now.getDate() - 30); break;
        case '90d': threshold.setDate(now.getDate() - 90); break;
        case 'all': threshold.setFullYear(2000); break;
        default: threshold.setDate(now.getDate() - 30); break;
    }

    const severityFilter = searchParams.severity;

    const whereClause: any = {
        createdAt: { gte: threshold }
    };

    if (roleFilter) whereClause.role = roleFilter;
    if (ratingFilter) whereClause.rating = ratingFilter;
    if (severityFilter) whereClause.severity = severityFilter;

    // Stats
    const totalFeedback = await prisma.tourFeedback.count({ where: whereClause });
    const criticalFeedback = await prisma.tourFeedback.count({ where: { ...whereClause, severity: 'CRITICAL' } });
    const criticalPercent = totalFeedback > 0 ? ((criticalFeedback / totalFeedback) * 100).toFixed(1) : '0.0';

    const feedbacks = await prisma.tourFeedback.findMany({
        where: whereClause,
        include: {
            request: { select: { title: true, location: true } },
            user: { select: { email: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 50
    });

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Feedback Viewer</h1>
                        <p className="text-sm text-gray-600">Ops/Admin view of collected feedback signals</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500 uppercase font-semibold">Critical Signal</p>
                        <p className={`text-2xl font-bold ${Number(criticalPercent) > 10 ? 'text-red-600' : 'text-gray-900'}`}>
                            {criticalPercent}%
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    {/* Role Filter */}
                    <div className="space-x-2">
                        <span className="text-sm font-medium text-gray-700">Role:</span>
                        <Link href="?role=" className={`px-2 py-1 text-xs rounded ${!roleFilter ? 'bg-gray-800 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>All</Link>
                        <Link href="?role=TOUR_OPERATOR" className={`px-2 py-1 text-xs rounded ${roleFilter === 'TOUR_OPERATOR' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}>Operators</Link>
                        <Link href="?role=TOUR_GUIDE" className={`px-2 py-1 text-xs rounded ${roleFilter === 'TOUR_GUIDE' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'}`}>Guides</Link>
                    </div>

                    {/* Severity Filter */}
                    <div className="space-x-2">
                        <span className="text-sm font-medium text-gray-700">Severity:</span>
                        <Link href="?severity=" className={`px-2 py-1 text-xs rounded ${!severityFilter ? 'bg-gray-800 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>All</Link>
                        <Link href="?severity=CRITICAL" className={`px-2 py-1 text-xs rounded ${severityFilter === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}>Critical</Link>
                        <Link href="?severity=WARNING" className={`px-2 py-1 text-xs rounded ${severityFilter === 'WARNING' ? 'bg-yellow-500 text-white' : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'}`}>Warning</Link>
                    </div>

                    <div className="space-x-2">
                        <span className="text-sm font-medium text-gray-700">Rating:</span>
                        <Link href="?rating=" className={`px-2 py-1 text-xs rounded ${!ratingFilter ? 'bg-gray-800 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>All</Link>
                        {[1, 2, 3, 4, 5].map(r => (
                            <Link key={r} href={`?rating=${r}`} className={`px-2 py-1 text-xs rounded ${ratingFilter === r ? 'bg-yellow-500 text-white' : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'}`}>
                                {r}★
                            </Link>
                        ))}
                    </div>

                    <div className="space-x-2">
                        <span className="text-sm font-medium text-gray-700">Range:</span>
                        <Link href="?range=7d" className={`px-2 py-1 text-xs rounded ${range === '7d' ? 'bg-gray-800 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>7d</Link>
                        <Link href="?range=30d" className={`px-2 py-1 text-xs rounded ${range === '30d' ? 'bg-gray-800 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>30d</Link>
                        <Link href="?range=all" className={`px-2 py-1 text-xs rounded ${range === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>All</Link>
                    </div>
                </div>

                {/* List */}
                <div className="space-y-4">
                    {feedbacks.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
                            No feedback found for current filters.
                        </div>
                    ) : (
                        feedbacks.map((fb) => (
                            <div key={fb.id} className={`bg-white p-5 rounded-lg border shadow-sm flex flex-col sm:flex-row gap-4 ${fb.severity === 'CRITICAL' ? 'border-red-200 ring-1 ring-red-100' : 'border-gray-200'}`}>
                                <div className="sm:w-32 flex-shrink-0 flex flex-col items-center justify-center bg-gray-50 rounded-lg p-2">
                                    <span className="text-3xl font-bold text-gray-900">{fb.rating}★</span>
                                    <div className="flex flex-col items-center gap-1 mt-1">
                                        <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${fb.role === 'TOUR_OPERATOR' ? 'bg-indigo-100 text-indigo-800' : 'bg-purple-100 text-purple-800'
                                            }`}>
                                            {fb.role === 'TOUR_OPERATOR' ? 'Operator' : 'Guide'}
                                        </span>
                                        {fb.severity && (
                                            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${fb.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                                                fb.severity === 'WARNING' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                {fb.severity}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{fb.request.title}</h3>
                                            <p className="text-xs text-gray-500">{fb.request.location}</p>
                                        </div>
                                        <span className="text-xs text-gray-400">{new Date(fb.createdAt).toLocaleString()}</span>
                                    </div>

                                    {/* Tags */}
                                    {fb.tags && (
                                        <div className="flex flex-wrap gap-2">
                                            {JSON.parse(fb.tags as string).map((tag: string, i: number) => (
                                                <span key={i} className="px-2 py-1 rounded bg-gray-100 text-gray-600 text-xs border border-gray-200">
                                                    {tag.replace('_', ' ')}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Comment */}
                                    {fb.comment && (
                                        <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-3 rounded italic border-l-4 border-gray-200">
                                            "{fb.comment}"
                                        </div>
                                    )}

                                    <div className="pt-2 text-xs text-gray-400 border-t border-gray-100 mt-2">
                                        Submitted by: {fb.user.email} (ID: {fb.userId})
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
