'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface TrackingData {
    tour: {
        id: string;
        title: string;
        status: string;
        startTime: string;
        endTime: string;
        durationMinutes: number;
        location: string;
        province: string;
        language: string;
        groupSize: number;
        operatorName: string;
    };
    guide: { name: string; avatarUrl: string | null } | null;
    segments: { title: string; type: string; orderIndex: number }[];
    timeline: { eventType: string; role: string | null; description: string; createdAt: string }[];
    progress: { percentage: number; label: string; phase: string };
    agencyName: string;
    expiresAt: string;
}

export default function TourTrackingPage() {
    const params = useParams();
    const token = params.token as string;

    const [data, setData] = useState<TrackingData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(`/api/tour-track/${token}`);
                const json = await res.json();
                if (!json.success) {
                    setError(json.error || 'Failed to load tracking data');
                } else {
                    setData(json.data);
                }
            } catch {
                setError('Failed to connect. Please try again.');
            } finally {
                setLoading(false);
            }
        }
        fetchData();
        // Refresh every 30 seconds for real-time updates
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [token]);

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.loadingPulse}>Loading tour tracking...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.errorIcon}>🔗</div>
                    <h2 style={styles.errorTitle}>Tracking Unavailable</h2>
                    <p style={styles.errorMessage}>{error}</p>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const { tour, guide, segments, timeline, progress } = data;
    const startTime = new Date(tour.startTime);
    const endTime = new Date(tour.endTime);

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.logo}>LUNAVIA</div>
                <div style={styles.agencyBadge}>🔗 {data.agencyName}</div>
            </div>

            {/* Tour Info Card */}
            <div style={styles.card}>
                <h1 style={styles.tourTitle}>{tour.title}</h1>
                <div style={styles.operatorLabel}>by {tour.operatorName}</div>

                <div style={styles.infoGrid}>
                    <div style={styles.infoItem}>
                        <span style={styles.infoLabel}>📍 Location</span>
                        <span style={styles.infoValue}>{tour.location}</span>
                    </div>
                    <div style={styles.infoItem}>
                        <span style={styles.infoLabel}>📅 Date</span>
                        <span style={styles.infoValue}>{startTime.toLocaleDateString()}</span>
                    </div>
                    <div style={styles.infoItem}>
                        <span style={styles.infoLabel}>🕐 Time</span>
                        <span style={styles.infoValue}>{startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div style={styles.infoItem}>
                        <span style={styles.infoLabel}>👥 Guests</span>
                        <span style={styles.infoValue}>{tour.groupSize || '—'}</span>
                    </div>
                    <div style={styles.infoItem}>
                        <span style={styles.infoLabel}>🌐 Language</span>
                        <span style={styles.infoValue}>{tour.language || '—'}</span>
                    </div>
                    {guide && (
                        <div style={styles.infoItem}>
                            <span style={styles.infoLabel}>🧑‍🏫 Guide</span>
                            <span style={styles.infoValue}>{guide.name}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Progress Bar */}
            <div style={styles.card}>
                <div style={styles.statusBadge(progress.phase)}>{progress.phase}</div>
                <div style={styles.progressBar}>
                    <div style={{ ...styles.progressFill, width: `${progress.percentage}%` }} />
                </div>
                <div style={styles.progressLabel}>{progress.label} — {progress.percentage}%</div>
            </div>

            {/* Itinerary */}
            {segments.length > 0 && (
                <div style={styles.card}>
                    <h2 style={styles.sectionTitle}>Itinerary</h2>
                    <div style={styles.itinerary}>
                        {segments.map((seg, i) => {
                            const isCheckedIn = timeline.some(
                                (e) => e.eventType === 'SEGMENT_CHECKED_IN' && e.description?.includes(seg.title)
                            );
                            return (
                                <div key={i} style={styles.segmentItem}>
                                    <div style={styles.segmentDot(isCheckedIn)} />
                                    <div style={styles.segmentLabel}>
                                        <span style={{ fontWeight: isCheckedIn ? 600 : 400 }}>{seg.title}</span>
                                        {isCheckedIn && <span style={styles.checkMark}>✓</span>}
                                    </div>
                                    {i < segments.length - 1 && <div style={styles.segmentLine} />}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Execution Timeline */}
            {timeline.length > 0 && (
                <div style={styles.card}>
                    <h2 style={styles.sectionTitle}>Execution Timeline</h2>
                    <div style={styles.timeline}>
                        {timeline.map((event, i) => (
                            <div key={i} style={styles.timelineItem}>
                                <div style={styles.timelineDot} />
                                <div style={styles.timelineContent}>
                                    <div style={styles.timelineEvent}>{event.description}</div>
                                    <div style={styles.timelineTime}>
                                        {event.role && <span style={styles.roleTag}>{event.role.replace(/_/g, ' ')}</span>}
                                        {new Date(event.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Footer */}
            <div style={styles.footer}>
                Powered by <strong>Lunavia</strong> · Tour Operations Platform
            </div>
        </div>
    );
}

// ── Inline Styles ─────────────────────────────────────────────────────

const styles: any = {
    container: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        padding: '24px 16px',
        fontFamily: "'Inter', -apple-system, sans-serif",
        color: '#e2e8f0',
        maxWidth: 600,
        margin: '0 auto',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    logo: {
        fontSize: 20,
        fontWeight: 700,
        letterSpacing: 2,
        color: '#38bdf8',
    },
    agencyBadge: {
        fontSize: 12,
        background: 'rgba(56, 189, 248, 0.15)',
        padding: '4px 12px',
        borderRadius: 20,
        color: '#38bdf8',
    },
    card: {
        background: 'rgba(30, 41, 59, 0.8)',
        borderRadius: 16,
        padding: '20px',
        marginBottom: 16,
        border: '1px solid rgba(148, 163, 184, 0.1)',
        backdropFilter: 'blur(10px)',
    },
    tourTitle: {
        fontSize: 22,
        fontWeight: 700,
        margin: '0 0 4px 0',
        color: '#f1f5f9',
    },
    operatorLabel: {
        fontSize: 14,
        color: '#94a3b8',
        marginBottom: 16,
    },
    infoGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 12,
    },
    infoItem: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 2,
    },
    infoLabel: {
        fontSize: 12,
        color: '#64748b',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: 500,
        color: '#cbd5e1',
    },
    statusBadge: (phase: string) => ({
        display: 'inline-block',
        fontSize: 11,
        fontWeight: 700,
        textTransform: 'uppercase' as const,
        letterSpacing: 1,
        padding: '4px 10px',
        borderRadius: 6,
        marginBottom: 12,
        background:
            phase === 'COMPLETED' ? 'rgba(34, 197, 94, 0.2)' :
            phase === 'IN_PROGRESS' ? 'rgba(59, 130, 246, 0.2)' :
            phase === 'CANCELLED' ? 'rgba(239, 68, 68, 0.2)' :
            'rgba(148, 163, 184, 0.2)',
        color:
            phase === 'COMPLETED' ? '#4ade80' :
            phase === 'IN_PROGRESS' ? '#60a5fa' :
            phase === 'CANCELLED' ? '#f87171' :
            '#94a3b8',
    }),
    progressBar: {
        width: '100%',
        height: 8,
        background: 'rgba(148, 163, 184, 0.2)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        background: 'linear-gradient(90deg, #38bdf8, #818cf8)',
        borderRadius: 4,
        transition: 'width 0.5s ease',
    },
    progressLabel: {
        fontSize: 13,
        color: '#94a3b8',
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 600,
        marginBottom: 16,
        color: '#f1f5f9',
    },
    itinerary: {
        paddingLeft: 8,
    },
    segmentItem: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        position: 'relative' as const,
        paddingBottom: 16,
    },
    segmentDot: (checked: boolean) => ({
        width: 12,
        height: 12,
        borderRadius: '50%',
        marginTop: 4,
        flexShrink: 0,
        background: checked ? '#4ade80' : 'rgba(148, 163, 184, 0.3)',
        border: checked ? '2px solid #22c55e' : '2px solid rgba(148, 163, 184, 0.5)',
    }),
    segmentLabel: {
        fontSize: 14,
        color: '#cbd5e1',
        display: 'flex',
        gap: 8,
        alignItems: 'center',
    },
    checkMark: {
        color: '#4ade80',
        fontSize: 14,
        fontWeight: 700,
    },
    segmentLine: {
        position: 'absolute' as const,
        left: 13,
        top: 20,
        width: 2,
        height: 'calc(100% - 16px)',
        background: 'rgba(148, 163, 184, 0.2)',
    },
    timeline: {
        paddingLeft: 8,
    },
    timelineItem: {
        display: 'flex',
        gap: 12,
        paddingBottom: 12,
        position: 'relative' as const,
    },
    timelineDot: {
        width: 10,
        height: 10,
        borderRadius: '50%',
        background: '#38bdf8',
        marginTop: 5,
        flexShrink: 0,
    },
    timelineContent: {
        flex: 1,
    },
    timelineEvent: {
        fontSize: 14,
        color: '#cbd5e1',
    },
    timelineTime: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 2,
        display: 'flex',
        gap: 8,
        alignItems: 'center',
    },
    roleTag: {
        fontSize: 10,
        background: 'rgba(129, 140, 248, 0.2)',
        color: '#a5b4fc',
        padding: '1px 6px',
        borderRadius: 4,
        textTransform: 'uppercase' as const,
    },
    footer: {
        textAlign: 'center' as const,
        fontSize: 12,
        color: '#475569',
        padding: '24px 0',
    },
    errorIcon: {
        fontSize: 48,
        textAlign: 'center' as const,
        marginBottom: 16,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: 600,
        textAlign: 'center' as const,
        marginBottom: 8,
    },
    errorMessage: {
        fontSize: 14,
        color: '#94a3b8',
        textAlign: 'center' as const,
    },
    loadingPulse: {
        textAlign: 'center' as const,
        fontSize: 16,
        color: '#94a3b8',
        padding: 40,
    },
};
