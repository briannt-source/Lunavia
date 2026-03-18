'use client';

import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths, isBefore, startOfDay } from 'date-fns';
import { useTranslations } from 'next-intl';

interface GuideCalendarProps {
    initialAvailability: { date: Date; status: string }[];
    assignments: { startTime: Date; endTime: Date; title: string }[];
}

export function GuideCalendar({ initialAvailability, assignments }: GuideCalendarProps) {
    const t = useTranslations('Guide.Calendar');
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [availability, setAvailability] = useState(initialAvailability);

    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth),
    });

    const toggleDate = async (date: Date) => {
        if (isBefore(date, startOfDay(new Date()))) return; // Cannot edit past

        const isAvailable = availability.some(a => isSameDay(new Date(a.date), date) && a.status === 'AVAILABLE');
        const newStatus = isAvailable ? 'UNAVAILABLE' : 'AVAILABLE';

        // Optimistic UI Update
        const newAvailability = isAvailable
            ? availability.filter(a => !isSameDay(new Date(a.date), date))
            : [...availability, { date, status: 'AVAILABLE' }];

        setAvailability(newAvailability);

        // API Call
        try {
            await fetch('/api/guide/availability', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date, status: newStatus }),
            });
        } catch (error) {
            console.error('Failed to update availability', error);
            // Revert on error would go here
        }
    };

    const getDayStatus = (date: Date) => {
        const assignment = assignments.find(a =>
            isSameDay(new Date(a.startTime), date) || (isBefore(new Date(a.startTime), date) && isBefore(date, new Date(a.endTime)))
        );
        if (assignment) return { type: 'ASSIGNED', label: 'Assigned' };

        const avail = availability.find(a => isSameDay(new Date(a.date), date));
        if (avail?.status === 'AVAILABLE') return { type: 'AVAILABLE', label: 'Available' };

        return { type: 'UNAVAILABLE', label: 'Unavailable' };
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-gray-900">
                    {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <div className="flex bg-gray-100 rounded-lg p-1">
                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="px-3 py-1 hover:bg-white rounded-md transition-all text-sm font-medium">{t('controls.prev')}</button>
                    <button onClick={() => setCurrentMonth(new Date())} className="px-3 py-1 hover:bg-white rounded-md transition-all text-sm font-medium text-gray-600">{t('controls.today')}</button>
                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="px-3 py-1 hover:bg-white rounded-md transition-all text-sm font-medium">{t('controls.next')}</button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden border border-gray-200">
                {[t('days.sun'), t('days.mon'), t('days.tue'), t('days.wed'), t('days.thu'), t('days.fri'), t('days.sat')].map(day => (
                    <div key={day} className="bg-gray-50 py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {day}
                    </div>
                ))}

                {/* Empty start slots */}
                {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
                    <div key={`empty-${i}`} className="bg-white min-h-[120px]" />
                ))}

                {daysInMonth.map(date => {
                    const status = getDayStatus(date);
                    const isPast = isBefore(date, startOfDay(new Date()));
                    const isTodayDate = isToday(date);

                    return (
                        <div
                            key={date.toString()}
                            onClick={() => !isPast && status.type !== 'ASSIGNED' && toggleDate(date)}
                            className={`bg-white min-h-[120px] p-2 relative group transition-colors ${!isPast && status.type !== 'ASSIGNED' ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                        >
                            <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isTodayDate ? 'bg-indigo-600 text-white' : 'text-gray-700'}`}>
                                {format(date, 'd')}
                            </span>

                            <div className="mt-2 space-y-1">
                                {status.type === 'ASSIGNED' && (
                                    <div className="px-2 py-1 rounded bg-blue-100 border border-blue-200 text-blue-800 text-xs font-medium truncate">
                                        {t('status.assigned')}
                                    </div>
                                )}
                                {status.type === 'AVAILABLE' && (
                                    <div className="px-2 py-1 rounded bg-green-100 border border-green-200 text-green-800 text-xs font-medium text-center">
                                        {t('status.available')}
                                    </div>
                                )}
                            </div>

                            {!isPast && status.type !== 'ASSIGNED' && (
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                                    <span className="bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg">
                                        {status.type === 'AVAILABLE' ? t('status.markUnavailable') : t('status.markAvailable')}
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="mt-6 flex gap-6 text-sm">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-100 border border-green-200"></span>
                    <span className="text-gray-600">{t('legend.available')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-100 border border-blue-200"></span>
                    <span className="text-gray-600">{t('legend.assigned')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-white border border-gray-200"></span>
                    <span className="text-gray-600">{t('legend.unavailable')}</span>
                </div>
            </div>
        </div>
    );
}
