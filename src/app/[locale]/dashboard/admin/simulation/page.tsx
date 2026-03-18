"use client";

import { useState } from 'react';
import Link from 'next/link';

const SCENARIOS = [
    { key: 'NORMAL_EXECUTION', label: 'Normal Execution', icon: '✅', desc: 'Simulate a standard tour running smoothly from start to completion.' },
    { key: 'GUIDE_LATE_REPLACEMENT', label: 'Guide Late Replacement', icon: '🔄', desc: 'Guide is replaced shortly before tour start time.' },
    { key: 'GUIDE_NO_SHOW', label: 'Guide No-Show', icon: '❌', desc: 'Guide fails to appear — triggers alerts and SOS flow.' },
    { key: 'EMERGENCY_SOS', label: 'Emergency SOS', icon: '🚨', desc: 'Emergency SOS broadcast triggered during active tour.' },
    { key: 'SEGMENT_CHECKINS', label: 'Segment Check-ins', icon: '📍', desc: 'Simulate segment-by-segment check-in flow.' },
    { key: 'TOUR_COMPLETION', label: 'Tour Completion', icon: '🏁', desc: 'Full tour lifecycle from start to completion and feedback.' },
];

export default function SimulationPage() {
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
                setResult({ message: data.message || 'Simulation data cleaned up successfully', data: data.data });
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

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <Link href="/dashboard/admin" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition">
                ← Back to Dashboard
            </Link>

            <div>
                <h1 className="text-xl font-bold text-gray-900">Simulation Control Panel</h1>
                <p className="text-sm text-gray-500 mt-1">Run operational test scenarios to validate tour execution flows.</p>
            </div>

            {/* Warning Banner */}
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                <span className="text-lg shrink-0">⚠️</span>
                <div>
                    <p className="text-sm font-semibold text-amber-900">Simulation Mode</p>
                    <p className="text-xs text-amber-700 mt-0.5">All simulation data is tagged with <code className="bg-amber-100 px-1 rounded">isSimulation = true</code>. No real payments, notifications, or trust penalties are triggered.</p>
                </div>
            </div>

            {/* Scenario Selector */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-sm font-bold text-gray-900 mb-4">Select Scenario</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SCENARIOS.map(s => (
                        <button
                            key={s.key}
                            onClick={() => setSelectedScenario(s.key)}
                            className={`text-left p-4 rounded-xl border-2 transition-all ${
                                selectedScenario === s.key
                                    ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-xl">{s.icon}</span>
                                <div>
                                    <div className="text-sm font-semibold text-gray-900">{s.label}</div>
                                    <div className="text-[11px] text-gray-500 mt-0.5">{s.desc}</div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Configuration */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-sm font-bold text-gray-900 mb-4">Configuration</h2>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tour Count: <span className="font-bold text-indigo-600">{tourCount}</span>
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
                        <span>1</span>
                        <span>25</span>
                        <span>50</span>
                        <span>75</span>
                        <span>100</span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                <button
                    onClick={handleRun}
                    disabled={running || cleaning}
                    className="flex-1 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-all text-sm"
                >
                    {running ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Running {selected?.label}...
                        </span>
                    ) : (
                        `▶ Run ${selected?.label}`
                    )}
                </button>
                <button
                    onClick={handleCleanup}
                    disabled={running || cleaning}
                    className="rounded-xl bg-red-50 border border-red-200 px-6 py-3 font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50 transition-all text-sm"
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
                <div className="space-y-4">
                    {/* Summary Banner */}
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <p className="text-sm font-semibold text-green-900">✅ {result.message}</p>
                    </div>

                    {/* Stats Bar */}
                    {result.data?.summary && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                                <div className="text-2xl font-bold text-indigo-600">{result.data.summary.success}</div>
                                <div className="text-[11px] text-gray-500 mt-1">Tours Created</div>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                                <div className="text-2xl font-bold text-emerald-600">{result.data.summary.totalEvents}</div>
                                <div className="text-[11px] text-gray-500 mt-1">Events Generated</div>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                                <div className="text-2xl font-bold text-red-500">{result.data.summary.failed}</div>
                                <div className="text-[11px] text-gray-500 mt-1">Errors</div>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                                <div className="text-sm font-semibold text-gray-700 truncate">{result.data.summary.operatorName}</div>
                                <div className="text-[11px] text-gray-500 mt-1">Operator</div>
                            </div>
                        </div>
                    )}

                    {/* Error Alerts */}
                    {result.data?.errors?.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                            <p className="text-sm font-semibold text-red-900 mb-2">⚠️ {result.data.errors.length} tour(s) failed</p>
                            <div className="space-y-1">
                                {result.data.errors.map((err: any, i: number) => (
                                    <div key={i} className="text-xs text-red-700 bg-red-100 rounded-lg px-3 py-1.5">
                                        <span className="font-medium">Tour #{err.index + 1}:</span> {err.error}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Per-Tour Results Table */}
                    {result.data?.results?.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                                <h3 className="text-sm font-bold text-gray-900">Tour Details</h3>
                            </div>
                            <div className="max-h-80 overflow-auto">
                                <table className="w-full text-xs">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="text-left px-4 py-2 text-gray-500 font-medium">#</th>
                                            <th className="text-left px-4 py-2 text-gray-500 font-medium">Tour ID</th>
                                            <th className="text-left px-4 py-2 text-gray-500 font-medium">Title</th>
                                            <th className="text-center px-4 py-2 text-gray-500 font-medium">Events</th>
                                            <th className="text-center px-4 py-2 text-gray-500 font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {result.data.results.map((tour: any, idx: number) => (
                                            <tr key={tour.tourId || idx} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-2 text-gray-400">{idx + 1}</td>
                                                <td className="px-4 py-2 font-mono text-gray-600 truncate max-w-[120px]" title={tour.tourId}>
                                                    {tour.tourId?.slice(0, 12)}…
                                                </td>
                                                <td className="px-4 py-2 text-gray-900">{tour.title}</td>
                                                <td className="px-4 py-2 text-center">
                                                    <span className="inline-flex items-center justify-center bg-indigo-50 text-indigo-700 rounded-full px-2 py-0.5 font-semibold">
                                                        {tour.eventsGenerated}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2 text-center">
                                                    {tour.status === 'SUCCESS' ? (
                                                        <span className="text-green-600 font-semibold">✓</span>
                                                    ) : (
                                                        <span className="text-red-600 font-semibold">✗</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Cleanup results (no per-tour data) */}
                    {result.data && !result.data.results && (
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                            <pre className="text-xs text-gray-700 overflow-auto">
                                {JSON.stringify(result.data, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
