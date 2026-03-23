'use client';

import { useEffect, useState, useCallback } from 'react';
import { Link } from '@/navigation';

// ── Types ────────────────────────────────────────────────────────────

type SystemMode = 'INTERNAL_OPERATOR_MODE' | 'MARKETPLACE_MODE' | 'SAAS_ENTERPRISE_MODE';
type FeatureLayer = 'MARKETPLACE_ACCESS' | 'ESCROW_ENABLED' | 'COMMISSION_ENABLED' | 'BOOST_ENABLED' | 'HYBRID_INTERNAL_ASSIGN' | 'ADVANCED_ANALYTICS';
type TimeRange = '7d' | '30d' | '90d';

interface HealthData {
    operatorsByCategory: { category: string; count: number }[];
    totalGuides: number;
    operatorsByMode: { mode: string; count: number }[];
    operatorsByRisk: { level: string; count: number }[];
    operatorsByCompliance: { level: string; count: number }[];
    activeEscrowVolume: number;
    ledgerVolume: number;
    commissionEarned: number;
    boostPurchases: number;
    pendingVerifications: number;
    pendingWithdrawals: number;
}

interface RiskOperator {
    id: string;
    name: string | null;
    email: string;
    operatorCategory: string | null;
    legalTier: string | null;
    trustScore: number;
    riskScore: number;
    riskLevel: string;
    complianceLevel: string;
    systemMode: string;
    openIncidents: number;
    activeDisputes: number;
    lastActivityAt: string | null;
}

interface TrustBreakdown {
    legalBase: number | null;
    complianceScore: number | null;
    performanceScore: number | null;
    financialBehavior: number | null;
    operationalPenalty: number | null;
    financialPenalty: number | null;
    riskPenalty: number | null;
    decayPenalty: number | null;
    newScore: number;
    createdAt: string;
}

interface HighTrustOp {
    id: string;
    name: string | null;
    email: string;
    trustScore: number;
    operatorCategory: string | null;
    complianceLevel: string;
    trustMax: number;
    nearCap: boolean;
    breakdown: TrustBreakdown | null;
}

interface TrustDrop {
    operatorId: string;
    operatorName: string | null;
    operatorEmail: string;
    operatorCategory: string | null;
    currentScore: number;
    change: number;
    newScoreAtEvent: number;
    type: string;
    description: string | null;
    date: string;
    breakdown: Partial<TrustBreakdown>;
}

interface DriftCase {
    walletId: string;
    operatorId: string;
    operatorName: string | null;
    operatorEmail: string;
    columnBalance: number;
    ledgerBalance: number;
    drift: number;
}

interface ModeOperator {
    id: string;
    name: string | null;
    email: string;
    systemMode: SystemMode;
    enabledLayers: FeatureLayer[];
    effectiveLayers: FeatureLayer[];
    hasCustomLayers: boolean;
    operatorCategory: string | null;
    plan: string;
    accountStatus: string;
    escrowEnabled: boolean;
    commissionEnabled: boolean;
    boostEnabled: boolean;
    settlements: Record<string, number>;
    lastModeChange: string | null;
    lastChangedBy: string | null;
}

interface DashboardData {
    range: string;
    panels: string[];
    role: string;
    health?: HealthData;
    risk?: { operators: RiskOperator[] };
    trust?: { highTrustOperators: HighTrustOp[]; trustDrops: TrustDrop[] };
    financial?: {
        ledgerDriftCases: DriftCase[];
        stuckEscrows: { tourId: string; title: string; operatorName: string | null; heldAt: string; amount: number | null; hoursHeld: number | null }[];
        staleWithdrawals: { id: string; operatorName: string | null; operatorEmail: string; amount: number; waitingHours: number }[];
        boostsWithoutLedger: { id: string; operatorId: string; amount: number; date: string }[];
        hasIssues: boolean;
    };
    mode?: {
        operators: ModeOperator[];
        availableModes: SystemMode[];
        availableLayers: FeatureLayer[];
        modeDefinitions: Record<SystemMode, FeatureLayer[]>;
    };
}

// ── Constants ────────────────────────────────────────────────────────

const MODE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
    INTERNAL_OPERATOR_MODE: { label: 'Internal', color: '#1d4ed8', bg: '#eff6ff' },
    MARKETPLACE_MODE: { label: 'Marketplace', color: '#15803d', bg: '#f0fdf4' },
    SAAS_ENTERPRISE_MODE: { label: 'Enterprise', color: '#7e22ce', bg: '#faf5ff' },
};

const RISK_COLORS: Record<string, { text: string; bg: string; border: string }> = {
    GREEN: { text: '#166534', bg: '#f0fdf4', border: '#bbf7d0' },
    YELLOW: { text: '#854d0e', bg: '#fefce8', border: '#fef08a' },
    RED: { text: '#991b1b', bg: '#fef2f2', border: '#fecaca' },
};

const COMPLIANCE_COLORS: Record<string, { text: string; bg: string }> = {
    GOLD: { text: '#92400e', bg: '#fffbeb' },
    STANDARD: { text: '#1e40af', bg: '#eff6ff' },
    PROBATION: { text: '#991b1b', bg: '#fef2f2' },
};

const LAYER_LABELS: Record<string, string> = {
    MARKETPLACE_ACCESS: 'Marketplace',
    ESCROW_ENABLED: 'Escrow',
    COMMISSION_ENABLED: 'Commission',
    BOOST_ENABLED: 'Boost',
    HYBRID_INTERNAL_ASSIGN: 'Hybrid Assign',
    ADVANCED_ANALYTICS: 'Analytics',
};

