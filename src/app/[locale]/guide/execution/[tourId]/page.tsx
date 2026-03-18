'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface TourData {
    tour: {
        id: string;
        title: string;
        status: string;
        startTime: string;
        endTime: string;
        location: string;
        groupSize: number;
        operatorName: string;
    };
    role: string;
    verified: boolean;
    stage: string;
    segments: { id: string; title: string; type: string; orderIndex: number; checkedIn: boolean }[];
    timeline: { eventType: string; role: string | null; description: string; createdAt: string }[];
}

const STAGE_CONFIG: Record<string, { label: string; color: string }> = {
    PRE_VERIFICATION: { label: 'Verify Identity', color: '#f97316' },
    PRE_PICKUP: { label: 'Ready for Pickup', color: '#3b82f6' },
    POST_PICKUP: { label: 'Pickup Started', color: '#6366f1' },
    DEPARTED: { label: 'Departed', color: '#8b5cf6' },
    DURING_TOUR: { label: 'Tour In Progress', color: '#22c55e' },
    COMPLETED: { label: 'Completed', color: '#64748b' },
};

export default function GuideExecutionPage() {
    const params = useParams();
    const router = useRouter();
    const tourId = params.tourId as string;

    const [data, setData] = useState<TourData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch(`/api/guide/execution/${tourId}`);
            const json = await res.json();
            if (json.success) setData(json.data);
            else setError(json.error);
        } catch { setError('Failed to connect'); }
        finally { setLoading(false); }
    }, [tourId]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 15000);
        return () => clearInterval(interval);
    }, [fetchData]);

    async function performAction(eventType: string, description: string, extra?: any) {
        setActionLoading(eventType);
        try {
            await fetch(`/api/tours/${tourId}/execution-timeline`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventType, description, role: data?.role, ...extra }),
            });
            await fetchData();
        } catch { /* retry silently */ }
        setActionLoading(null);
    }

    async function handleVerify() {
        setActionLoading('VERIFY');
        try {
            await fetch(`/api/tours/${tourId}/verify-identity`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ selfieUrl: `selfie_${Date.now()}.jpg` }),
            });
            await fetchData();
        } catch { /* retry silently */ }
        setActionLoading(null);
    }

    async function handleSegmentCheckIn(segmentId: string, segmentTitle: string) {
        await performAction('SEGMENT_CHECKED_IN', `Checked in: ${segmentTitle}`, {
            metadata: { segmentId, segmentTitle, timestamp: new Date().toISOString() },
        });
    }

    if (loading) {
        return (
            <div style={s.container}>
                <div style={s.loadingBox}>
                    <div style={s.spinner} />
                    <p style={{ color: '#94a3b8', marginTop: 12 }}>Loading tour...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div style={s.container}>
                <div style={s.errorBox}>
                    <p style={{ fontSize: 40 }}>⚠️</p>
                    <h2 style={{ color: '#f1f5f9', fontSize: 18, fontWeight: 600 }}>{error || 'Tour not found'}</h2>
                    <button onClick={() => router.back()} style={s.backBtn}>← Go Back</button>
                </div>
            </div>
        );
    }

    const { tour, stage, verified, segments, timeline, role } = data;
    const stageConf = STAGE_CONFIG[stage] || STAGE_CONFIG.PRE_VERIFICATION;
    const startTime = new Date(tour.startTime);

    return (
        <div style={s.container}>
            {/* Header */}
            <div style={s.header}>
                <button onClick={() => router.back()} style={s.headerBack}>←</button>
                <div>
                    <div style={s.headerTitle}>{tour.title}</div>
                    <div style={s.headerSub}>{tour.operatorName} · {tour.groupSize} guests</div>
                </div>
                <div style={{ ...s.stageBadge, background: `${stageConf.color}20`, color: stageConf.color }}>
                    {stageConf.label}
                </div>
            </div>

            {/* Tour Info */}
            <div style={s.infoBar}>
                <div style={s.infoItem}>📍 {tour.location}</div>
                <div style={s.infoItem}>🕐 {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                <div style={s.infoItem}>👤 {role.replace(/_/g, ' ')}</div>
            </div>

            {/* Action Buttons — depends on stage */}
            <div style={s.actionArea}>
                {stage === 'PRE_VERIFICATION' && (
                    <button onClick={handleVerify} disabled={actionLoading === 'VERIFY'} style={{ ...s.actionBtn, background: '#f97316' }}>
                        {actionLoading === 'VERIFY' ? 'Verifying...' : '📷 Verify Identity'}
                    </button>
                )}

                {stage === 'PRE_PICKUP' && (
                    <button onClick={() => performAction('PICKUP_STARTED', 'Pickup started.')} disabled={actionLoading === 'PICKUP_STARTED'} style={{ ...s.actionBtn, background: '#3b82f6' }}>
                        {actionLoading === 'PICKUP_STARTED' ? 'Starting...' : '🚗 Start Pickup'}
                    </button>
                )}

                {stage === 'POST_PICKUP' && (
                    <button onClick={() => performAction('DEPARTURE_CONFIRMED', 'All guests on board. Departing.')} disabled={actionLoading === 'DEPARTURE_CONFIRMED'} style={{ ...s.actionBtn, background: '#6366f1' }}>
                        {actionLoading === 'DEPARTURE_CONFIRMED' ? 'Confirming...' : '✈️ Confirm Departure'}
                    </button>
                )}

                {stage === 'DEPARTED' && (
                    <button onClick={() => performAction('TOUR_STARTED', 'Tour commenced.')} disabled={actionLoading === 'TOUR_STARTED'} style={{ ...s.actionBtn, background: '#8b5cf6' }}>
                        {actionLoading === 'TOUR_STARTED' ? 'Starting...' : '▶️ Start Tour'}
                    </button>
                )}

                {stage === 'DURING_TOUR' && (
                    <>
                        {/* Segment Check-ins */}
                        <div style={s.sectionTitle}>Segments</div>
                        <div style={s.segmentList}>
                            {segments.map((seg) => (
                                <button
                                    key={seg.id}
                                    onClick={() => !seg.checkedIn && handleSegmentCheckIn(seg.id, seg.title)}
                                    disabled={seg.checkedIn || actionLoading === 'SEGMENT_CHECKED_IN'}
                                    style={{
                                        ...s.segmentBtn,
                                        background: seg.checkedIn ? 'rgba(34, 197, 94, 0.15)' : 'rgba(99, 102, 241, 0.1)',
                                        borderColor: seg.checkedIn ? '#22c55e' : 'rgba(148, 163, 184, 0.3)',
                                        opacity: seg.checkedIn ? 0.7 : 1,
                                    }}
                                >
                                    <span style={{ fontSize: 18 }}>{seg.checkedIn ? '✅' : '📍'}</span>
                                    <span style={{ color: seg.checkedIn ? '#4ade80' : '#e2e8f0', fontWeight: 500 }}>{seg.title}</span>
                                </button>
                            ))}
                        </div>

                        {/* Quick Actions */}
                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                            <button onClick={() => performAction('INCIDENT_REPORTED', 'Incident reported by guide.')} style={{ ...s.smallActionBtn, background: '#ef4444' }}>
                                🚨 Report Incident
                            </button>
                            <button onClick={() => performAction('ADD_NOTES', 'Guide added notes.')} style={{ ...s.smallActionBtn, background: '#64748b' }}>
                                📝 Add Notes
                            </button>
                        </div>

                        {/* Complete Tour */}
                        <button onClick={() => performAction('TOUR_COMPLETED', 'Tour completed successfully.')} disabled={actionLoading === 'TOUR_COMPLETED'} style={{ ...s.actionBtn, background: '#22c55e', marginTop: 16 }}>
                            {actionLoading === 'TOUR_COMPLETED' ? 'Completing...' : '🏁 Complete Tour'}
                        </button>
                    </>
                )}

                {stage === 'COMPLETED' && (
                    <div style={s.completedBox}>
                        <span style={{ fontSize: 48 }}>🎉</span>
                        <h3 style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 18 }}>Tour Completed</h3>
                        <p style={{ color: '#94a3b8', fontSize: 14 }}>Great work! This tour has been completed.</p>
                    </div>
                )}
            </div>

            {/* Timeline */}
            {timeline.length > 0 && (
                <div style={s.timelineSection}>
                    <div style={s.sectionTitle}>Timeline</div>
                    {timeline.map((event, i) => (
                        <div key={i} style={s.timelineItem}>
                            <div style={s.timelineDot} />
                            <div style={{ flex: 1 }}>
                                <div style={{ color: '#cbd5e1', fontSize: 13 }}>{event.description}</div>
                                <div style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>
                                    {event.role && <span style={s.roleTag}>{event.role.replace(/_/g, ' ')}</span>}
                                    {new Date(event.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Mobile-First Inline Styles ────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
    container: {
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
        fontFamily: "'Inter', -apple-system, sans-serif",
        color: '#e2e8f0',
        maxWidth: 480,
        margin: '0 auto',
        padding: '0 0 40px 0',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '16px',
        borderBottom: '1px solid rgba(148,163,184,0.1)',
    },
    headerBack: {
        background: 'none',
        border: 'none',
        color: '#94a3b8',
        fontSize: 20,
        cursor: 'pointer',
        padding: 4,
    },
    headerTitle: { fontSize: 16, fontWeight: 700, color: '#f1f5f9' },
    headerSub: { fontSize: 12, color: '#94a3b8' },
    stageBadge: {
        marginLeft: 'auto',
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase' as const,
        letterSpacing: 0.5,
        padding: '4px 10px',
        borderRadius: 8,
    },
    infoBar: {
        display: 'flex',
        gap: 16,
        padding: '12px 16px',
        background: 'rgba(30,41,59,0.6)',
        borderBottom: '1px solid rgba(148,163,184,0.1)',
        overflowX: 'auto' as const,
    },
    infoItem: { fontSize: 12, color: '#94a3b8', whiteSpace: 'nowrap' as const },
    actionArea: { padding: '20px 16px' },
    actionBtn: {
        width: '100%',
        padding: '18px 24px',
        border: 'none',
        borderRadius: 16,
        color: '#fff',
        fontSize: 17,
        fontWeight: 700,
        cursor: 'pointer',
        textAlign: 'center' as const,
        transition: 'opacity 0.2s',
    },
    smallActionBtn: {
        flex: 1,
        padding: '12px 8px',
        border: 'none',
        borderRadius: 12,
        color: '#fff',
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        textAlign: 'center' as const,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: 700,
        color: '#94a3b8',
        textTransform: 'uppercase' as const,
        letterSpacing: 1,
        marginBottom: 12,
    },
    segmentList: { display: 'flex', flexDirection: 'column' as const, gap: 8 },
    segmentBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 16px',
        border: '1px solid',
        borderRadius: 12,
        background: 'transparent',
        cursor: 'pointer',
        textAlign: 'left' as const,
        fontSize: 14,
        width: '100%',
    },
    completedBox: {
        textAlign: 'center' as const,
        padding: 32,
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        gap: 8,
    },
    timelineSection: { padding: '0 16px', marginTop: 16 },
    timelineItem: {
        display: 'flex',
        gap: 10,
        paddingBottom: 12,
        position: 'relative' as const,
    },
    timelineDot: {
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: '#38bdf8',
        marginTop: 5,
        flexShrink: 0,
    },
    roleTag: {
        fontSize: 9,
        background: 'rgba(129,140,248,0.2)',
        color: '#a5b4fc',
        padding: '1px 5px',
        borderRadius: 4,
        textTransform: 'uppercase' as const,
        marginRight: 6,
    },
    loadingBox: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
    },
    spinner: {
        width: 32,
        height: 32,
        border: '3px solid rgba(148,163,184,0.2)',
        borderTop: '3px solid #38bdf8',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    errorBox: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 12,
    },
    backBtn: {
        padding: '10px 20px',
        borderRadius: 10,
        border: '1px solid rgba(148,163,184,0.3)',
        background: 'none',
        color: '#94a3b8',
        cursor: 'pointer',
        fontSize: 14,
    },
};
