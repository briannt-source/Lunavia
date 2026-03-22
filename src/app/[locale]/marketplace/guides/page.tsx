'use client';

import { useState, useEffect, useCallback } from 'react';
import GuideDiscovery from '@/components/marketplace/GuideDiscovery';
import type { GuideCardData } from '@/components/marketplace/GuideCard';

export default function GuidesMarketplacePage() {
    const [guides, setGuides] = useState<GuideCardData[]>([]);
    const [loading, setLoading] = useState(true);
    const [availableDate, setAvailableDate] = useState('');

    // Invite modal state
    const [targetGuideId, setTargetGuideId] = useState<string | null>(null);
    const [tours, setTours] = useState<any[]>([]);
    const [loadingTours, setLoadingTours] = useState(false);
    const [inviting, setInviting] = useState<string | null>(null);
    const [inviteSuccess, setInviteSuccess] = useState('');

    // Saved guides
    const [savedGuides, setSavedGuides] = useState<string[]>([]);

    const fetchGuides = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (availableDate) params.set('availableDate', availableDate);
            const res = await fetch(`/api/marketplace/guides?${params.toString()}`);
            const json = await res.json();
            if (json.success) setGuides(json.data.guides);
        } catch { /* silent */ }
        finally { setLoading(false); }
    }, [availableDate]);

    useEffect(() => {
        fetchGuides();
        setSavedGuides(JSON.parse(localStorage.getItem('lunavia_saved_guides') || '[]'));
    }, [fetchGuides]);

    const handleInvite = async (guideId: string) => {
        setTargetGuideId(guideId);
        setInviteSuccess('');
        setLoadingTours(true);
        try {
            const res = await fetch('/api/requests?status=OPEN&status=PUBLISHED');
            if (res.ok) {
                const json = await res.json();
                setTours(json.data?.requests || json.requests || []);
            }
        } catch { /* silent */ }
        setLoadingTours(false);
    };

    const handleInviteToTour = async (tourId: string) => {
        if (!targetGuideId) return;
        setInviting(tourId);
        try {
            const res = await fetch(`/api/tours/${tourId}/invite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ guideId: targetGuideId }),
            });
            if (res.ok) {
                setInviteSuccess('✅ Invite sent successfully!');
                setTimeout(() => { setTargetGuideId(null); setInviteSuccess(''); }, 1500);
            }
        } catch { /* silent */ }
        setInviting(null);
    };

    const handleSave = (guideId: string) => {
        const current = JSON.parse(localStorage.getItem('lunavia_saved_guides') || '[]');
        let updated: string[];
        if (current.includes(guideId)) {
            updated = current.filter((id: string) => id !== guideId);
        } else {
            updated = [...current, guideId];
        }
        localStorage.setItem('lunavia_saved_guides', JSON.stringify(updated));
        setSavedGuides(updated);
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Find Tour Guides</h1>
                <p className="text-gray-500 mb-6">Loading guides from database...</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    const targetGuide = guides.find(g => g.id === targetGuideId);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Date Availability Filter */}
            <div className="mb-6 flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    📅 Available on:
                </label>
                <input
                    type="date"
                    value={availableDate}
                    onChange={e => setAvailableDate(e.target.value)}
                    min={new Date().toISOString().slice(0, 10)}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
                {availableDate && (
                    <button onClick={() => setAvailableDate('')} className="text-xs text-red-500 hover:text-red-700 font-medium">
                        Clear date
                    </button>
                )}
                {availableDate && (
                    <span className="text-xs text-gray-400 ml-auto">
                        Showing only guides available on {new Date(availableDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                )}
            </div>

            <GuideDiscovery
                guides={guides}
                onInvite={handleInvite}
                onSave={handleSave}
            />

            {/* Invite Tour Selection Modal */}
            {targetGuideId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[80vh] overflow-hidden">
                        <div className="bg-gradient-to-r from-[#5BA4CF] to-indigo-700 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-white font-bold text-lg">Invite to Tour</h2>
                                    <p className="text-indigo-200 text-xs mt-0.5">
                                        Select a tour for {targetGuide?.name || 'this guide'}
                                    </p>
                                </div>
                                <button onClick={() => setTargetGuideId(null)} className="text-white/70 hover:text-white text-xl">×</button>
                            </div>
                        </div>

                        <div className="p-5 overflow-y-auto max-h-[60vh]">
                            {inviteSuccess ? (
                                <div className="p-6 text-center">
                                    <div className="text-4xl mb-3">✅</div>
                                    <p className="text-sm font-semibold text-green-700">{inviteSuccess}</p>
                                </div>
                            ) : loadingTours ? (
                                <div className="flex justify-center py-12">
                                    <div className="w-8 h-8 border-3 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
                                </div>
                            ) : tours.length === 0 ? (
                                <div className="p-8 text-center">
                                    <div className="text-3xl mb-3">📋</div>
                                    <p className="text-sm text-gray-500">No open tours to invite to.</p>
                                    <p className="text-xs text-gray-400 mt-1">Create a tour first.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {tours.map((tour: any) => (
                                        <button
                                            key={tour.id}
                                            onClick={() => handleInviteToTour(tour.id)}
                                            disabled={inviting === tour.id}
                                            className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-[#5BA4CF]/40 hover:bg-lunavia-light/30 transition text-left"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <div className="text-sm font-semibold text-gray-900 truncate">{tour.title}</div>
                                                <div className="text-xs text-gray-400 mt-0.5">
                                                    {tour.startTime ? new Date(tour.startTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No date'}
                                                </div>
                                            </div>
                                            <span className="text-xs font-medium text-[#5BA4CF] shrink-0 ml-3">
                                                {inviting === tour.id ? 'Sending...' : 'Invite →'}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

