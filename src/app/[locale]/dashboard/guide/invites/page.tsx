import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { BaseDashboardLayout } from '@/components/layout/BaseDashboardLayout';
import { GuideInviteList } from '@/components/dashboard/GuideInviteList';
import { getTranslations } from 'next-intl/server';

export const metadata = { title: 'Tour Invitations — Lunavia' };

export default async function GuideInvitesPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect('/login');

    const t = await getTranslations('Guide.Invites');

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
                <GuideInviteList />
            </div>
        </BaseDashboardLayout>
    );
}
