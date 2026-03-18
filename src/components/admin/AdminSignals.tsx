'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminSignals() {
    const router = useRouter();
    const [metrics, setMetrics] = useState<{
        pendingVerifications: number;
        openIncidents: number;
        suspendedUsers: number | null;
    }>({
        pendingVerifications: 0,
        openIncidents: 0,
        suspendedUsers: null, // Not yet available
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSignals() {
            try {
                // We need a lightweight signals API. For MVP, we'll fetch from respective APIs or a dedicated one.
                // Let's assume we can hit the endpoints we made.

                // 1. Pending Verifications
                const verRes = await fetch('/api/admin/verification/pending');
                const verData = await verRes.json();
                const pendingVerifications = verData.submissions ? verData.submissions.length : 0;

                // 2. Open Incidents
                const incRes = await fetch('/api/incidents?status=OPEN');
                const incData = await incRes.json();
                const openIncidents = incData.incidents ? incData.incidents.length : 0;

                // 3. Suspended Users - We don't have a direct count API yet.
                // For MVP, we'll skip or mock, OR simpler: create /api/admin/signals route.
                // Let's create the route efficiently in the next step.
                // For now, assume 0 or placeholder.

                setMetrics({
                    pendingVerifications,
                    openIncidents,
                    suspendedUsers: null // Will be fetched when API is available
                });
            } catch (e) {
                console.error('Failed to fetch signals', e);
            } finally {
                setLoading(false);
            }
        }

        fetchSignals();
    }, []);

    if (loading) return <div className="animate-pulse h-24 bg-gray-100 rounded-lg"></div>;

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-red-100 bg-red-50 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-red-600">Open Incidents</p>
                        <p className="text-2xl font-bold text-red-900">{metrics.openIncidents}</p>
                    </div>
                    <Link href="/dashboard/admin/incidents" className="text-sm text-red-600 underline">View</Link>
                </div>
            </div>

            <div className="rounded-lg border border-yellow-100 bg-yellow-50 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-yellow-600">Pending Verification</p>
                        <p className="text-2xl font-bold text-yellow-900">{metrics.pendingVerifications}</p>
                    </div>
                    <Link href="/dashboard/admin/verification" className="text-sm text-yellow-600 underline">Review</Link>
                </div>
            </div>

            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">Total Users</p>
                        <p className="text-xs text-gray-500">(Active/Suspended/Total)</p>
                    </div>
                    <Link href="/dashboard/admin/users" className="text-sm text-gray-600 underline">Manage</Link>
                </div>
            </div>
        </div>
    );
}
