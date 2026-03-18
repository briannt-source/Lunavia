import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { SecuritySection } from '@/components/profile/SecuritySection';
import Link from 'next/link';

export const metadata = { title: 'Security — Lunavia' };

export default async function SecurityPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect('/login');

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { emailVerified: true },
    });

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <Link href="/dashboard/guide/profile" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition">
                ← Back to Profile
            </Link>
            <div>
                <h1 className="text-xl font-bold text-gray-900">Security Settings</h1>
                <p className="text-sm text-gray-500 mt-1">Manage your password and account security.</p>
            </div>
            <SecuritySection emailVerified={!!user?.emailVerified} />
        </div>
    );
}
