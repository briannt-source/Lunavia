'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

interface DisputeModalProps {
    isOpen: boolean;
    onClose: () => void;
    tourId: string;
    onSuccess?: () => void;
}

export default function DisputeModal({ isOpen, onClose, tourId, onSuccess }: DisputeModalProps) {
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [evidenceUrl, setEvidenceUrl] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!reason.trim() || !description.trim()) {
            toast.error('Reason and description are required.');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/disputes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tourId,
                    reason,
                    description,
                    evidenceUrl: evidenceUrl || undefined
                }),
            });

            if (res.ok) {
                toast.success('Dispute opened successfully.');
                onClose();
                if (onSuccess) onSuccess();
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to open dispute.');
            }
        } catch (error) {
            toast.error('An error occurred while opening the dispute.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Open a Dispute</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <p className="text-sm text-gray-500">
                        If there is a severe mismatch, an unresolvable argument, or a safety violation during the tour, you can open a dispute. Ops/Admin will mediate.
                    </p>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                        <select
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 text-sm"
                        >
                            <option value="">Select a reason...</option>
                            <option value="NO_SHOW">No Show</option>
                            <option value="LATE_ARRIVAL">Late Arrival</option>
                            <option value="POOR_PERFORMANCE">Poor Performance / Mismatch</option>
                            <option value="SAFETY_VIOLATION">Safety Violation</option>
                            <option value="PAYMENT_ISSUE">Payment Issue</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            required
                            placeholder="Provide detailed context for your dispute..."
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Evidence Link (Optional)</label>
                        <input
                            type="url"
                            value={evidenceUrl}
                            onChange={(e) => setEvidenceUrl(e.target.value)}
                            placeholder="e.g. Google Drive link to images or screenshots"
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 text-sm"
                        />
                        <p className="text-xs text-gray-400 mt-1">If you have screenshots or proofs, please provide a link.</p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 font-medium">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 shadow-sm disabled:opacity-50"
                        >
                            {loading ? 'Submitting...' : 'Submit Dispute'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
