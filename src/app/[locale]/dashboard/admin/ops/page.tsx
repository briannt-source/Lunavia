import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { BaseDashboardLayout } from '@/components/layout/BaseDashboardLayout';
import { OpsOperationsCenter } from '@/components/ops/OpsOperationsCenter';
import { OperationalAlertPanel } from '@/components/ops/OperationalAlertPanel';

export const metadata = {
    title: 'Operations Center — Lunavia',
};

export default async function OpsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect('/login');

    const role = session.user.role;
    if (!['OPS', 'SUPER_ADMIN', 'ADMIN'].includes(role)) redirect('/dashboard');

    const header = (
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Operations Center</h1>
            <p className="mt-1 text-sm text-gray-500">
                Platform-wide tour monitoring and incident management
            </p>
        </div>
    );

    return (
        <BaseDashboardLayout header={header}>
            <OperationalAlertPanel />
            <div className="mt-6">
                <OpsOperationsCenter />
            </div>
        </BaseDashboardLayout>
    );
}
