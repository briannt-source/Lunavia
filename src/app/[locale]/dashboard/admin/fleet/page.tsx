import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const metadata = { title: 'Fleet Tracking | God Mode — Lunavia' };

export default async function AdminFleetPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect('/login');
    const rawRole = (session.user as any)?.role || '';
    const adminRole = rawRole.startsWith('ADMIN_') ? rawRole.replace('ADMIN_', '') : rawRole;
    if (!['SUPER_ADMIN', 'OPS_CS', 'OPS', 'MODERATOR'].includes(adminRole)) redirect('/dashboard');

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Global Fleet Tracking</h1>
                    <p className="mt-1 text-sm text-gray-500">Live God-mode view of all active tours across the platform.</p>
                </div>
            </div>

            <div className="relative rounded-2xl border border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-white p-12 text-center">
                <div className="mx-auto max-w-md">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                        <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                    </div>
                    <h2 className="mb-2 text-xl font-semibold text-gray-900">
                        Coming Soon
                    </h2>
                    <p className="mb-6 text-sm text-gray-600">
                        Real-time fleet tracking requires WebSocket infrastructure and GPS integration. This feature is planned for a future release.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3 text-xs text-gray-500">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">Live GPS Tracking</span>
                        <span className="rounded-full bg-green-50 px-3 py-1 text-green-700">Tour Progress</span>
                        <span className="rounded-full bg-purple-50 px-3 py-1 text-purple-700">Guide Locations</span>
                        <span className="rounded-full bg-orange-50 px-3 py-1 text-orange-700">Real-time Alerts</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
