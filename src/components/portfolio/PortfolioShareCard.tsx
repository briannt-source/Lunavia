'use client';

import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';

interface ShareCardProps {
    user: any;
    stats: any;
    role: 'TOUR_OPERATOR' | 'TOUR_GUIDE';
}

/**
 * Generates a social-media-story-sized (1080×1920) image
 * that users can post to Instagram Story, Facebook Story, or TikTok.
 */
export default function PortfolioShareCard({ user, stats, role }: ShareCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [generating, setGenerating] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const isOperator = role === 'TOUR_OPERATOR';
    const initials = (user.name?.[0] || user.email?.[0] || '?').toUpperCase();

    const handleDownload = async () => {
        if (!cardRef.current) return;
        setGenerating(true);
        try {
            const canvas = await html2canvas(cardRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: null,
                width: 540,
                height: 960,
            });
            const link = document.createElement('a');
            link.download = `lunavia-portfolio-${user.name || 'user'}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error('Screenshot failed:', err);
            alert('Failed to generate image. Please try again.');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={() => setShowPreview(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-sm font-bold rounded-xl hover:from-purple-700 hover:to-pink-600 transition-all shadow-lg active:scale-95"
            >
                📸 Share Portfolio
            </button>

            {/* Modal Overlay */}
            {showPreview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="relative max-h-[90vh] overflow-auto">
                        {/* Close */}
                        <button
                            onClick={() => setShowPreview(false)}
                            className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 text-sm font-bold"
                        >
                            ✕
                        </button>

                        {/* The Card (540×960 → renders as 1080×1920 at 2x) */}
                        <div
                            ref={cardRef}
                            style={{ width: 540, height: 960 }}
                            className="relative overflow-hidden rounded-3xl"
                        >
                            {/* Background Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950" />
                            <div className="absolute inset-0 opacity-20" style={{
                                backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(99,102,241,0.4) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(168,85,247,0.3) 0%, transparent 50%)'
                            }} />

                            {/* Content */}
                            <div className="relative z-10 h-full flex flex-col items-center justify-between p-10 text-center">
                                {/* Top: Brand */}
                                <div className="w-full">
                                    <div className="text-white/40 text-xs font-bold uppercase tracking-[0.3em] mb-1">Verified by</div>
                                    <div className="text-white text-2xl font-black tracking-tight">LUNAVIA</div>
                                </div>

                                {/* Center: Profile */}
                                <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full">
                                    {/* Avatar */}
                                    <div className="relative">
                                        {user.avatarUrl ? (
                                            <div className="h-28 w-28 rounded-full border-4 border-white/20 shadow-2xl overflow-hidden bg-white">
                                                <img src={user.avatarUrl} alt={user.name || 'Avatar'} className="w-full h-full object-cover" crossOrigin="anonymous" />
                                            </div>
                                        ) : (
                                            <div className="h-28 w-28 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-5xl font-black text-white border-4 border-white/20 shadow-2xl">
                                                {initials}
                                            </div>
                                        )}
                                        {user.verificationStatus === 'APPROVED' && (
                                            <div className="absolute -bottom-1 -right-1 bg-lunavia-light0 rounded-full p-1.5 border-2 border-slate-900">
                                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                            </div>
                                        )}
                                    </div>

                                    {/* Name */}
                                    <div>
                                        <h1 className="text-white text-3xl font-black tracking-tight leading-tight">
                                            {user.name || 'Unnamed'}
                                        </h1>
                                        <p className="text-indigo-300 text-sm font-semibold mt-2">
                                            {isOperator ? '🏢 Tour Operator' : '🎯 Professional Guide'}
                                            {user.experienceYears > 0 && ` • ${user.experienceYears}y exp`}
                                        </p>
                                    </div>

                                    {/* Trust Score Ring */}
                                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-5 border border-white/10">
                                        <div className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">Trust Score</div>
                                        <div className="text-white text-5xl font-black">{user.trustScore || 0}</div>
                                        <div className="text-emerald-400 text-xs font-bold mt-1">
                                            {(user.trustScore || 0) >= 80 ? '★ Excellent' : (user.trustScore || 0) >= 50 ? '● Good' : '○ Building'}
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
                                        <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
                                            <div className="text-white text-2xl font-black">
                                                {isOperator ? (stats.toursCreated || 0) : (stats.toursCompleted || 0)}
                                            </div>
                                            <div className="text-white/50 text-[10px] font-bold uppercase tracking-wider">
                                                {isOperator ? 'Tours Created' : 'Tours Done'}
                                            </div>
                                        </div>
                                        <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
                                            <div className="text-white text-2xl font-black">
                                                {stats.completionRate || 0}%
                                            </div>
                                            <div className="text-white/50 text-[10px] font-bold uppercase tracking-wider">
                                                Success Rate
                                            </div>
                                        </div>
                                        {isOperator ? (
                                            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10 col-span-2">
                                                <div className="text-white text-2xl font-black">{stats.collaborators || 0}</div>
                                                <div className="text-white/50 text-[10px] font-bold uppercase tracking-wider">Active Guides</div>
                                            </div>
                                        ) : (
                                            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10 col-span-2">
                                                <div className="text-white text-2xl font-black flex items-center justify-center gap-1">
                                                    {stats.rating > 0 ? stats.rating : '-'}
                                                    {stats.rating > 0 && <span className="text-yellow-400 text-lg">★</span>}
                                                </div>
                                                <div className="text-white/50 text-[10px] font-bold uppercase tracking-wider">
                                                    Rating {stats.reviewCount > 0 && `(${stats.reviewCount})`}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Bottom: Watermark */}
                                <div className="w-full pt-4 border-t border-white/10">
                                    <p className="text-white/30 text-[10px] font-medium">
                                        lunavia.vn • Verified Platform Data
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Download Button */}
                        <div className="mt-4 flex justify-center gap-3">
                            <button
                                onClick={handleDownload}
                                disabled={generating}
                                className="px-6 py-3 bg-white text-gray-900 text-sm font-bold rounded-xl hover:bg-gray-100 transition shadow-lg flex items-center gap-2 disabled:opacity-50"
                            >
                                {generating ? (
                                    <><span className="h-4 w-4 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" /> Generating...</>
                                ) : (
                                    <>⬇️ Download for Story</>
                                )}
                            </button>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="px-6 py-3 bg-white/10 text-white text-sm font-semibold rounded-xl hover:bg-white/20 transition border border-white/10"
                            >
                                Close
                            </button>
                        </div>
                        <p className="text-center text-white/40 text-xs mt-3">
                            Perfect for Instagram Story, Facebook Story & TikTok (1080×1920)
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
