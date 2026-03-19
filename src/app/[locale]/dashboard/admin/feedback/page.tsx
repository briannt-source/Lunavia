import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const metadata = { title: 'Review Viewer — Lunavia Admin' };

export default async function AdminFeedbackViewer({
    searchParams,
}: {
    searchParams: { rating?: string; range?: string; status?: string };
}) {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect('/login');

    const user = session.user;
    if (!['SUPER_ADMIN', 'OPS'].includes(user.role)) {
        return <div className="p-8 text-center text-red-600">Unauthorized Access</div>;
    }

    const ratingFilter = searchParams.rating ? parseInt(searchParams.rating) : undefined;
    const range = searchParams.range || '30d';
    const statusFilter = searchParams.status;

    const threshold = new Date();
    const now = new Date();
    switch (range) {
        case '7d': threshold.setDate(now.getDate() - 7); break;
        case '30d': threshold.setDate(now.getDate() - 30); break;
        case '90d': threshold.setDate(now.getDate() - 90); break;
        case 'all': threshold.setFullYear(2000); break;
        default: threshold.setDate(now.getDate() - 30); break;
    }

    const whereClause: any = {
        createdAt: { gte: threshold }
    };

    if (ratingFilter) whereClause.overallRating = ratingFilter;
    if (statusFilter) whereClause.status = statusFilter;

    // Stats using Review model
    const totalReviews = await prisma.review.count({ where: whereClause });
    const flaggedReviews = await prisma.review.count({ where: { ...whereClause, isFlagged: true } });
    const flaggedPercent = totalReviews > 0 ? ((flaggedReviews / totalReviews) * 100).toFixed(1) : '0.0';

    const reviews = await prisma.review.findMany({
        where: whereClause,
        include: {
            tour: { select: { title: true, city: true } },
            reviewer: { select: { email: true } },
            subject: { select: { email: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 50
    });

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Review Viewer</h1>
                        <p className="text-sm text-gray-600">Admin view of platform reviews</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500 uppercase font-semibold">Flagged</p>
                        <p className={`text-2xl font-bold ${Number(flaggedPercent) > 10 ? 'text-red-600' : 'text-gray-900'}`}>
                            {flaggedPercent}%
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="space-x-2">
                        <span className="text-sm font-medium text-gray-700">Status:</span>
                        <Link href="?status=" className={`px-2 py-1 text-xs rounded ${!statusFilter ? 'bg-gray-800 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>All</Link>
                        <Link href="?status=PENDING" className={`px-2 py-1 text-xs rounded ${statusFilter === 'PENDING' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'}`}>Pending</Link>
                        <Link href="?status=APPROVED" className={`px-2 py-1 text-xs rounded ${statusFilter === 'APPROVED' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>Approved</Link>
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
                    {reviews.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
                            No reviews found for current filters.
                        </div>
                    ) : (
                        reviews.map((review) => (
                            <div key={review.id} className={`bg-white p-5 rounded-lg border shadow-sm flex flex-col sm:flex-row gap-4 ${review.isFlagged ? 'border-red-200 ring-1 ring-red-100' : 'border-gray-200'}`}>
                                <div className="sm:w-32 flex-shrink-0 flex flex-col items-center justify-center bg-gray-50 rounded-lg p-2">
                                    <span className="text-3xl font-bold text-gray-900">{review.overallRating}★</span>
                                    <div className="flex flex-col items-center gap-1 mt-1">
                                        <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${review.status === 'APPROVED' ? 'bg-green-100 text-green-800' : review.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'}`}>
                                            {review.status}
                                        </span>
                                        {review.isFlagged && (
                                            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                                                FLAGGED
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{review.tour?.title || 'No tour'}</h3>
                                            <p className="text-xs text-gray-500">{review.tour?.city || 'N/A'}</p>
                                        </div>
                                        <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleString()}</span>
                                    </div>

                                    {review.comment && (
                                        <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-3 rounded italic border-l-4 border-gray-200">
                                            &quot;{review.comment}&quot;
                                        </div>
                                    )}

                                    <div className="pt-2 text-xs text-gray-400 border-t border-gray-100 mt-2">
                                        By: {review.reviewer.email} → About: {review.subject.email}
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
