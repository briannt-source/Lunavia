import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const metadata = { title: 'Referral System — Lunavia' };

export default async function AdminReferralPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect('/login');

    const rawRole = (session.user as any)?.role || '';
    const adminRole = rawRole.startsWith('ADMIN_') ? rawRole.replace('ADMIN_', '') : rawRole;
    if (!['SUPER_ADMIN', 'OPS_CS', 'OPS', 'FINANCE', 'FINANCE_LEAD', 'MODERATOR'].includes(adminRole)) redirect('/dashboard');

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Referral System</h1>
                <p className="text-sm text-gray-500 mt-1">Track referral signups and top referrers.</p>
            </div>

            <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <p className="text-3xl mb-3">🔗</p>
                <p className="text-gray-500 font-medium">Referral system module is not yet available</p>
                <p className="text-xs text-gray-400 mt-1">The referral tracking model has not been provisioned in the database yet.</p>
            </div>
        </div>
    );
}