function formatVND(amount: number): string {
    if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`;
    return amount.toLocaleString();
}

function formatDate(d: string | null): string {
    if (!d) return 'No Data';
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Reusable Components ─────────────────────────────────────────────

function StatCard({ label, value, sub, alert }: { label: string; value: string | number; sub?: string; alert?: boolean }) {
    return (
        <div style={{
            background: alert ? '#fef2f2' : '#fff',
            border: `1px solid ${alert ? '#fecaca' : '#e5e7eb'}`,
            borderRadius: 10,
            padding: '16px 20px',
            minWidth: 160,
        }}>
            <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500, marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: alert ? '#991b1b' : '#111827' }}>{value}</div>
            {sub && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{sub}</div>}
        </div>
    );
}

function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
    return (
        <span style={{
            display: 'inline-block',
            fontSize: 11,
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: 999,
            color,
            background: bg,
        }}>
            {label}
        </span>
    );
}

function SectionHeader({ title, sub, id }: { title: string; sub: string; id: string }) {
    return (
        <div id={id} style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>{title}</h2>
            <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>{sub}</p>
        </div>
    );
}

// ── Main Component ──────────────────────────────────────────────────

export default function GovernanceDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [range, setRange] = useState<TimeRange>('30d');
    const [activeTab, setActiveTab] = useState<string>('health');

    // Mode editing state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editMode, setEditMode] = useState<SystemMode>('MARKETPLACE_MODE');
    const [editLayers, setEditLayers] = useState<FeatureLayer[]>([]);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // ── Dispute / Risk / Reliability state (must be before conditional returns) ──
    const [disputes, setDisputes] = useState<any[]>([]);
    const [disputesLoading, setDisputesLoading] = useState(false);
    const [riskEvents, setRiskEvents] = useState<any[]>([]);
    const [riskEventsLoading, setRiskEventsLoading] = useState(false);
    const [guideReliability, setGuideReliability] = useState<any[]>([]);
    const [reliabilityLoading, setReliabilityLoading] = useState(false);
    const [resolving, setResolving] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await fetch(`/api/admin/governance/dashboard?range=${range}&panel=all`);
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || `HTTP ${res.status}`);
            }
            setData(await res.json());
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [range]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // ── Mode editing handlers ────────────────────────────────────
    const startEdit = (op: ModeOperator) => {
        setEditingId(op.id);
        setEditMode(op.systemMode);
        setEditLayers(op.hasCustomLayers ? [...op.enabledLayers] : []);
        setMessage(null);
    };

    const saveChanges = async (operatorId: string) => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/governance', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    operatorId,
                    systemMode: editMode,
                    enabledLayers: editLayers.length > 0 ? editLayers : undefined,
                    resetToDefaults: editLayers.length === 0,
                }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Failed to save');
            setMessage({ type: 'success', text: 'Governance settings updated & audit logged.' });
            setEditingId(null);
            fetchData();
        } catch (e: any) {
            setMessage({ type: 'error', text: e.message });
        } finally {
            setSaving(false);
        }
    };

    const toggleLayer = (layer: FeatureLayer) => {
        setEditLayers(prev => prev.includes(layer) ? prev.filter(l => l !== layer) : [...prev, layer]);
    };

    // ── Render ───────────────────────────────────────────────────

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
                <div style={{
                    width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: '#4f46e5',
                    borderRadius: '50%', animation: 'spin 0.7s linear infinite',
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: 32, textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 600, color: '#991b1b' }}>Error</div>
                <p style={{ color: '#6b7280', marginTop: 8 }}>{error}</p>
                <button onClick={fetchData} style={{
                    marginTop: 16, padding: '8px 20px', background: '#4f46e5', color: '#fff',
                    border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14,
                }}>Retry</button>
            </div>
        );
    }

    // Lazy-fetch disputes/risk-events/reliability on tab change
    useEffect(() => {
        if (activeTab === 'disputes' && disputes.length === 0) {
            setDisputesLoading(true);
            fetch('/api/disputes').then(r => r.json()).then(d => setDisputes(d.disputes || [])).catch(() => {}).finally(() => setDisputesLoading(false));
        }
        if (activeTab === 'riskEvents' && riskEvents.length === 0) {
            setRiskEventsLoading(true);
            fetch('/api/admin/governance/risk-events').then(r => r.json()).then(d => setRiskEvents(d.events || [])).catch(() => {}).finally(() => setRiskEventsLoading(false));
        }
        if (activeTab === 'reliability' && guideReliability.length === 0) {
            setReliabilityLoading(true);
            fetch('/api/admin/governance/guide-reliability').then(r => r.json()).then(d => setGuideReliability(d.guides || [])).catch(() => {}).finally(() => setReliabilityLoading(false));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    if (!data) return null;

    const handleResolve = async (disputeId: string, resolution: string, action: string) => {
        setResolving(disputeId);
        await fetch(`/api/disputes/${disputeId}/resolve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resolution, action }),
        });
        // Refresh disputes
        const res = await fetch('/api/disputes');
        const d = await res.json();
        setDisputes(d.disputes || []);
        setResolving(null);
    };

    const allTabs = [
        { key: 'health', label: '📊 Platform Health' },
        { key: 'risk', label: '⚠️ Risk Monitoring' },
        { key: 'trust', label: '🛡️ Trust Integrity' },
        { key: 'financial', label: '💰 Financial Integrity' },
        { key: 'mode', label: '⚙️ SystemMode' },
        { key: 'disputes', label: '⚖️ Disputes' },
        { key: 'riskEvents', label: '🔥 Risk Events' },
        { key: 'reliability', label: '👥 Reliability' },
    ];
    const tabs = allTabs.filter(t => data.panels.includes(t.key) || ['disputes', 'riskEvents', 'reliability'].includes(t.key));

    const canEdit = data.role === 'SUPER_ADMIN';
    const canForceReview = ['SUPER_ADMIN', 'ADMIN'].includes(data.role);

    return (
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: 0 }}>
                    Governance Dashboard
                </h1>
                <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>
                    Compliance-grade overview • All data from DB • Role: <strong>{data.role}</strong>
                </p>
            </div>

            {/* Time Range + Tab Navigation */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: 24, flexWrap: 'wrap', gap: 12,
            }}>
                {/* Tabs */}
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {tabs.map(t => (
                        <button
                            key={t.key}
                            onClick={() => setActiveTab(t.key)}
                            style={{
                                padding: '6px 16px',
                                fontSize: 13,
                                fontWeight: activeTab === t.key ? 700 : 500,
                                background: activeTab === t.key ? '#4f46e5' : '#f3f4f6',
                                color: activeTab === t.key ? '#fff' : '#374151',
                                border: 'none',
                                borderRadius: 6,
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                            }}
                        >{t.label}</button>
                    ))}
                </div>

                {/* Range selector */}
                <div style={{ display: 'flex', gap: 4 }}>
                    {(['7d', '30d', '90d'] as TimeRange[]).map(r => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            style={{
                                padding: '4px 12px',
                                fontSize: 12,
                                fontWeight: range === r ? 700 : 400,
                                background: range === r ? '#111827' : '#f3f4f6',
                                color: range === r ? '#fff' : '#6b7280',
                                border: 'none',
                                borderRadius: 4,
                                cursor: 'pointer',
                            }}
                        >{r}</button>
                    ))}
                </div>
            </div>

            {/* Message */}
            {message && (
                <div style={{
                    padding: '10px 16px', borderRadius: 8, fontSize: 13, marginBottom: 16,
                    background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
                    color: message.type === 'success' ? '#166534' : '#991b1b',
                    border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                }}>{message.text}</div>
            )}

            {/* ═══ Panel 1: Platform Health ═══ */}
            {activeTab === 'health' && data.health && (
                <div>
                    <SectionHeader id="health" title="Platform Health Overview" sub={`Aggregated metrics for the last ${range}`} />

                    {/* Stat Cards Row 1 */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
                        <StatCard
                            label="Total Operators"
                            value={data.health.operatorsByCategory.reduce((a, b) => a + b.count, 0)}
                        />
                        <StatCard label="Total Guides" value={data.health.totalGuides} />
                        <StatCard
                            label="Active Escrow"
                            value={`₫${formatVND(data.health.activeEscrowVolume)}`}
                            sub="Currently held"
                        />
                        <StatCard
                            label={`Ledger Volume (${range})`}
                            value={`₫${formatVND(data.health.ledgerVolume)}`}
                        />
                        <StatCard
                            label={`Commission (${range})`}
                            value={`₫${formatVND(data.health.commissionEarned)}`}
                            sub="Platform revenue"
                        />
                        <StatCard
                            label={`Boosts (${range})`}
                            value={data.health.boostPurchases}
                        />
                        <StatCard
                            label="Pending Verifications"
                            value={data.health.pendingVerifications}
                            alert={data.health.pendingVerifications > 0}
                        />
                        <StatCard
                            label="Pending Withdrawals"
                            value={data.health.pendingWithdrawals}
                            alert={data.health.pendingWithdrawals > 0}
                        />
                    </div>

                    {/* Breakdown Tables */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                        {/* By Category */}
                        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 16 }}>
                            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: '0 0 12px' }}>Operators by Category</h3>
                            {data.health.operatorsByCategory.length === 0
                                ? <div style={{ color: '#9ca3af', fontSize: 13 }}>No Data</div>
                                : data.health.operatorsByCategory.map(r => (
                                    <div key={r.category} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f3f4f6' }}>
                                        <span style={{ fontSize: 13, color: '#374151' }}>{r.category}</span>
                                        <span style={{ fontSize: 13, fontWeight: 700 }}>{r.count}</span>
                                    </div>
                                ))
                            }
                        </div>

                        {/* By Mode */}
                        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 16 }}>
                            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: '0 0 12px' }}>Operators by SystemMode</h3>
                            {data.health.operatorsByMode.length === 0
                                ? <div style={{ color: '#9ca3af', fontSize: 13 }}>No Data</div>
                                : data.health.operatorsByMode.map(r => (
                                    <div key={r.mode} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f3f4f6' }}>
                                        <Badge label={MODE_LABELS[r.mode]?.label || r.mode} color={MODE_LABELS[r.mode]?.color || '#374151'} bg={MODE_LABELS[r.mode]?.bg || '#f3f4f6'} />
                                        <span style={{ fontSize: 13, fontWeight: 700 }}>{r.count}</span>
                                    </div>
                                ))
                            }
                        </div>

                        {/* By Risk */}
                        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 16 }}>
                            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: '0 0 12px' }}>Operators by Risk Level</h3>
                            {data.health.operatorsByRisk.length === 0
                                ? <div style={{ color: '#9ca3af', fontSize: 13 }}>No Data</div>
                                : data.health.operatorsByRisk.map(r => (
                                    <div key={r.level} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f3f4f6' }}>
                                        <Badge label={r.level} color={RISK_COLORS[r.level]?.text || '#374151'} bg={RISK_COLORS[r.level]?.bg || '#f3f4f6'} />
                                        <span style={{ fontSize: 13, fontWeight: 700 }}>{r.count}</span>
                                    </div>
                                ))
                            }
                        </div>

                        {/* By Compliance */}
                        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 16 }}>
                            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: '0 0 12px' }}>Operators by Compliance</h3>
                            {data.health.operatorsByCompliance.length === 0
                                ? <div style={{ color: '#9ca3af', fontSize: 13 }}>No Data</div>
                                : data.health.operatorsByCompliance.map(r => (
                                    <div key={r.level} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f3f4f6' }}>
                                        <Badge label={r.level} color={COMPLIANCE_COLORS[r.level]?.text || '#374151'} bg={COMPLIANCE_COLORS[r.level]?.bg || '#f3f4f6'} />
                                        <span style={{ fontSize: 13, fontWeight: 700 }}>{r.count}</span>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ Panel 2: Risk Monitoring ═══ */}
            {activeTab === 'risk' && data.risk && (
                <div>
                    <SectionHeader id="risk" title="Risk Monitoring" sub="Top 20 highest risk operators — sorted by riskScore descending" />

                    {data.risk.operators.length === 0 ? (
                        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: 24, textAlign: 'center', color: '#166534', fontSize: 14 }}>
                            No operators with risk score &gt; 0
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, background: '#fff', borderRadius: 10, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                                <thead>
                                    <tr style={{ background: '#f9fafb' }}>
                                        {['Operator', 'Category', 'Legal Tier', 'Trust', 'Risk', 'Level', 'Compliance', 'Incidents', 'Disputes', 'Last Active', 'Mode', 'Actions'].map(h => (
                                            <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.risk.operators.map(op => (
                                        <tr key={op.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                            <td style={{ padding: '10px 12px' }}>
                                                <div style={{ fontWeight: 600 }}>{op.name || 'Unnamed'}</div>
                                                <div style={{ fontSize: 11, color: '#9ca3af' }}>{op.email}</div>
                                            </td>
                                            <td style={{ padding: '10px 12px' }}>{op.operatorCategory || 'No Data'}</td>
                                            <td style={{ padding: '10px 12px' }}>{op.legalTier || 'No Data'}</td>
                                            <td style={{ padding: '10px 12px', fontWeight: 700 }}>{op.trustScore}</td>
                                            <td style={{ padding: '10px 12px', fontWeight: 700 }}>{op.riskScore}</td>
                                            <td style={{ padding: '10px 12px' }}>
                                                <Badge label={op.riskLevel} color={RISK_COLORS[op.riskLevel]?.text || '#374151'} bg={RISK_COLORS[op.riskLevel]?.bg || '#f3f4f6'} />
                                            </td>
                                            <td style={{ padding: '10px 12px' }}>
                                                <Badge label={op.complianceLevel} color={COMPLIANCE_COLORS[op.complianceLevel]?.text || '#374151'} bg={COMPLIANCE_COLORS[op.complianceLevel]?.bg || '#f3f4f6'} />
                                            </td>
                                            <td style={{ padding: '10px 12px', textAlign: 'center', color: op.openIncidents > 0 ? '#991b1b' : '#6b7280', fontWeight: op.openIncidents > 0 ? 700 : 400 }}>{op.openIncidents}</td>
                                            <td style={{ padding: '10px 12px', textAlign: 'center', color: op.activeDisputes > 0 ? '#991b1b' : '#6b7280', fontWeight: op.activeDisputes > 0 ? 700 : 400 }}>{op.activeDisputes}</td>
                                            <td style={{ padding: '10px 12px', fontSize: 12, color: '#6b7280' }}>{formatDate(op.lastActivityAt)}</td>
                                            <td style={{ padding: '10px 12px' }}>
                                                <Badge label={MODE_LABELS[op.systemMode]?.label || op.systemMode} color={MODE_LABELS[op.systemMode]?.color || '#374151'} bg={MODE_LABELS[op.systemMode]?.bg || '#f3f4f6'} />
                                            </td>
                                            <td style={{ padding: '10px 12px' }}>
                                                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                                    <Link href={`/dashboard/admin/users?search=${encodeURIComponent(op.email)}`}
                                                        style={{ fontSize: 11, color: '#4f46e5', textDecoration: 'none', padding: '2px 6px', background: '#eef2ff', borderRadius: 4 }}>
                                                        Profile
                                                    </Link>
                                                    <Link href={`/dashboard/admin/incidents?operator=${op.id}`}
                                                        style={{ fontSize: 11, color: '#b45309', textDecoration: 'none', padding: '2px 6px', background: '#fffbeb', borderRadius: 4 }}>
                                                        Signals
                                                    </Link>
                                                    <Link href={`/dashboard/admin/payments?operator=${op.id}`}
                                                        style={{ fontSize: 11, color: '#0369a1', textDecoration: 'none', padding: '2px 6px', background: '#f0f9ff', borderRadius: 4 }}>
                                                        Ledger
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ═══ Panel 3: Trust Integrity ═══ */}
            {activeTab === 'trust' && data.trust && (
                <div>
                    <SectionHeader id="trust" title="Trust Integrity" sub="Trust scores, breakdowns, and recent drops" />

                    {/* High Trust Operators with Breakdown */}
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#374151', margin: '0 0 12px' }}>High Trust Operators (≥70)</h3>

                    {data.trust.highTrustOperators.length === 0 ? (
                        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 24, textAlign: 'center', color: '#6b7280', fontSize: 13, marginBottom: 24 }}>
                            No operators with trust ≥ 70
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto', marginBottom: 24 }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, background: '#fff', borderRadius: 10, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                                <thead>
                                    <tr style={{ background: '#f9fafb' }}>
                                        {['Operator', 'Category', 'Trust', 'Max', 'Near Cap', 'Legal', 'Compliance', 'Perform.', 'Financial', 'Op.Pen', 'Fin.Pen', 'Risk.Pen', 'Decay', 'Level'].map(h => (
                                            <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.trust.highTrustOperators.map(op => (
                                        <tr key={op.id} style={{ borderBottom: '1px solid #f3f4f6', background: op.nearCap ? '#fffbeb' : 'transparent' }}>
                                            <td style={{ padding: '8px 10px' }}>
                                                <div style={{ fontWeight: 600, fontSize: 12 }}>{op.name || 'Unnamed'}</div>
                                                <div style={{ fontSize: 10, color: '#9ca3af' }}>{op.email}</div>
                                            </td>
                                            <td style={{ padding: '8px 10px' }}>{op.operatorCategory || 'No Data'}</td>
                                            <td style={{ padding: '8px 10px', fontWeight: 700, fontSize: 14 }}>{op.trustScore}</td>
                                            <td style={{ padding: '8px 10px', fontWeight: 600, color: '#6b7280' }}>{op.trustMax}</td>
                                            <td style={{ padding: '8px 10px' }}>
                                                {op.nearCap
                                                    ? <Badge label="NEAR CAP" color="#92400e" bg="#fef3c7" />
                                                    : <span style={{ color: '#9ca3af', fontSize: 11 }}>—</span>
                                                }
                                            </td>
                                            <td style={bdCell}>{op.breakdown?.legalBase ?? '—'}</td>
                                            <td style={bdCell}>{op.breakdown?.complianceScore ?? '—'}</td>
                                            <td style={bdCell}>{op.breakdown?.performanceScore ?? '—'}</td>
                                            <td style={bdCell}>{op.breakdown?.financialBehavior ?? '—'}</td>
                                            <td style={{ ...bdCell, color: (op.breakdown?.operationalPenalty ?? 0) < 0 ? '#991b1b' : '#6b7280' }}>
                                                {op.breakdown?.operationalPenalty ?? '—'}
                                            </td>
                                            <td style={{ ...bdCell, color: (op.breakdown?.financialPenalty ?? 0) < 0 ? '#991b1b' : '#6b7280' }}>
                                                {op.breakdown?.financialPenalty ?? '—'}
                                            </td>
                                            <td style={{ ...bdCell, color: (op.breakdown?.riskPenalty ?? 0) < 0 ? '#991b1b' : '#6b7280' }}>
                                                {op.breakdown?.riskPenalty ?? '—'}
                                            </td>
                                            <td style={{ ...bdCell, color: (op.breakdown?.decayPenalty ?? 0) < 0 ? '#854d0e' : '#6b7280' }}>
                                                {op.breakdown?.decayPenalty ?? '—'}
                                            </td>
                                            <td style={{ padding: '8px 10px' }}>
                                                <Badge label={op.complianceLevel} color={COMPLIANCE_COLORS[op.complianceLevel]?.text || '#374151'} bg={COMPLIANCE_COLORS[op.complianceLevel]?.bg || '#f3f4f6'} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Trust Drops */}
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#374151', margin: '0 0 12px' }}>Trust Drops (last {range})</h3>

                    {data.trust.trustDrops.length === 0 ? (
                        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: 24, textAlign: 'center', color: '#166534', fontSize: 13 }}>
                            No trust drops in the last {range}
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, background: '#fff', borderRadius: 10, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                                <thead>
                                    <tr style={{ background: '#f9fafb' }}>
                                        {['Operator', 'Change', 'Score After', 'Current', 'Type', 'Description', 'Date'].map(h => (
                                            <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.trust.trustDrops.map((e, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                            <td style={{ padding: '8px 10px' }}>
                                                <div style={{ fontWeight: 600 }}>{e.operatorName || 'Unnamed'}</div>
                                                <div style={{ fontSize: 10, color: '#9ca3af' }}>{e.operatorCategory || ''}</div>
                                            </td>
                                            <td style={{ padding: '8px 10px', fontWeight: 700, color: '#991b1b' }}>{e.change}</td>
                                            <td style={{ padding: '8px 10px', fontWeight: 600 }}>{e.newScoreAtEvent}</td>
                                            <td style={{ padding: '8px 10px', fontWeight: 600 }}>{e.currentScore}</td>
                                            <td style={{ padding: '8px 10px' }}>
                                                <span style={{ fontSize: 10, color: '#6b7280', background: '#f3f4f6', padding: '2px 6px', borderRadius: 4 }}>
                                                    {e.type.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td style={{ padding: '8px 10px', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#6b7280' }}>
                                                {e.description || 'No Data'}
                                            </td>
                                            <td style={{ padding: '8px 10px', color: '#6b7280' }}>{formatDate(e.date)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ═══ Panel 4: Financial Integrity ═══ */}
            {activeTab === 'financial' && data.financial && (
                <div>
                    <SectionHeader id="financial" title="Financial Integrity" sub="Ledger drift, stuck escrows, stale withdrawals, missing entries" />

                    {!data.financial.hasIssues ? (
                        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: 32, textAlign: 'center' }}>
                            <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: '#166534' }}>All Clear</div>
                            <div style={{ fontSize: 13, color: '#15803d', marginTop: 4 }}>No financial integrity issues detected</div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {/* Ledger Drift */}
                            {data.financial.ledgerDriftCases.length > 0 && (
                                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: 16 }}>
                                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#991b1b', margin: '0 0 12px' }}>
                                        🔴 Ledger Drift Detected ({data.financial.ledgerDriftCases.length})
                                    </h3>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                                        <thead>
                                            <tr>
                                                {['Operator', 'Column Balance', 'Ledger Balance', 'Drift', 'Action'].map(h => (
                                                    <th key={h} style={{ padding: '6px 10px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: '#991b1b', borderBottom: '1px solid #fecaca' }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.financial.ledgerDriftCases.map(d => (
                                                <tr key={d.walletId}>
                                                    <td style={{ padding: '6px 10px' }}>{d.operatorName || d.operatorEmail}</td>
                                                    <td style={{ padding: '6px 10px' }}>₫{formatVND(d.columnBalance)}</td>
                                                    <td style={{ padding: '6px 10px' }}>₫{formatVND(d.ledgerBalance)}</td>
                                                    <td style={{ padding: '6px 10px', fontWeight: 700, color: '#991b1b' }}>₫{formatVND(d.drift)}</td>
                                                    <td style={{ padding: '6px 10px' }}>
                                                        <Link href={`/dashboard/admin/payments?operator=${d.operatorId}`}
                                                            style={{ fontSize: 10, color: '#4f46e5', textDecoration: 'none', padding: '2px 6px', background: '#eef2ff', borderRadius: 4 }}>
                                                            Inspect
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Stuck Escrows */}
                            {data.financial.stuckEscrows.length > 0 && (
                                <div style={{ background: '#fffbeb', border: '1px solid #fef08a', borderRadius: 10, padding: 16 }}>
                                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#92400e', margin: '0 0 12px' }}>
                                        ⚠️ Escrow Held &gt; 48h ({data.financial.stuckEscrows.length})
                                    </h3>
                                    {data.financial.stuckEscrows.map(s => (
                                        <div key={s.tourId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #fef08a' }}>
                                            <div>
                                                <div style={{ fontSize: 13, fontWeight: 600 }}>{s.title}</div>
                                                <div style={{ fontSize: 11, color: '#92400e' }}>
                                                    {s.operatorName} • {s.hoursHeld}h held • ₫{formatVND(s.amount || 0)}
                                                </div>
                                            </div>
                                            <Link href={`/dashboard/admin/payments?tour=${s.tourId}`}
                                                style={{ fontSize: 11, color: '#4f46e5', textDecoration: 'none', padding: '4px 10px', background: '#eef2ff', borderRadius: 4 }}>
                                                Inspect
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Stale Withdrawals */}
                            {data.financial.staleWithdrawals.length > 0 && (
                                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: 16 }}>
                                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#991b1b', margin: '0 0 12px' }}>
                                        🔴 Withdrawals Pending &gt; 24h ({data.financial.staleWithdrawals.length})
                                    </h3>
                                    {data.financial.staleWithdrawals.map(w => (
                                        <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #fecaca' }}>
                                            <div>
                                                <div style={{ fontSize: 13, fontWeight: 600 }}>{w.operatorName || w.operatorEmail}</div>
                                                <div style={{ fontSize: 11, color: '#991b1b' }}>₫{formatVND(w.amount)} • Waiting {w.waitingHours}h</div>
                                            </div>
                                            <Link href="/dashboard/admin/payments"
                                                style={{ fontSize: 11, color: '#4f46e5', textDecoration: 'none', padding: '4px 10px', background: '#eef2ff', borderRadius: 4 }}>
                                                Review
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Boosts without Ledger */}
                            {data.financial.boostsWithoutLedger.length > 0 && (
                                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: 16 }}>
                                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#991b1b', margin: '0 0 12px' }}>
                                        🔴 Boost Purchases Missing Ledger Entry ({data.financial.boostsWithoutLedger.length})
                                    </h3>
                                    {data.financial.boostsWithoutLedger.map(b => (
                                        <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #fecaca' }}>
                                            <span style={{ fontSize: 12 }}>Boost #{b.id.slice(0, 8)}… • ₫{formatVND(b.amount)}</span>
                                            <span style={{ fontSize: 11, color: '#991b1b' }}>{formatDate(b.date)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ═══ Panel 5: SystemMode Governance ═══ */}
            {activeTab === 'mode' && data.mode && (
                <div>
                    <SectionHeader id="mode" title="SystemMode Governance" sub="Operator modes, layers, settlement types — Super Admin can edit" />

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, background: '#fff', borderRadius: 10, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                            <thead>
                                <tr style={{ background: '#f9fafb' }}>
                                    {['Operator', 'Mode', 'Layers', 'Escrow', 'Comm.', 'Boost', 'Settlements', 'Last Change', 'Actions'].map(h => (
                                        <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.mode.operators.map(op => (
                                    <tr key={op.id} style={{ borderBottom: '1px solid #f3f4f6', background: editingId === op.id ? '#eef2ff' : 'transparent' }}>
                                        <td style={{ padding: '8px 10px' }}>
                                            <div style={{ fontWeight: 600, fontSize: 12 }}>{op.name || 'Unnamed'}</div>
                                            <div style={{ fontSize: 10, color: '#9ca3af' }}>{op.email}</div>
                                        </td>
                                        <td style={{ padding: '8px 10px' }}>
                                            {editingId === op.id ? (
                                                <select
                                                    value={editMode}
                                                    onChange={e => setEditMode(e.target.value as SystemMode)}
                                                    style={{ fontSize: 11, padding: '2px 4px', borderRadius: 4, border: '1px solid #d1d5db' }}
                                                >
                                                    {data.mode!.availableModes.map(m => (
                                                        <option key={m} value={m}>{MODE_LABELS[m]?.label || m}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <Badge label={MODE_LABELS[op.systemMode]?.label || op.systemMode} color={MODE_LABELS[op.systemMode]?.color || '#374151'} bg={MODE_LABELS[op.systemMode]?.bg || '#f3f4f6'} />
                                            )}
                                        </td>
                                        <td style={{ padding: '8px 10px' }}>
                                            {editingId === op.id ? (
                                                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                                    {data.mode!.availableLayers.map(layer => (
                                                        <button
                                                            key={layer}
                                                            onClick={() => toggleLayer(layer)}
                                                            style={{
                                                                fontSize: 10, padding: '2px 6px', borderRadius: 999, cursor: 'pointer',
                                                                background: editLayers.includes(layer) ? '#c7d2fe' : '#f3f4f6',
                                                                color: editLayers.includes(layer) ? '#3730a3' : '#9ca3af',
                                                                border: `1px solid ${editLayers.includes(layer) ? '#a5b4fc' : '#e5e7eb'}`,
                                                            }}
                                                        >{LAYER_LABELS[layer] || layer}</button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                                                    {op.effectiveLayers.map(l => (
                                                        <span key={l} style={{ fontSize: 10, padding: '1px 5px', background: '#f3f4f6', color: '#374151', borderRadius: 4 }}>
                                                            {LAYER_LABELS[l] || l}
                                                        </span>
                                                    ))}
                                                    {op.hasCustomLayers && <Badge label="Custom" color="#b45309" bg="#fffbeb" />}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                                            {op.escrowEnabled ? <span style={{ color: '#166534' }}>✓</span> : <span style={{ color: '#d1d5db' }}>—</span>}
                                        </td>
                                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                                            {op.commissionEnabled ? <span style={{ color: '#166534' }}>✓</span> : <span style={{ color: '#d1d5db' }}>—</span>}
                                        </td>
                                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                                            {op.boostEnabled ? <span style={{ color: '#166534' }}>✓</span> : <span style={{ color: '#d1d5db' }}>—</span>}
                                        </td>
                                        <td style={{ padding: '8px 10px', fontSize: 10 }}>
                                            {Object.keys(op.settlements).length > 0
                                                ? Object.entries(op.settlements).map(([k, v]) => (
                                                    <div key={k}>{k}: {v}</div>
                                                ))
                                                : <span style={{ color: '#d1d5db' }}>No Data</span>
                                            }
                                        </td>
                                        <td style={{ padding: '8px 10px', fontSize: 11, color: '#6b7280' }}>
                                            {op.lastModeChange ? formatDate(op.lastModeChange) : 'No Data'}
                                        </td>
                                        <td style={{ padding: '8px 10px' }}>
                                            {editingId === op.id ? (
                                                <div style={{ display: 'flex', gap: 4 }}>
                                                    <button
                                                        onClick={() => saveChanges(op.id)}
                                                        disabled={saving}
                                                        style={{
                                                            fontSize: 10, padding: '4px 10px', background: '#4f46e5', color: '#fff',
                                                            border: 'none', borderRadius: 4, cursor: 'pointer', opacity: saving ? 0.5 : 1,
                                                        }}
                                                    >{saving ? '…' : 'Save'}</button>
                                                    <button
                                                        onClick={() => { setEditingId(null); setMessage(null); }}
                                                        style={{ fontSize: 10, padding: '4px 8px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                                                    >Cancel</button>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', gap: 4 }}>
                                                    {canEdit && (
                                                        <button
                                                            onClick={() => startEdit(op)}
                                                            style={{ fontSize: 10, padding: '3px 8px', background: '#eef2ff', color: '#4f46e5', border: '1px solid #c7d2fe', borderRadius: 4, cursor: 'pointer' }}
                                                        >Edit</button>
                                                    )}
                                                    <Link href={`/dashboard/admin/users?search=${encodeURIComponent(op.email)}`}
                                                        style={{ fontSize: 10, color: '#6b7280', textDecoration: 'none', padding: '3px 8px', background: '#f3f4f6', borderRadius: 4 }}>
                                                        Audit
                                                    </Link>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {data.mode.operators.length === 0 && (
                                    <tr>
                                        <td colSpan={9} style={{ padding: 24, textAlign: 'center', color: '#9ca3af' }}>No operators found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ═══ Panel 6: Disputes ═══ */}
            {activeTab === 'disputes' && (
                <div>
                    <SectionHeader id="disputes" title="Tour Disputes" sub="All disputes across the platform" />
                    {disputesLoading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
                            <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                        </div>
                    ) : disputes.length === 0 ? (
                        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: 32, textAlign: 'center' }}>
                            <div style={{ fontSize: 32, marginBottom: 8 }}>⚖️</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#166534' }}>No disputes</div>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, background: '#fff', borderRadius: 10, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                                <thead>
                                    <tr style={{ background: '#f9fafb' }}>
                                        {['Tour', 'Opened By', 'Reason', 'Status', 'Evidence', 'Date', 'Actions'].map(h => (
                                            <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {disputes.map((d: any) => (
                                        <tr key={d.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                            <td style={{ padding: '8px 10px', fontWeight: 600 }}>{d.tour?.title || d.tourId?.slice(0, 8)}</td>
                                            <td style={{ padding: '8px 10px' }}>{d.openedBy?.name || d.openedBy?.email || '—'}</td>
                                            <td style={{ padding: '8px 10px', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.reason}</td>
                                            <td style={{ padding: '8px 10px' }}>
                                                <Badge
                                                    label={d.status.replace(/_/g, ' ')}
                                                    color={d.status === 'OPEN' ? '#991b1b' : d.status === 'UNDER_REVIEW' ? '#92400e' : '#166534'}
                                                    bg={d.status === 'OPEN' ? '#fef2f2' : d.status === 'UNDER_REVIEW' ? '#fffbeb' : '#f0fdf4'}
                                                />
                                            </td>
                                            <td style={{ padding: '8px 10px', textAlign: 'center' }}>{d._count?.evidence || 0}</td>
                                            <td style={{ padding: '8px 10px', color: '#6b7280' }}>{formatDate(d.createdAt)}</td>
                                            <td style={{ padding: '8px 10px' }}>
                                                {(d.status === 'OPEN' || d.status === 'UNDER_REVIEW') && (
                                                    <button
                                                        onClick={() => handleResolve(d.id, 'Reviewed and resolved by admin', 'RELEASE_TO_GUIDE')}
                                                        disabled={resolving === d.id}
                                                        style={{ fontSize: 11, color: '#4f46e5', background: '#eef2ff', border: 'none', padding: '4px 10px', borderRadius: 4, cursor: 'pointer' }}
                                                    >
                                                        {resolving === d.id ? 'Resolving…' : 'Resolve'}
                                                    </button>
                                                )}
                                                {d.status === 'RESOLVED' && (
                                                    <span style={{ fontSize: 11, color: '#166534' }}>✅ Done</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ═══ Panel 7: Risk Events ═══ */}
            {activeTab === 'riskEvents' && (
                <div>
                    <SectionHeader id="riskEvents" title="Operator Risk Events" sub="Recent risk events logged by the system" />
                    {riskEventsLoading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
                            <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                        </div>
                    ) : riskEvents.length === 0 ? (
                        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: 32, textAlign: 'center' }}>
                            <div style={{ fontSize: 32, marginBottom: 8 }}>🔥</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#166534' }}>No risk events recorded</div>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, background: '#fff', borderRadius: 10, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                                <thead>
                                    <tr style={{ background: '#f9fafb' }}>
                                        {['Operator', 'Event Type', 'Impact', 'Description', 'Date'].map(h => (
                                            <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {riskEvents.map((e: any) => (
                                        <tr key={e.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                            <td style={{ padding: '8px 10px' }}>
                                                <div style={{ fontWeight: 600 }}>{e.operator?.name || 'Unnamed'}</div>
                                                <div style={{ fontSize: 10, color: '#9ca3af' }}>{e.operator?.email}</div>
                                            </td>
                                            <td style={{ padding: '8px 10px' }}>
                                                <Badge
                                                    label={e.eventType.replace(/_/g, ' ')}
                                                    color={e.impact < 0 ? '#991b1b' : '#166534'}
                                                    bg={e.impact < 0 ? '#fef2f2' : '#f0fdf4'}
                                                />
                                            </td>
                                            <td style={{ padding: '8px 10px', fontWeight: 700, color: e.impact < 0 ? '#991b1b' : '#166534' }}>{e.impact > 0 ? '+' : ''}{e.impact}</td>
                                            <td style={{ padding: '8px 10px', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#6b7280' }}>{e.description}</td>
                                            <td style={{ padding: '8px 10px', color: '#6b7280' }}>{formatDate(e.createdAt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ═══ Panel 8: Guide Reliability ═══ */}
            {activeTab === 'reliability' && (
                <div>
                    <SectionHeader id="reliability" title="Guide Reliability" sub="All guides sorted by reliability score" />
                    {reliabilityLoading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
                            <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                        </div>
                    ) : guideReliability.length === 0 ? (
                        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 32, textAlign: 'center' }}>
                            <div style={{ fontSize: 32, marginBottom: 8 }}>👥</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#6b7280' }}>No guide data</div>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, background: '#fff', borderRadius: 10, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                                <thead>
                                    <tr style={{ background: '#f9fafb' }}>
                                        {['Guide', 'Trust', 'Reliability', 'KYC', 'Tours', 'Disputes', 'Blacklisted By'].map(h => (
                                            <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {guideReliability.map((g: any) => (
                                        <tr key={g.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                            <td style={{ padding: '8px 10px' }}>
                                                <div style={{ fontWeight: 600 }}>{g.name || 'Unnamed'}</div>
                                                <div style={{ fontSize: 10, color: '#9ca3af' }}>{g.email}</div>
                                            </td>
                                            <td style={{ padding: '8px 10px', fontWeight: 700, color: '#4f46e5' }}>{g.trustScore}</td>
                                            <td style={{ padding: '8px 10px' }}>
                                                <Badge
                                                    label={`${g.reliabilityScore}%`}
                                                    color={g.reliabilityScore >= 80 ? '#166534' : g.reliabilityScore >= 50 ? '#92400e' : '#991b1b'}
                                                    bg={g.reliabilityScore >= 80 ? '#f0fdf4' : g.reliabilityScore >= 50 ? '#fffbeb' : '#fef2f2'}
                                                />
                                            </td>
                                            <td style={{ padding: '8px 10px' }}>
                                                <Badge
                                                    label={g.kycStatus || 'NOT_SUBMITTED'}
                                                    color={g.kycStatus === 'APPROVED' ? '#166534' : '#6b7280'}
                                                    bg={g.kycStatus === 'APPROVED' ? '#f0fdf4' : '#f3f4f6'}
                                                />
                                            </td>
                                            <td style={{ padding: '8px 10px', textAlign: 'center' }}>{g.tourCount || 0}</td>
                                            <td style={{ padding: '8px 10px', textAlign: 'center', color: (g.disputeCount || 0) > 0 ? '#991b1b' : '#6b7280', fontWeight: (g.disputeCount || 0) > 0 ? 700 : 400 }}>{g.disputeCount || 0}</td>
                                            <td style={{ padding: '8px 10px', textAlign: 'center', color: (g.blacklistedCount || 0) > 0 ? '#991b1b' : '#6b7280' }}>{g.blacklistedCount || 0}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// Shared cell style for breakdown numbers
const bdCell: React.CSSProperties = { padding: '8px 10px', textAlign: 'center', fontSize: 12, color: '#6b7280' };
