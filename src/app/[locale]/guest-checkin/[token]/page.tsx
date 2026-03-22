'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface CheckInData {
    guestName: string;
    status: string;
    checkedInAt: string | null;
    tour: {
        title: string;
        status: string;
        startTime: string;
        endTime: string;
        location: string;
        province: string;
        operatorName: string;
        guides: string[];
    };
}

export default function GuestCheckInPage() {
    const params = useParams();
    const token = params.token as string;

    const [data, setData] = useState<CheckInData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [confirming, setConfirming] = useState(false);
    const [confirmed, setConfirmed] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(`/api/guest-checkin/${token}`);
                const json = await res.json();
                if (!json.success) {
                    setError(json.error || 'Invalid check-in link');
                } else {
                    setData(json.data);
                    if (json.data.status === 'CHECKED_IN') setConfirmed(true);
                }
            } catch {
                setError('Failed to connect. Please try again.');
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [token]);

    const handleCheckIn = async () => {
        setConfirming(true);
        try {
            const res = await fetch(`/api/guest-checkin/${token}`, { method: 'POST' });
            const json = await res.json();
            if (!json.success) {
                if (json.error === 'ALREADY_CHECKED_IN') {
                    setConfirmed(true);
                } else {
                    setError(json.error || 'Failed to check in');
                }
            } else {
                setConfirmed(true);
            }
        } catch {
            setError('Failed to connect. Please try again.');
        } finally {
            setConfirming(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-400 text-sm">Loading your check-in...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
                <div className="bg-slate-800/80 backdrop-blur rounded-2xl border border-slate-700 p-8 max-w-md w-full text-center">
                    <div className="text-5xl mb-4">🔗</div>
                    <h2 className="text-xl font-bold text-white mb-2">Check-in Unavailable</h2>
                    <p className="text-slate-400 text-sm">{error === 'INVALID_TOKEN' ? 'This check-in link is invalid or has expired.' : error}</p>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const startTime = new Date(data.tour.startTime);
    const endTime = new Date(data.tour.endTime);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
            <div className="max-w-md mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="text-xl font-bold tracking-widest text-blue-400">LUNAVIA</div>
                    <div className="text-xs bg-lunavia-light0/20 text-blue-400 px-3 py-1 rounded-full">Guest Check-in</div>
                </div>

                {/* Greeting */}
                <div className="bg-slate-800/80 backdrop-blur rounded-2xl border border-slate-700 p-6">
                    <p className="text-slate-400 text-sm mb-1">Welcome,</p>
                    <h1 className="text-2xl font-bold text-white">{data.guestName}</h1>
                </div>

                {/* Tour Info */}
                <div className="bg-slate-800/80 backdrop-blur rounded-2xl border border-slate-700 p-6 space-y-4">
                    <h2 className="text-lg font-bold text-white">{data.tour.title}</h2>
                    <p className="text-sm text-slate-400">by {data.tour.operatorName}</p>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-0.5">
                            <p className="text-xs text-slate-500">📍 Location</p>
                            <p className="text-sm text-slate-300">{data.tour.location}</p>
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-xs text-slate-500">📅 Date</p>
                            <p className="text-sm text-slate-300">{startTime.toLocaleDateString()}</p>
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-xs text-slate-500">🕐 Time</p>
                            <p className="text-sm text-slate-300">
                                {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                        {data.tour.guides.length > 0 && (
                            <div className="space-y-0.5">
                                <p className="text-xs text-slate-500">🧑‍🏫 Guide</p>
                                <p className="text-sm text-slate-300">{data.tour.guides.join(', ')}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Check-in Action */}
                {confirmed ? (
                    <div className="bg-emerald-900/40 backdrop-blur rounded-2xl border border-emerald-700 p-8 text-center">
                        <div className="text-5xl mb-3">✅</div>
                        <h2 className="text-xl font-bold text-emerald-300 mb-1">You&apos;re Checked In!</h2>
                        <p className="text-emerald-400/70 text-sm">
                            {data.checkedInAt
                                ? `Confirmed at ${new Date(data.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                : 'Your attendance has been confirmed.'}
                        </p>
                        <p className="text-emerald-400/50 text-xs mt-3">
                            Have a wonderful tour! Your guide will see your check-in status.
                        </p>
                    </div>
                ) : (
                    <div className="bg-slate-800/80 backdrop-blur rounded-2xl border border-slate-700 p-6 text-center space-y-4">
                        <div className="text-4xl">📍</div>
                        <div>
                            <h2 className="text-lg font-bold text-white mb-1">Confirm Your Attendance</h2>
                            <p className="text-sm text-slate-400">Tap below to let your guide know you&apos;re here.</p>
                        </div>
                        <button
                            onClick={handleCheckIn}
                            disabled={confirming}
                            className="w-full py-4 bg-lunavia-primary text-white text-lg font-bold rounded-xl hover:bg-lunavia-primary-hover active:scale-95 transition disabled:opacity-50 disabled:cursor-wait shadow-lg shadow-[#2E8BC0]/25"
                        >
                            {confirming ? '⏳ Confirming...' : '✅ Confirm I\'m Here'}
                        </button>
                    </div>
                )}

                {/* Footer */}
                <div className="text-center text-xs text-slate-600 py-4">
                    Powered by <strong className="text-slate-500">Lunavia</strong> · Tour Operations Platform
                </div>
            </div>
        </div>
    );
}
