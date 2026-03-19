'use client';

import React, { useState, useEffect } from 'react';
import {import toast from 'react-hot-toast';

interface BulkTask {
    id: string;
    title: string;
    subtitle: string;
    type: 'APPLICATION' | 'TOUR';
    status: string;
    warning?: string;
}

export function CommandCenter() {
    const [tasks, setTasks] = useState<BulkTask[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [filter, setFilter] = useState<'ALL' | 'APPLICATIONS' | 'TOURS'>('ALL');

    useEffect(() => {
        fetchTasks();
    }, []);

    async function fetchTasks() {
        setLoading(true);
        try {
            // Fetch applications and tours in parallel
            const [appsRes, toursRes] = await Promise.all([
                fetch('/api/guide-applications?status=APPLIED'),
                fetch('/api/requests?mine=true')
            ]);

            const appsData = await appsRes.json();
            const toursData = await toursRes.json();

            const appTasks: BulkTask[] = (appsData.applications || []).map((app: any) => ({
                id: app.id,
                title: `Application: ${app.request.title}`,
                subtitle: `By Guide: ${app.guide.email}`,
                type: 'APPLICATION',
                status: 'Needs Review',
                warning: app.matchingScore < 50 ? '⚠️ Low Matching Score' : undefined
            }));

            const tourTasks: BulkTask[] = (toursData.requests || [])
                .filter((r: any) => r.status === 'COMPLETED')
                .map((tour: any) => ({
                    id: tour.id,
                    title: `Completed Tour: ${tour.title}`,
                    subtitle: `Ended: ${new Date(tour.endDate).toLocaleDateString()}`,
                    type: 'TOUR',
                    status: 'Ready to Close',
                    warning: tour.incidents?.length > 0 ? '🚫 Open Incidents' : undefined
                }));

            setTasks([...appTasks, ...tourTasks]);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        } finally {
            setLoading(false);
        }
    }

    const filteredTasks = tasks.filter(t => {
        if (filter === 'APPLICATIONS') return t.type === 'APPLICATION';
        if (filter === 'TOURS') return t.type === 'TOUR';
        return true;
    });

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const selectAll = () => {
        if (selectedIds.length === filteredTasks.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredTasks.map(t => t.id));
        }
    };

    async function handleBulkAction(actionType: 'ACCEPT' | 'CLOSE') {
        if (selectedIds.length === 0) return;

        setProcessing(true);
        try {
            const action = actionType === 'ACCEPT' ? 'ACCEPT_APPLICATIONS' : 'CLOSE_TOURS';
            const res = await fetch('/api/operator/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, ids: selectedIds })
            });

            const data = await res.json();
            if (res.ok) {
                toast.success(`Successfully processed ${data.results.successful} items.`);
                if (data.results.failed > 0) {
                    toast.error(`Failed to process ${data.results.failed} items.`);
                }
                setSelectedIds([]);
                fetchTasks();
            } else {
                toast.error(data.error || 'Bulk operation failed');
            }
        } catch (err) {
            toast.error('Network error during bulk operation');
        } finally {
            setProcessing(false);
        }
    }

    if (loading) return <div className="p-8 animate-pulse space-y-4"><div className="h-10 bg-gray-100 rounded w-1/4" /><div className="h-64 bg-gray-50 rounded" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    {(['ALL', 'APPLICATIONS', 'TOURS'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => { setFilter(f); setSelectedIds([]); }}
                            className={`px-4 py-1.5 text-xs font-bold rounded-md transition ${filter === f ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleBulkAction('ACCEPT')}
                        disabled={processing || selectedIds.length === 0 || filter === 'TOURS'}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition shadow-sm"
                    >
                        Bulk Accept ({selectedIds.filter(id => tasks.find(t => t.id === id)?.type === 'APPLICATION').length})
                    </button>
                    <button
                        onClick={() => handleBulkAction('CLOSE')}
                        disabled={processing || selectedIds.length === 0 || filter === 'APPLICATIONS'}
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-black disabled:opacity-50 transition shadow-sm"
                    >
                        Bulk Close ({selectedIds.filter(id => tasks.find(t => t.id === id)?.type === 'TOUR').length})
                    </button>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.length === filteredTasks.length && filteredTasks.length > 0}
                                    onChange={selectAll}
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Item</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Alerts</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredTasks.length > 0 ? filteredTasks.map(task => (
                            <tr key={task.id} className={`hover:bg-gray-50 transition cursor-pointer ${selectedIds.includes(task.id) ? 'bg-indigo-50/30' : ''}`} onClick={() => toggleSelect(task.id)}>
                                <td className="px-6 py-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(task.id)}
                                        onChange={() => { }} // Handled by row click
                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-bold text-gray-900">{task.title}</div>
                                    <div className="text-xs text-gray-500">{task.subtitle}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${task.type === 'APPLICATION' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
                                        }`}>
                                        {task.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {task.warning ? (
                                        <span className="text-xs font-medium text-orange-600">{task.warning}</span>
                                    ) : (
                                        <span className="text-xs text-green-600 font-medium">✓ Passed Checks</span>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">
                                    No bulk tasks found for this filter.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="text-[11px] text-gray-400 mt-2 px-1">
                * Bulk closure only applies to tours with no open incidents and no negative feedback signals.
            </div>
        </div>
    );
}
