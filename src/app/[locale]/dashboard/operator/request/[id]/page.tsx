"use client";
import { useState, useEffect, useCallback } from 'react';
import { Link } from '@/navigation';
import toast from 'react-hot-toast';
import FeedbackModal from '@/components/feedback/FeedbackModal';
import DisputeModal from '@/components/feedback/DisputeModal';
import { calculateMatchingScore, MatchingResult } from '@/lib/matching-score';
import { calculateRiskSignal, RiskSignalResult } from '@/lib/risk-signals';
import RecommendedBadge from '@/components/ai/RecommendedBadge';
import RiskFlag from '@/components/ai/RiskFlag';
import SuggestionHint from '@/components/ai/SuggestionHint';
import TourExecutionTimeline from '@/components/tour/TourExecutionTimeline';
import TourChatPanel from '@/components/tour/TourChatPanel';

interface TourDetail {
    id: string;
    title: string;
    location: string;
    province?: string;
    language?: string; // Phase 20
    startTime: string;
    endTime: string;
    status: string;
    assignedGuideId: string | null;
    operatorId: string;
    tourType?: string;
    rolesNeeded?: string;
    // Phase 25.x Incident Signal
    incidents?: {
        id: string;
        severity: string;
        description: string;
        status: string;
        createdAt: string;
    }[];
    // Phase 26 Feedback
    feedback?: {
        userId: string;
        role: string;
        rating: number;
    }[];
    applications?: {
        id: string;
        guideId: string;
        status: string;
        createdAt: string;
        guide: {
            id: string;
            email: string;
            name?: string;
            kycStatus: string;
            trustScore?: number;
            avatarUrl?: string;
            roleMetadata: string | null;
            createdAt: string;
            completedTourCount?: number;
        }
    }[];
    tourDisputes?: any[];
}

interface GuideProfile {
    id: string;
    email: string;
    province: string;
    kycStatus: string;
    trustScore: number;
    trustState: string;
    trustEvents: any[];
    completedTourCount: number;
    roleMetadata?: string;
    updatedAt: string;
    paymentInfo?: {
        bankName: string;
        accountNumber: string;
        accountName: string;
    };
}

