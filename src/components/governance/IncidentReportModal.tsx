'use client';

import { useState } from 'react';

interface Props {
    tourId: string;
    onClose: () => void;
    onSuccess?: () => void;
}

const INCIDENT_TYPES = [
    { value: 'GUEST_COMPLAINT', label: '😟 Guest Complaint', desc: 'Tourist reported an issue during the tour' },
    { value: 'VEHICLE_DELAY', label: '🚌 Vehicle Delay', desc: 'Transport arrived late or broke down' },
    { value: 'WEATHER', label: '🌧️ Weather', desc: 'Bad weather affecting tour execution' },
    { value: 'GUIDE_ISSUE', label: '⚠️ Guide Issue', desc: 'Problem with guide performance or attendance' },
    { value: 'OTHER', label: '📋 Other', desc: 'Any other operational incident' },
];

export default function IncidentReportModal({ tourId, onClose, onSuccess }: Props) {
    const [type, setType] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!type) { setError('Please select an incident type'); return; }
        if (!description.trim()) { setError('Please describe the incident'); return; }

        setSubmitting(true);
        setError('');

        const res = await fetch(`/api/tours/${tourId}/incident`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, description }),
        });

        if (res.ok) {
            onSuccess?.();
            onClose();
        } else {
            const data = await res.json();
            setError(data.error || 'Failed to report incident');
        }
        setSubmitting(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden animate-fade-in">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-white font-bold text-lg">Report Incident</h2>
                            <p className="text-red-200 text-xs mt-0.5">This will be logged in the tour timeline</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white/70 hover:text-white transition text-xl leading-none"
                        >×</button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
                    )}

                    {/* Incident Type */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Incident Type</label>
                        <div className="grid grid-cols-1 gap-2">
                            {INCIDENT_TYPES.map(t => (
                                <button
                                    key={t.value}
                                    type="button"
                                    onClick={() => setType(t.value)}
                                    className={`flex items-start gap-3 p-3 rounded-xl border-2 text-left transition ${type === t.value
                                        ? 'border-red-500 bg-red-50'
                                        : 'border-gray-100 hover:border-red-200 hover:bg-gray-50'
                                        }`}
                                >
                                    <span className="text-lg">{t.label.split(' ')[0]}</span>
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">{t.label.split(' ').slice(1).join(' ')}</div>
                                        <div className="text-xs text-gray-500">{t.desc}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-1.5">Description</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={3}
                            placeholder="What happened? Be specific — this helps resolve any future disputes."
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition"
                            required
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 px-4 py-3 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 disabled:opacity-50 transition shadow-sm"
                        >
                            {submitting ? 'Reporting...' : '🚨 Report Incident'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-3 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
