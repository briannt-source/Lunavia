'use client';

import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface PortfolioEntry {
    id: string;
    type: string;
    title: string;
    description: string | null;
    year: number | null;
    createdAt: string;
}

const TYPE_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
    OPERATOR_MILESTONE: { label: 'Company Milestone', icon: '🏢', color: '#6366f1' },
    GUIDE_EXPERIENCE: { label: 'Experience', icon: '🗺️', color: '#0ea5e9' },
    CERTIFICATION: { label: 'Certification', icon: '📜', color: '#10b981' },
};

export default function PortfolioTimelineSeparated({ role }: { role: 'TOUR_OPERATOR' | 'TOUR_GUIDE' }) {
    const { data: session } = useSession();
    const { data, mutate } = useSWR('/api/portfolio/entries', fetcher);
    const [showAdd, setShowAdd] = useState(false);
    const [newEntry, setNewEntry] = useState({ type: '', title: '', description: '', year: '' });
    const [submitting, setSubmitting] = useState(false);

    const entries: PortfolioEntry[] = data?.data || [];

    // Filter entries by role
    const allowedTypes = role === 'TOUR_OPERATOR'
        ? ['OPERATOR_MILESTONE', 'CERTIFICATION']
        : ['GUIDE_EXPERIENCE', 'CERTIFICATION'];

    const filteredEntries = entries.filter(e => allowedTypes.includes(e.type));

    const defaultType = role === 'TOUR_OPERATOR' ? 'OPERATOR_MILESTONE' : 'GUIDE_EXPERIENCE';

    async function handleAdd() {
        setSubmitting(true);
        try {
            await fetch('/api/portfolio/entries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: newEntry.type || defaultType,
                    title: newEntry.title,
                    description: newEntry.description,
                    year: newEntry.year || null,
                }),
            });
            setShowAdd(false);
            setNewEntry({ type: '', title: '', description: '', year: '' });
            mutate();
        } catch {}
        setSubmitting(false);
    }

    async function handleDelete(entryId: string) {
        await fetch('/api/portfolio/entries', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ entryId }),
        });
        mutate();
    }

    const sectionTitle = role === 'TOUR_OPERATOR' ? 'Company Timeline' : 'Experience & Certifications';

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold text-gray-900">{sectionTitle}</h3>
                <button
                    onClick={() => setShowAdd(true)}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                >+ Add Entry</button>
            </div>

            {filteredEntries.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No entries yet. Add your first one!</p>
            )}

            <div className="space-y-4">
                {filteredEntries.map((entry) => {
                    const config = TYPE_CONFIG[entry.type] || TYPE_CONFIG.CERTIFICATION;
                    return (
                        <div key={entry.id} className="flex gap-3 items-start group">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: `${config.color}15` }}>
                                {config.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-900">{entry.title}</span>
                                    {entry.year && <span className="text-xs text-gray-400">{entry.year}</span>}
                                </div>
                                {entry.description && (
                                    <p className="text-xs text-gray-500 mt-0.5">{entry.description}</p>
                                )}
                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full mt-1 inline-block" style={{ background: `${config.color}15`, color: config.color }}>
                                    {config.label}
                                </span>
                            </div>
                            <button
                                onClick={() => handleDelete(entry.id)}
                                className="opacity-0 group-hover:opacity-100 text-xs text-gray-400 hover:text-red-500 transition-opacity"
                            >✕</button>
                        </div>
                    );
                })}
            </div>

            {/* Add Entry Modal */}
            {showAdd && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
                        <h4 className="text-sm font-semibold text-gray-900 mb-4">Add Portfolio Entry</h4>
                        <div className="space-y-3">
                            <select
                                value={newEntry.type || defaultType}
                                onChange={(e) => setNewEntry({ ...newEntry, type: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            >
                                {allowedTypes.map((t) => (
                                    <option key={t} value={t}>{TYPE_CONFIG[t]?.label || t}</option>
                                ))}
                            </select>
                            <input
                                placeholder="Title"
                                value={newEntry.title}
                                onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            />
                            <textarea
                                placeholder="Description (optional)"
                                value={newEntry.description}
                                onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                rows={2}
                            />
                            <input
                                type="number"
                                placeholder="Year (optional)"
                                value={newEntry.year}
                                onChange={(e) => setNewEntry({ ...newEntry, year: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            />
                        </div>
                        <div className="mt-4 flex gap-3">
                            <button onClick={() => setShowAdd(false)} className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700">Cancel</button>
                            <button onClick={handleAdd} disabled={submitting || !newEntry.title.trim()} className="flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50">
                                {submitting ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
