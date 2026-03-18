"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BaseDashboardLayout } from '@/components/layout/BaseDashboardLayout';
import toast from 'react-hot-toast';
import StatusBadge from '@/components/StatusBadge';
import TourChatPanel from '@/components/tour/TourChatPanel';
import { useTranslations } from 'next-intl';

export default function AdminTourDetailClient({ initialData }: { initialData: any }) {
    const t = useTranslations('Admin.TourDetails');
    const router = useRouter();
    const [tour, setTour] = useState(initialData);
    const [resolving, setResolving] = useState(false);
    const [resolutionNote, setResolutionNote] = useState("");
    const [resolutionAction, setResolutionAction] = useState("");
    const [partialAmount, setPartialAmount] = useState("");
    const [trustAction, setTrustAction] = useState("");
    const [trustAmount, setTrustAmount] = useState("");

    const activeDispute = tour.tourDisputes?.find((d: any) => d.status === 'OPEN' || d.status === 'UNDER_REVIEW') || tour.tourDisputes?.[0];

    const getAvatarUrl = (url?: string, name?: string) => {
        if (url && url !== '/avatars/default.png') return url;
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&background=E0E7FF&color=4338CA`;
    };

    const fmtVND = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
    const fmtDateTime = (d: string | null) => d ? new Date(d).toLocaleString('vi-VN') : '—';

    async function handleResolveDispute(e: React.FormEvent) {
        e.preventDefault();
        if (!activeDispute) return;
        if (!confirm(t('dispute.confirmResolve'))) return;

        setResolving(true);
        try {
            const res = await fetch(`/api/admin/tours/${tour.id}/resolve-dispute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    disputeId: activeDispute.id,
                    resolution: resolutionNote,
                    action: resolutionAction,
                    partialAmount: partialAmount ? parseInt(partialAmount) : undefined,
                    trustAction: trustAction || undefined,
                    trustAmount: trustAmount ? parseInt(trustAmount) : undefined
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || t('dispute.resolveError'));

            toast.success(t('dispute.resolveSuccess'));
            router.refresh();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setResolving(false);
        }
    }

    return (
        <BaseDashboardLayout header={
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard/admin/tours" className="text-gray-400 hover:text-gray-600 transition">
                            {t('back')}
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">{tour.title}</h1>
                        <StatusBadge status={tour.status} />
                    </div>
                    <p className="mt-1 text-sm text-gray-500 font-mono">ID: {tour.id}</p>
                </div>
            </div>
        }>
            <div className="space-y-6 max-w-5xl mx-auto pb-12">
                
                {/* ── Active Dispute Banner & Resolution Form ── */}
                {activeDispute && (
                    <div className={`p-6 rounded-2xl border ${activeDispute.status === 'RESOLVED' ? 'bg-gray-50 border-gray-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className={`text-lg font-bold ${activeDispute.status === 'RESOLVED' ? 'text-gray-900' : 'text-red-800'}`}>
                                    {activeDispute.status === 'RESOLVED' ? t('dispute.resolved') : t('dispute.activeDispute')}
                                </h2>
                                <p className={`text-sm mt-1 ${activeDispute.status === 'RESOLVED' ? 'text-gray-600' : 'text-red-700'}`}>
                                    {t('dispute.reason')} <span className="font-semibold">{activeDispute.reason}</span>
                                </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${activeDispute.status === 'OPEN' ? 'bg-red-200 text-red-900' : 'bg-gray-200 text-gray-800'}`}>
                                {activeDispute.status}
                            </span>
                        </div>

                        {/* Dispute Evidence Log */}
                        <div className="mt-6 space-y-4">
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">{t('dispute.evidenceNotes')}</h3>
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100 max-h-96 overflow-y-auto">
                                {activeDispute.evidence.map((ev: any) => (
                                    <div key={ev.id} className="p-4 flex gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-xs text-gray-500">
                                            {ev.uploader.role?.name === 'TOUR_OPERATOR' ? 'OP' : ev.uploader.role?.name === 'TOUR_GUIDE' ? 'GD' : 'AD'}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-900">{ev.uploader.name || ev.uploader.email}</span>
                                                <span className="text-xs text-gray-400">{new Date(ev.createdAt).toLocaleString()}</span>
                                            </div>
                                            <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">{ev.message}</p>
                                            {ev.fileUrl && (
                                                <a href={ev.fileUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-800">
                                                    {t('dispute.viewEvidence')}
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Admin Resolution Form */}
                        {activeDispute.status !== 'RESOLVED' && (
                            <form onSubmit={handleResolveDispute} className="mt-8 bg-white p-5 rounded-xl border border-red-100 shadow-sm">
                                <h3 className="text-md font-bold text-gray-900 mb-4">{t('dispute.executeResolution')}</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('dispute.escrowAction')}</label>
                                        <select 
                                            required
                                            value={resolutionAction}
                                            onChange={e => setResolutionAction(e.target.value)}
                                            className="w-full border-gray-300 rounded-lg shadow-sm text-sm focus:border-red-500 focus:ring-red-500"
                                        >
                                            <option value="">{t('dispute.selectAction')}</option>
                                            <option value="RELEASE_TO_GUIDE">{t('dispute.releaseToGuide')}</option>
                                            <option value="REFUND_OPERATOR">{t('dispute.refundToOperator')}</option>
                                            <option value="PARTIAL_PAYMENT">{t('dispute.partialPayment')}</option>
                                            <option value="WARN_GUIDE">{t('dispute.warnGuide')}</option>
                                            <option value="WARN_OPERATOR">{t('dispute.warnOperator')}</option>
                                        </select>
                                    </div>
                                    {resolutionAction === 'PARTIAL_PAYMENT' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('dispute.amountToGuide')}</label>
                                            <input 
                                                type="number" 
                                                required
                                                max={tour.assignedGuidePayout || 0}
                                                value={partialAmount}
                                                onChange={e => setPartialAmount(e.target.value)}
                                                placeholder={`Max: ${tour.assignedGuidePayout}`}
                                                className="w-full border-gray-300 rounded-lg shadow-sm text-sm focus:border-red-500 focus:ring-red-500"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">{t('dispute.operatorRefundRemainder')}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('dispute.resolutionNote')}</label>
                                    <textarea 
                                        required
                                        rows={3}
                                        value={resolutionNote}
                                        onChange={e => setResolutionNote(e.target.value)}
                                        placeholder={t('dispute.explainVerdict')}
                                        className="w-full border-gray-300 rounded-lg shadow-sm text-sm focus:border-red-500 focus:ring-red-500"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('dispute.trustScoreAction')}</label>
                                        <select 
                                            value={trustAction}
                                            onChange={e => setTrustAction(e.target.value)}
                                            className="w-full border-gray-300 rounded-lg shadow-sm text-sm focus:border-red-500 focus:ring-red-500"
                                        >
                                            <option value="">{t('dispute.noTrustAdjustment')}</option>
                                            <option value="NEUTRAL_REFUND">{t('dispute.refundTrust')}</option>
                                            <option value="FAULT_GUIDE">{t('dispute.penalizeGuide')}</option>
                                            <option value="FAULT_OPERATOR">{t('dispute.penalizeOperator')}</option>
                                        </select>
                                    </div>
                                    {trustAction && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('dispute.trustPointsAmount')}</label>
                                            <input 
                                                type="number" 
                                                min="1" max="100" required
                                                value={trustAmount}
                                                onChange={e => setTrustAmount(e.target.value)}
                                                placeholder="e.g. 50"
                                                className="w-full border-gray-300 rounded-lg shadow-sm text-sm focus:border-red-500 focus:ring-red-500"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 flex justify-end">
                                    <button 
                                        type="submit"
                                        disabled={resolving || !resolutionAction}
                                        className="px-6 py-2 bg-red-600 text-white font-medium rounded-lg text-sm hover:bg-red-700 disabled:opacity-50 transition"
                                    >
                                        {resolving ? t('dispute.executing') : t('dispute.executeResolutionBtn')}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* ── Left Col: Overview ── */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Tour Basics */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">{t('overview.title')}</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">{t('overview.location')}</p>
                                    <p className="font-medium text-gray-900">{tour.location} {tour.province ? `(${tour.province})` : ''}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">{t('overview.categoryGroupSize')}</p>
                                    <p className="font-medium text-gray-900">{tour.category || 'General'} · {tour.groupSize || 0} pax</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">{t('overview.startTime')}</p>
                                    <p className="font-medium text-gray-900">{fmtDateTime(tour.startTime)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">{t('overview.endTime')}</p>
                                    <p className="font-medium text-gray-900">{fmtDateTime(tour.endTime)}</p>
                                </div>
                            </div>
                            {tour.notes && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <p className="text-sm text-gray-500 mb-1">{t('overview.notes')}</p>
                                    <p className="text-sm text-gray-900">{tour.notes}</p>
                                </div>
                            )}
                        </div>

                        {/* Finance Overview */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">{t('finance.title')}</h2>
                            <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-xl">
                                <div>
                                    <p className="text-sm text-gray-500">{t('finance.escrowStatus')}</p>
                                    <span className={`inline-flex items-center px-2 py-1 mt-1 rounded-md text-xs font-bold border ${tour.escrowStatus === 'HELD' ? 'bg-amber-100 text-amber-800' : tour.escrowStatus === 'RELEASED' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                                        {tour.escrowStatus || 'NOT_FUNDED'}
                                    </span>
                                </div>
                                <div className="h-10 w-px bg-gray-200"></div>
                                <div>
                                    <p className="text-sm text-gray-500">{t('finance.totalCharged')}</p>
                                    <p className="font-bold text-gray-900 mt-1">{fmtVND(tour.totalPayout || 0)}</p>
                                </div>
                                <div className="h-10 w-px bg-gray-200"></div>
                                <div>
                                    <p className="text-sm text-gray-500">{t('finance.guidePayout')}</p>
                                    <p className="font-bold text-emerald-600 mt-1">{fmtVND(tour.assignedGuidePayout || 0)}</p>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* ── Right Col: Users ── */}
                    <div className="space-y-6">
                        
                        {/* Operator Snapshot */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center text-center">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest w-full text-left mb-4">{t('users.operator')}</h3>
                            <img src={getAvatarUrl(tour.operator.avatarUrl, tour.operator.companyName || tour.operator.email)} alt="Op" className="w-16 h-16 rounded-full bg-gray-100 mb-3 object-cover" />
                            <h4 className="font-bold text-gray-900">{tour.operator.companyName || tour.operator.email}</h4>
                            <p className="text-sm text-gray-500">{tour.operator.email}</p>
                            <div className="mt-3 flex items-center gap-2">
                                <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full">{t('users.trust')}: {tour.operator.trustScore}</span>
                                {tour.operator.operatorCategory && (
                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">{tour.operator.operatorCategory}</span>
                                )}
                            </div>
                            <Link href={`/dashboard/admin/users/${tour.operator.id}`} className="mt-4 text-sm text-indigo-600 font-medium hover:underline">
                                {t('users.viewProfile')}
                            </Link>
                        </div>

                        {/* Guide Snapshot */}
                        {tour.assignedGuide ? (
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center text-center">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest w-full text-left mb-4">{t('users.assignedGuide')}</h3>
                                <img src={getAvatarUrl(tour.assignedGuide.avatarUrl, tour.assignedGuide.name || tour.assignedGuide.email)} alt="Guide" className="w-16 h-16 rounded-full bg-gray-100 mb-3 object-cover" />
                                <h4 className="font-bold text-gray-900">{tour.assignedGuide.name || tour.assignedGuide.email}</h4>
                                <p className="text-sm text-gray-500">{tour.assignedGuide.email}</p>
                                <div className="mt-3 flex items-center gap-2">
                                    <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">{t('users.trust')}: {tour.assignedGuide.trustScore}</span>
                                    {tour.assignedGuide.verificationStatus === 'VERIFIED' && (
                                        <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">{t('users.verified')}</span>
                                    )}
                                </div>
                                <div className="mt-3 w-full bg-gray-50 p-3 rounded-lg text-sm text-gray-600 flex flex-col text-left space-y-2">
                                    <div className="flex justify-between">
                                        <span>{t('users.checkIn')}</span>
                                        <span className="font-medium text-gray-900">{fmtDateTime(tour.guideCheckedInAt)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>{t('users.payoutStatus')}</span>
                                        <span className="font-medium text-gray-900">{tour.payoutStatus || 'PENDING'}</span>
                                    </div>
                                </div>
                                <Link href={`/dashboard/admin/users/${tour.assignedGuide.id}`} className="mt-4 text-sm text-indigo-600 font-medium hover:underline">
                                    {t('users.viewProfile')}
                                </Link>
                            </div>
                        ) : (
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 border-dashed text-center">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest w-full text-left mb-4">{t('users.assignedGuide')}</h3>
                                <div className="text-gray-400 text-3xl mb-2">🤷</div>
                                <p className="text-sm text-gray-500">{t('users.noGuide')}</p>
                            </div>
                        )}

                    </div>
                </div>

                {/* ── Phase V: Secure In-App Tour Chat (Admin Audit Mode) ── */}
                {tour.assignedGuideId && (
                    <div className="mt-6">
                        <TourChatPanel tourId={tour.id} isAdminView={true} />
                    </div>
                )}

                {/* ── Timeline ── */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mt-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">{t('timeline.title')}</h2>
                    {tour.timelineEvents?.length > 0 ? (
                        <div className="relative pl-4 space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                            {tour.timelineEvents.map((event: any, idx: number) => {
                                let icon = '📌';
                                if (event.eventType.includes('CANCEL')) icon = '🚫';
                                if (event.eventType.includes('ASSIGN')) icon = '🤝';
                                if (event.eventType.includes('PAYOUT') || event.eventType.includes('ESCROW')) icon = '💰';
                                if (event.eventType.includes('CHECK_IN')) icon = '📍';
                                if (event.eventType.includes('DISPUTE')) icon = '⚖️';
                                if (event.eventType.includes('COMPLETE')) icon = '✅';

                                return (
                                    <div key={event.id} className="relative flex items-start gap-4 z-10">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shadow-sm">
                                            {icon}
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-xl flex-1 border border-gray-100 shadow-sm relative top-[-6px]">
                                            <div className="flex items-start justify-between">
                                                <h4 className="text-sm font-bold text-gray-900">{event.title}</h4>
                                                <span className="text-xs font-medium text-gray-400 whitespace-nowrap">{new Date(event.timestamp).toLocaleString()}</span>
                                            </div>
                                            <p className="mt-1 text-sm text-gray-600">{event.description}</p>
                                            <div className="mt-2 text-xs font-medium text-gray-400">
                                                {t('timeline.actor')} {event.actorRole}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-6">{t('timeline.empty')}</p>
                    )}
                </div>

            </div>
        </BaseDashboardLayout>
    );
}
