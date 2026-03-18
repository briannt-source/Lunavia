import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { BaseDashboardLayout } from '@/components/layout/BaseDashboardLayout';
import { OperatorLiveMonitor } from '@/components/operator/OperatorLiveMonitor';

export const metadata = {
    title: 'Command Center — Lunavia',
};

export default async function OperatorCommandCenterPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'TOUR_OPERATOR') {
        redirect('/dashboard');
    }

    const header = (
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Command Center</h1>
            <p className="mt-1 text-sm text-gray-500">
                Monitor all your tours in real time
            </p>
        </div>
    );

    return (
        <BaseDashboardLayout header={header}>
            <OperatorLiveMonitor />
        </BaseDashboardLayout>
    );
}
