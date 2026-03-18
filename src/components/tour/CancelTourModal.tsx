import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CancelTourModalProps {
    tourId: string;
    tourTitle: string;
    isOpen: boolean;
    onClose: () => void;
    role: 'TOUR_OPERATOR' | 'TOUR_GUIDE';
}

export function CancelTourModal({ tourId, tourTitle, isOpen, onClose, role }: CancelTourModalProps) {
    const router = useRouter();
    const [reason, setReason] = useState('');
    const [explanation, setExplanation] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const reasons = role === 'TOUR_OPERATOR'
        ? [
            { value: 'NOT_ENOUGH_GUESTS', label: 'Not enough guests' },
            { value: 'FORCE_MAJEURE', label: 'Force Majeure (Weather, Disaster)' },
            { value: 'OPERATIONAL_ISSUES', label: 'Operational Issues' },
            { value: 'OTHER', label: 'Other' }
        ]
        : [
            { value: 'PERSONAL_EMERGENCY', label: 'Personal Emergency' },
            { value: 'HEALTH_ISSUE', label: 'Health Issue' },
            { value: 'FORCE_MAJEURE', label: 'Force Majeure (Transport, Disaster)' },
            { value: 'OTHER', label: 'Other' }
        ];

    const isForceMajeure = reason === 'FORCE_MAJEURE';

    async function handleCancel() {
        if (!reason) {
            setError('Please select a reason.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch(`/api/requests/${tourId}/cancel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason, explanation }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to cancel tour');
            }

            // Success
            onClose();
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Cancel Tour</h3>
                    <p className="text-sm text-gray-500 mt-1">Are you sure you want to cancel <span className="font-medium text-gray-900">&quot;{tourTitle}&quot;</span>?</p>
                </div>

                <div className="p-6 space-y-4">
                    {/* Trust Warning */}
                    <div className={`p-4 rounded-lg text-sm border ${isForceMajeure ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                        {isForceMajeure ? (
                            <>
                                <strong>⚠️ Force Majeure Claim:</strong> This will be flagged for manual review. No immediate trust penalty, but false claims will result in severe penalties later.
                            </>
                        ) : (
                            <>
                                <strong>Warning:</strong> Cancelling for this reason plays a negative trust impact and may affect your ability to create/apply for future tours.
                            </>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                        <select
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                        >
                            <option value="">Select a reason...</option>
                            {reasons.map(r => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Explanation (Optional)</label>
                        <textarea
                            value={explanation}
                            onChange={(e) => setExplanation(e.target.value)}
                            rows={3}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                            placeholder="Provide any additional context..."
                        />
                    </div>

                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                            {error}
                        </div>
                    )}
                </div>

                <div className="p-4 bg-gray-50 flex items-center justify-end gap-3 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        disabled={loading}
                    >
                        Keep Tour
                    </button>
                    <button
                        onClick={handleCancel}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        Confirm Cancellation
                    </button>
                </div>
            </div>
        </div>
    );
}
