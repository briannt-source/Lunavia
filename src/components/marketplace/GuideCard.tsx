'use client';

import Link from 'next/link';
import { TrustScoreBadge } from '@/components/marketplace/TrustScoreRing';

// ── Types ────────────────────────────────────────────────────────────
export interface GuideCardData {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    trustScore: number;
    languages: string[];
    experienceYears: number;
    specialties: string[];
    verificationStatus: string;
    availabilityStatus: 'available' | 'busy' | 'unavailable';
    completedTours: number;
    matchScore?: number; // 0-100 match score from engine
    plan?: string;
}

type ViewMode = 'grid' | 'list' | 'compact';

interface GuideCardProps {
    guide: GuideCardData;
    mode: ViewMode;
    onInvite?: (guideId: string) => void;
    onSave?: (guideId: string) => void;
}

// ── Availability Badge ───────────────────────────────────────────────
function AvailabilityDot({ status }: { status: GuideCardData['availabilityStatus'] }) {
    const config = {
        available: { dot: 'bg-green-500', label: 'Available', text: 'text-green-700' },
        busy: { dot: 'bg-amber-500', label: 'Busy', text: 'text-amber-700' },
        unavailable: { dot: 'bg-gray-400', label: 'Unavailable', text: 'text-gray-500' },
    };
    const c = config[status];
    return (
        <span className={`inline-flex items-center gap-1.5 text-[10px] font-medium ${c.text}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
            {c.label}
        </span>
    );
}

// ── Avatar ───────────────────────────────────────────────────────────
function GuideAvatar({ guide, size }: { guide: GuideCardData; size: 'sm' | 'md' | 'lg' }) {
    const px = { sm: 'h-8 w-8', md: 'h-12 w-12', lg: 'h-14 w-14' };
    const txt = { sm: 'text-xs', md: 'text-base', lg: 'text-lg' };
    return (
        <div className={`${px[size]} rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shrink-0 overflow-hidden`}>
            {guide.avatarUrl ? (
                <img src={guide.avatarUrl} alt={guide.name} className="h-full w-full object-cover" />
            ) : (
                <span className={`${txt[size]} font-bold text-[#5BA4CF]`}>
                    {(guide.name || guide.email || 'G').charAt(0).toUpperCase()}
                </span>
            )}
        </div>
    );
}

// ── Verified Icon ────────────────────────────────────────────────────
function VerifiedIcon() {
    return (
        <svg className="h-4 w-4 text-lunavia-primary shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
    );
}

function ProBadge({ plan }: { plan?: string }) {
    if (!plan || !['PRO', 'ELITE'].includes(plan)) return null;
    return (
        <span className="inline-flex items-center gap-0.5 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 border border-amber-200 shadow-sm">
            ✦ {plan === 'ELITE' ? 'ELITE' : 'PRO'}
        </span>
    );
}

