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
        // Fetch fresh status in realtime
        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
                id: true,
                role: true,
                kybStatus: true,
                kycStatus: true,
                verificationStatus: true,
                paymentInfo: true, // Fetch payment details
            }
        });

        if (!dbUser) redirect('/login');

        // Fetch Trust Score using Repo
        const trustState = await PrismaUserTrustRepo.getTrustState(dbUser.id);

        let parsedPaymentInfo = null;
        if (dbUser.paymentInfo) {
            try {
                parsedPaymentInfo = JSON.parse(dbUser.paymentInfo);
            } catch (e) {
                console.error("Failed to parse paymentInfo", e);
            }
        }

        return (
            <SettingsForm
                user={{
                    ...user, // existing session user details
                    kybStatus: dbUser.kybStatus, // Ensure consistent status from DB
                    kycStatus: dbUser.kycStatus,
                    verificationStatus: dbUser.verificationStatus
                }}
                trustScore={trustState.score}
                kybStatus={dbUser.kybStatus}
                kycStatus={dbUser.kycStatus}
                paymentInfo={parsedPaymentInfo}
            />
        );
    } catch (e) {
        console.error("Settings fetch error", e);
        return <div>Error loading settings</div>;
    }
}
