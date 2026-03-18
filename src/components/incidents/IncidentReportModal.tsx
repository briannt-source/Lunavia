import { useState } from 'react';
import toast from 'react-hot-toast';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    requestId: string;
}

export default function IncidentReportModal({ isOpen, onClose, requestId }: Props) {
    const [type, setType] = useState('DELAY');
    const [severity, setSeverity] = useState('LOW');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Prepend Type to Description as per Phase 25.x constraints (No DB migration)
            const finalDescription = `[${type}] ${message}`;

            const res = await fetch('/api/incidents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requestId,
                    description: finalDescription,
                    severity,
                }),
            });

            if (res.ok) {
                toast.success('Incident reported successfully');
                onClose();
                setMessage('');
                setType('DELAY');
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to report incident');
            }
        } catch (error) {
            toast.error('Network error');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
                <h2 className="text-xl font-bold text-red-600 mb-4">Report Incident</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Issue Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-gray-300 p-2"
                        >
                            <option value="DELAY">Delay / Schedule Change</option>
                            <option value="GUEST_ISSUE">Guest Issue (Illness, Conflict)</option>
                            <option value="SAFETY">Safety Concern / Accident</option>
                            <option value="VEHICLE">Vehicle / Logistics</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Severity</label>
                        <select
                            value={severity}
                            onChange={(e) => setSeverity(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-gray-300 p-2"
                        >
                            <option value="LOW">Low (FYI, minor delay)</option>
                            <option value="MEDIUM">Medium (Requires attention)</option>
                            <option value="HIGH">High (Urgent, blocks tour)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            required
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            maxLength={500}
                            rows={4}
                            placeholder="Describe what happened..."
                            className="mt-1 w-full rounded-lg border border-gray-300 p-2"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Reporting...' : 'Submit Report'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
