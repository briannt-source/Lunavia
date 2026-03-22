'use client';

import { useState, useCallback, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths, isBefore, startOfDay, isWithinInterval } from 'date-fns';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

/**
 * Unified Calendar + Availability component
 * Combines guide calendar view with availability management
 */
export function GuideCalendar() {
    const t = useTranslations('Guide.Calendar');
    const queryClient = useQueryClient();
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Derive date range from current month
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = format(monthStart, 'yyyy-MM-dd');
    const endDate = format(monthEnd, 'yyyy-MM-dd');

    // ── Data fetching ──
    const { data, isLoading } = useQuery({
        queryKey: ['guideCalendar', startDate, endDate],
        queryFn: async () => {
            const params = new URLSearchParams({ startDate, endDate });
            const res = await fetch(`/api/guides/availability?${params}`);
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
    });

    const availabilities: any[] = data?.availabilities || [];
    const currentStatus: string = data?.currentStatus || 'AVAILABLE';
    const assignedTours: any[] = data?.assignedTours || [];

    // ── Mutations ──
    const statusMutation = useMutation({
        mutationFn: async (status: string) => {
            const res = await fetch('/api/guides/availability', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            toast.success(t('toast.statusUpdated'));
            queryClient.invalidateQueries({ queryKey: ['guideCalendar'] });
        },
        onError: () => toast.error(t('toast.updateFailed')),
    });

    const dateMutation = useMutation({
        mutationFn: async (payload: { date: string; slots: any[] }) => {
            const res = await fetch('/api/guides/availability', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['guideCalendar'] });
        },
        onError: () => toast.error(t('toast.updateFailed')),
    });

    // ── Availability map ──
    const availabilityMap = useMemo(() => {
        const map = new Map<string, string>();
        for (const av of availabilities) {
            const d = new Date(av.date);
            const key = format(d, 'yyyy-MM-dd');
            const slots = av.slots as any[];
            if (slots && Array.isArray(slots) && slots[0]?.status) {
                map.set(key, slots[0].status);
            }
        }
        return map;
    }, [availabilities]);

    // ── Tour assignments ──
    const isAssignedDate = useCallback(
        (date: Date) => {
            return assignedTours.find((tour) => {
                const tourStart = new Date(tour.startDate);
                const tourEnd = new Date(tour.endDate);
                return isWithinInterval(date, { start: startOfDay(tourStart), end: startOfDay(tourEnd) })
                    || isSameDay(date, tourStart)
                    || isSameDay(date, tourEnd);
            });
        },
        [assignedTours]
    );

    // ── Day status logic ──
    const getDayStatus = useCallback(
        (date: Date): { type: string; label: string; tourTitle?: string } => {
            const assignment = isAssignedDate(date);
            if (assignment) {
                return {
                    type: 'ASSIGNED',
                    label: t('status.assigned'),
                    tourTitle: assignment.title,
                };
            }

            const dateStr = format(date, 'yyyy-MM-dd');
            const dayStatus = availabilityMap.get(dateStr);

            if (dayStatus === 'AVAILABLE') return { type: 'AVAILABLE', label: t('status.available') };
            if (dayStatus === 'BUSY') return { type: 'BUSY', label: t('status.busy') };
            if (dayStatus === 'ON_TOUR') return { type: 'ON_TOUR', label: t('status.onTour') };

            return { type: 'NONE', label: '' };
        },
        [isAssignedDate, availabilityMap, t]
    );

    // ── Click handler: cycle availability ──
    const handleDateClick = useCallback(
        (date: Date) => {
            if (isBefore(date, startOfDay(new Date()))) return; // Past dates
            if (isAssignedDate(date)) return; // Assigned dates locked
            if (currentStatus === 'ON_TOUR') {
                toast.error(t('toast.onTourRestricted'));
                return;
            }

            const dateStr = format(date, 'yyyy-MM-dd');
            const current = availabilityMap.get(dateStr);

            // Cycle: none → AVAILABLE → BUSY → none
            let newStatus: string | null;
            if (!current || current === 'NONE') {
                newStatus = 'AVAILABLE';
            } else if (current === 'AVAILABLE') {
                newStatus = 'BUSY';
            } else {
                newStatus = null; // Clear
            }

            const slots = newStatus ? [{ status: newStatus }] : [];
            dateMutation.mutate({ date: dateStr, slots });
        },
        [isAssignedDate, availabilityMap, currentStatus, dateMutation, t]
    );

    // ── Calendar grid ──
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const statusColors: Record<string, string> = {
        ASSIGNED: 'bg-lunavia-muted/50 border-lunavia-muted/60 text-blue-800',
        AVAILABLE: 'bg-green-100 border-green-200 text-green-800',
        BUSY: 'bg-red-100 border-red-200 text-red-800',
        ON_TOUR: 'bg-amber-100 border-amber-200 text-amber-800',
    };

    const globalStatusConfig: Record<string, { bg: string; text: string; ring: string }> = {
        AVAILABLE: { bg: 'bg-green-50', text: 'text-green-700', ring: 'ring-green-600' },
        BUSY: { bg: 'bg-red-50', text: 'text-red-700', ring: 'ring-red-600' },
        ON_TOUR: { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-600' },
    };

    return (
        <div>
            {/* ── Global Status Card ── */}
            <div className="mb-6 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{t('globalStatus.title')}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{t('globalStatus.description')}</p>
                    </div>
                    <div className="flex gap-2">
                        {(['AVAILABLE', 'BUSY', 'ON_TOUR'] as const).map((status) => {
                            const config = globalStatusConfig[status];
                            const isActive = currentStatus === status;
                            return (
                                <button
                                    key={status}
                                    onClick={() => statusMutation.mutate(status)}
                                    disabled={statusMutation.isPending}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                                        isActive
                                            ? `${config.bg} ${config.text} ring-2 ${config.ring} border-transparent`
                                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                    } ${statusMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {t(`globalStatus.${status.toLowerCase()}`)}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── Calendar Header ── */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                    {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                        className="px-3 py-1 hover:bg-white rounded-md transition-all text-sm font-medium"
                    >
                        {t('controls.prev')}
                    </button>
                    <button
                        onClick={() => setCurrentMonth(new Date())}
                        className="px-3 py-1 hover:bg-white rounded-md transition-all text-sm font-medium text-gray-600"
                    >
                        {t('controls.today')}
                    </button>
                    <button
                        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                        className="px-3 py-1 hover:bg-white rounded-md transition-all text-sm font-medium"
                    >
                        {t('controls.next')}
                    </button>
                </div>
            </div>

            {/* ── Calendar Grid ── */}
            {isLoading ? (
                <div className="text-center py-16 text-gray-400">Loading...</div>
            ) : (
                <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden border border-gray-200">
                    {/* Day headers */}
                    {[t('days.sun'), t('days.mon'), t('days.tue'), t('days.wed'), t('days.thu'), t('days.fri'), t('days.sat')].map((day) => (
                        <div key={day} className="bg-gray-50 py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            {day}
                        </div>
                    ))}

                    {/* Empty start slots */}
                    {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                        <div key={`empty-${i}`} className="bg-white min-h-[110px]" />
                    ))}

                    {/* Days */}
                    {daysInMonth.map((date) => {
                        const status = getDayStatus(date);
                        const isPast = isBefore(date, startOfDay(new Date()));
                        const isTodayDate = isToday(date);
                        const isLocked = status.type === 'ASSIGNED' || isPast || currentStatus === 'ON_TOUR';

                        return (
                            <div
                                key={date.toString()}
                                onClick={() => handleDateClick(date)}
                                className={`bg-white min-h-[110px] p-2 relative group transition-colors ${
                                    !isLocked ? 'cursor-pointer hover:bg-gray-50' : ''
                                } ${isPast ? 'opacity-60' : ''}`}
                            >
                                {/* Day number */}
                                <span
                                    className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${
                                        isTodayDate ? 'bg-lunavia-primary text-white' : 'text-gray-700'
                                    }`}
                                >
                                    {format(date, 'd')}
                                </span>

                                {/* Status badge */}
                                <div className="mt-1.5 space-y-1">
                                    {status.type !== 'NONE' && (
                                        <div
                                            className={`px-1.5 py-0.5 rounded border text-[10px] font-medium truncate ${
                                                statusColors[status.type] || ''
                                            }`}
                                        >
                                            {status.type === 'ASSIGNED' && status.tourTitle
                                                ? `🔒 ${status.tourTitle}`
                                                : status.label}
                                        </div>
                                    )}
                                </div>

                                {/* Hover tooltip */}
                                {!isLocked && (
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none z-10">
                                        <span className="bg-gray-900 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap">
                                            {status.type === 'AVAILABLE'
                                                ? t('status.markBusy')
                                                : status.type === 'BUSY'
                                                ? t('status.markClear')
                                                : t('status.markAvailable')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Legend ── */}
            <div className="mt-6 flex flex-wrap gap-4 text-sm">
                {[
                    { color: 'bg-green-100 border-green-200', label: t('legend.available') },
                    { color: 'bg-lunavia-muted/50 border-lunavia-muted/60', label: t('legend.assigned') },
                    { color: 'bg-red-100 border-red-200', label: t('legend.busy') },
                    { color: 'bg-amber-100 border-amber-200', label: t('legend.onTour') },
                    { color: 'bg-white border-gray-200', label: t('legend.unavailable') },
                ].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full border ${color}`}></span>
                        <span className="text-gray-600">{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
