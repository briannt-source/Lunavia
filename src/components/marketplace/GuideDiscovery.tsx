'use client';

import { useState, useMemo } from 'react';
import GuideCard, { ViewModeToggle, type GuideCardData, type ViewMode } from '@/components/marketplace/GuideCard';

// ── Types ────────────────────────────────────────────────────────────
interface GuideDiscoveryProps {
    guides: GuideCardData[];
    onInvite?: (guideId: string) => void;
    onSave?: (guideId: string) => void;
}

// ── Filter Options ───────────────────────────────────────────────────
const LANGUAGE_OPTIONS = [
    { value: '', label: 'All Languages' },
    { value: 'EN', label: 'English' },
    { value: 'TH', label: 'Thai' },
    { value: 'ZH', label: 'Chinese' },
    { value: 'JA', label: 'Japanese' },
    { value: 'KO', label: 'Korean' },
    { value: 'FR', label: 'French' },
    { value: 'VI', label: 'Vietnamese' },
];

const EXPERIENCE_OPTIONS = [
    { value: 0, label: 'Any Experience' },
    { value: 1, label: '1+ years' },
    { value: 3, label: '3+ years' },
    { value: 5, label: '5+ years' },
    { value: 10, label: '10+ years' },
];

const TRUST_OPTIONS = [
    { value: 0, label: 'Any Trust Score' },
    { value: 40, label: '40+ (Active)' },
    { value: 70, label: '70+ (Trusted)' },
    { value: 90, label: '90+ (Elite)' },
];

const AVAILABILITY_OPTIONS = [
    { value: '', label: 'All Availability' },
    { value: 'available', label: 'Available Now' },
    { value: 'busy', label: 'Busy' },
];

// ── Main Component ───────────────────────────────────────────────────
export default function GuideDiscovery({ guides, onInvite, onSave }: GuideDiscoveryProps) {
    const [search, setSearch] = useState('');
    const [langFilter, setLangFilter] = useState('');
    const [expFilter, setExpFilter] = useState(0);
    const [trustFilter, setTrustFilter] = useState(0);
    const [availFilter, setAvailFilter] = useState('');
    const [specialtyFilter, setSpecialtyFilter] = useState('');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');

    // Collect all unique specialties for dynamic filter
    const allSpecialties = useMemo(() => {
        const set = new Set<string>();
        guides.forEach(g => g.specialties.forEach(s => set.add(s)));
        return Array.from(set).sort();
    }, [guides]);

    const filtered = useMemo(() => {
        return guides.filter(g => {
            if (search) {
                const q = search.toLowerCase();
                const matchName = g.name.toLowerCase().includes(q);
                const matchLang = g.languages.some(l => l.toLowerCase().includes(q));
                const matchSpec = g.specialties.some(s => s.toLowerCase().includes(q));
                if (!matchName && !matchLang && !matchSpec) return false;
            }
            if (langFilter && !g.languages.includes(langFilter)) return false;
            if (g.experienceYears < expFilter) return false;
            if (g.trustScore < trustFilter) return false;
            if (availFilter && g.availabilityStatus !== availFilter) return false;
            if (specialtyFilter && !g.specialties.includes(specialtyFilter)) return false;
            return true;
        });
    }, [guides, search, langFilter, expFilter, trustFilter, availFilter, specialtyFilter]);

    const hasActiveFilters = search || langFilter || expFilter > 0 || trustFilter > 0 || availFilter || specialtyFilter;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Find Tour Guides</h1>
                <p className="text-sm text-gray-500 mt-1">Discover verified professional guides for your tours</p>
            </div>

            {/* Search */}
            <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name, language, or specialty..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-12 pr-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition"
                />
            </div>

            {/* Filters + View Toggle */}
            <div className="flex flex-wrap items-center gap-3">
                <select value={langFilter} onChange={e => setLangFilter(e.target.value)}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20">
                    {LANGUAGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <select value={expFilter} onChange={e => setExpFilter(Number(e.target.value))}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20">
                    {EXPERIENCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <select value={trustFilter} onChange={e => setTrustFilter(Number(e.target.value))}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20">
                    {TRUST_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <select value={availFilter} onChange={e => setAvailFilter(e.target.value)}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20">
                    {AVAILABILITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                {allSpecialties.length > 0 && (
                    <select value={specialtyFilter} onChange={e => setSpecialtyFilter(e.target.value)}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20">
                        <option value="">All Specialties</option>
                        {allSpecialties.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                )}

                {hasActiveFilters && (
                    <button
                        onClick={() => { setSearch(''); setLangFilter(''); setExpFilter(0); setTrustFilter(0); setAvailFilter(''); setSpecialtyFilter(''); }}
                        className="text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                        Clear All
                    </button>
                )}

                <div className="ml-auto">
                    <ViewModeToggle mode={viewMode} onChange={setViewMode} />
                </div>
            </div>

            {/* Results Count */}
            <p className="text-sm text-gray-500">
                {filtered.length} guide{filtered.length !== 1 ? 's' : ''} found
            </p>

            {/* Results */}
            {filtered.length === 0 ? (
                <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                        <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">No guides match your criteria</h3>
                    <p className="mt-2 text-sm text-gray-500">Try adjusting your filters or search terms.</p>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map(g => <GuideCard key={g.id} guide={g} mode="grid" onInvite={onInvite} onSave={onSave} />)}
                </div>
            ) : (
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    {viewMode === 'list' && (
                        <div className="hidden md:flex items-center gap-4 px-4 py-2 border-b border-gray-100 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                            <span className="w-12" />
                            <span className="w-40">Name</span>
                            <span className="w-28">Trust</span>
                            <span className="w-32 hidden md:inline">Languages</span>
                            <span className="w-20 hidden lg:inline">Exp</span>
                            <span className="flex-1 hidden xl:inline">Specialties</span>
                            <span className="ml-auto">Actions</span>
                        </div>
                    )}
                    {filtered.map(g => <GuideCard key={g.id} guide={g} mode={viewMode} onInvite={onInvite} onSave={onSave} />)}
                </div>
            )}
        </div>
    );
}
