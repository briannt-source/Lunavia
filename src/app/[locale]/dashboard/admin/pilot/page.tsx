import { prisma } from '@/lib/prisma';
import { BaseDashboardLayout } from '@/components/layout/BaseDashboardLayout';

export const dynamic = 'force-dynamic';

export default async function SystemHealthDashboard() {
    const start = performance.now();
    let dbStatus = 'ONLINE';
    let dbLatency = 0;

    try {
        await prisma.$queryRaw`SELECT 1`;
        dbLatency = Math.round(performance.now() - start);
    } catch {
        dbStatus = 'OFFLINE';
    }

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Use correct models: Tour instead of tour
    const [
        totalTours,
        statusCounts,
        recentErrors,
        activeUsers,
    ] = await Promise.all([
        prisma.tour.count(),
        prisma.tour.groupBy({ by: ['status'], _count: true }),
        // No frictionLog or pilotFeedback model — use AuditLog as proxy
        prisma.auditLog.count({ where: { action: { contains: 'ERROR' }, createdAt: { gte: twentyFourHoursAgo } } }),
        prisma.user.count({ where: { updatedAt: { gte: twentyFourHoursAgo } } }),
    ]);

    const statusMap = statusCounts.reduce((acc, item) => { acc[item.status] = item._count; return acc; }, {} as Record<string, number>);

    // Fetch recent audit logs as friction/error proxy
    const recentLogs = await prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
    });

    return (
        <BaseDashboardLayout>
            <div className="space-y-6 max-w-7xl mx-auto pb-10">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                            🩺 System Health
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-blue-100 text-blue-800 rounded-full">Pilot Ops</span>
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Platform stability, performance metrics, and operational overview</p>
                    </div>
                </div>

                {/* ── ALERTS & OVERVIEW ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    <div className={`p-4 rounded-xl border ${dbStatus === 'ONLINE' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl">🗄️</span>
                            <span className={`h-2 w-2 rounded-full ${dbStatus === 'ONLINE' ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
                        </div>
                        <p className={`text-xl font-black ${dbStatus === 'ONLINE' ? 'text-green-900' : 'text-red-900'}`}>{dbStatus}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-green-700">Database ({dbLatency}ms)</p>
                    </div>
                    
                    <div className="p-4 rounded-xl border bg-white shadow-sm">
                        <span className="text-xl mb-1 block">👥</span>
                        <p className="text-xl font-black text-gray-900">{activeUsers}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Active Users (24h)</p>
                    </div>

                    <div className="p-4 rounded-xl border bg-white shadow-sm">
                        <span className="text-xl mb-1 block">🗺️</span>
                        <p className="text-xl font-black text-gray-900">{totalTours}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Total Tours</p>
                    </div>

                    <div className={`p-4 rounded-xl border ${recentErrors > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                        <span className="text-xl mb-1 block">🚨</span>
                        <p className={`text-xl font-black ${recentErrors > 0 ? 'text-red-900' : 'text-gray-900'}`}>{recentErrors}</p>
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${recentErrors > 0 ? 'text-red-700' : 'text-gray-500'}`}>Errors (24h)</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT COLUMN */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Status Breakdown */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">📊 Tour Status Distribution</h2>
                            <div className="grid grid-cols-4 gap-3">
                                {Object.entries(statusMap).sort((a,b) => b[1] - a[1]).map(([status, count]) => (
                                    <div key={status} className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
                                        <p className="text-xl font-black text-gray-900">{count}</p>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">{status}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="space-y-6">
                        {/* Recent Audit Logs */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                                <h2 className="font-bold text-gray-900 flex items-center gap-2">📋 Recent Audit Logs</h2>
                            </div>
                            {recentLogs.length === 0 ? (
                                <p className="p-6 text-center text-sm text-gray-400">No recent activity</p>
                            ) : (
                                <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
                                    {recentLogs.map(log => (
                                        <div key={log.id} className="p-4 hover:bg-gray-50">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700">
                                                    {log.action}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(log.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-900 mt-1">{log.entityType} — {log.entityId}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </BaseDashboardLayout>
    );
}
