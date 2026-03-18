'use client';

import useSWR, { mutate } from 'swr';
import { useSession } from 'next-auth/react';
import PortfolioHeader from '@/components/portfolio/PortfolioHeader';
import PortfolioStats from '@/components/portfolio/PortfolioStats';
import PortfolioTours from '@/components/portfolio/PortfolioTours';
import PortfolioShareCard from '@/components/portfolio/PortfolioShareCard';
import { useState } from 'react';
import { PencilIcon } from '@heroicons/react/24/outline';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function OperatorPortfolioPage() {
    const { data: session } = useSession();
    const { data, error, isLoading } = useSWR('/api/portfolio', fetcher);

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading portfolio...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Failed to load portfolio data.</div>;
    if (!data?.profile) return <div className="p-8 text-center text-gray-500">Profile not found.</div>;

    const isOwner = session?.user?.email === data.profile.email;

    const handleUpdate = async (updateData: any) => {
        try {
            const res = await fetch('/api/portfolio', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });
            if (!res.ok) throw new Error('Failed to update');
            mutate('/api/portfolio');
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Portfolio</h1>
                    <p className="text-sm text-gray-500">Your public business profile on Lunavia.</p>
                    <a href={`/operators/${data.profile.id}`} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                        View Public Profile ↗
                    </a>
                </div>
                <PortfolioShareCard
                        user={data.profile}
                        stats={data.stats}
                        role="TOUR_OPERATOR"
                    />
                </div>

                <PortfolioHeader
                    user={data.profile}
                    isEditable={isOwner}
                    onUpdate={handleUpdate}
                />

                <PortfolioStats
                    stats={data.stats}
                    role="TOUR_OPERATOR"
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Company Overview — Operator-specific */}
                        <OperatorAbout
                            user={data.profile}
                            isEditable={isOwner}
                            onUpdate={handleUpdate}
                        />
                        <PortfolioTours tours={data.portfolioTours} />
                    </div>
                    <div className="lg:col-span-1 space-y-6">
                        {/* Business Info Card */}
                        <OperatorBusinessCard user={data.profile} />
                        {/* Guide Network */}
                        <OperatorGuideNetwork stats={data.stats} />
                    </div>
                </div>
        </div>
    );
}

// ─── Operator-Specific About (Company Overview) ──────────────────────

function OperatorAbout({ user, isEditable, onUpdate }: { user: any; isEditable: boolean; onUpdate: (d: any) => Promise<void> }) {
    const [editing, setEditing] = useState(false);
    const [bio, setBio] = useState(user.bio || '');

    const handleSave = async () => {
        await onUpdate({ bio });
        setEditing(false);
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900">Company Overview</h2>
                {isEditable && !editing && (
                    <button onClick={() => setEditing(true)} className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center gap-1">
                        <PencilIcon className="h-4 w-4" /> Edit
                    </button>
                )}
            </div>

            {editing ? (
                <div>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={5}
                        className="w-full border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                        placeholder="Describe your tour operation business, your mission, specialties, and what makes you unique..."
                    />
                    <div className="flex gap-2 mt-3">
                        <button onClick={handleSave} className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-black">Save</button>
                        <button onClick={() => { setEditing(false); setBio(user.bio || ''); }} className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200">Cancel</button>
                    </div>
                </div>
            ) : (
                <div className="prose prose-sm max-w-none text-gray-600">
                    {bio ? (
                        <p className="whitespace-pre-line">{bio}</p>
                    ) : (
                        <p className="italic text-gray-400">No company overview yet. Tell potential guides about your business.</p>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Operator Business Card ──────────────────────────────────────────

function OperatorBusinessCard({ user }: { user: any }) {
    const categoryLabels: Record<string, string> = {
        LICENSED: '🏛️ Licensed Operator',
        TRAVEL_AGENCY: '✈️ Travel Agency',
        SOLE: '👤 Sole Proprietor',
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Business Details</h3>
            <div className="space-y-4">
                <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Category</div>
                    <div className="text-sm font-semibold text-gray-900">
                        {categoryLabels[user.operatorCategory] || user.operatorCategory || 'Not Set'}
                    </div>
                </div>
                {user.operatorCategory === 'LICENSED' && user.licenseScope && (
                    <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">License Scope</div>
                        <div className="text-sm font-semibold text-gray-900">{user.licenseScope}</div>
                    </div>
                )}
                {user.legalName && (
                    <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Legal Name</div>
                        <div className="text-sm font-semibold text-gray-900">{user.legalName}</div>
                    </div>
                )}
                <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Compliance</div>
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        user.complianceLevel === 'GOLD' ? 'bg-amber-100 text-amber-700' :
                        user.complianceLevel === 'PROBATION' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                    }`}>
                        {user.complianceLevel || 'STANDARD'}
                    </span>
                </div>
                <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Member Since</div>
                    <div className="text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Operator Guide Network ──────────────────────────────────────────

function OperatorGuideNetwork({ stats }: { stats: any }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Guide Network</h3>
            <div className="text-center py-4">
                <div className="text-4xl font-black text-indigo-600">{stats.collaborators || 0}</div>
                <div className="text-xs text-gray-500 mt-1">Active Collaborating Guides</div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tours Created</span>
                    <span className="font-bold text-gray-900">{stats.toursCreated || 0}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-500">Completion Rate</span>
                    <span className={`font-bold ${(stats.completionRate || 0) >= 90 ? 'text-emerald-600' : 'text-gray-900'}`}>
                        {stats.completionRate || 0}%
                    </span>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-400 italic">Verified platform data by Lunavia</p>
            </div>
        </div>
    );
}
