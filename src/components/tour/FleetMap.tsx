'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Ping {
    latitude: number;
    longitude: number;
    timestamp: string;
    speed?: number | null;
    accuracy?: number | null;
}

interface FleetTour {
    tourId: string;
    title: string;
    location: string;
    guide?: { id: string; name: string; email: string; avatarUrl: string | null } | null;
    operator?: { name: string; email: string; companyName: string | null } | null;
    latestPing: Ping | null;
}

export default function FleetMap({ isAdmin = false }: { isAdmin?: boolean }) {
    const [fleet, setFleet] = useState<FleetTour[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
    const [selectedTourId, setSelectedTourId] = useState<string | null>(null);

    async function fetchFleet() {
        try {
            const url = isAdmin ? '/api/admin/fleet' : '/api/operator/fleet';
            const res = await fetch(url);
            const data = await res.json();
            if (res.ok) {
                setFleet(data.data || []);
                setLastRefresh(new Date());
            } else {
                setError(data.error || 'Failed to fetch fleet data');
            }
        } catch (e: any) {
            setError('Network error loading fleet');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchFleet();
        const interval = setInterval(fetchFleet, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [isAdmin]);

    if (loading) return (
        <div className="p-8 animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-[500px] bg-gray-200 rounded-2xl w-full"></div>
        </div>
    );

    if (error) return (
        <div className="p-8 text-center text-red-600 bg-red-50 rounded-2xl border border-red-200">
            {error}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Live Fleet Tracking</h2>
                    <p className="text-sm text-gray-500">Monitoring {fleet.length} active tours</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">Last updated: {lastRefresh.toLocaleTimeString()}</span>
                    <button onClick={fetchFleet} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm font-medium transition">
                        Refresh
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Fleet List Panel */}
                <div className="lg:col-span-1 bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col h-[600px] shadow-sm">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="font-semibold text-gray-900">Active Tours</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                        {fleet.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <div className="text-3xl mb-2">🏝️</div>
                                <p className="text-sm">No tours currently in progress.</p>
                            </div>
                        ) : (
                            fleet.map(tour => {
                                const isSelected = selectedTourId === tour.tourId;
                                const hasSignal = !!tour.latestPing;
                                const staleMs = hasSignal ? new Date().getTime() - new Date(tour.latestPing!.timestamp).getTime() : 0;
                                const isStale = staleMs > 5 * 60 * 1000; // 5 minutes old = stale

                                return (
                                    <div 
                                        key={tour.tourId} 
                                        onClick={() => setSelectedTourId(tour.tourId)}
                                        className={`p-4 cursor-pointer transition flex gap-3 ${isSelected ? 'bg-indigo-50/50 ring-1 ring-inset ring-indigo-200' : 'hover:bg-gray-50'}`}
                                    >
                                        <div className="pt-1">
                                            {hasSignal ? (
                                                <div className="relative flex items-center justify-center w-3 h-3">
                                                    {!isStale && <div className="absolute w-full h-full bg-green-400 rounded-full animate-ping opacity-75"></div>}
                                                    <div className={`relative w-2 h-2 rounded-full ${isStale ? 'bg-amber-400' : 'bg-green-500'}`}></div>
                                                </div>
                                            ) : (
                                                <div className="w-2 h-2 rounded-full bg-gray-300 mt-1"></div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-gray-900 text-sm truncate">{tour.title}</h4>
                                            
                                            {/* Guide Name */}
                                            {tour.guide && (
                                                <p className="text-xs text-gray-500 mt-0.5 truncate flex items-center gap-1">
                                                    <span className="shrink-0 w-3 h-3 rounded-full bg-gray-200 overflow-hidden inline-flex">
                                                        {tour.guide.avatarUrl && <img src={tour.guide.avatarUrl} alt="" className="w-full h-full object-cover" />}
                                                    </span>
                                                    {tour.guide.name || tour.guide.email}
                                                </p>
                                            )}

                                            {/* Signal Status */}
                                            <div className="mt-2 flex items-center gap-2 text-[10px] font-medium tracking-wide">
                                                {hasSignal ? (
                                                    isStale ? (
                                                        <span className="text-amber-600">⚠️ Signal Lost ({Math.floor(staleMs / 60000)}m ago)</span>
                                                    ) : (
                                                        <span className="text-green-600">LIVE SIGNAL</span>
                                                    )
                                                ) : (
                                                    <span className="text-gray-400">NO SIGNAL YET</span>
                                                )}
                                                
                                                {tour.latestPing?.speed != null && tour.latestPing.speed > 0 && (
                                                    <span className="text-gray-500 px-1 border-l border-gray-200">
                                                        {Math.round(tour.latestPing.speed * 3.6)} km/h
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Map Panel */}
                <div className="lg:col-span-2 bg-gray-100 border border-gray-200 rounded-2xl overflow-hidden h-[600px] relative shadow-sm">
                    {fleet.length === 0 ? (
                        <div className="absolute inset-0 flex items-center justify-center flex-col text-gray-400">
                            <span className="text-4xl mb-4">🗺️</span>
                            <p>Map inactive. Waiting for active tours.</p>
                        </div>
                    ) : (
                        (() => {
                            // Find the selected tour or default to the first one with a ping
                            const activeTour = selectedTourId 
                                ? fleet.find(t => t.tourId === selectedTourId) 
                                : fleet.find(t => t.latestPing);

                            if (!activeTour?.latestPing) {
                                return (
                                    <div className="absolute inset-0 flex items-center justify-center flex-col text-gray-400 bg-white">
                                        <span className="text-4xl mb-4">📡</span>
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">Awaiting GPS Signal</h3>
                                        <p className="text-sm">The guide's device has not transmitted a location yet.</p>
                                    </div>
                                );
                            }

                            const lat = activeTour.latestPing.latitude;
                            const lng = activeTour.latestPing.longitude;
                            
                            // Simple OSM Iframe (No API key needed)
                            const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`;

                            return (
                                <>
                                    <iframe 
                                        width="100%" 
                                        height="100%" 
                                        frameBorder="0" 
                                        scrolling="no" 
                                        marginHeight={0} 
                                        marginWidth={0} 
                                        src={mapUrl}
                                        className="absolute inset-0"
                                    ></iframe>
                                    
                                    {/* Overlay Card */}
                                    <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur shadow-xl rounded-xl border border-gray-200 p-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-base">{activeTour.title}</h3>
                                                <p className="text-xs text-gray-500 mt-0.5">Location: {lat.toFixed(6)}, {lng.toFixed(6)}</p>
                                            </div>
                                            <Link 
                                                href={isAdmin ? `/dashboard/admin/tours/${activeTour.tourId}` : `/dashboard/operator/request/${activeTour.tourId}`}
                                                className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold transition"
                                            >
                                                View Tour
                                            </Link>
                                        </div>
                                        {activeTour.latestPing.accuracy && (
                                            <div className="mt-3 flex items-center gap-4 text-xs font-medium text-gray-500">
                                                <span>⏱️ Updated: {new Date(activeTour.latestPing.timestamp).toLocaleTimeString()}</span>
                                                <span>🎯 Accuracy: &plusmn;{Math.round(activeTour.latestPing.accuracy)}m</span>
                                            </div>
                                        )}
                                    </div>
                                </>
                            );
                        })()
                    )}
                </div>

            </div>
        </div>
    );
}
