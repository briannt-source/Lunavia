'use client';

import { ReactNode, useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Topbar from './Topbar';

interface Props {
    children: ReactNode;
    sidebar: ReactNode;
    role?: string;
    bottomNav?: ReactNode;
    extra?: ReactNode; // e.g. TourReminderPopup
}

export default function MobileDashboardLayout({ children, sidebar, role, bottomNav, extra }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();

    // Close sidebar on navigation
    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

    // Close on Escape key
    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') setSidebarOpen(false);
        }
        if (sidebarOpen) {
            document.addEventListener('keydown', onKeyDown);
            return () => document.removeEventListener('keydown', onKeyDown);
        }
    }, [sidebarOpen]);

    // Prevent body scroll when sidebar is open
    useEffect(() => {
        if (sidebarOpen) {
            document.body.style.overflow = 'hidden';
            return () => { document.body.style.overflow = ''; };
        }
    }, [sidebarOpen]);

    const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* ── Desktop Sidebar ── */}
            <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r bg-white hidden lg:block overflow-y-auto">
                {sidebar}
            </aside>

            {/* ── Mobile Sidebar Overlay ── */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-[60] lg:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/30 backdrop-blur-[2px] transition-opacity"
                        onClick={() => setSidebarOpen(false)}
                    />
                    {/* Sidebar Panel */}
                    <aside
                        className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-2xl overflow-y-auto animate-slide-in-left"
                    >
                        {sidebar}
                    </aside>
                </div>
            )}

            {/* ── Main Content ── */}
            <div className="flex flex-1 flex-col lg:pl-64 transition-all duration-300">
                <Topbar
                    role={role}
                    onToggleSidebar={toggleSidebar}
                    sidebarOpen={sidebarOpen}
                />
                <main className="flex-1 p-4 sm:p-6 pb-20 lg:pb-6">
                    {children}
                </main>
            </div>

            {/* ── Mobile Bottom Nav ── */}
            {bottomNav && (
                <nav className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-gray-100 safe-area-bottom">
                    {bottomNav}
                </nav>
            )}

            {/* ── Extra overlays ── */}
            {extra}
        </div>
    );
}
