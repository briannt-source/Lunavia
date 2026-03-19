"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MaintenanceScreen() {
    const [message, setMessage] = useState('');
    const [endTime, setEndTime] = useState<string | null>(null);
    const [type, setType] = useState('SOFT');

    useEffect(() => {
        fetch('/api/admin/maintenance')
            .then(res => res.json())
            .then(data => {
                if (data.message) setMessage(data.message);
                if (data.endDate) setEndTime(data.endDate);
                if (data.type) setType(data.type);
                // If maintenance is off, redirect back
                if (!data.maintenanceMode) {
                    window.location.href = '/dashboard';
                }
            })
            .catch(() => {});
    }, []);

    const endTimeFormatted = endTime
        ? new Date(endTime).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
        : null;

    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 p-6">
            <div className="max-w-lg text-center">
                {/* Animated icon */}
                <div className="mb-8 inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                    <svg
                        className="h-12 w-12 text-amber-400 animate-spin"
                        style={{ animationDuration: '3s' }}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                    </svg>
                </div>

                <h1 className="text-3xl font-bold text-white mb-3">
                    Hệ thống đang bảo trì
                </h1>
                <p className="text-gray-400 mb-2 text-lg">
                    Lunavia is currently under maintenance.
                </p>
                <p className="text-gray-500 mb-8 text-sm">
                    We apologize for the inconvenience. Our team is working to improve your experience.
                </p>

                {/* Status card */}
                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 text-left mb-8 space-y-4">
                    {/* Type badge */}
                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            type === 'HARD'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                            {type === 'HARD' ? '🔴 Full Lockdown' : '🟡 Limited Access'}
                        </span>
                    </div>

                    {/* Message */}
                    {message && (
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Message</p>
                            <p className="text-sm text-gray-300 leading-relaxed">{message}</p>
                        </div>
                    )}

                    {/* End time */}
                    {endTimeFormatted && (
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Expected Return</p>
                            <p className="text-sm text-emerald-400 font-medium">{endTimeFormatted}</p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full rounded-xl bg-white/10 border border-white/10 px-5 py-3.5 font-semibold text-white hover:bg-white/20 active:scale-[0.98] transition-all backdrop-blur-sm"
                    >
                        ↻ Check Again
                    </button>
                    <Link
                        href="/"
                        className="text-sm font-medium text-gray-500 hover:text-gray-300 transition-colors"
                    >
                        Return to Home
                    </Link>
                </div>

                <p className="mt-10 text-xs text-gray-600">
                    Need help? Contact us at support@lunavia.vn
                </p>
            </div>
        </main>
    );
}