export default function OperatorRequestDetailPage({
    params,
}: {
    params: { id: string };
}) {
    const [request, setRequest] = useState<TourDetail | null>(null);
    const [applicant, setApplicant] = useState<GuideProfile | null>(null);
    const [assignedGuide, setAssignedGuide] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [guideId, setGuideId] = useState('');
    const [checkingGuide, setCheckingGuide] = useState(false);

    // AI-Assisted Results
    const [matchingResult, setMatchingResult] = useState<MatchingResult | null>(null);
    const [riskSignal, setRiskSignal] = useState<RiskSignalResult | null>(null);

    // Feedback Modal State
    const [feedbackTourId, setFeedbackTourId] = useState<string | null>(null);
    const [disputeTourId, setDisputeTourId] = useState<string | null>(null);

    // Mismatch Handling
    const [mismatchWarning, setMismatchWarning] = useState<string | null>(null);
    const [acknowledgement, setAcknowledgement] = useState(false);
    const [pendingGuideId, setPendingGuideId] = useState<string | null>(null);

    // SOS Eligibility
    const [sosEligibility, setSosEligibility] = useState<{ isFree: boolean; cost: number; remainingFreeThisWeek: number } | null>(null);

    const fetchRequest = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/requests/${params.id}`);
            const data = await res.json();
            if (res.ok && data.request) {
                setRequest({
                    ...data.request,
                    applications: data.applications || []
                });
                setAssignedGuide(data.assignedGuide || null);
            } else {
                setRequest(null);
                setAssignedGuide(null);
            }
        } catch (error) {
            console.error('Failed to fetch request:', error);
            setRequest(null);
        } finally {
            setLoading(false);
        }
    }, [params.id]);

    const fetchApplicant = useCallback(async (id: string) => {
        try {
            const res = await fetch(`/api/guides/${id}`);
            if (res.ok) {
                const data = await res.json();
                setApplicant(data);
            }
        } catch (error) {
            console.error('Failed to fetch applicant:', error);
        }
    }, []);

    useEffect(() => {
        fetchRequest();
    }, [fetchRequest]);

    useEffect(() => {
        const fetchEligibility = async () => {
            try {
                const res = await fetch('/api/operator/sos-eligibility');
                const data = await res.json();
                if (data.success) {
                    setSosEligibility(data.data);
                }
            } catch (e) {
                console.error('Failed to fetch SOS eligibility', e);
            }
        };
        fetchEligibility();
    }, []);

    useEffect(() => {
        if (request?.assignedGuideId && request.status === 'OFFERED') {
            fetchApplicant(request.assignedGuideId);
        }
    }, [request, fetchApplicant]);

    useEffect(() => {
        if (applicant && request) {
            // Run AI Logic
            const guideData = {
                ...applicant,
                roleMetadata: applicant.roleMetadata || '',
                updatedAt: new Date(applicant.updatedAt),
            } as any;

            const reqData = { ...request } as any;

            const scoreRes = calculateMatchingScore(guideData, reqData, applicant.trustScore, applicant.completedTourCount);
            const riskRes = calculateRiskSignal(applicant.trustEvents || []);

            setMatchingResult(scoreRes);
            setRiskSignal(riskRes);
        }
    }, [applicant, request]);

    async function handleAssignClick(targetId: string) {
        setMismatchWarning(null);
        setAcknowledgement(false);
        setCheckingGuide(true);

        try {
            // First validation check via guide API
            const res = await fetch(`/api/guides/${targetId}`);
            if (!res.ok) {
                toast.error('Guide not found');
                setCheckingGuide(false);
                return;
            }
            const guide = await res.json();

            // Check mismatch locally first (faster UI)
            const reqProvince = request?.province;
            const guideProvince = guide.province;

            if (reqProvince && guideProvince && reqProvince !== guideProvince) {
                setMismatchWarning(`⚠️ This guide is based in ${guideProvince} and is applying for a tour in ${reqProvince}.`);
                setPendingGuideId(targetId);
                setCheckingGuide(false);
                return; // Stop here, show mismatch UI
            }

            // If no mismatch, proceed to assign
            submitAssignment(targetId, false);
        } catch (error) {
            toast.error('Failed to validate guide');
        } finally {
            setCheckingGuide(false);
        }
    }

    async function submitAssignment(targetId: string, ack: boolean) {
        const res = await fetch(`/api/requests/${params.id}/assign`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ guideId: targetId, acknowledgement: ack }),
        });

        const data = await res.json();

        if (res.ok) {
            toast.success('Guide assigned successfully');
            setMismatchWarning(null);
            setPendingGuideId(null);
            fetchRequest();
        } else if (data.requiresAcknowledgement) {
            // Fallback if API catches mismatch we missed locally
            setMismatchWarning(data.message);
            setPendingGuideId(targetId);
        } else {
            toast.error(data.error || 'Failed to assign');
        }
    }

    async function handleRejectApplication(appId: string) {
        if (!confirm('Are you sure you want to reject this application?')) return;
        setCheckingGuide(true);
        try {
            const res = await fetch(`/api/requests/${params.id}/applicants/${appId}/reject`, {
                method: 'PATCH',
            });
            if (res.ok) {
                toast.success('Application rejected successfully');
                fetchRequest();
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to reject application');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setCheckingGuide(false);
        }
    }

    const hasGivenFeedback = (req: TourDetail) => {
        return req.feedback?.some(f => f.role === 'TOUR_OPERATOR');
    };

    if (loading) return <div className="p-8"><div className="animate-pulse h-32 bg-gray-100 rounded-xl"></div></div>;
    if (!request) return <div className="p-8 text-center text-gray-500">Request not found</div>;

    return (
        <div className="space-y-6 max-w-3xl">
            <FeedbackModal
                isOpen={!!feedbackTourId}
                onClose={() => setFeedbackTourId(null)}
                tourId={feedbackTourId || ''}
                role="TOUR_OPERATOR"
                onSuccess={() => fetchRequest()}
            />

            <DisputeModal
                isOpen={!!disputeTourId}
                onClose={() => setDisputeTourId(null)}
                tourId={disputeTourId || ''}
                onSuccess={() => fetchRequest()}
            />

            <a href="/dashboard/operator" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                ← Back to requests
            </a>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{request.title}</h1>
                        <p className="mt-1 text-gray-600">{request.location} {request.province && `(${request.province})`}</p>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                        {request.status.replace('_', ' ')}
                    </span>
                </div>
                <p className="mt-4 text-sm text-gray-500">
                    {new Date(request.startTime).toLocaleString()} — {new Date(request.endTime).toLocaleString()}
                </p>

                {/* Manual Assign Section inside overview */}
                {['PUBLISHED', 'OPEN', 'OFFERED'].includes(request.status) && !mismatchWarning && (
                    <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col md:flex-row gap-6 md:items-start justify-between">
                        <div className="flex-1">
                            <h2 className="mb-3 text-sm font-semibold text-gray-900">
                                {request.status === 'OFFERED' ? 'Or assign manually:' : 'Manually Assign a Guide:'}
                            </h2>
                            <div className="flex gap-3 max-w-md">
                                <input
                                    type="text"
                                    value={guideId}
                                    onChange={(e) => setGuideId(e.target.value)}
                                    placeholder="Enter Guide User ID"
                                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                />
                                <button
                                    onClick={() => handleAssignClick(guideId)}
                                    disabled={!guideId.trim() || checkingGuide}
                                    className="rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-50 transition"
                                >
                                    {checkingGuide ? 'Checking...' : 'Assign'}
                                </button>
                            </div>
                        </div>

                        <div className="md:w-px md:h-16 bg-gray-200 hidden md:block"></div>

                        <div className="flex-1">
                            <h2 className="mb-3 text-sm font-semibold text-red-700 flex items-center gap-2">
                                <span>🚨</span> Emergency:
                            </h2>
                            <button
                                onClick={async () => {
                                    const costText = sosEligibility?.isFree ? 'FREE (using your 1 free weekly allowance)' : '200,000 VND';
                                    if (!confirm(`Triggering an SOS Broadcast costs ${costText} and lasts for 15 minutes. This will notify matching guides immediately. Proceed?`)) return;
                                    setCheckingGuide(true);
                                    const res = await fetch(`/api/tours/${request.id}/sos-broadcast`, { method: 'POST' });
                                    if (res.ok) {
                                        toast.success(`SOS Broadcast triggered successfully. ${sosEligibility?.isFree ? 'Free allowance used.' : '200,000 VND deducted.'}`);
                                        fetchRequest();
                                        // Refresh eligibility to show updated count
                                        const elRes = await fetch('/api/operator/sos-eligibility');
                                        const data = await elRes.json();
                                        if (data.success) setSosEligibility(data.data);
                                    } else {
                                        const d = await res.json();
                                        toast.error(d.error || 'Failed to trigger SOS Broadcast');
                                    }
                                    setCheckingGuide(false);
                                }}
                                disabled={checkingGuide || !sosEligibility}
                                className="w-full max-w-md rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-5 py-2 text-sm font-medium transition flex flex-col justify-center items-center shadow-sm disabled:opacity-50"
                            >
                                <span className="flex items-center gap-2">Trigger SOS Broadcast</span>
                                <span className="text-[10px] uppercase font-bold tracking-wider mt-0.5 opacity-80">
                                    {sosEligibility ? (sosEligibility.isFree ? 'Cost: FREE (1/1 weekly remaining) • Lasts 15m' : 'Cost: 200,000 VND (Limit Reached) • Lasts 15m') : 'Loading...'}
                                </span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Critical Incident Banner (Phase 25.x) */}
            {request.incidents && request.incidents.length > 0 && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-6 animate-pulse">
                    <div className="flex gap-3">
                        <div className="text-2xl">⚠️</div>
                        <div className="w-full">
                            <h3 className="font-bold text-red-900">Incident Reported</h3>
                            <div className="mt-3 space-y-2">
                                {request.incidents.map((inc) => (
                                    <div key={inc.id} className="bg-white p-3 rounded-lg border border-red-100 shadow-sm flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${inc.severity === 'HIGH' || inc.severity === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {inc.severity}
                                                </span>
                                                <span className="text-xs text-gray-500">{new Date(inc.createdAt).toLocaleString()}</span>
                                            </div>
                                            <p className="text-sm text-gray-800 font-medium">{inc.description}</p>
                                        </div>
                                        <span className="text-xs text-red-500 font-semibold uppercase">{inc.status}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="mt-3 text-xs text-red-700">
                                Please contact the guide immediately. Incident resolution is handled by Admin/Ops.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Mismatch Warning Modal/Card */}
            {mismatchWarning && pendingGuideId && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 animate-fade-in">
                    <div className="flex gap-3">
                        <div className="text-2xl">⚠️</div>
                        <div>
                            <h3 className="font-semibold text-amber-900">Assignment Warnings</h3>
                            <p className="mt-1 text-amber-800 whitespace-pre-line">{mismatchWarning}</p>

                            <label className="mt-4 flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={acknowledgement}
                                    onChange={(e) => setAcknowledgement(e.target.checked)}
                                    className="mt-1 h-4 w-4 rounded border-amber-300 text-indigo-600 focus:ring-indigo-600"
                                />
                                <span className="text-sm text-amber-900 font-medium">
                                    I acknowledge the warnings above and wish to proceed.
                                </span>
                            </label>

                            <div className="mt-4 flex gap-3">
                                <button
                                    onClick={() => { setMismatchWarning(null); setPendingGuideId(null); }}
                                    className="rounded-lg bg-white border border-amber-200 px-4 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => submitAssignment(pendingGuideId, true)}
                                    disabled={!acknowledgement}
                                    className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    Confirm Assignment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Details (For Operator) */}
            {request.assignedGuideId && request.status === 'ASSIGNED' && applicant?.paymentInfo && (
                <div className="mt-6 rounded-xl border border-indigo-200 bg-indigo-50 p-6">
                    <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
                        <span>💳</span> Guide Payment Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <p className="text-xs text-indigo-600 font-medium uppercase tracking-wider">Bank Name</p>
                            <p className="text-base font-semibold text-gray-900 mt-1">{applicant.paymentInfo.bankName}</p>
                        </div>
                        <div>
                            <p className="text-xs text-indigo-600 font-medium uppercase tracking-wider">Account Number</p>
                            <p className="font-mono text-base font-semibold text-gray-900 mt-1">{applicant.paymentInfo.accountNumber}</p>
                        </div>
                        <div>
                            <p className="text-xs text-indigo-600 font-medium uppercase tracking-wider">Account Name</p>
                            <p className="text-base font-semibold text-gray-900 mt-1">{applicant.paymentInfo.accountName}</p>
                        </div>
                    </div>
                    <p className="text-xs text-indigo-600 mt-4 opacity-80">
                        * Please use these details to process payments for the guide. Ensure to verify before transfer.
                    </p>
                </div>
            )}

            {/* AI Operational Suggestions */}
            <div className="space-y-3">
                {request.status === 'ASSIGNED' && (
                    <SuggestionHint
                        title="Tour starts soon"
                        description="Recommend sending a check-in reminder to the guide to ensure on-time arrival."
                        actionLabel="Remind Guide"
                        onAction={() => toast.success('Reminder sent!')}
                    />
                )}
                {request.status === 'OPEN' && (
                    <SuggestionHint
                        title="Optimization Tip"
                        description="This tour spans multiple sites. Consider assigning an additional Sub Guide for better group management."
                        actionLabel="Learn more"
                    />
                )}
            </div>

            {/* Applicant Section via OFFERED */}
            {request.status === 'OFFERED' && request.assignedGuideId && !mismatchWarning && (
                <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-indigo-900">Pending Application</h2>
                        {matchingResult && (
                            <RecommendedBadge
                                score={matchingResult.score}
                                breakdown={matchingResult.breakdown}
                                recommendation={matchingResult.recommendation}
                            />
                        )}
                    </div>

                    {riskSignal && riskSignal.level !== 'STABLE' && (
                        <div className="mb-4">
                            <RiskFlag signal={riskSignal} />
                        </div>
                    )}

                    {applicant ? (
                        <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-indigo-100 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                    {applicant.email[0].toUpperCase()}
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900">{applicant.email}</div>
                                    <div className="text-xs text-gray-500 flex gap-2">
                                        <span>📍 {applicant.province || 'Unknown Location'}</span>
                                        <span>Trust: {applicant.trustScore}</span>
                                        {applicant.kycStatus === 'APPROVED' && <span className="text-green-600">✓ KYC Verified</span>}
                                    </div>
                                    <div className="mt-1 text-[10px] text-gray-400 capitalize">
                                        {applicant.completedTourCount} Tours Completed
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => handleAssignClick(request.assignedGuideId!)}
                                disabled={checkingGuide}
                                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition shadow-sm"
                            >
                                {checkingGuide ? 'Checking...' : 'Accept Application'}
                            </button>
                        </div>
                    ) : (
                        <div className="text-sm text-gray-500">Loading applicant details...</div>
                    )}
                </div>
            )}

            {/* Applicant List via OPEN / PUBLISHED state */}
            {['PUBLISHED', 'OPEN'].includes(request.status) && request.applications && request.applications.length > 0 && !mismatchWarning && (
                <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-indigo-900">
                            Pending Applications ({request.applications.length})
                        </h2>
                    </div>

                    <div className="space-y-3">
                        {request.applications.map((app) => {
                            // Determine guide certification from roleMetadata
                            let guideCert = 'MAIN_GUIDE';
                            try {
                                const meta = app.guide.roleMetadata ? JSON.parse(app.guide.roleMetadata) : {};
                                if (meta.guideType === 'SUPPORT_GUIDE' || meta.guideType === 'SUPPORT') guideCert = 'SUPPORT_GUIDE';
                                else if (meta.guideType === 'INTERN') guideCert = 'INTERN';
                            } catch {}

                            const certConfig: Record<string, { badge: string; label: string; color: string; notice: string }> = {
                                MAIN_GUIDE: { badge: '✅', label: 'Licensed Guide', color: 'bg-emerald-50 border-emerald-200 text-emerald-700', notice: 'Holds a professional Tour Guide License.' },
                                SUPPORT_GUIDE: { badge: '⚠️', label: 'No Tour Guide License', color: 'bg-amber-50 border-amber-200 text-amber-700', notice: 'Does not hold a professional Tour Guide License. May assist but cannot lead independently.' },
                                INTERN: { badge: '📘', label: 'Intern Guide', color: 'bg-blue-50 border-blue-200 text-blue-700', notice: 'A trainee guide still building experience. Max trust score: 60/100.' },
                            };
                            const cert = certConfig[guideCert] || certConfig.MAIN_GUIDE;

                            return (
                            <div key={app.id} className="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm">
                                <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Link href={`/marketplace/guide/${app.guideId}`} target="_blank" className="shrink-0 h-12 w-12 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border-2 border-transparent hover:border-indigo-300 transition group">
                                        {app.guide.avatarUrl ? (
                                            <img src={app.guide.avatarUrl} alt={app.guide.name || 'Guide Avatar'} className="w-full h-full object-cover group-hover:scale-110 transition duration-300" />
                                        ) : (
                                            (app.guide.name?.[0] || app.guide.email[0]).toUpperCase()
                                        )}
                                    </Link>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Link href={`/marketplace/guide/${app.guideId}`} target="_blank" className="font-semibold text-gray-900 hover:text-indigo-600 transition truncate">
                                                {app.guide.name || app.guide.email}
                                            </Link>
                                            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${cert.color}`}>
                                                {cert.badge} {cert.label}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-0.5 max-w-[200px] truncate">
                                            {app.guide.email}
                                        </div>
                                        <div className="text-xs text-gray-600 flex items-center gap-2 mt-1.5 font-medium">
                                            {app.guide.trustScore !== undefined && (
                                                <span className="flex items-center gap-1 bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">
                                                    <span>⭐</span>
                                                    {app.guide.trustScore}
                                                </span>
                                            )}
                                            {app.guide.kycStatus === 'APPROVED' && <span className="text-emerald-600">✓ KYC</span>}
                                        </div>
                                        <div className="mt-1 text-xs text-gray-400">
                                            Applied on {new Date(app.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleRejectApplication(app.id)}
                                        disabled={checkingGuide}
                                        className="rounded-lg bg-white border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 disabled:opacity-50 transition shadow-sm"
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => handleAssignClick(app.guideId)}
                                        disabled={checkingGuide}
                                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition shadow-sm"
                                    >
                                        {checkingGuide ? 'Processing...' : 'Approve & Assign'}
                                    </button>
                                </div>
                                </div>
                                {/* Certification Notice for non-licensed guides */}
                                {guideCert !== 'MAIN_GUIDE' && (
                                    <div className={`mt-3 rounded-lg border px-3 py-2 text-[11px] font-medium ${cert.color}`}>
                                        {cert.badge} {cert.notice}
                                    </div>
                                )}
                            </div>
                            );
                        })}
                    </div>
                </div>
            )}


            {request.status === 'PENDING_MUTUAL_CANCEL' && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
                    <div className="flex gap-3">
                        <div className="text-2xl mt-1">⚠️</div>
                        <div className="w-full">
                            <h3 className="font-bold text-amber-900">Guide Requested Withdrawal</h3>
                            <p className="mt-1 text-sm text-amber-800">
                                The assigned guide has requested to withdraw from this tour. If you approve, they will be removed and you can find a replacement.
                            </p>
                            <div className="mt-4 flex gap-3">
                                <button
                                    onClick={async () => {
                                        if (!confirm('Reject this request and keep the guide assigned?')) return;
                                        setCheckingGuide(true);
                                        const res = await fetch(`/api/requests/${request.id}/cancel/reject`, { method: 'POST' });
                                        if (res.ok) { toast.success('Request rejected'); fetchRequest(); }
                                        else toast.error('Failed to reject');
                                        setCheckingGuide(false);
                                    }}
                                    disabled={checkingGuide}
                                    className="rounded-lg bg-white border border-amber-300 px-4 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100 transition shadow-sm disabled:opacity-50"
                                >
                                    Reject Request
                                </button>
                                <button
                                    onClick={async () => {
                                        if (!confirm('Approve withdrawal? The guide will be removed.')) return;
                                        setCheckingGuide(true);
                                        const res = await fetch(`/api/requests/${request.id}/withdraw/approve`, { method: 'POST' });
                                        if (res.ok) { 
                                            toast.success('Guide removed successfully'); 
                                            fetchRequest(); 
                                        }
                                        else toast.error('Failed to approve withdrawal');
                                        setCheckingGuide(false);
                                    }}
                                    disabled={checkingGuide}
                                    className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition shadow-sm disabled:opacity-50"
                                >
                                    Approve & Remove Guide
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {request.assignedGuideId && request.status === 'ASSIGNED' && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-green-200 flex items-center justify-center text-green-800">✓</div>
                            <div>
                                <p className="font-medium text-green-900">Guide Assigned Successfully</p>
                                <p className="text-sm text-green-800 opacity-80">Guide ID: {request.assignedGuideId}</p>
                            </div>
                        </div>

                        {/* Phase 18: In-house Reassignment */}
                        <div className="flex items-center gap-2">
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-green-200/50">
                        {assignedGuide?.guideMode === 'IN_HOUSE' && assignedGuide?.affiliatedOperatorId === request.operatorId ? (
                            <details className="group">
                                <summary className="flex cursor-pointer items-center text-sm font-medium text-green-800 hover:text-green-900">
                                    <span>🔄 Reassign Guide (In-house Only)</span>
                                </summary>
                                <div className="mt-3 bg-white/50 p-3 rounded-lg">
                                    <p className="text-xs text-green-700 mb-2">
                                        You can reassign this tour to another in-house guide without trust penalty.
                                    </p>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="New Guide ID"
                                            id="reassign-input"
                                            className="flex-1 rounded border border-green-300 px-3 py-1.5 text-sm"
                                        />
                                        <button
                                            onClick={async () => {
                                                const newId = (document.getElementById('reassign-input') as HTMLInputElement).value;
                                                if (!newId) return;
                                                const res = await fetch(`/api/requests/${params.id}/reassign`, {
                                                    method: 'PATCH',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ newGuideId: newId })
                                                });
                                                if (res.ok) {
                                                    toast.success('Reassigned successfully');
                                                    fetchRequest();
                                                    (document.getElementById('reassign-input') as HTMLInputElement).value = '';
                                                } else {
                                                    const d = await res.json();
                                                    toast.error(d.error || 'Failed to reassign');
                                                }
                                            }}
                                            className="rounded bg-green-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-800"
                                        >
                                            Reassign
                                        </button>
                                    </div>
                                </div>
                            </details>
                        ) : (
                            <div className="text-sm font-medium text-amber-800 bg-amber-50 p-3 rounded shadow-sm border border-amber-200">
                                <span className="mr-2">⚠</span> 
                                Reassignment is disabled. You cannot manually reassign this tour because a freelance guide was assigned.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Tour Execution Timeline */}
            {(request.status === 'IN_PROGRESS' || request.status === 'COMPLETED' || request.status === 'CANCELLED' || request.status === 'DISPUTED') && (
                <div className="space-y-6">
                    {(request.status === 'IN_PROGRESS' || request.status === 'COMPLETED') && (
                        <TourExecutionTimeline tourId={request.id} />
                    )}
                    
                    {/* Active Dispute UI */}
                    {request.tourDisputes?.some(d => d.status === 'OPEN' || d.status === 'UNDER_REVIEW') ? (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-lg font-bold text-red-900">Active Dispute Overlay</h2>
                                    <p className="text-sm text-red-700">A dispute is currently open. Funds are frozen until Lunavia Support resolves it.</p>
                                </div>
                                <span className="px-3 py-1 bg-red-200 text-red-900 font-bold text-xs rounded-full">FROZEN</span>
                            </div>
                            <div className="bg-white rounded-lg border border-red-100 divide-y divide-red-50">
                                {request.tourDisputes.find(d => d.status === 'OPEN' || d.status === 'UNDER_REVIEW')?.evidence?.map((ev: any) => (
                                    <div key={ev.id} className="p-4 flex gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center font-bold text-xs text-red-800">
                                            {ev.uploadedBy === request.operatorId ? 'YOU' : 'OTHER'}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between">
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {ev.uploadedBy === request.operatorId ? 'You' : 'Counterpart / Admin'}
                                                </span>
                                                <span className="text-xs text-gray-400">{new Date(ev.createdAt).toLocaleString()}</span>
                                            </div>
                                            <p className="mt-1 text-sm text-gray-700">{ev.message}</p>
                                            {ev.fileUrl && (
                                                <a href={ev.fileUrl} target="_blank" rel="noreferrer" className="mt-2 text-xs font-medium text-indigo-600 hover:text-indigo-800 inline-flex items-center">
                                                    📎 View Attached Evidence
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm flex items-center justify-between mt-6">
                            <div>
                                <h2 className="text-lg font-medium text-red-900">Issue with this tour?</h2>
                                <p className="text-sm text-red-700">Open a dispute if there was a severe mismatch, no-show, or safety issue.</p>
                            </div>
                            <button
                                onClick={() => setDisputeTourId(request.id)}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 shadow-sm transition"
                            >
                                Open Dispute
                            </button>
                        </div>
                    )}

                    {/* Integrated Tour Chat Widget */}
                    <div className="mt-8">
                        <TourChatPanel tourId={request.id} />
                    </div>
                </div>
            )}

            {/* Phase 26: Feedback Loop */}
            {request.status === 'COMPLETED' && (
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-medium text-gray-900">Tour Completed</h2>
                            <p className="text-sm text-gray-500">How was the guide's performance?</p>
                        </div>

                        {!hasGivenFeedback(request) ? (
                            <button
                                onClick={() => setFeedbackTourId(request.id)}
                                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 shadow-sm"
                            >
                                ★ Give Feedback
                            </button>
                        ) : (
                            <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                ✓ Feedback Submitted
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
