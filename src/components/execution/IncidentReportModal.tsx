'use client';

import { useState } from 'react';

// ── Incident Report Modal ────────────────────────────────────────────
// Guide can report incidents during tour execution

interface IncidentReportModalProps {
    tourId: string;
    segmentId?: string;
    segmentTitle?: string;
    onClose: () => void;
    onSubmitted: () => void;
}

const SEVERITY_OPTIONS = [
    { value: 'LOW', label: 'Low', desc: 'Minor issue, no impact on tour' },
    { value: 'MEDIUM', label: 'Medium', desc: 'Some impact, can continue' },
    { value: 'HIGH', label: 'High', desc: 'Major issue, tour affected' },
    { value: 'CRITICAL', label: 'Critical', desc: 'Emergency, immediate action needed' },
];

export function IncidentReportModal({ tourId, segmentId, segmentTitle, onClose, onSubmitted }: IncidentReportModalProps) {
    const [description, setDescription] = useState('');
    const [severity, setSeverity] = useState('MEDIUM');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit() {
        if (!description.trim()) {
            setError('Description is required');
            return;
        }
        if (description.trim().length < 10) {
            setError('Please provide more detail (min 10 characters)');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const res = await fetch('/api/incidents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requestId: tourId,
                    description: description.trim() + (segmentId ? ` [Segment: ${segmentTitle || segmentId}]` : ''),
                    severity,
                }),
            });

            const data = await res.json();
            if (res.ok) {
                onSubmitted();
                onClose();
            } else {
                setError(data.error?.message || data.error || 'Failed to report incident');
            }
        } catch {
            setError('Network error');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Report Issue</h3>
                        {segmentTitle && (
                            <p className="text-sm text-gray-500">Segment: {segmentTitle}</p>
                        )}
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 text-sm text-red-700">{error}</div>
                )}

                <div className="space-y-4">
                    {/* Severity */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                        <div className="grid grid-cols-2 gap-2">
                            {SEVERITY_OPTIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => setSeverity(opt.value)}
                                    className={`text-left rounded-lg border p-2.5 transition ${severity === opt.value
                                            ? 'border-red-300 bg-red-50 ring-1 ring-red-300'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className={`text-sm font-medium ${severity === opt.value ? 'text-red-700' : 'text-gray-700'}`}>
                                        {opt.label}
                                    </div>
                                    <div className="text-[10px] text-gray-500">{opt.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            What happened? <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={4}
                            maxLength={1000}
                            placeholder="Describe the issue in detail..."
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base resize-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                        <div className="text-xs text-gray-400 text-right mt-1">{description.length}/1000</div>
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition shadow-sm"
                        style={{ minHeight: '44px' }}
                    >
                        {submitting ? 'Reporting...' : 'Report Issue'}
                    </button>
                </div>
            </div>
        </div>
    );
}
