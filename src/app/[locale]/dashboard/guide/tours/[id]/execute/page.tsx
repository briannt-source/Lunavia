import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { GuideExecutionInterface } from '@/components/guide/GuideExecutionInterface';

export const metadata = { title: 'Execute Tour — Lunavia' };

export default async function GuideExecutePage({
    params,
}: {
    params: { id: string };
}) {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect('/login');
    if (session.user.role !== 'TOUR_GUIDE') redirect('/dashboard');

    // Verify this guide is assigned to this tour (via accepted application)
    const assignment = await prisma.application.findFirst({
        where: {
            tourId: params.id,
            guideId: session.user.id,
            status: 'ACCEPTED',
        },
    });

    if (!assignment) {
        redirect('/dashboard/guide');
    }

    return <GuideExecutionInterface tourId={params.id} />;
}
