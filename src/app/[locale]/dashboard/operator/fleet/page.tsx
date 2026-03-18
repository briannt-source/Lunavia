import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { BaseDashboardLayout } from '@/components/layout/BaseDashboardLayout';
import FleetMap from '@/components/tour/FleetMap';

export const metadata = { title: 'Fleet Tracking — Operator Dashboard | Lunavia' };

export default async function OperatorFleetTrackingPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect('/login');
    if (session.user.role !== 'TOUR_OPERATOR') redirect('/dashboard');

    return (
        <BaseDashboardLayout header={
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Live Fleet Tracking</h1>
                    <p className="mt-1 text-sm text-gray-500">Monitor your active tours and guide locations in real-time.</p>
                </div>
            </div>
        }>
            <div className="max-w-7xl mx-auto space-y-6 pb-12">
                <FleetMap isAdmin={false} />
            </div>
        </BaseDashboardLayout>
    );
}
