"use client";

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { AUDIT_ACTIONS, ENTITY_TYPES } from '@/domain/governance/AuditService';

interface AuditLog {
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    actorRole: string | null;
    userId: string;
    user: {
        id: string;
        email: string;
        name: string | null;
        role: string;
    };
    beforeState: any;
    afterState: any;
    metadata: any;
    ipAddress: string | null;
    createdAt: string;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export default function AdminAuditPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, totalPages: 0 });

    // Filters
    const [filterAction, setFilterAction] = useState('');
    const [filterEntity, setFilterEntity] = useState('');
    const [filterUserId, setFilterUserId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Modal
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    useEffect(() => {
        fetchLogs();
    }, [pagination.page, filterAction, filterEntity, startDate, endDate]); // Debounce userId in real app, here fetch on button or distinct filter

    async function fetchLogs() {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
            });

            if (filterAction) params.append('action', filterAction);
            if (filterEntity) params.append('entityType', filterEntity);
            if (filterUserId) params.append('userId', filterUserId);
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const res = await fetch(`/api/admin/governance/audit?${params.toString()}`);
            if (!res.ok) throw new Error('Failed to fetch logs');

            const data = await res.json();
            setLogs(data.data || []);
            setPagination(prev => ({ ...prev, ...data.pagination }));
        } catch (err) {
            toast.error('Failed to load audit logs');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    function handleSearch() {
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchLogs();
    }

    function clearFilters() {
        setFilterAction('');
        setFilterEntity('');
        setFilterUserId('');
        setStartDate('');
        setEndDate('');
        setPagination(prev => ({ ...prev, page: 1 }));
        // fetchLogs will trigger via effect if dependent state changes, 
        // but explicit call ensures reset if state didn't change effectively
        setTimeout(fetchLogs, 0);
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Governance Audit Logs</h1>
                    <p className="text-sm text-gray-600">Immutable record of all financial and critical state changes.</p>
                </div>
                <button
                    onClick={fetchLogs}
                    className="text-gray-500 hover:text-lunavia-primary text-sm flex items-center gap-1"
                >
                    ↻ Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Action</label>
                        <select
                            value={filterAction}
                            onChange={e => setFilterAction(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        >
                            <option value="">All Actions</option>
                            {Object.values(AUDIT_ACTIONS).map(act => (
                                <option key={act} value={act}>{act}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Entity Type</label>
                        <select
                            value={filterEntity}
                            onChange={e => setFilterEntity(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        >
                            <option value="">All Entities</option>
                            {Object.values(ENTITY_TYPES).map(ent => (
                                <option key={ent} value={ent}>{ent}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">User ID</label>
                        <input
                            type="text"
                            placeholder="Search User ID..."
                            value={filterUserId}
                            onChange={e => setFilterUserId(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={clearFilters}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                    >
                        Clear Filters
                    </button>
                    <button
                        onClick={handleSearch}
                        className="px-4 py-2 text-sm bg-lunavia-primary text-white rounded-lg hover:bg-lunavia-primary-hover"
                    >
                        Search Logs
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 font-semibold text-gray-600">Timestamp</th>
                                <th className="px-6 py-3 font-semibold text-gray-600">Actor</th>
                                <th className="px-6 py-3 font-semibold text-gray-600">Action</th>
                                <th className="px-6 py-3 font-semibold text-gray-600">Entity</th>
                                <th className="px-6 py-3 font-semibold text-gray-600">Metadata</th>
                                <th className="px-6 py-3 font-semibold text-gray-600">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500 animate-pulse">
                                        Loading audit logs...
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">
                                        No logs found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                logs.map(log => (
                                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-3 whitespace-nowrap text-gray-500 text-xs">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900">
                                                    {log.user?.email || 'Unknown'}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {log.actorRole || log.user?.role}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold
                                                ${log.action.includes('REJECT') ? 'bg-red-100 text-red-800' :
                                                    log.action.includes('APPROVE') || log.action.includes('RELEASE') ? 'bg-green-100 text-green-800' :
                                                        'bg-blue-100 text-blue-800'}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="flex flex-col">
                                                <span className="text-gray-900">{log.entityType}</span>
                                                <span className="text-xs text-gray-500 font-mono">{log.entityId.slice(0, 8)}...</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 max-w-xs truncate text-gray-500 text-xs" title={JSON.stringify(log.metadata)}>
                                            {JSON.stringify(log.metadata)}
                                        </td>
                                        <td className="px-6 py-3">
                                            <button
                                                onClick={() => setSelectedLog(log)}
                                                className="text-lunavia-primary hover:text-lunavia-primary-hover font-medium text-xs border border-lunavia-primary/20 rounded px-2 py-1 hover:bg-lunavia-primary-light"
                                            >
                                                Inspect
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                        Showing {logs.length} of {pagination.total} entries
                    </span>
                    <div className="flex gap-2">
                        <button
                            disabled={pagination.page <= 1}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="px-3 py-1 text-sm text-gray-600 flex items-center">
                            Page {pagination.page} of {pagination.totalPages || 1}
                        </span>
                        <button
                            disabled={pagination.page >= pagination.totalPages}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Audit Log Details</h2>
                                <p className="text-sm text-gray-500 font-mono">{selectedLog.id} • {selectedLog.createdAt}</p>
                            </div>
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="text-gray-400 hover:text-gray-600 text-2xl"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 space-y-6">
                            {/* Header Info */}
                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <span className="block text-xs font-semibold text-gray-500">ACTOR</span>
                                    <span className="font-medium">{selectedLog.user?.email}</span>
                                    <span className="block text-xs text-gray-400">{selectedLog.actorRole} ({selectedLog.ipAddress || 'No IP'})</span>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <span className="block text-xs font-semibold text-gray-500">ACTION</span>
                                    <span className="font-medium text-lunavia-primary">{selectedLog.action}</span>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <span className="block text-xs font-semibold text-gray-500">ENTITY</span>
                                    <span className="font-medium">{selectedLog.entityType}</span>
                                    <span className="block text-xs text-gray-400 font-mono truncate" title={selectedLog.entityId}>{selectedLog.entityId}</span>
                                </div>
                            </div>

                            {/* Metadata */}
                            <div>
                                <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Metadata</h3>
                                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
                                    {JSON.stringify(selectedLog.metadata, null, 2)}
                                </pre>
                            </div>

                            {/* State Diff */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-xs font-bold text-red-600 uppercase mb-2">Before State</h3>
                                    <pre className="bg-red-50 border border-red-100 p-4 rounded-lg text-xs overflow-x-auto h-64 text-red-900">
                                        {selectedLog.beforeState ? JSON.stringify(selectedLog.beforeState, null, 2) : 'No state captured'}
                                    </pre>
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-green-600 uppercase mb-2">After State</h3>
                                    <pre className="bg-green-50 border border-green-100 p-4 rounded-lg text-xs overflow-x-auto h-64 text-green-900">
                                        {selectedLog.afterState ? JSON.stringify(selectedLog.afterState, null, 2) : 'No state captured'}
                                    </pre>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
