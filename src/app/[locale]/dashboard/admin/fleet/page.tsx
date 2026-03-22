import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { BaseDashboardLayout } from '@/components/layout/BaseDashboardLayout';
import FleetMap from '@/components/tour/FleetMap';

export const metadata = { title: 'Fleet Tracking | God Mode — Lunavia' };

export default async function AdminFleetPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect('/login');
    const rawRole = (session.user as any)?.role || '';
    const adminRole = rawRole.startsWith('ADMIN_') ? rawRole.replace('ADMIN_', '') : rawRole;
    if (!['SUPER_ADMIN', 'OPS_CS', 'OPS', 'MODERATOR'].includes(adminRole)) redirect('/dashboard');

    return (
        <BaseDashboardLayout header={
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Global Fleet Tracking</h1>
                    <p className="mt-1 text-sm text-gray-500">Live God-mode view of all active tours across the platform.</p>
                </div>
            </div>
        }>
            <div className="max-w-7xl mx-auto space-y-6 pb-12">
                <FleetMap isAdmin={true} />
            </div>
        </BaseDashboardLayout>
    );
}
