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

    // Fetch Request (No includes for operator/guide due to schema limitations)
    const request = await prisma.serviceRequest.findUnique({
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
            roleMetadata: true,
            verificationStatus: true,
            kybStatus: true,
            createdAt: true
        }
    });

    // Fetch Assigned Guide Details
    let assignedGuide = null;
    if (request.assignedGuideId) {
        assignedGuide = await prisma.user.findUnique({
            where: { id: request.assignedGuideId },
            select: {
                id: true,
                roleMetadata: true,
                verificationStatus: true,
                kycStatus: true,
                createdAt: true
            }
        });
    }

    // Fetch Trust & Stats for Operator
    let operatorData = null;
    if (operator) {
        const opTrustState = await PrismaUserTrustRepo.getTrustState(operator.id);
        const opTrustScore = opTrustState.score;
        const opCompletedTours = await prisma.serviceRequest.count({
            where: { operatorId: operator.id, status: 'COMPLETED' }
        });
        const opIncidents = await prisma.trustEvent.count({
            where: { userId: operator.id, changeValue: { lt: 0 } }
        });

        operatorData = {
            ...operator,
            roleMetadata: operator.roleMetadata ? JSON.parse(operator.roleMetadata) : {},
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
        const gCompletedTours = await prisma.serviceRequest.count({
            where: { assignedGuideId: assignedGuide.id, status: 'COMPLETED' }
        });
        const gIncidents = await prisma.trustEvent.count({
            where: { userId: assignedGuide.id, changeValue: { lt: 0 } }
        });

        guideData = {
            ...assignedGuide,
            roleMetadata: assignedGuide.roleMetadata ? JSON.parse(assignedGuide.roleMetadata) : {},
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
            rolesNeeded: request.rolesNeeded ? JSON.parse(request.rolesNeeded) : []
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
