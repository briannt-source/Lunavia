'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function IncidentDashboard() {
    const { data: session } = useSession();
    const router = useRouter();
    const [incidents, setIncidents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('OPEN');

    const fetchIncidents = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/incidents?status=${filter === 'ALL' ? '' : filter}`);
            const data = await res.json();
            if (data.incidents) {
                setIncidents(data.incidents);
            }
        } catch (error) {
            console.error('Failed to fetch incidents', error);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchIncidents();
    }, [fetchIncidents]);

    function getSeverityColor(severity: string) {
        switch (severity) {
            case 'CRITICAL': return 'text-red-600 bg-red-50 border-red-200';
            case 'HIGH': return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'MEDIUM': return 'text-amber-600 bg-amber-50 border-amber-200';
            default: return 'text-blue-600 bg-blue-50 border-blue-200';
        }
    }

    if (loading && incidents.length === 0) return <div className="p-6">Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Incident Management</h1>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="rounded-md border border-gray-300 p-2"
                >
                    <option value="OPEN">Open</option>
                    <option value="INVESTIGATING">Investigating</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="ALL">All Statuses</option>
                </select>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Severity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Reported</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Tour</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Reporter</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {incidents.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                                    No incidents found.
                                </td>
                            </tr>
                        ) : (
                            incidents.map((incident) => (
                                <tr key={incident.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                                            {incident.severity}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(incident.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {incident.request.title}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                        {incident.description}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {incident.reporter.email} ({incident.reporter.role?.name || 'Unknown'})
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {incident.status}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link
                                            href={`/dashboard/admin/incidents/${incident.id}`}
                                            className="text-indigo-600 hover:text-indigo-900"
                                        >
                                            Resolve
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
