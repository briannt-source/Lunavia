"use client";
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Skeleton, { TableSkeleton } from '@/components/ui/Skeleton';
import StatusBadge from '@/components/StatusBadge';

interface Applicant {
    id: string;
    name: string;
    avatarUrl?: string;
    trustScore: number;
    experience: string;
    languages: string[];
    specialties: string;
    dailyRate: number;
    role: string;
    rating: number;
    reviewsCount: number;
    quote: string;
    isRecommended?: boolean;
}

export default function ComparisonPage() {
    const { id } = useParams();
    const router = useRouter();
    const [request, setRequest] = useState<any>(null);
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch request details
            const reqRes = await fetch(`/api/requests/${id}`);
            const reqData = await reqRes.json();
            setRequest(reqData.request);

            // Fetch real applicants from API
            const appRes = await fetch(`/api/requests/${id}/applicants`);
            const appData = await appRes.json();

            if (appRes.ok && appData.applicants) {
                // Transform API response to match UI interface
                const transformedApplicants = appData.applicants.map((app: any) => ({
                    id: app.applicationId,
                    name: app.guide.name || app.guide.email,
                    role: app.roleApplied || 'Tour Guide',
                    trustScore: app.guide.trustScore || 0,
                    experience: app.guide.experience || '—',
                    languages: app.guide.languages || [],
                    specialties: Array.isArray(app.guide.specialties)
                        ? app.guide.specialties.join(', ')
                        : (app.guide.specialties || '—'),
                    dailyRate: 0, // Not tracked currently
                    rating: 0, // Can be added later from feedback system
                    reviewsCount: 0,
                    quote: '', // No quote field currently
                    conflictCount: app.guide.conflictCount || 0,
                    verificationStatus: app.guide.verificationStatus,
                    avatarUrl: app.guide.avatarUrl,
                }));
                setApplicants(transformedApplicants);
            } else {
                setApplicants([]);
            }
        } catch (error) {
            console.error(error);
            setApplicants([]);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) return <div className="p-12"><TableSkeleton /></div>;

    return (
        <div className="bg-gray-50/50 min-h-screen">
            <div className="max-w-[1400px] mx-auto px-4 py-8 pb-32">
                {/* Header */}
                <div className="mb-10">
                    <nav className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-6">
                        <span>Dashboard</span>
                        <span>›</span>
                        <span>{request?.title || 'Tour'}</span>
                        <span>›</span>
                        <span className="text-gray-900">Comparison View</span>
                    </nav>

                    <div className="bg-white rounded-[32px] p-8 shadow-premium border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-4 mb-3">
                                <h1 className="text-4xl font-black text-gray-900">{request?.title || '7-Day Alpine Trek'}</h1>
                                <StatusBadge status="OFFERED" />
                            </div>
                            <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-gray-400 uppercase tracking-widest">
                                <span className="flex items-center gap-2">📅 Oct 12 - Oct 19, 2024</span>
                                <span className="flex items-center gap-2">📍 Swiss Alps, Switzerland</span>
                                <span className="flex items-center gap-2 text-[#00A3FF]">👥 8 Applicants</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="px-6 py-3 bg-white border border-gray-100 rounded-xl font-bold text-sm text-gray-900 shadow-sm hover:shadow-md transition flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                Export Report
                            </button>
                            <button className="px-6 py-3 bg-[#00A3FF] hover:bg-[#008DD1] text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-100 transition flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                Edit Listing
                            </button>
                        </div>
                    </div>
                </div>

                {/* Comparison Grid */}
                <div className="bg-white rounded-[40px] shadow-premium border border-gray-100 overflow-hidden">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-gray-50">
                                <th className="w-48 p-8 text-left text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] align-top mt-8 block">Metric</th>
                                {applicants.map(guide => (
                                    <th key={guide.id} className="p-8 text-center relative min-w-[300px]">
                                        {guide.isRecommended && (
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#00A3FF] text-white text-[10px] font-black px-4 py-1.5 rounded-b-xl uppercase tracking-widest shadow-lg shadow-blue-100">Recommended</div>
                                        )}
                                        <div className="flex flex-col items-center">
                                            <div className="w-24 h-24 rounded-[32px] bg-gray-100 p-1 shadow-lg mb-6">
                                                <div className="w-full h-full rounded-[24px] bg-gray-200 overflow-hidden">
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                                                        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                                                    </div>
                                                </div>
                                            </div>
                                            <h3 className="text-xl font-black text-gray-900 mb-1">{guide.name}</h3>
                                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">{guide.role}</p>
                                            <button className={`w-full py-3.5 rounded-xl font-bold text-sm transition ${guide.isRecommended ? 'bg-[#00A3FF] text-white shadow-lg shadow-blue-100 hover:bg-[#008DD1]' : 'bg-[#E0F7FA] text-[#00A3FF] hover:bg-[#B2EBF2]'}`}>
                                                Assign
                                            </button>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {/* Trust Score */}
                            <tr>
                                <td className="p-8 text-left text-sm font-bold text-gray-900 border-r border-gray-50">Trust Score</td>
                                {applicants.map(guide => (
                                    <td key={guide.id} className="p-8 text-center border-r border-gray-50">
                                        <div className="max-w-[160px] mx-auto">
                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                <span className="text-2xl font-black text-gray-900">{guide.trustScore}</span>
                                                <span className="text-xs font-bold text-gray-300">/100</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${guide.trustScore > 95 ? 'bg-green-500' : 'bg-[#00A3FF]'}`}
                                                    style={{ width: `${guide.trustScore}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </td>
                                ))}
                            </tr>
                            {/* Experience */}
                            <tr>
                                <td className="p-8 text-left text-sm font-bold text-gray-900 border-r border-gray-50">Experience</td>
                                {applicants.map(guide => (
                                    <td key={guide.id} className="p-8 text-center text-sm font-bold text-gray-600 border-r border-gray-50">{guide.experience}</td>
                                ))}
                            </tr>
                            {/* Verification */}
                            <tr>
                                <td className="p-8 text-left text-sm font-bold text-gray-900 border-r border-gray-50">Verification</td>
                                {applicants.map(guide => (
                                    <td key={guide.id} className="p-8 text-center border-r border-gray-50">
                                        <div className="flex items-center justify-center gap-3">
                                            <span className="text-green-500">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                            </span>
                                            <span className="text-green-500">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            </span>
                                            <span className="text-gray-200">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                            </span>
                                        </div>
                                    </td>
                                ))}
                            </tr>
                            {/* Languages */}
                            <tr>
                                <td className="p-8 text-left text-sm font-bold text-gray-900 border-r border-gray-50">Languages</td>
                                {applicants.map(guide => (
                                    <td key={guide.id} className="p-8 text-center border-r border-gray-50">
                                        <div className="flex items-center justify-center flex-wrap gap-2">
                                            {guide.languages.map(l => (
                                                <span key={l} className="px-3 py-1 bg-gray-50 text-gray-400 text-[10px] font-bold rounded uppercase tracking-widest">{l}</span>
                                            ))}
                                        </div>
                                    </td>
                                ))}
                            </tr>
                            {/* Specialties */}
                            <tr>
                                <td className="p-8 text-left text-sm font-bold text-gray-900 border-r border-gray-50">Specialties</td>
                                {applicants.map(guide => (
                                    <td key={guide.id} className="p-8 text-center text-xs font-bold text-gray-600 border-r border-gray-50">{guide.specialties}</td>
                                ))}
                            </tr>
                            {/* Daily Rate */}
                            <tr>
                                <td className="p-8 text-left text-sm font-bold text-gray-900 border-r border-gray-50">Daily Rate</td>
                                {applicants.map(guide => (
                                    <td key={guide.id} className="p-8 text-center border-r border-gray-50">
                                        <span className={`text-2xl font-black ${guide.isRecommended ? 'text-[#00A3FF]' : 'text-gray-900'}`}>${guide.dailyRate}</span>
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Quotes Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
                    {applicants.map(guide => (
                        <div key={guide.id} className={`p-8 rounded-[32px] border transition-all duration-300 ${guide.isRecommended ? 'bg-[#E0F7FA]/30 border-[#00A3FF]/20 shadow-xl' : 'bg-white border-gray-100 shadow-premium hover:shadow-lg'}`}>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-gray-200 overflow-hidden"></div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-900">{guide.name}</div>
                                        <div className="flex items-center">
                                            {[...Array(5)].map((_, i) => (
                                                <svg key={i} className={`w-3 h-3 ${i < Math.floor(guide.rating) ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                            ))}
                                            <span className="text-[10px] font-bold text-gray-400 ml-1">({guide.reviewsCount})</span>
                                        </div>
                                    </div>
                                </div>
                                <button className="text-gray-400 hover:text-[#00A3FF] transition">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                </button>
                            </div>
                            <p className="text-sm italic text-gray-500 font-medium leading-relaxed">
                                {guide.quote}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sticky Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 p-6 z-50">
                <div className="max-w-[1400px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex -space-x-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white"></div>
                            ))}
                        </div>
                        <span className="text-sm font-bold text-gray-900 italic">Comparing <span className="text-[#00A3FF]">3 of 8</span> applicants</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <button className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-[#00A3FF] transition">Clear All</button>
                        <button className="px-10 py-3 bg-gray-900 text-white font-black text-sm rounded-xl shadow-2xl hover:bg-black transition active:scale-95">
                            Select Best Fit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
