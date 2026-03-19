import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import ServiceView from '@/components/service/ServiceView';
import OperatorSidebar from '@/components/sidebar/OperatorSidebar';
import GuideSidebar from '@/components/sidebar/GuideSidebar';
import AdminSidebar from '@/components/sidebar/AdminSidebar';
import { PrismaUserTrustRepo } from '@/infrastructure/repositories/PrismaUserTrustRepo';

export const metadata = { title: 'Tour Details — Lunavia' };

export default async function ServiceRequestParamsPage({
    params
}: {
    params: { id: string };
}) {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect('/login');

    const user = session.user;
    const userId = user.id;
    const userRole = user.role;

    // Fetch Tour (renamed from serviceRequest)
    const request = await prisma.tour.findUnique({
        where: { id: params.id },
        include: {
            applications: true,
        }
    });

    if (!request) {
        return <div className="p-8">Request not found</div>;
    }

    // Permission Check
    if (userRole === 'TOUR_OPERATOR' && request.operatorId !== userId) {
        return <div className="p-8">Unauthorized</div>;
    }

    // Fetch Operator Details
    const operator = await prisma.user.findUnique({
        where: { id: request.operatorId },
        select: {
            id: true,
            verificationStatus: true,
            createdAt: true
        }
    });

    // Fetch Assigned Guide (via accepted applications instead of assignedGuideId)
    let assignedGuide = null;
    const acceptedApp = request.applications?.find((a: any) => a.status === 'ACCEPTED' && a.role === 'MAIN');
    if (acceptedApp) {
        assignedGuide = await prisma.user.findUnique({
            where: { id: acceptedApp.guideId },
            select: {
                id: true,
                verificationStatus: true,
                createdAt: true
            }
        });
    }

    // Fetch Trust & Stats for Operator
    let operatorData = null;
    if (operator) {
        const opTrustState = await PrismaUserTrustRepo.getTrustState(operator.id);
        const opTrustScore = opTrustState.score;
        const opCompletedTours = await prisma.tour.count({
            where: { operatorId: operator.id, status: 'COMPLETED' }
        });
        const opIncidents = await prisma.trustRecord.count({
            where: { userId: operator.id, delta: { lt: 0 } }
        });

        operatorData = {
            ...operator,
            roleMetadata: {},
            trustScore: opTrustScore,
            trustState: opTrustState,
            completedTours: opCompletedTours,
            incidentCount: opIncidents
        };
    }

    // Fetch Trust & Stats for Assigned Guide (if any)
    let guideData = null;
    if (assignedGuide) {
        const gTrustState = await PrismaUserTrustRepo.getTrustState(assignedGuide.id);
        const gTrustScore = gTrustState.score;
        // Guide completed tours = count via applications
        const gCompletedTours = await prisma.application.count({
            where: { guideId: assignedGuide.id, status: 'ACCEPTED', tour: { status: 'COMPLETED' } }
        });
        const gIncidents = await prisma.trustRecord.count({
            where: { userId: assignedGuide.id, delta: { lt: 0 } }
        });

        guideData = {
            ...assignedGuide,
            roleMetadata: {},
            trustScore: gTrustScore,
            trustState: gTrustState,
            completedTours: gCompletedTours,
            incidentCount: gIncidents
        };
    }

    // View Data
    const viewData = {
        request: {
            ...request,
        },
        operator: operatorData,
        assignedGuide: guideData
    };

    // Render Layout based on Role
    let Sidebar: any = null;
    if (userRole === 'TOUR_OPERATOR') Sidebar = OperatorSidebar;
    else if (userRole === 'TOUR_GUIDE') Sidebar = GuideSidebar;
    else if (['SUPER_ADMIN', 'OPS', 'FINANCE'].includes(userRole)) Sidebar = AdminSidebar;

    return (
        <div className="flex min-h-screen bg-gray-50">
            {Sidebar && (
                <aside className="w-56 border-r bg-white hidden md:block">
                    <Sidebar />
                </aside>
            )}
            <main className="flex-1 p-6">
                <ServiceView data={viewData} viewerRole={userRole} />
            </main>
        </div>
    );
}
