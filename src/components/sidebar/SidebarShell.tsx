'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

// ── NavItem ──────────────────────────────────────────────────────
export function NavItem({ href, icon, children, active, badge, locked, badgeLabel }: {
    href: string;
    icon: string;
    children: React.ReactNode;
    active?: boolean;
    badge?: number;
    locked?: boolean;
    badgeLabel?: string;
}) {
    if (locked) {
        return (
            <div className="nav-item opacity-50 cursor-not-allowed" title="Upgrade to unlock">
                <span className="text-[15px] w-5 text-center shrink-0">{icon}</span>
                <span className="flex-1 truncate">{children}</span>
                <span className="text-[9px] font-bold bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full">
                    {badgeLabel || 'PRO'}
                </span>
            </div>
        );
    }

    return (
        <Link href={href} className={`nav-item ${active ? 'active' : ''}`}>
            <span className="text-[15px] w-5 text-center shrink-0">{icon}</span>
            <span className="flex-1 truncate">{children}</span>
            {badge !== undefined && badge > 0 && (
                <span className="flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold bg-red-500 text-white rounded-full px-1">
                    {badge > 99 ? '99+' : badge}
                </span>
            )}
        </Link>
    );
}

// ── NavSection ───────────────────────────────────────────────────
export function NavSection({ title, children }: { title?: string; children: React.ReactNode }) {
    return (
        <div>
            {title && <div className="nav-section-label">{title}</div>}
            <div className="space-y-0.5">{children}</div>
        </div>
    );
}

// ── SidebarShell ─────────────────────────────────────────────────
export default function SidebarShell({
    children,
    brandColor = 'text-indigo-600',
    roleLabel,
}: {
    children: React.ReactNode;
    brandColor?: string;
    roleLabel?: string;
}) {
    const { data: session } = useSession();
    const user = session?.user as any;
    const t = useTranslations('Dashboard.Sidebar');

    return (
        <div className="flex h-full flex-col bg-white">
            {/* Logo */}
            <div className="flex items-center gap-2.5 px-5 py-4 shrink-0">
                <Link href="/" className={`text-lg font-extrabold tracking-tight ${brandColor}`}>
                    Lunavia
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 pb-4 space-y-5">
                {children}
            </nav>

            {/* User Footer */}
            <div className="shrink-0 border-t border-gray-100 px-3 py-3">
                <div className="flex items-center gap-2.5 px-2 mb-2">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white`}
                        style={{ background: 'rgb(var(--color-primary))' }}>
                        {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="truncate text-[13px] font-semibold text-gray-900">
                            {user?.name || user?.email?.split('@')[0] || 'User'}
                        </div>
                        <div className="text-[11px] text-gray-400">
                            {roleLabel || t('footer.tourGuide')}
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                    </svg>
                    {t('footer.logOut')}
                </button>
            </div>
        </div>
    );
}

// ── Hook: isActive ───────────────────────────────────────────────
export function useIsActive() {
    const pathname = usePathname();
    return (path: string) => pathname === path || pathname.startsWith(path + '/');
}