// ── Action Buttons ───────────────────────────────────────────────────
function CardActions({ guide, onInvite, onSave, compact = false }: {
    guide: GuideCardData; onInvite?: (id: string) => void; onSave?: (id: string) => void; compact?: boolean;
}) {
    if (compact) {
        return (
            <div className="flex items-center gap-2">
                <Link href={`/marketplace/guide/${guide.id}`} className="text-xs font-medium text-[#5BA4CF] hover:text-indigo-800">
                    View
                </Link>
                {onInvite && (
                    <button onClick={() => onInvite(guide.id)} className="text-xs font-medium text-purple-600 hover:text-purple-800">
                        Invite
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <Link
                href={`/marketplace/guide/${guide.id}`}
                className="flex-1 text-center rounded-lg border border-[#5BA4CF]/30 bg-lunavia-light px-3 py-1.5 text-xs font-medium text-[#2E8BC0] hover:bg-lunavia-muted/50 transition"
            >
                View Profile
            </Link>
            {onInvite && (
                <button
                    onClick={() => onInvite(guide.id)}
                    className="flex-1 text-center rounded-lg bg-lunavia-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition"
                >
                    Invite to Tour
                </button>
            )}
            {onSave && (
                <button
                    onClick={() => onSave(guide.id)}
                    className="rounded-lg border border-gray-200 p-1.5 text-gray-400 hover:text-[#5BA4CF] hover:border-[#5BA4CF]/30 transition"
                    title="Save Guide"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                </button>
            )}
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════
// GRID VIEW
// ══════════════════════════════════════════════════════════════════════
function GridCard({ guide, onInvite, onSave }: Omit<GuideCardProps, 'mode'>) {
    return (
        <div className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-[#5BA4CF]/30 transition-all flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
                <GuideAvatar guide={guide} size="lg" />
                <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 truncate flex items-center gap-1.5 text-sm">
                        {guide.name || 'Guide'}
                        {guide.verificationStatus === 'APPROVED' && <VerifiedIcon />}
                        <ProBadge plan={guide.plan} />
                    </h3>
                    <div className="mt-1">
                        <TrustScoreBadge score={guide.trustScore} size="sm" />
                    </div>
                </div>
                <AvailabilityDot status={guide.availabilityStatus} />
            </div>

            {/* Meta */}
            <div className="space-y-2 mb-4 flex-1">
                {/* Languages */}
                <div className="flex flex-wrap gap-1">
                    {guide.languages.slice(0, 4).map(lang => (
                        <span key={lang} className="inline-flex items-center rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                            {lang}
                        </span>
                    ))}
                    {guide.languages.length > 4 && (
                        <span className="text-[10px] text-gray-400">+{guide.languages.length - 4}</span>
                    )}
                </div>

                {/* Specialties */}
                {guide.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {guide.specialties.slice(0, 3).map(s => (
                            <span key={s} className="inline-flex items-center rounded-md bg-purple-50 px-1.5 py-0.5 text-[10px] font-medium text-purple-600">
                                {s}
                            </span>
                        ))}
                    </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{guide.experienceYears} yr{guide.experienceYears !== 1 ? 's' : ''} exp</span>
                    <span className="text-gray-300">·</span>
                    <span>{guide.completedTours} tours</span>
                    {guide.matchScore !== undefined && (
                        <>
                            <span className="text-gray-300">·</span>
                            <span className="font-semibold text-[#5BA4CF]">{guide.matchScore}% match</span>
                        </>
                    )}
                </div>
            </div>

            {/* Actions */}
            <CardActions guide={guide} onInvite={onInvite} onSave={onSave} />
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════
// LIST VIEW — table row optimized for comparison
// ══════════════════════════════════════════════════════════════════════
function ListRow({ guide, onInvite, onSave }: Omit<GuideCardProps, 'mode'>) {
    return (
        <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition">
            <GuideAvatar guide={guide} size="md" />

            {/* Name + Verified */}
            <div className="w-40 min-w-0 shrink-0">
                <h3 className="font-medium text-sm text-gray-900 truncate flex items-center gap-1">
                    {guide.name || 'Guide'}
                    {guide.verificationStatus === 'APPROVED' && <VerifiedIcon />}
                    <ProBadge plan={guide.plan} />
                </h3>
                <AvailabilityDot status={guide.availabilityStatus} />
            </div>

            {/* Trust */}
            <div className="w-28 shrink-0">
                <TrustScoreBadge score={guide.trustScore} size="sm" />
            </div>

            {/* Languages */}
            <div className="w-32 shrink-0 hidden md:flex flex-wrap gap-1">
                {guide.languages.slice(0, 3).map(lang => (
                    <span key={lang} className="inline-flex items-center rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                        {lang}
                    </span>
                ))}
            </div>

            {/* Experience */}
            <div className="w-20 shrink-0 hidden lg:block text-xs text-gray-500">
                {guide.experienceYears} yr{guide.experienceYears !== 1 ? 's' : ''}
            </div>

            {/* Match Score */}
            {guide.matchScore !== undefined && (
                <div className="w-16 shrink-0 hidden lg:block">
                    <span className="inline-flex items-center rounded-full bg-lunavia-light px-2 py-0.5 text-xs font-semibold text-[#2E8BC0]">
                        {guide.matchScore}%
                    </span>
                </div>
            )}

            {/* Specialties */}
            <div className="flex-1 min-w-0 hidden xl:flex flex-wrap gap-1">
                {guide.specialties.slice(0, 2).map(s => (
                    <span key={s} className="inline-flex items-center rounded-md bg-purple-50 px-1.5 py-0.5 text-[10px] font-medium text-purple-600">
                        {s}
                    </span>
                ))}
            </div>

            {/* Actions */}
            <div className="shrink-0 ml-auto">
                <CardActions guide={guide} onInvite={onInvite} onSave={onSave} />
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════
// COMPACT VIEW — minimal for scanning
// ══════════════════════════════════════════════════════════════════════
function CompactRow({ guide, onInvite, onSave }: Omit<GuideCardProps, 'mode'>) {
    return (
        <div className="flex items-center gap-3 px-3 py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50/30 transition text-xs">
            <GuideAvatar guide={guide} size="sm" />
            <span className="font-medium text-gray-900 w-32 truncate flex items-center gap-1">
                {guide.name || 'Guide'}
                {guide.verificationStatus === 'APPROVED' && (
                    <svg className="h-3 w-3 text-lunavia-primary shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                )}
            </span>
            <TrustScoreBadge score={guide.trustScore} size="sm" />
            <span className="text-gray-500 hidden sm:inline">{guide.languages.slice(0, 2).join(', ')}</span>
            <span className="text-gray-400 hidden md:inline">{guide.experienceYears}yr</span>
            <AvailabilityDot status={guide.availabilityStatus} />
            <div className="ml-auto">
                <CardActions guide={guide} onInvite={onInvite} onSave={onSave} compact />
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════
// EXPORTED COMPONENT
// ══════════════════════════════════════════════════════════════════════
export default function GuideCard({ guide, mode, onInvite, onSave }: GuideCardProps) {
    switch (mode) {
        case 'list': return <ListRow guide={guide} onInvite={onInvite} onSave={onSave} />;
        case 'compact': return <CompactRow guide={guide} onInvite={onInvite} onSave={onSave} />;
        default: return <GridCard guide={guide} onInvite={onInvite} onSave={onSave} />;
    }
}

// ── View Mode Toggle ─────────────────────────────────────────────────
interface ViewModeToggleProps {
    mode: ViewMode;
    onChange: (mode: ViewMode) => void;
}

export function ViewModeToggle({ mode, onChange }: ViewModeToggleProps) {
    const modes: { value: ViewMode; icon: JSX.Element; label: string }[] = [
        {
            value: 'grid', label: 'Grid',
            icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>,
        },
        {
            value: 'list', label: 'List',
            icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" /></svg>,
        },
        {
            value: 'compact', label: 'Compact',
            icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>,
        },
    ];

    return (
        <div className="inline-flex items-center rounded-lg border border-gray-200 bg-white p-0.5">
            {modes.map(m => (
                <button
                    key={m.value}
                    onClick={() => onChange(m.value)}
                    title={m.label}
                    className={`rounded-md p-1.5 transition ${mode === m.value
                        ? 'bg-lunavia-muted/50 text-[#2E8BC0]'
                        : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    {m.icon}
                </button>
            ))}
        </div>
    );
}

export type { ViewMode, GuideCardProps };
