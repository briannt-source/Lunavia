import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Link } from '@/navigation';

export const metadata = {
    title: 'My Profile — Lunavia',
};

export default async function InternalProfilePage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return <div className="p-8 text-center text-gray-500">Not authenticated</div>;
    }

    const rawRole = (session.user as any)?.role || '';
    const adminRole = rawRole.startsWith('ADMIN_') ? rawRole.replace('ADMIN_', '') : rawRole;

    // Try to get admin user from AdminUser table
    let adminUser: any = null;
    try {
        adminUser = await prisma.adminUser.findUnique({
            where: { email: session.user.email! },
        });
    } catch (e) { }

    const displayName = (session.user as any)?.name || session.user?.email?.split('@')[0] || 'Admin';
    const displayEmail = session.user.email || '';

    const roleColors: Record<string, string> = {
        SUPER_ADMIN: 'from-violet-600 to-purple-600',
        MODERATOR: 'from-blue-500 to-indigo-600',
        OPS_CS: 'from-teal-500 to-cyan-600',
        FINANCE: 'from-amber-500 to-orange-600',
        FINANCE_LEAD: 'from-orange-500 to-red-500',
        SUPPORT_STAFF: 'from-gray-500 to-gray-600',
        KYC_ANALYST: 'from-green-500 to-emerald-600',
    };

    const roleLabel = adminRole.replace(/_/g, ' ');

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Profile Header Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className={`h-20 bg-gradient-to-r ${roleColors[adminRole] || 'from-gray-400 to-gray-500'}`} />
                <div className="px-8 pb-8 -mt-10">
                    <div className="flex items-end gap-5">
                        <div className="h-20 w-20 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center text-2xl font-bold text-gray-600">
                            {displayName[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="pb-1">
                            <h1 className="text-xl font-bold text-gray-900">{displayName}</h1>
                            <p className="text-sm text-gray-500">{displayEmail}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Role</p>
                    <span className={`inline-block px-3 py-1 rounded-lg text-sm font-bold text-white bg-gradient-to-r ${roleColors[adminRole] || 'from-gray-400 to-gray-500'}`}>
                        {roleLabel}
                    </span>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Status</p>
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                        ACTIVE
                    </span>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Member Since</p>
                    <p className="text-sm font-semibold text-gray-900">
                        {adminUser?.createdAt
                            ? new Date(adminUser.createdAt).toLocaleDateString('vi-VN')
                            : 'N/A'}
                    </p>
                </div>
            </div>

            {/* Permissions */}
            {adminUser?.permissions && adminUser.permissions.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Permissions</p>
                    <div className="flex flex-wrap gap-1.5">
                        {adminUser.permissions.map((p: string) => (
                            <span key={p} className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded font-mono">
                                {p.replace(/_/g, ' ').toLowerCase()}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Navigation Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link href="/dashboard/admin/profile/security" className="group bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:border-violet-300 hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-violet-50 flex items-center justify-center text-lg group-hover:bg-violet-100 transition">
                            🔐
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Security</h3>
                            <p className="text-xs text-gray-500">Change password, manage sessions</p>
                        </div>
                    </div>
                    <div className="mt-4 text-xs font-semibold text-violet-600 group-hover:translate-x-1 transition-transform">
                        Manage →
                    </div>
                </Link>

                <Link href="/dashboard/admin/profile/settings" className="group bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:border-blue-300 hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-lg group-hover:bg-blue-100 transition">
                            ⚙️
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Settings</h3>
                            <p className="text-xs text-gray-500">Avatar, display name, theme</p>
                        </div>
                    </div>
                    <div className="mt-4 text-xs font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
                        Manage →
                    </div>
                </Link>
            </div>
        </div>
    );
}
