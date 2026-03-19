"use client";

import { useState, useEffect, useCallback } from "react";
import {import toast from 'react-hot-toast';

interface AvailabilityBlock {
    id: string;
    date: string;
    status: string;
    note: string | null;
}

interface AssignedTour {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    status: string;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function GuideCalendarWidget() {
    const [currentMonth, setCurrentMonth] = useState(() => new Date());
    const [blocks, setBlocks] = useState<AvailabilityBlock[]>([]);
    const [tours, setTours] = useState<AssignedTour[]>([]);
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState<string | null>(null);

    const monthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;

    const fetchCalendar = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/guide/availability?month=${monthKey}`);
            const json = await res.json();
            if (json.success) {
                setBlocks(json.data.blocks || []);
                setTours(json.data.tours || []);
            }
        } catch { /* ignore */ }
        finally { setLoading(false); }
    }, [monthKey]);

    useEffect(() => { fetchCalendar(); }, [fetchCalendar]);

    const prevMonth = () => setCurrentMonth(d => { const n = new Date(d); n.setMonth(n.getMonth() - 1); return n; });
    const nextMonth = () => setCurrentMonth(d => { const n = new Date(d); n.setMonth(n.getMonth() + 1); return n; });

    // Build a map: dateStr -> status
    const blockMap = new Map(blocks.map(b => {
        const d = new Date(b.date);
        return [d.toISOString().slice(0, 10), b];
    }));

    // Build tour map: dateStr -> tour[]
    const tourMap = new Map<string, AssignedTour[]>();
    tours.forEach(t => {
        const key = new Date(t.startDate).toISOString().slice(0, 10);
        if (!tourMap.has(key)) tourMap.set(key, []);
        tourMap.get(key)!.push(t);
    });

    const toggleDay = async (dateStr: string) => {
        const existing = blockMap.get(dateStr);
        const newStatus = existing?.status === 'UNAVAILABLE' ? 'AVAILABLE' : 'UNAVAILABLE';
        setToggling(dateStr);
        try {
            const res = await fetch('/api/guide/availability', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: `${dateStr}T00:00:00Z`, status: newStatus }),
            });
            if (res.ok) {
                toast.success(newStatus === 'UNAVAILABLE' ? 'Marked as unavailable' : 'Marked as available');
                fetchCalendar();
            } else {
                toast.error('Failed to update availability');
            }
        } catch { toast.error('Network error'); }
        finally { setToggling(null); }
    };

    // Generate calendar grid
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date().toISOString().slice(0, 10);

    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">📅 Availability Calendar</h3>
                <div className="flex items-center gap-2">
                    <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-500">
                        ‹
                    </button>
                    <span className="text-sm font-semibold text-gray-900 min-w-[140px] text-center">
                        {MONTHS[month]} {year}
                    </span>
                    <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-500">
                        ›
                    </button>
                </div>
            </div>

            {/* Legend */}
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-400" /> Available</div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-400" /> Unavailable</div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-indigo-400" /> Booked (Tour)</div>
                <span className="text-gray-400 ml-auto">Click a day to toggle</span>
            </div>

            {/* Calendar Grid */}
            <div className="p-4">
                {loading ? (
                    <div className="h-64 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
                    </div>
                ) : (
                    <>
                        {/* Day headers */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {DAYS.map(d => (
                                <div key={d} className="text-center text-[10px] font-bold text-gray-400 uppercase py-1">{d}</div>
                            ))}
                        </div>

                        {/* Day cells */}
                        <div className="grid grid-cols-7 gap-1">
                            {cells.map((day, i) => {
                                if (day === null) return <div key={`empty-${i}`} />;
                                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                const block = blockMap.get(dateStr);
                                const dayTours = tourMap.get(dateStr) || [];
                                const isUnavailable = block?.status === 'UNAVAILABLE';
                                const isBooked = dayTours.length > 0;
                                const isToday = dateStr === today;
                                const isPast = dateStr < today;
                                const isToggling = toggling === dateStr;

                                let bgClass = 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-900';
                                if (isUnavailable) bgClass = 'bg-red-50 hover:bg-red-100 border-red-200 text-red-900';
                                if (isBooked) bgClass = 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-900';
                                if (isPast) bgClass = 'bg-gray-50 border-gray-100 text-gray-400 cursor-default';

                                return (
                                    <button
                                        key={dateStr}
                                        onClick={() => !isPast && !isBooked && toggleDay(dateStr)}
                                        disabled={isPast || isBooked || isToggling}
                                        className={`relative p-2 rounded-lg border text-sm font-medium transition-colors min-h-[52px] flex flex-col items-center justify-start ${bgClass} ${isToday ? 'ring-2 ring-indigo-500 ring-offset-1' : ''} ${isToggling ? 'opacity-50' : ''}`}
                                        title={isBooked ? dayTours.map(t => t.title).join(', ') : isUnavailable ? 'Unavailable — click to make available' : 'Available — click to block'}
                                    >
                                        <span className="text-xs font-bold">{day}</span>
                                        {isBooked && <span className="text-[8px] mt-0.5 font-semibold">🎯 Tour</span>}
                                        {isUnavailable && !isBooked && <span className="text-[8px] mt-0.5">Blocked</span>}
                                    </button>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            {/* Upcoming Tours */}
            {tours.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-100">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Upcoming Tours This Month</h4>
                    <div className="space-y-2">
                        {tours.slice(0, 5).map(t => (
                            <div key={t.id} className="flex items-center justify-between bg-indigo-50 rounded-lg px-3 py-2 text-sm">
                                <span className="font-medium text-indigo-900 truncate max-w-[200px]">{t.title}</span>
                                <span className="text-indigo-500 text-xs">
                                    {new Date(t.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
