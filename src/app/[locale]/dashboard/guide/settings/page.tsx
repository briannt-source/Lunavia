import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { PrismaUserTrustRepo } from '@/infrastructure/repositories/PrismaUserTrustRepo';
import SettingsForm from '@/components/settings/SettingsForm';

export const metadata = { title: 'Settings — Lunavia' };

export default async function SettingsPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) redirect('/login');
    const user = session.user;

    try {
        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
                id: true,
                role: true,
                verifiedStatus: true,
            }
        });

        if (!dbUser) redirect('/login');

        const trustState = await PrismaUserTrustRepo.getTrustState(dbUser.id);

        return (
            <SettingsForm
                user={{
                    ...user,
                    kybStatus: dbUser.verifiedStatus,
                    kycStatus: dbUser.verifiedStatus,
                    verificationStatus: dbUser.verifiedStatus
                }}
                trustScore={trustState.score}
                kybStatus={dbUser.verifiedStatus}
                kycStatus={dbUser.verifiedStatus}
                paymentInfo={null}
            />
        );
    } catch (e) {
        console.error("Settings fetch error", e);
        return <div>Error loading settings</div>;
    }
}
