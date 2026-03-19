import { Metadata } from 'next';
import AdminTourDetailClient from './AdminTourDetailClient';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
    title: 'Tour Details | Lunavia Admin',
};

async function getTourData(id: string) {
    const queryTour = await prisma.tour.findUnique({
        where: { id },
        include: {
            operator: {
                select: {
                    id: true,
                    email: true,
                    roleMetadata: true,
                    trustScore: true,
                }
            },
            applications: {
                include: {
                    guide: {
                        select: {
                            id: true,
                            email: true,
                            trustScore: true,
                            verificationStatus: true,
                        }
                    }
                }
            },
            Dispute: {
                orderBy: { createdAt: 'desc' }
            },
        }
    });

    if (!queryTour) return null;

    // Get assigned guide via accepted application
    let assignedGuide = null;
    const acceptedApp = queryTour.applications?.find((a: any) => a.status === 'ACCEPTED' && a.role === 'MAIN');
    if (acceptedApp) {
        assignedGuide = await prisma.user.findUnique({
            where: { id: acceptedApp.guideId },
            select: {
                id: true,
                email: true,
                trustScore: true,
                verificationStatus: true,
            }
        });
    }

    const tAny = queryTour as any;
    let opMetadata: any = {};
    try { opMetadata = JSON.parse(tAny.operator.roleMetadata || '{}'); } catch {}

    const operator = {
        ...tAny.operator,
        companyName: opMetadata.companyName || null,
        phone: opMetadata.phoneNumber || null,
        operatorCategory: opMetadata.operatorCategory || 'STANDARD',
    };

    return { ...tAny, operator, assignedGuide, tourDisputes: tAny.Dispute || [], timelineEvents: [] };
}

export default async function Page({ params }: { params: { id: string } }) {
    const tour = await getTourData(params.id);
    if (!tour) notFound();

    return <AdminTourDetailClient initialData={tour as any} />;
}
