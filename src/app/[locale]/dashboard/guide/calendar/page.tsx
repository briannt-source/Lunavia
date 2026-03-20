import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { BaseDashboardLayout } from '@/components/layout/BaseDashboardLayout';
import { GuideCalendar } from '@/components/dashboard/GuideCalendar';
import { getTranslations } from 'next-intl/server';

export const metadata = { title: 'Availability Calendar — Lunavia' };

export default async function GuideCalendarPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect('/login');
    const t = await getTranslations('Guide.Calendar');

    // Fetch Availability Blocks
    const rawAvailability = await prisma.guideAvailability.findMany({
        where: { guideId: session.user.id },
        select: { date: true, slots: true }
    });

    // Derive status from slots — if any slots exist, mark as AVAILABLE
    const availability = rawAvailability.map(a => ({
        date: a.date,
        status: (a.slots && Array.isArray(a.slots) && a.slots.length > 0) ? 'AVAILABLE' : 'UNAVAILABLE',
    }));

    // Fetch Assigned Tours via accepted Applications
    const acceptedApps = await prisma.application.findMany({
        where: {
            guideId: session.user.id,
            status: 'ACCEPTED',
            tour: { status: { in: ['OPEN', 'CLOSED', 'IN_PROGRESS'] } }
        },
        select: {
            tour: {
                select: { startDate: true, endDate: true, title: true }
            }
        }
    });

    const assignedTours = acceptedApps
        .filter(a => a.tour.endDate !== null)
        .map(a => ({
            startDate: a.tour.startDate,
            endDate: a.tour.endDate!,
            title: a.tour.title,
        }));

    return (
        <BaseDashboardLayout
            header={
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
                    <p className="text-sm text-gray-600">{t('subtitle')}</p>
                </div>
            }
        >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <GuideCalendar
                    initialAvailability={availability}
                    assignments={assignedTours}
                />
            </div>
        </BaseDashboardLayout>
    );
}
