import Link from 'next/link';
import { prisma } from '@/lib/prisma';

interface UpcomingToursWidgetProps {
    role: 'TOUR_OPERATOR' | 'TOUR_GUIDE';
    userId: string;
}

export async function UpcomingToursWidget({ role, userId }: UpcomingToursWidgetProps) {
    const now = new Date();

    // Query condition based on role
    const whereCondition = role === 'TOUR_OPERATOR'
        ? { operatorId: userId, status: { in: ['ASSIGNED', 'READY', 'IN_PROGRESS'] }, startDate: { gte: now } }
        : { assignedGuideId: userId, status: { in: ['ASSIGNED', 'READY', 'IN_PROGRESS'] }, startDate: { gte: now } };

    const upcomingTours = await prisma.tour.findMany({
        where: whereCondition as any,
        orderBy: { startDate: 'asc' },
        take: 3,
        select: {
            id: true,
            title: true,
            startDate: true,
            location: true,
            status: true,
        }
    });

    if (upcomingTours.length === 0) {
        return (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-full flex flex-col justify-center items-center text-center">
                <div className="bg-gray-50 p-3 rounded-full mb-3">
                    <span className="text-2xl">🗓️</span>
                </div>
                <h3 className="text-gray-900 font-medium">No Upcoming Tours</h3>
                <p className="text-gray-500 text-sm mt-1">
                    {role === 'TOUR_OPERATOR' ? 'Create a new tour to get started.' : 'Apply for tours in the marketplace.'}
                </p>
                {role === 'TOUR_OPERATOR' && (
                    <Link href="/dashboard/operator/tours/new" className="mt-4 text-[#5BA4CF] text-sm font-medium hover:underline">
                        Create Tour →
                    </Link>
                )}
                {role === 'TOUR_GUIDE' && (
                    <Link href="/dashboard/guide/available" className="mt-4 text-[#5BA4CF] text-sm font-medium hover:underline">
                        Browse Marketplace →
                    </Link>
                )}
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">📅 Upcoming Tours</h3>
                <Link href={role === 'TOUR_OPERATOR' ? "/dashboard/operator/tours" : "/dashboard/guide/assigned"} className="text-sm text-[#5BA4CF] hover:underline">
                    View All
                </Link>
            </div>
            <div className="space-y-4">
                {upcomingTours.map((tour) => (
                    <Link href={`/dashboard/service-requests/${tour.id}`} key={tour.id} className="block group">
                        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                            <div className="bg-lunavia-light text-[#5BA4CF] px-3 py-2 rounded-lg text-center min-w-[60px]">
                                <div className="text-xs font-bold uppercase">{tour.startDate.toLocaleString('default', { month: 'short' })}</div>
                                <div className="text-lg font-bold">{tour.startDate.getDate()}</div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 truncate group-hover:text-[#5BA4CF] transition-colors">{tour.title}</h4>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                    <span>📍 {tour.location}</span>
                                    <span>•</span>
                                    <span>{tour.startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${tour.status === 'IN_PROGRESS' ? 'bg-green-100 text-green-700' : 'bg-lunavia-muted/50 text-lunavia-primary-hover'
                                    }`}>
                                    {tour.status.replace('_', ' ')}
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
