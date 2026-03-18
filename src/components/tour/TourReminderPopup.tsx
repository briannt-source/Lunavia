"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

interface TourAlert {
    id: string;
    tourId: string;
    tourTitle: string;
    alertType: string;
    urgency: 'info' | 'warning' | 'critical' | 'urgent';
    message: string;
    startTime: string;
    endTime: string;
    icon: string;
    actionUrl: string;
}

interface SnoozeEntry {
    alertId: string;
    until: number; // timestamp
}

// ═══════════════════════════════════════════════════════════════════
// LOCAL STORAGE HELPERS
// ═══════════════════════════════════════════════════════════════════

const DISMISSED_KEY = 'lunavia_dismissed_alerts';
const SNOOZED_KEY = 'lunavia_snoozed_alerts';
const COLLAPSED_KEY = 'lunavia_reminder_collapsed';
const POLL_INTERVAL = 60_000; // 60 seconds

function getDismissed(): string[] {
    if (typeof window === 'undefined') return [];
    try {
        return JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]');
    } catch { return []; }
}

function addDismissed(alertId: string) {
    const list = getDismissed();
    if (!list.includes(alertId)) list.push(alertId);
    // Keep max 200 entries
    if (list.length > 200) list.splice(0, list.length - 200);
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(list));
}

function getSnoozed(): SnoozeEntry[] {
    if (typeof window === 'undefined') return [];
    try {
        return JSON.parse(localStorage.getItem(SNOOZED_KEY) || '[]');
    } catch { return []; }
}

function addSnoozed(alertId: string, durationMs: number) {
    const list = getSnoozed().filter(s => s.alertId !== alertId);
    list.push({ alertId, until: Date.now() + durationMs });
    localStorage.setItem(SNOOZED_KEY, JSON.stringify(list));
}

function isSnoozed(alertId: string): boolean {
    const list = getSnoozed();
    const entry = list.find(s => s.alertId === alertId);
    if (!entry) return false;
    return Date.now() < entry.until;
}

function getCollapsed(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(COLLAPSED_KEY) === 'true';
}

function setCollapsed(val: boolean) {
    localStorage.setItem(COLLAPSED_KEY, val ? 'true' : 'false');
}

// ═══════════════════════════════════════════════════════════════════
// SNOOZE OPTIONS
// ═══════════════════════════════════════════════════════════════════

const SNOOZE_OPTIONS = [
    { label: '15 min', ms: 15 * 60 * 1000 },
    { label: '30 min', ms: 30 * 60 * 1000 },
    { label: '1 hour', ms: 60 * 60 * 1000 },
];

// ═══════════════════════════════════════════════════════════════════
// URGENCY STYLES
// ═══════════════════════════════════════════════════════════════════

const URGENCY_STYLES: Record<string, { bg: string; border: string; text: string; badge: string; pulse?: boolean }> = {
    urgent: { bg: 'bg-red-50', border: 'border-red-400', text: 'text-red-900', badge: 'bg-red-600 text-white', pulse: true },
    critical: { bg: 'bg-orange-50', border: 'border-orange-400', text: 'text-orange-900', badge: 'bg-orange-600 text-white', pulse: true },
    warning: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-900', badge: 'bg-amber-500 text-white' },
    info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', badge: 'bg-blue-500 text-white' },
};

// ═══════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════

