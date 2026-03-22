'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
    relatedId?: string;
}

export function NotificationCenter() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [cursor, setCursor] = useState<string | undefined>(undefined);
    const [hasNextPage, setHasNextPage] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const loadingRef = useRef(false);
    const cursorRef = useRef<string | undefined>(undefined);
    const router = useRouter();

    const fetchNotifications = useCallback(async (reset = false) => {
        if (loadingRef.current) return;
        loadingRef.current = true;
        setLoading(true);
        try {
            const url = new URL('/api/notifications', window.location.origin);
            url.searchParams.set('limit', '10');
            if (!reset && cursorRef.current) url.searchParams.set('cursor', cursorRef.current);

            const res = await fetch(url.toString());
            const json = await res.json();

            if (!res.ok || !json.data) {
                console.warn('Notifications API returned unexpected format', json);
                return;
            }

            if (reset) {
                setNotifications(json.data);
            } else {
                setNotifications(prev => [...prev, ...json.data]);
            }

            const meta = json.meta || {};
            cursorRef.current = meta.nextCursor;
            setCursor(meta.nextCursor);
            setHasNextPage(meta.hasNextPage ?? false);

            // Recalculate unread (simplified, ideally backend sends count)
            const unread = json.data.filter((n: Notification) => !n.isRead).length;
            // Note: This is just for the current batch. Developing a proper unread count 
            // usually requires a dedicated endpoint or metadata. 
            // For MVP, we'll just track what we see or optimistically update.
            if (reset) setUnreadCount(unread);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }, []);

    // Initial Fetch & Polling
    useEffect(() => {
        fetchNotifications(true);
        const interval = setInterval(() => fetchNotifications(true), 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAllRead = async () => {
        try {
            await fetch('/api/notifications', { method: 'PATCH' });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark read', error);
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.isRead) {
            // Optimistically mark read
            setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n));
            // Ideally call API to mark single read here if supported, or rely on markAllRead
        }

        // Deep linking logic
        if (notification.type === 'CONFLICT_REPORTED') {
            router.push(`/dashboard/incidents/${notification.relatedId}`); // Assuming route exists or similar
        } else if (notification.type === 'TOUR_ASSIGNED' || notification.type === 'TOUR_COMPLETED') {
            router.push(`/dashboard/tours/${notification.relatedId}`);
        }

        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Notifications"
            >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 z-50 overflow-hidden transform transition-all">
                    <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                        <button
                            onClick={markAllRead}
                            className="text-xs text-[#5BA4CF] hover:text-indigo-800 font-medium"
                        >
                            Mark all as read
                        </button>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 text-sm">
                                <p>No notifications yet.</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {notifications.map(notification => (
                                    <li
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.isRead ? 'bg-lunavia-light/40' : ''}`}
                                    >
                                        <div className="flex gap-3">
                                            <div className="flex-1">
                                                <p className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                                    {notification.title}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <p className="text-[10px] text-gray-400 mt-2">
                                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                </p>
                                            </div>
                                            {!notification.isRead && (
                                                <div className="w-2 h-2 bg-lunavia-primary rounded-full mt-1.5 flex-shrink-0"></div>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                        {/* Load More Trigger could go here */}
                    </div>
                </div>
            )}
        </div>
    );
}
