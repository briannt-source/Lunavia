import Link from 'next/link';
import { prisma } from '@/lib/prisma';

interface ActionItemsWidgetProps {
    role: 'TOUR_OPERATOR' | 'TOUR_GUIDE';
    userId: string;
}

export async function ActionItemsWidget({ role, userId }: ActionItemsWidgetProps) {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const actions = [];

    if (role === 'TOUR_OPERATOR') {
        const pendingAppsCount = await prisma.guideApplication.count({
            where: {
                request: { operatorId: userId },
                status: 'APPLIED'
            }
        });

        const staleDraftsCount = await prisma.tour.count({
            where: {
                operatorId: userId,
                status: 'DRAFT',
                updatedAt: { lt: oneDayAgo }
            }
        });

        if (pendingAppsCount > 0) {
            actions.push({
                label: 'Review Applications',
                desc: `${pendingAppsCount} guides waiting for approval`,
                href: '/dashboard/operator/tours?status=OPEN', // Ideally filter by pending apps
                icon: 'busts_in_silhouette',
                color: 'bg-amber-50 text-amber-700'
            });
        }

        if (staleDraftsCount > 0) {
            actions.push({
                label: 'Publish Drafts',
                desc: `${staleDraftsCount} drafts unchecked > 24h`,
                href: '/dashboard/operator/tours?status=DRAFT',
                icon: 'pencil',
                color: 'bg-gray-100 text-gray-700'
            });
        }
    } else {
        // Guide Actions
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { kycStatus: true, verificationStatus: true }
        });

        if (user?.kycStatus !== 'APPROVED') {
            actions.push({
                label: 'Complete Verification',
                desc: 'Unlock tour applications',
                href: '/dashboard/guide/verification',
                icon: 'id_button',
                color: 'bg-red-50 text-red-700'
            });
        }

        // Check for offers
        const offersCount = await prisma.tour.count({
            where: {
                assignedGuideId: userId,
                status: 'OFFERED' // Assuming we have an OFFERED status for direct assigns or after application approval if that flow exists
            }
        });

        if (offersCount > 0) {
            actions.push({
                label: 'Review Job Offers',
                desc: `${offersCount} tours offered to you`,
                href: '/dashboard/guide/assigned',
                icon: 'star',
                color: 'bg-indigo-50 text-indigo-700'
            });
        }
    }

    if (actions.length === 0) {
        return (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-full flex flex-col justify-center items-center text-center">
                <div className="bg-green-50 p-3 rounded-full mb-3">
                    <span className="text-2xl">✅</span>
                </div>
                <h3 className="text-gray-900 font-medium">All Caught Up!</h3>
                <p className="text-gray-500 text-sm mt-1">No pending actions required.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-full">
            <h3 className="font-bold text-gray-900 mb-4">⚡ Action Items</h3>
            <div className="space-y-3">
                {actions.map((action, idx) => (
                    <Link href={action.href} key={idx} className="block group">
                        <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-indigo-200 hover:bg-gray-50 transition-all">
                            <div className={`p-2 rounded-lg ${action.color}`}>
                                {/* Simple emoji icons for now */}
                                {action.icon === 'busts_in_silhouette' && '👥'}
                                {action.icon === 'pencil' && '📝'}
                                {action.icon === 'id_button' && '🪪'}
                                {action.icon === 'star' && '⭐'}
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900 text-sm group-hover:text-indigo-600 transition-colors">{action.label}</h4>
                                <p className="text-xs text-gray-500">{action.desc}</p>
                            </div>
                            <div className="ml-auto text-gray-400 group-hover:text-indigo-500">
                                →
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