export default function TourReminderPopup() {
    const [alerts, setAlerts] = useState<TourAlert[]>([]);
    const [collapsed, setCollapsedState] = useState(true);
    const [snoozeMenuId, setSnoozeMenuId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const snoozeRef = useRef<HTMLDivElement>(null);

    // Initialize collapsed state from localStorage
    useEffect(() => {
        setCollapsedState(getCollapsed());
    }, []);

    // Fetch alerts
    const fetchAlerts = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/tour-reminders');
            if (!res.ok) return;
            const data = await res.json();
            if (data.alerts) {
                const dismissed = getDismissed();
                const filtered = data.alerts.filter((a: TourAlert) =>
                    !dismissed.includes(a.id) && !isSnoozed(a.id)
                );
                setAlerts(filtered);
            }
        } catch {
            // Silently fail — non-critical
        } finally {
            setLoading(false);
        }
    }, []);

    // Poll every 60s
    useEffect(() => {
        fetchAlerts();
        const interval = setInterval(fetchAlerts, POLL_INTERVAL);
        return () => clearInterval(interval);
    }, [fetchAlerts]);

    // Close snooze menu on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (snoozeRef.current && !snoozeRef.current.contains(e.target as Node)) {
                setSnoozeMenuId(null);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Handlers
    function handleDismiss(alertId: string) {
        addDismissed(alertId);
        setAlerts(prev => prev.filter(a => a.id !== alertId));
    }

    function handleSnooze(alertId: string, durationMs: number) {
        addSnoozed(alertId, durationMs);
        setAlerts(prev => prev.filter(a => a.id !== alertId));
        setSnoozeMenuId(null);
    }

    function handleCollapse() {
        const next = !collapsed;
        setCollapsedState(next);
        setCollapsed(next);
    }

    function handleDismissAll() {
        alerts.forEach(a => addDismissed(a.id));
        setAlerts([]);
    }

    // Don't render if no alerts
    if (alerts.length === 0 && !loading) return null;

    // ── COLLAPSED VIEW ─────────────────────────────────────────
    if (collapsed && alerts.length > 0) {
        const hasCritical = alerts.some(a => a.urgency === 'critical' || a.urgency === 'urgent');
        return (
            <div className="fixed bottom-6 right-6 z-[9999]">
                <button
                    onClick={handleCollapse}
                    className={`
                        relative flex items-center gap-2 px-4 py-3 rounded-2xl shadow-lg
                        transition-all hover:scale-105
                        ${hasCritical
                            ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white'
                            : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                        }
                    `}
                >
                    {hasCritical && (
                        <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-red-500 animate-ping" />
                    )}
                    <span className="text-lg">🔔</span>
                    <span className="text-sm font-bold">{alerts.length} Tour Alert{alerts.length !== 1 ? 's' : ''}</span>
                    <span className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                        {alerts.length}
                    </span>
                </button>
            </div>
        );
    }

    // ── EXPANDED VIEW ──────────────────────────────────────────
    return (
        <div className="fixed bottom-6 right-6 z-[9999] w-[400px] max-h-[70vh] flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-t-2xl px-5 py-3.5 flex items-center justify-between shadow-xl">
                <div className="flex items-center gap-2">
                    <span className="text-lg">🔔</span>
                    <h3 className="text-sm font-bold text-white">Tour Reminders</h3>
                    <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                        {alerts.length}
                    </span>
                </div>
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={handleDismissAll}
                        className="text-white/60 hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-white/10 transition"
                        title="Dismiss all"
                    >
                        Clear All
                    </button>
                    <button
                        onClick={handleCollapse}
                        className="text-white/60 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10 transition text-sm"
                        title="Minimize"
                    >
                        ▾
                    </button>
                </div>
            </div>

            {/* Alert List */}
            <div className="overflow-y-auto bg-white rounded-b-2xl shadow-xl border border-gray-200 border-t-0 divide-y divide-gray-100">
                {alerts.map(alert => {
                    const style = URGENCY_STYLES[alert.urgency] || URGENCY_STYLES.info;
                    return (
                        <div
                            key={alert.id}
                            className={`${style.bg} px-4 py-3 relative group`}
                        >
                            {/* Pulse indicator for critical */}
                            {style.pulse && (
                                <span className="absolute top-3 left-1.5 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                            )}

                            {/* Content */}
                            <div className="flex items-start gap-3 ml-2">
                                <span className="text-lg mt-0.5 shrink-0">{alert.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${style.badge}`}>
                                            {alert.alertType.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                    <p className={`text-sm font-medium ${style.text} leading-snug`}>
                                        {alert.message}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-gray-500">
                                        {alert.startTime && (
                                            <span>
                                                🕒 {new Date(alert.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        )}
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex items-center gap-2 mt-2">
                                        <a
                                            href={alert.actionUrl}
                                            className="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
                                        >
                                            View Tour
                                        </a>

                                        {/* Snooze */}
                                        <div className="relative" ref={snoozeMenuId === alert.id ? snoozeRef : undefined}>
                                            <button
                                                onClick={() => setSnoozeMenuId(snoozeMenuId === alert.id ? null : alert.id)}
                                                className="text-xs px-2.5 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                                            >
                                                ⏰ Snooze
                                            </button>
                                            {snoozeMenuId === alert.id && (
                                                <div className="absolute bottom-full left-0 mb-1 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[120px] z-10">
                                                    {SNOOZE_OPTIONS.map(opt => (
                                                        <button
                                                            key={opt.label}
                                                            onClick={() => handleSnooze(alert.id, opt.ms)}
                                                            className="block w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition"
                                                        >
                                                            {opt.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Dismiss */}
                                        <button
                                            onClick={() => handleDismiss(alert.id)}
                                            className="text-xs px-2.5 py-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
                                        >
                                            ✕ Dismiss
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {alerts.length === 0 && (
                    <div className="px-4 py-8 text-center text-gray-400 text-sm">
                        <span className="text-2xl block mb-2">✅</span>
                        No active tour alerts
                    </div>
                )}
            </div>
        </div>
    );
}
