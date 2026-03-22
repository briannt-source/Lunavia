'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import GuidePublicProfile from '@/components/marketplace/GuidePublicProfile';

export default function GuideProfilePage() {
    const params = useParams();
    const guideId = params.id as string;

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Invite modal state
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [tours, setTours] = useState<any[]>([]);
    const [loadingTours, setLoadingTours] = useState(false);
    const [inviting, setInviting] = useState<string | null>(null);
    const [inviteSuccess, setInviteSuccess] = useState('');

    // Save state
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await fetch(`/api/marketplace/guides/${guideId}`);
                if (!res.ok) { setError('Guide not found'); return; }
                const json = await res.json();
                if (json.success) setData(json.data);
                else setError('Guide not found');
            } catch { setError('Failed to load'); }
            finally { setLoading(false); }
        }
        if (guideId) fetchProfile();
    }, [guideId]);

    // Load saved state from localStorage
    useEffect(() => {
        const savedGuides = JSON.parse(localStorage.getItem('lunavia_saved_guides') || '[]');
        setSaved(savedGuides.includes(guideId));
    }, [guideId]);

    const handleInvite = async () => {
        setShowInviteModal(true);
        setLoadingTours(true);
        setInviteSuccess('');
        try {
            const res = await fetch('/api/requests?status=OPEN&status=PUBLISHED');
            if (res.ok) {
                const json = await res.json();
                setTours(json.data || json.requests || []);
            }
        } catch { /* silent */ }
        setLoadingTours(false);
    };

    const handleInviteToTour = async (tourId: string) => {
        setInviting(tourId);
        try {
            const res = await fetch(`/api/tours/${tourId}/invite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ guideId }),
            });
            if (res.ok) {
                setInviteSuccess(`Invite sent to ${data?.guide?.name || 'guide'}!`);
                setTimeout(() => setShowInviteModal(false), 1500);
            }
        } catch { /* silent */ }
        setInviting(null);
    };

    const handleSave = () => {
        const savedGuides = JSON.parse(localStorage.getItem('lunavia_saved_guides') || '[]');
        if (saved) {
            const filtered = savedGuides.filter((id: string) => id !== guideId);
            localStorage.setItem('lunavia_saved_guides', JSON.stringify(filtered));
            setSaved(false);
        } else {
            savedGuides.push(guideId);
            localStorage.setItem('lunavia_saved_guides', JSON.stringify(savedGuides));
            setSaved(true);
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="animate-pulse space-y-6">
                    <div className="h-32 bg-gray-100 rounded-2xl" />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-4">
                            <div className="h-40 bg-gray-100 rounded-xl" />
                            <div className="h-28 bg-gray-100 rounded-xl" />
                        </div>
                        <div className="h-60 bg-gray-100 rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-24 text-center">
                <div className="text-4xl mb-4">👤</div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">Guide Not Found</h1>
                <p className="text-sm text-gray-500 mb-6">{error || 'This guide profile does not exist.'}</p>
                <a href="/marketplace/guides" className="text-sm font-medium text-[#5BA4CF] hover:text-[#2E8BC0]">← Back to Marketplace</a>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Action Buttons */}
            <div className="flex items-center justify-between mb-6">
                <a href="/marketplace/guides" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    Back to Marketplace
                </a>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSave}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border transition ${saved
                            ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        {saved ? '❤️ Saved' : '🤍 Save'}
                    </button>
                    <button
                        onClick={handleInvite}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-lunavia-primary text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition shadow-sm"
                    >
                        📩 Invite to Tour
                    </button>
                </div>
            </div>

            <GuidePublicProfile
                guide={data.guide}
                recentActivity={data.recentActivity}
                reviews={data.reviews}
                onInvite={handleInvite}
            />

            {/* Invite Tour Selection Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[80vh] overflow-hidden">
                        <div className="bg-gradient-to-r from-[#5BA4CF] to-indigo-700 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-white font-bold text-lg">Invite to Tour</h2>
                                    <p className="text-indigo-200 text-xs mt-0.5">Select a tour to invite {data.guide.name}</p>
                                </div>
                                <button onClick={() => setShowInviteModal(false)} className="text-white/70 hover:text-white text-xl">×</button>
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
                                    <p className="text-xs text-gray-400 mt-1">Create a tour first, then come back to invite this guide.</p>
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
                                                    {tour.location && ` · ${tour.location}`}
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
