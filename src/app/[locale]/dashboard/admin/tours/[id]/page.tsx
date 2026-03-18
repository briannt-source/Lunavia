import { Metadata } from 'next';
import AdminTourDetailClient from './AdminTourDetailClient';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
    title: 'Tour Details | Lunavia Admin',
};

async function getTourData(id: string) {
    const queryTour = await prisma.serviceRequest.findUnique({
        where: { id },
        include: {
            operator: {
                select: {
                    id: true,
                    email: true,
                    roleMetadata: true,
                    avatarUrl: true,
                    trustScore: true,
                }
            },
            applications: {
                include: {
                    guide: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatarUrl: true,
                            trustScore: true,
                            verificationStatus: true,
                            experienceYears: true,
                        }
                    }
                }
            },
            tourDisputes: {
                include: {
                    evidence: {
                        orderBy: { createdAt: 'desc' }
                    }
                },
                orderBy: { createdAt: 'desc' }
            },
            timelineEvents: {
                orderBy: { createdAt: 'desc' },
                take: 50
            }
        }
    });

    if (!queryTour) return null;

    let assignedGuide = null;
    if (queryTour.assignedGuideId) {
        assignedGuide = await prisma.user.findUnique({
            where: { id: queryTour.assignedGuideId },
            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
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

    return { ...tAny, operator, assignedGuide };
}

export default async function Page({ params }: { params: { id: string } }) {
    const tour = await getTourData(params.id);
    if (!tour) notFound();

    return <AdminTourDetailClient initialData={tour as any} />;
}
