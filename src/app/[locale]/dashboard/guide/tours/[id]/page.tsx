'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Link } from '@/navigation';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import DisputeModal from '@/components/feedback/DisputeModal';
import TourChatPanel from '@/components/tour/TourChatPanel';
import { TourDocumentList } from '@/components/documents/TourDocumentList';

interface TourDetail {
    id: string;
    title: string;
    description?: string | null;
    itinerary?: string | null;
    inclusion?: string | null;
    exclusion?: string | null;
    location: string;
    province?: string;
    language?: string;
    startTime: string;
    endTime: string;
    status: string;
    category?: string;
    groupSize?: number;
    durationMinutes?: number;
    totalPayout?: number;
    currency?: string;
    rolesNeeded?: { role: string; quantity: number; rate: number }[];
    segments?: { id: string; label: string; location: string; startTime: string; endTime: string; order: number }[];
    operatorName?: string;
    operatorTrust?: number;
    operatorAvatar?: string;
    assignedGuideId?: string | null;
    guideCheckedInAt?: string | null;
    myApplication?: { id: string; status: string; createdAt: string } | null;
    tourDisputes?: any[];
}

function fmt(n: number) {
    return new Intl.NumberFormat('vi-VN').format(n);
}

function fmtDate(d: string) {
    return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function fmtTime(d: string) {
    return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function fmtDuration(minutes: number | undefined): string {
    if (!minutes) return '—';
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h} hours`;
}

const STATUS_COLORS: Record<string, string> = {
    OPEN: 'bg-indigo-100 text-indigo-700',
    PUBLISHED: 'bg-indigo-100 text-indigo-700',
    OFFERED: 'bg-purple-100 text-purple-700',
    ASSIGNED: 'bg-cyan-100 text-cyan-700',
    READY: 'bg-amber-100 text-amber-700',
    IN_PROGRESS: 'bg-green-100 text-green-700',
    COMPLETED: 'bg-emerald-100 text-emerald-700',
    CLOSED: 'bg-gray-100 text-gray-600',
    CANCELLED: 'bg-red-100 text-red-700',
    DISPUTED: 'bg-red-100 text-red-700',
    DRAFT: 'bg-gray-100 text-gray-500',
};

export default function GuideTourDetailPage() {
    const t = useTranslations('Guide.TourDetails');
    const params = useParams();
    const router = useRouter();
    const tourId = params.id as string;

    const [tour, setTour] = useState<TourDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [withdrawing, setWithdrawing] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [checkingIn, setCheckingIn] = useState(false);
    const [error, setError] = useState('');

    // Modals
    const [showConfirmApply, setShowConfirmApply] = useState(false);
    const [showConfirmWithdraw, setShowConfirmWithdraw] = useState(false);
    const [showConfirmCancel, setShowConfirmCancel] = useState(false);
    const [showDisputeModal, setShowDisputeModal] = useState(false);

    useEffect(() => {
        fetchTour();
    }, [tourId]);

    async function fetchTour() {
        try {
            const res = await fetch(`/api/requests/${tourId}`);
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Failed to load tour');
                return;
            }
            // API returns { request: {...}, operator: {...}, assignedGuide: {...} }
            const t = data.request || data.data?.request || data;
            // Merge operator info into tour object for display
            if (data.operator) {
                t.operatorName = data.operator.roleMetadata?.companyName || data.operator.roleMetadata?.name || data.operator.email || 'Operator';
                t.operatorTrust = data.operator.trustScore;
            }
            // Check if current user already applied
            if (t.applications) {
                const myApp = t.applications.find((a: any) => a.status !== 'WITHDRAWN');
                if (myApp) {
                    t.myApplication = myApp;
                }
            }
            setTour(t);
        } catch {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    }

    async function handleApply() {
        setApplying(true);
        try {
            const res = await fetch(`/api/requests/${tourId}/apply`, { method: 'POST' });
            const data = await res.json();
            if (res.ok) {
                toast.success(t('alerts.applySuccess'));
                setShowConfirmApply(false);
                fetchTour(); // Refresh to show application status
            } else {
                if (data.requiresLocationAcknowledgement) {
                    if (confirm(`${data.error}\n\n${t('alerts.confirmLocation')}`)) {
                        const confirmRes = await fetch(`/api/requests/${tourId}/apply`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ locationAcknowledgement: true })
                        });
                        const confirmData = await confirmRes.json();
                        if (confirmRes.ok) {
                            toast.success(t('alerts.applySuccess'));
                            setShowConfirmApply(false);
                            fetchTour();
                        } else {
                            toast.error(confirmData.error || t('alerts.applyFail'));
                        }
                    }
                } else {
                    toast.error(data.error || t('alerts.applyFail'));
                }
            }
        } catch {
            toast.error('Network error');
        } finally {
            setApplying(false);
        }
    }

    async function handleCheckIn() {
        if (!confirm('Are you sure you want to check in now? Ensure you are at the meeting point.')) return;
        setCheckingIn(true);
        try {
            const res = await fetch(`/api/requests/${tourId}/check-in`, { method: 'POST' });
            const data = await res.json();
            if (res.ok) {
                toast.success(t('alerts.checkInSuccess'));
                fetchTour();
            } else {
                toast.error(data.error || t('alerts.checkInFail'));
            }
        } catch {
            toast.error('Network error');
        } finally {
            setCheckingIn(false);
        }
    }

    async function handleWithdraw() {
        setWithdrawing(true);
        try {
            const res = await fetch(`/api/requests/${tourId}/apply`, { method: 'DELETE' });
            const data = await res.json();
            if (res.ok) {
                toast.success(t('alerts.withdrawSuccess'));
                setShowConfirmWithdraw(false);
                fetchTour();
            } else {
                toast.error(data.error || t('alerts.withdrawFail'));
            }
        } catch {
            toast.error('Network error');
        } finally {
            setWithdrawing(false);
        }
    }

    async function handleCancelAssignment() {
        setCancelling(true);
        try {
            const res = await fetch(`/api/requests/${tourId}/cancel/propose`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: 'Guide requests withdrawal due to unforeseen circumstances.' })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(t('alerts.cancelSuccess'));
                setShowConfirmCancel(false);
                fetchTour();
            } else {
                toast.error(data.error || t('alerts.cancelFail'));
            }
        } catch {
            toast.error('Network error');
        } finally {
            setCancelling(false);
        }
    }

    if (loading) return (
        <div className="max-w-4xl mx-auto p-8">
            <div className="animate-pulse space-y-6">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-10 bg-gray-200 rounded w-2/3"></div>
                <div className="grid grid-cols-4 gap-4">
                    {[1,2,3,4].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl"></div>)}
                </div>
                <div className="h-48 bg-gray-100 rounded-xl"></div>
            </div>
        </div>
    );

    if (error || !tour) return (
        <div className="max-w-4xl mx-auto p-8 text-center">
            <p className="text-red-600 mb-4">{error || t('notFound')}</p>
            <button onClick={() => router.back()} className="text-indigo-600 hover:underline text-sm">{t('back')}</button>
        </div>
    );

    const canApply = ['OPEN', 'PUBLISHED', 'OFFERED'].includes(tour.status) && !tour.myApplication;
    const alreadyApplied = !!tour.myApplication;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
            <DisputeModal
                isOpen={showDisputeModal}
                onClose={() => setShowDisputeModal(false)}
                tourId={tour.id}
                onSuccess={() => fetchTour()}
            />

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <Link href="/dashboard/guide/available" className="hover:text-indigo-600 transition-colors">{t('breadcrumbs.available')}</Link>
                <span>›</span>
                <span className="text-gray-900 font-medium truncate">{tour.title}</span>
            </div>

            {/* ───── HEADER ───── */}
            <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2.5 mb-2">
                            {tour.category && (
                                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 uppercase tracking-wider">
                                    {tour.category.replace('_', ' ')}
                                </span>
                            )}
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[tour.status] || 'bg-gray-100 text-gray-600'}`}>
                                {tour.status}
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{tour.title}</h1>
                        {tour.description && (
                            <p className="text-sm text-gray-600 leading-relaxed">{tour.description}</p>
                        )}
                    </div>
                    <div className="text-right shrink-0">
                        <p className="text-xs font-medium text-gray-400 uppercase mb-1">{t('summary.totalRate')}</p>
                        <p className="text-3xl font-black text-gray-900">
                            ₫{fmt(tour.totalPayout || 0)}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{tour.currency || 'VND'}</p>
                    </div>
                </div>
            </div>

            {/* ───── STAT CARDS ───── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InfoCard icon="📅" label={t('summary.date')} value={fmtDate(tour.startTime)} />
                <InfoCard icon="🕐" label={t('summary.time')} value={`${fmtTime(tour.startTime)} – ${fmtTime(tour.endTime)}`} />
                <InfoCard icon="⏱" label={t('summary.duration')} value={fmtDuration(tour.durationMinutes)} />
                <InfoCard icon="👥" label={t('summary.groupSize')} value={tour.groupSize ? `${tour.groupSize} pax` : '—'} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT (2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Location & Details */}
                    <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
                        <h3 className="font-semibold text-gray-900 text-sm mb-3">{t('details.sectionTitle')}</h3>
                        <div className="space-y-3 text-sm">
                            <Row label={t('details.location')} value={tour.province || tour.location || '—'} />
                            <Row label={t('details.language')} value={tour.language || '—'} />
                            <Row label={t('details.tourId')} value={tour.id} mono />
                        </div>
                    </div>

                    {/* Roles Needed */}
                    {tour.rolesNeeded && tour.rolesNeeded.length > 0 && (
                        <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
                            <h3 className="font-semibold text-gray-900 text-sm mb-3">{t('roles.sectionTitle')}</h3>
                            <div className="space-y-2">
                                {tour.rolesNeeded.map((r, i) => (
                                    <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{r.role.replace('_', ' ')}</p>
                                            <p className="text-xs text-gray-500">{t('roles.qty')}: {r.quantity}</p>
                                        </div>
                                        <span className="font-bold text-gray-900">₫{fmt(r.rate)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Itinerary & Inclusions */}
                    {(tour.itinerary || tour.inclusion || tour.exclusion) && (
                        <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm space-y-6">
                            {tour.itinerary && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 text-sm mb-2">Itinerary / Overview</h3>
                                    <div className="text-sm text-gray-700 whitespace-pre-wrap">{tour.itinerary}</div>
                                </div>
                            )}
                            {tour.inclusion && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 text-sm mb-2">Inclusions</h3>
                                    <div className="text-sm text-emerald-700 whitespace-pre-wrap">{tour.inclusion}</div>
                                </div>
                            )}
                            {tour.exclusion && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 text-sm mb-2">Exclusions</h3>
                                    <div className="text-sm text-red-700 whitespace-pre-wrap">{tour.exclusion}</div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Segments/Itinerary */}
                    {tour.segments && tour.segments.length > 0 && (
                        <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
                            <h3 className="font-semibold text-gray-900 text-sm mb-3">{t('itinerary.sectionTitle')}</h3>
                            <div className="space-y-3">
                                {tour.segments.sort((a, b) => a.order - b.order).map((seg) => (
                                    <div key={seg.id} className="flex items-start gap-3">
                                        <div className="mt-1 h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                                            {seg.order}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{seg.label}</p>
                                            <p className="text-xs text-gray-500">{seg.location} · {fmtTime(seg.startTime)} – {fmtTime(seg.endTime)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT (1/3) */}
                <div className="space-y-6">
                    {/* Operator Info */}
                    <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
                        <h3 className="font-semibold text-gray-900 text-sm mb-3">{t('operator.sectionTitle')}</h3>
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center text-lg font-bold text-indigo-700">
                                {tour.operatorName?.[0]?.toUpperCase() || '🏢'}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">{tour.operatorName || t('operator.sectionTitle')}</p>
                                {tour.operatorTrust != null && (
                                    <p className="text-xs text-emerald-600 font-medium">{t('operator.trust')}: {tour.operatorTrust}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Apply Section */}
                    <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
                        <h3 className="font-semibold text-gray-900 text-sm mb-3">{t('application.sectionTitle')}</h3>

                        {alreadyApplied ? (
                            <div className="text-center py-3">
                                <div className="h-10 w-10 mx-auto rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-2">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="text-sm font-medium text-gray-900">{t('application.submitted')}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {t('application.status')}: <span className="font-semibold">{tour.myApplication?.status}</span>
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {tour.myApplication?.createdAt ? t('application.appliedAt', { date: fmtDate(tour.myApplication.createdAt) }) : ''}
                                </p>
                                {/* Withdraw Application Button for PENDING apps */}
                                {tour.myApplication?.status === 'PENDING' && (
                                    <button
                                        onClick={() => setShowConfirmWithdraw(true)}
                                        className="mt-4 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                    >
                                        {t('application.withdrawBtn')}
                                    </button>
                                )}
                            </div>
                        ) : canApply ? (
                            <div>
                                <p className="text-sm text-gray-600 mb-3">
                                    {t('application.applyDesc')}
                                </p>
                                <button
                                    onClick={() => setShowConfirmApply(true)}
                                    disabled={applying}
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50"
                                >
                                    {t('application.applyBtn')}
                                </button>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-3">
                                {t('application.closed')}
                            </p>
                        )}
                    </div>

                    {/* Execution / Check-in Section (Only for Assigned Guide) */}
                    {tour.myApplication?.status === 'ACCEPTED' && (
                        <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm mt-6">
                            <h3 className="font-semibold text-gray-900 text-sm mb-3">{t('execution.sectionTitle')}</h3>
                            
                            {/* === LIVE EXECUTION LINK (IN_PROGRESS / READY) === */}
                            {['IN_PROGRESS', 'READY'].includes(tour.status) && (
                                <div className="mb-4">
                                    <Link
                                        href={`/dashboard/guide/tours/${tour.id}/execute`}
                                        className="w-full flex items-center justify-center gap-2 py-4 bg-green-600 hover:bg-green-700 text-white text-base font-bold rounded-xl transition-colors shadow-lg active:scale-95"
                                    >
                                        <span className="text-xl">🎯</span>
                                        {tour.status === 'IN_PROGRESS' ? t('execution.liveBtn') : t('execution.dashBtn')}
                                    </Link>
                                    <p className="text-xs text-gray-400 text-center mt-2">{t('execution.desc')}</p>
                                </div>
                            )}

                            {tour.guideCheckedInAt ? (
                                <div className="text-center py-3">
                                    <div className="h-10 w-10 mx-auto rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-2">
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">{t('execution.checkedIn')}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {t('execution.at')}: <span className="font-semibold">{fmtTime(tour.guideCheckedInAt)}</span> ({fmtDate(tour.guideCheckedInAt)})
                                    </p>
                                    {tour.status !== 'IN_PROGRESS' && tour.status !== 'COMPLETED' && (
                                        <p className="text-xs text-blue-600 mt-2 bg-blue-50 py-1.5 px-2 rounded font-medium">
                                            {t('execution.waiting')}
                                        </p>
                                    )}
                                </div>
                            ) : !['IN_PROGRESS', 'COMPLETED', 'CLOSED'].includes(tour.status) ? (
                                <div>
                                    <p className="text-sm text-gray-600 mb-3">
                                        {t('execution.checkInDesc')}
                                    </p>
                                    <button
                                        onClick={handleCheckIn}
                                        disabled={checkingIn || !['ASSIGNED', 'READY'].includes(tour.status)}
                                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50 flex justify-center items-center"
                                    >
                                        {checkingIn ? t('execution.checkingInBtn') : t('execution.checkInBtn')}
                                    </button>
                                    
                                    {tour.status === 'ASSIGNED' && (
                                        <button
                                            onClick={() => setShowConfirmCancel(true)}
                                            className="w-full mt-3 py-2 text-sm font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors shadow-sm border border-amber-100"
                                        >
                                            {t('execution.cancelBtn')}
                                        </button>
                                    )}
                                    {tour.status === 'PENDING_MUTUAL_CANCEL' && (
                                        <div className="mt-3 py-2 text-sm font-medium text-amber-700 bg-amber-50 rounded-xl shadow-sm border border-amber-100 text-center">
                                            {t('execution.pendingCancel')}
                                        </div>
                                    )}
                                </div>
                            ) : null}

                            {/* Phase V: Secure In-App Tour Chat for Guides */}
                            {tour.myApplication?.status === 'ACCEPTED' && (
                                <div className="mt-8 pt-6 border-t border-gray-100">
                                    <TourChatPanel tourId={tour.id} />
                                </div>
                            )}

                            {/* Tour Documents (Only for Assigned Guides) */}
                            {tour.myApplication?.status === 'ACCEPTED' && (
                                <div className="mt-8 pt-6 border-t border-gray-100">
                                    <h3 className="font-semibold text-gray-900 text-sm mb-3">📁 Tour Documents</h3>
                                    <p className="text-xs text-gray-500 mb-4">Confidential documents shared by the operator.</p>
                                    <TourDocumentList tourId={tour.id} canManage={false} />
                                </div>
                            )}

                            {/* Phase G.4: Guide Dispute Action */}
                            {(tour.status === 'IN_PROGRESS' || tour.status === 'COMPLETED' || tour.status === 'CANCELLED' || tour.status === 'DISPUTED') && (
                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    {tour.tourDisputes?.some(d => d.status === 'OPEN' || d.status === 'UNDER_REVIEW') ? (
                                        <div className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <h2 className="text-lg font-bold text-red-900">{t('dispute.overlayTitle')}</h2>
                                                    <p className="text-sm text-red-700">{t('dispute.overlayDesc')}</p>
                                                </div>
                                                <span className="px-3 py-1 bg-red-200 text-red-900 font-bold text-xs rounded-full">{t('dispute.frozen')}</span>
                                            </div>
                                            <div className="bg-white rounded-lg border border-red-100 divide-y divide-red-50">
                                                {tour.tourDisputes.find(d => d.status === 'OPEN' || d.status === 'UNDER_REVIEW')?.evidence?.map((ev: any) => (
                                                    <div key={ev.id} className="p-4 flex gap-4">
                                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center font-bold text-xs text-red-800">
                                                            {ev.uploadedBy.includes('admin') ? 'ADMIN' : 'USER'}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between">
                                                                <span className="text-sm font-semibold text-gray-900">
                                                                    {ev.uploadedBy === 'admin' ? t('dispute.support') : t('dispute.participant')}
                                                                </span>
                                                                <span className="text-xs text-gray-400">{new Date(ev.createdAt).toLocaleString()}</span>
                                                            </div>
                                                            <p className="mt-1 text-sm text-gray-700">{ev.message}</p>
                                                            {ev.fileUrl && (
                                                                <a href={ev.fileUrl} target="_blank" rel="noreferrer" className="mt-2 text-xs font-medium text-indigo-600 hover:text-indigo-800 inline-flex items-center">
                                                                    {t('dispute.viewEvidence')}
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="rounded-xl border border-red-200 bg-red-50 p-5 shadow-sm">
                                            <h4 className="font-semibold text-red-900 text-sm mb-1">{t('dispute.issueTitle')}</h4>
                                            <p className="text-xs text-red-700 mb-3">{t('dispute.issueDesc')}</p>
                                            <button
                                                onClick={() => setShowDisputeModal(true)}
                                                className="w-full py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
                                            >
                                                {t('dispute.openBtn')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Application Confirmation Modal */}
            {showConfirmApply && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('modals.applyTitle')}</h3>
                            <p className="text-sm text-gray-600 mb-6">
                                {t('modals.applyDesc', { title: tour?.title })}
                            </p>
                            
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowConfirmApply(false)}
                                    disabled={applying}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition"
                                >
                                    {t('modals.cancelBtn')}
                                </button>
                                <button
                                    onClick={handleApply}
                                    disabled={applying}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 shadow-sm disabled:opacity-50 transition flex justify-center items-center"
                                >
                                    {applying ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            {t('modals.submittingBtn')}
                                        </span>
                                    ) : (
                                        t('modals.submitBtn')
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Withdraw Confirmation Modal */}
            {showConfirmWithdraw && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('modals.withdrawTitle')}</h3>
                            <p className="text-sm text-gray-600 mb-6">
                                {t('modals.withdrawDesc', { title: tour?.title })}
                            </p>
                            
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowConfirmWithdraw(false)}
                                    disabled={withdrawing}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition"
                                >
                                    {t('modals.cancelBtn')}
                                </button>
                                <button
                                    onClick={handleWithdraw}
                                    disabled={withdrawing}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 shadow-sm disabled:opacity-50 transition flex justify-center items-center"
                                >
                                    {withdrawing ? t('modals.withdrawingBtn') : t('modals.withdrawBtn')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Assignment Confirmation Modal */}
            {showConfirmCancel && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 text-red-600">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('modals.cancelTitle')}</h3>
                            <p className="text-sm text-yellow-700 bg-yellow-50 p-3 rounded-lg border border-yellow-200 mb-4 font-medium">
                                {t('modals.cancelWarning')}
                            </p>
                            <p className="text-sm text-gray-600 mb-6">
                                {t('modals.cancelDesc', { title: tour?.title })} 
                            </p>
                            
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowConfirmCancel(false)}
                                    disabled={cancelling}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition"
                                >
                                    {t('modals.keepBtn')}
                                </button>
                                <button
                                    onClick={handleCancelAssignment}
                                    disabled={cancelling}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 shadow-sm disabled:opacity-50 transition flex justify-center items-center"
                                >
                                    {cancelling ? t('modals.requestingBtn') : t('modals.requestCancelBtn')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function InfoCard({ icon, label, value }: { icon: string; label: string; value: string | React.ReactNode }) {
    return (
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-xl shrink-0">
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-xs text-gray-500 font-medium mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-gray-900 truncate">{value}</p>
            </div>
        </div>
    );
}

function Row({ label, value, mono = false }: { label: string; value: string | React.ReactNode; mono?: boolean }) {
    return (
        <div className="flex justify-between items-start gap-4 py-1">
            <span className="text-gray-500">{label}</span>
            <span className={`text-gray-900 text-right ${mono ? 'font-mono text-xs' : 'font-medium'}`}>{value}</span>
        </div>
    );
}
