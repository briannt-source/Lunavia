import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ProfileEditForm } from '@/components/profile/ProfileEditForm';
import Link from 'next/link';

export const metadata = { title: 'Edit Profile — Lunavia' };

export default async function EditProfilePage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect('/login');

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { role: true },
    });

    if (!user) redirect('/login');

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <Link href="/dashboard/operator/profile" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition">
                ← Back to Profile
            </Link>
            <ProfileEditForm user={{ ...user, role: user.role?.name || 'TOUR_OPERATOR' } as any} role="TOUR_OPERATOR" />
        </div>
    );
}
