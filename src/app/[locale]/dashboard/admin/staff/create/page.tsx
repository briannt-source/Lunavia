import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import CreateStaffForm from './CreateStaffForm';
import { Link } from '@/navigation';

export const metadata = {
    title: 'Create Internal Staff — Lunavia',
};

export default async function CreateStaffPage() {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    // Strict Permissions: Only SUPER_ADMIN
    if (userRole !== 'SUPER_ADMIN') {
        redirect('/dashboard/admin/staff');
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <Link href="/dashboard/admin/staff" className="text-sm text-gray-500 hover:text-gray-900">
                    ← Back to Staff List
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 mt-2">Create New Staff Member</h1>
                <p className="text-sm text-gray-500">Add a new internal user to the Lunavia operations team.</p>
            </div>

            <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
                <CreateStaffForm />
            </div>
        </div>
    );
}
