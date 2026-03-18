'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function IncidentDetail({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [incident, setIncident] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState('');
    const [resolution, setResolution] = useState('');
    const [status, setStatus] = useState('RESOLVED');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        // We can reuse the list endpoint but filter in memory or fetch single if we had get endpoint
        // Ideally adding GET /api/incidents/[id] would be better, but for MVP we can rely on list
        // Actually lists return minimal data. Let's assume we fetch full detail or just use list data for now.
        // To keep it simple and robust, let's just use the list endpoint and find locally or implement GET /api/incidents/[id]
        // I'll implement GET /api/incidents/[id] quickly in next step if needed, or just find from list if I had context.
        // Let's implement a quick fetch single logic here assuming the API supports it or we filter.
        // The current GET /api/incidents supports filtering by status, not ID explicitly designed yet.
        // Let's fetch all (filtered by nothing) and find. Not efficient but works for Pilot scale.

        async function load() {
            // Fetch specific incident logic requires API update or filtering.
            // Let's implement GET /api/incidents/[id] is best practice.
            // For now, I'll filter from the general list API which returns all if no status.
            // Wait, I can just update the API to support ID or make a new one. 
            // I will update the GET API in a moment. For now, let's assume I can fetch it.
            const res = await fetch(`/api/incidents?id=${params.id}`);
            // Note: I need to update route.ts to handle id param for single fetch
            const data = await res.json();
            const found = data.incidents?.find((i: any) => i.id === params.id);
            if (found) {
                setIncident(found);
                setNotes(found.internalNotes || '');
                setResolution(found.resolution || '');
                setStatus(found.status);
            }
            setLoading(false);
        }
        load();
    }, [params.id]);

    async function handleResolve() {
        setSubmitting(true);
        try {
            const res = await fetch(`/api/incidents/${params.id}/resolve`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status,
                    resolution,
                    internalNotes: notes
                })
            });

            if (res.ok) {
                router.push('/dashboard/admin/incidents');
            } else {
                alert('Failed to update incident');
            }
        } catch (e) {
            console.error(e);
            alert('Error updating incident');
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) return <div className="p-6">Loading...</div>;
    if (!incident) return <div className="p-6">Incident not found</div>;

    return (
        <div className="max-w-3xl space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Resolve Incident</h1>
                <button
                    onClick={() => router.back()}
                    className="text-sm text-gray-500 hover:text-gray-900"
                >
                    &larr; Back
                </button>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-6 grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase">Reporter</label>
                        <div className="mt-1 text-sm">{incident.reporter.email}</div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase">Tour</label>
                        <div className="mt-1 text-sm">{incident.request.title}</div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase">Severity</label>
                        <div className="mt-1 text-sm font-medium">{incident.severity}</div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase">Created</label>
                        <div className="mt-1 text-sm">{new Date(incident.createdAt).toLocaleString()}</div>
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-xs font-medium text-gray-500 uppercase">Description</label>
                    <div className="mt-2 rounded-md bg-gray-50 p-3 text-sm text-gray-800">
                        {incident.description}
                    </div>
                </div>

                <hr className="my-6 border-gray-200" />

                <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Internal Resolution</h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="OPEN">Open</option>
                            <option value="INVESTIGATING">Investigating</option>
                            <option value="RESOLVED">Resolved</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Internal Notes (CS/Ops Only)</label>
                        <textarea
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                            placeholder="Notes about the investigation..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Resolution (Visible to User)</label>
                        <textarea
                            rows={3}
                            value={resolution}
                            onChange={(e) => setResolution(e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                            placeholder="How was this issue resolved?"
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            onClick={handleResolve}
                            disabled={submitting}
                            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                            {submitting ? 'Updating...' : 'Update Incident'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
