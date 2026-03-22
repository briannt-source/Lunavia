import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Link } from '@/navigation';

export const metadata = {
    title: 'My Profile — Lunavia',
};

export default async function InternalProfilePage() {
    const session = await getServerSession(authOptions);
    const user = await prisma.user.findUnique({
        where: { id: (session?.user as any)?.id },
        include: { role: true }
    });

    if (!user) return <div className="p-8 text-center text-gray-500">User not found</div>;

    let name = 'Not set';
    try {
        if (user.roleMetadata) {
            const meta = JSON.parse(user.roleMetadata);
            if (meta.name) name = meta.name;
        }
    } catch (e) { }

    const roleName = user.role?.name || 'UNKNOWN';
    const roleColors: Record<string, string> = {
        SUPER_ADMIN: 'from-lunavia-primary to-lunavia-accent',
        OPS: 'from-lunavia-primary to-cyan-600',
        FINANCE: 'from-green-500 to-teal-600',
        KYC_ANALYST: 'from-amber-500 to-orange-600',
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Profile Header Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className={`h-20 bg-gradient-to-r ${roleColors[roleName] || 'from-gray-400 to-gray-500'}`} />
                <div className="px-8 pb-8 -mt-10">
                    <div className="flex items-end gap-5">
                        <div className="h-20 w-20 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center text-2xl font-bold text-gray-600">
                            {name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                        </div>
                        <div className="pb-1">
                            <h1 className="text-xl font-bold text-gray-900">{name}</h1>
                            <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Role</p>
                    <span className={`inline-block px-3 py-1 rounded-lg text-sm font-bold text-white bg-gradient-to-r ${roleColors[roleName] || 'from-gray-400 to-gray-500'}`}>
                        {roleName}
                    </span>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        user.accountStatus === 'ACTIVE'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                    }`}>
                        {user.accountStatus || 'ACTIVE'}
                    </span>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Member Since</p>
                    <p className="text-sm font-semibold text-gray-900">
                        {user.createdAt.toLocaleDateString('vi-VN')}
                    </p>
                </div>
            </div>

            {/* Navigation Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link href="/dashboard/admin/profile/security" className="group bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:border-lunavia-primary/30 hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-lunavia-primary-light flex items-center justify-center text-lg group-hover:bg-lunavia-primary/10 transition">
                            🔐
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Security</h3>
                            <p className="text-xs text-gray-500">Change password, manage sessions</p>
                        </div>
                    </div>
                    <div className="mt-4 text-xs font-semibold text-lunavia-primary group-hover:translate-x-1 transition-transform">
                        Manage →
                    </div>
                </Link>

                <Link href="/dashboard/admin/profile/settings" className="group bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:border-lunavia-accent/30 hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-lunavia-accent-light flex items-center justify-center text-lg group-hover:bg-lunavia-accent/10 transition">
                            ⚙️
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Settings</h3>
                            <p className="text-xs text-gray-500">Avatar, display name, theme</p>
                        </div>
                    </div>
                    <div className="mt-4 text-xs font-semibold text-lunavia-accent group-hover:translate-x-1 transition-transform">
                        Manage →
                    </div>
                </Link>
            </div>
        </div>
    );
}
