import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Link } from '@/navigation';
import StaffActions from '@/components/admin/StaffActions';

export const metadata = {
    title: 'Internal Staff Management — Lunavia',
};

export default async function InternalStaffPage() {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    // Strict Permissions: Only SUPER_ADMIN
    if (userRole !== 'SUPER_ADMIN') {
        return (
            <div className="p-8 text-center text-red-600">
                <h1 className="text-xl font-bold">Access Denied</h1>
                <p>Only Super Administrators can manage internal staff.</p>
                <Link href="/dashboard/admin" className="text-lunavia-primary underline mt-4 block">
                    Return to Dashboard
                </Link>
            </div>
        );
    }

    // Fetch Internal Users
    const staff = await prisma.user.findMany({
        where: {
            role: { name: { in: ['SUPER_ADMIN', 'OPS', 'FINANCE', 'KYC_ANALYST'] } }
        },
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            email: true,
            role: { select: { name: true } },
            roleMetadata: true,
            accountStatus: true,
            createdAt: true,
        }
    });

    const staffWithDetails = staff.map(member => {
        let name = 'Unnamed';
        try {
            if (member.roleMetadata) {
                const meta = JSON.parse(member.roleMetadata);
                if (meta.name) name = meta.name;
            }
        } catch (e) { }
        return { ...member, name, role: (member.role as { name: string })?.name || 'UNKNOWN' };
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Internal Staff</h1>
                    <p className="text-sm text-gray-500">Manage access for OPS, Finance, and KYC Analyst.</p>
                </div>
                <Link
                    href="/dashboard/admin/staff/create"
                    className="bg-lunavia-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-lunavia-primary-hover"
                >
                    + Add New Staff
                </Link>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Member</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Joined</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {staffWithDetails.map((member) => (
                            <tr key={member.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 flex-shrink-0 bg-lunavia-primary-light rounded-full flex items-center justify-center text-lunavia-primary font-bold">
                                            {member.name?.[0] || member.email[0].toUpperCase()}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{member.name}</div>
                                            <div className="text-sm text-gray-500">{member.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${member.role === 'SUPER_ADMIN' ? 'bg-lunavia-accent-light text-lunavia-accent' :
                                            member.role === 'OPS' ? 'bg-blue-100 text-blue-800' :
                                                member.role === 'KYC_ANALYST' ? 'bg-green-100 text-green-800' :
                                                    'bg-gray-100 text-gray-800'}`}>
                                        {member.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${member.accountStatus === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {member.accountStatus || 'ACTIVE'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(member.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <StaffActions userId={member.id} email={member.email} role={member.role} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
