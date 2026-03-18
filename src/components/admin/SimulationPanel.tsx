"use client";

import { useState } from 'react';

const SCENARIOS = [
    { key: 'NORMAL_EXECUTION', label: 'Normal Execution', icon: '✅', desc: 'Standard tour start to completion.' },
    { key: 'GUIDE_LATE_REPLACEMENT', label: 'Late Replacement', icon: '🔄', desc: 'Guide replaced before tour start.' },
    { key: 'GUIDE_NO_SHOW', label: 'No-Show', icon: '❌', desc: 'Guide fails to appear — SOS flow.' },
    { key: 'EMERGENCY_SOS', label: 'Emergency SOS', icon: '🚨', desc: 'SOS broadcast during active tour.' },
    { key: 'SEGMENT_CHECKINS', label: 'Check-ins', icon: '📍', desc: 'Segment check-in flow.' },
    { key: 'TOUR_COMPLETION', label: 'Full Lifecycle', icon: '🏁', desc: 'Start to feedback.' },
];

export default function SimulationPanel() {
    const [expanded, setExpanded] = useState(false);
    const [selectedScenario, setSelectedScenario] = useState('NORMAL_EXECUTION');
    const [tourCount, setTourCount] = useState(10);
    const [running, setRunning] = useState(false);
    const [cleaning, setCleaning] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    async function handleRun() {
        setRunning(true);
        setResult(null);
        setError(null);
        try {
            const res = await fetch('/api/admin/simulation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scenario: selectedScenario, tourCount }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setResult(data);
            } else {
                setError(data.error || 'Simulation failed');
            }
        } catch {
            setError('Failed to connect to simulation API');
        } finally {
            setRunning(false);
        }
    }

    async function handleCleanup() {
        if (!confirm('This will delete ALL simulation data. Continue?')) return;
        setCleaning(true);
        setResult(null);
        setError(null);
        try {
            const res = await fetch('/api/admin/simulation', { method: 'DELETE' });
            const data = await res.json();
            if (res.ok && data.success) {
                setResult({ message: data.message || 'Simulation data cleaned up.', data: data.data });
            } else {
                setError(data.error || 'Cleanup failed');
            }
        } catch {
            setError('Failed to connect to cleanup API');
        } finally {
            setCleaning(false);
        }
    }

    const selected = SCENARIOS.find(s => s.key === selectedScenario);

    if (!expanded) {
        return (
            <button
                onClick={() => setExpanded(true)}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl p-5 shadow-sm hover:from-violet-700 hover:to-indigo-700 transition-all text-left"
            >
                <div className="flex items-center gap-3">
                    <span className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center text-lg">🧪</span>
                    <div>
                        <h3 className="text-sm font-bold">Simulation Control Panel</h3>
                        <p className="text-xs text-white/70 mt-0.5">Run operational test scenarios to validate tour flows</p>
                    </div>
                    <span className="ml-auto text-white/60 text-lg">▸</span>
                </div>
            </button>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center text-base">🧪</span>
                    <div>
                        <h3 className="text-sm font-bold text-white">Simulation Control Panel</h3>
                        <p className="text-[11px] text-white/70">All data tagged isSimulation = true</p>
                    </div>
                </div>
                <button onClick={() => setExpanded(false)} className="text-white/60 hover:text-white text-sm font-bold px-2 py-1 rounded-lg hover:bg-white/10 transition">
                    ▾ Collapse
                </button>
            </div>

            <div className="p-6 space-y-5">
                {/* Scenario Grid */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Select Scenario</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {SCENARIOS.map(s => (
                            <button
                                key={s.key}
                                onClick={() => setSelectedScenario(s.key)}
                                className={`text-left p-3 rounded-xl border-2 transition-all text-sm ${
                                    selectedScenario === s.key
                                        ? 'border-indigo-500 bg-indigo-50'
                                        : 'border-gray-100 hover:border-gray-200'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-base">{s.icon}</span>
                                    <div>
                                        <div className="text-xs font-semibold text-gray-900">{s.label}</div>
                                        <div className="text-[10px] text-gray-500 mt-0.5 leading-tight">{s.desc}</div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tour Count Slider */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Tour Count: <span className="text-indigo-600">{tourCount}</span>
                    </label>
                    <input
                        type="range"
                        min={1}
                        max={100}
                        value={tourCount}
                        onChange={(e) => setTourCount(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                        <span>1</span><span>25</span><span>50</span><span>75</span><span>100</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={handleRun}
                        disabled={running || cleaning}
                        className="flex-1 rounded-xl bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-all text-sm"
                    >
                        {running ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Running...
                            </span>
                        ) : (
                            `▶ Run ${selected?.label}`
                        )}
                    </button>
                    <button
                        onClick={handleCleanup}
                        disabled={running || cleaning}
                        className="rounded-xl bg-red-50 border border-red-200 px-5 py-2.5 font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50 transition-all text-sm"
                    >
                        {cleaning ? 'Cleaning...' : '🗑 Cleanup'}
                    </button>
                </div>

                {/* Results */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <p className="text-sm font-semibold text-red-900">Error</p>
                        <p className="text-xs text-red-700 mt-1">{error}</p>
                    </div>
                )}
                {result && (
                    <div className="space-y-3">
                        {/* Summary Banner */}
                        <div className={`rounded-xl p-4 border ${result.data?.errorCount > 0 ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
                            <p className={`text-sm font-semibold ${result.data?.errorCount > 0 ? 'text-amber-900' : 'text-green-900'}`}>
                                {result.data?.errorCount > 0 ? '⚠️' : '✅'} {result.message || result.data?.message}
                            </p>
                        </div>

                        {/* Stats Grid */}
                        {result.data?.summary && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    { label: 'Successful', value: result.data.summary.success, color: 'text-green-700 bg-green-50' },
                                    { label: 'Failed', value: result.data.summary.failed, color: result.data.summary.failed > 0 ? 'text-red-700 bg-red-50' : 'text-gray-500 bg-gray-50' },
                                    { label: 'Events', value: result.data.summary.totalEvents, color: 'text-indigo-700 bg-indigo-50' },
                                    { label: 'Operator', value: result.data.summary.operatorName, color: 'text-gray-700 bg-gray-50' },
                                ].map((s, i) => (
                                    <div key={i} className={`rounded-lg p-3 text-center ${s.color}`}>
                                        <div className="text-lg font-bold">{s.value}</div>
                                        <div className="text-[10px] font-medium uppercase tracking-wider">{s.label}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Error Details */}
                        {result.data?.errors?.length > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <p className="text-xs font-bold text-red-900 mb-2">⚠ Errors ({result.data.errors.length})</p>
                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                    {result.data.errors.map((err: any, i: number) => (
                                        <div key={i} className="text-xs text-red-700 flex gap-2">
                                            <span className="font-mono text-red-400">#{err.index}</span>
                                            <span>{err.error}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Per-Tour Results (collapsible) */}
                        {result.data?.results?.length > 0 && (
                            <details className="bg-gray-50 border border-gray-200 rounded-xl">
                                <summary className="px-4 py-3 text-xs font-bold text-gray-600 cursor-pointer hover:text-gray-900">
                                    📋 Tour Details ({result.data.results.length} tours)
                                </summary>
                                <div className="px-4 pb-3 max-h-48 overflow-y-auto">
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-1 text-gray-500">Tour</th>
                                                <th className="text-left py-1 text-gray-500">Scenario</th>
                                                <th className="text-right py-1 text-gray-500">Events</th>
                                                <th className="text-right py-1 text-gray-500">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {result.data.results.map((r: any, i: number) => (
                                                <tr key={i} className="border-b border-gray-100">
                                                    <td className="py-1 text-gray-800 font-mono truncate max-w-[120px]">{r.title || r.tourId?.slice(0,8)}</td>
                                                    <td className="py-1 text-gray-600">{r.scenario}</td>
                                                    <td className="py-1 text-right text-indigo-600 font-semibold">{r.eventsGenerated}</td>
                                                    <td className="py-1 text-right">
                                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${r.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                            {r.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </details>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
