'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Notification {
    id: string;
    title: string;
    message: string;
    severity: string;
    createdAt: string;
    readAt: string | null;
    eventId?: string;
    targetUrl?: string | null;
}

const SEVERITY_STYLES: Record<string, string> = {
    INFO: 'border-l-blue-500 bg-blue-50',
    SUCCESS: 'border-l-green-500 bg-green-50',
    WARNING: 'border-l-yellow-500 bg-yellow-50',
    ERROR: 'border-l-red-500 bg-red-50',
};

export default function NotificationBell() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/notifications?limit=20');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.unreadCount || 0);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    // Mark single notification as read
    const markAsRead = async (id: string) => {
        try {
            const res = await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
            if (res.ok) {
                setNotifications(prev => prev.map(n =>
                    n.id === id ? { ...n, readAt: new Date().toISOString() } : n
                ));
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    // Mark all as read
    const markAllAsRead = async () => {
        try {
            const res = await fetch('/api/notifications/mark-all-read', { method: 'POST' });
            if (res.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, readAt: new Date().toISOString() })));
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch on mount and when dropdown opens
    useEffect(() => {
        fetchNotifications();
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 1) return 'Now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Notifications"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 max-h-96 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
                    {/* Header */}
                    <div className="flex items-center justify-between p-3 border-b bg-gray-50">
                        <h3 className="font-semibold text-gray-800">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notification List */}
                    <div className="overflow-y-auto max-h-72">
                        {loading && notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                Loading...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                                <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                    />
                                </svg>
                                <p className="text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    onClick={() => {
                                        if (!notification.readAt) markAsRead(notification.id);
                                        if (notification.targetUrl) {
                                            setIsOpen(false);
                                            router.push(notification.targetUrl);
                                        }
                                    }}
                                    className={`
                                        p-3 border-b border-l-4 cursor-pointer transition-colors
                                        ${SEVERITY_STYLES[notification.severity] || SEVERITY_STYLES.INFO}
                                        ${notification.readAt ? 'opacity-60' : 'hover:bg-gray-50'}
                                    `}
                                >
                                    <div className="flex justify-between items-start">
                                        <h4 className={`text-sm font-medium text-gray-900 ${!notification.readAt ? 'font-semibold' : ''}`}>
                                            {notification.title}
                                        </h4>
                                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                            {formatTime(notification.createdAt)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                        {notification.message}
                                    </p>
                                    {notification.targetUrl && (
                                        <span className="text-xs text-blue-500 mt-1 inline-block">View details →</span>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-2 border-t bg-gray-50 text-center">
                            <Link
                                href="/dashboard/notifications"
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                onClick={() => setIsOpen(false)}
                            >
                                View all notifications
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
