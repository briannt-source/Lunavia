'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Logo } from '@/components/logo';
import { ChevronDown, LogOut } from 'lucide-react';

// ── NavItem ──────────────────────────────────────────────────────
export function NavItem({ href, icon: Icon, iconEmoji, children, active, badge, locked, badgeLabel }: {
    href: string;
    icon?: React.ComponentType<{ className?: string }>;
    iconEmoji?: string;
    children: React.ReactNode;
    active?: boolean;
    badge?: number;
    locked?: boolean;
    badgeLabel?: string;
}) {
    if (locked) {
        return (
            <div className="nav-item opacity-50 cursor-not-allowed" title="Upgrade to unlock">
                {Icon ? <Icon className="w-[18px] h-[18px] shrink-0" /> : <span className="text-[15px] w-5 text-center shrink-0">{iconEmoji}</span>}
                <span className="flex-1 truncate">{children}</span>
                <span className="text-[9px] font-bold bg-lunavia-light text-lunavia-primary px-1.5 py-0.5 rounded-full">
                    {badgeLabel || 'PRO'}
                </span>
            </div>
        );
    }

    return (
        <Link href={href} className={`nav-item ${active ? 'active' : ''}`}>
            {Icon ? <Icon className="w-[18px] h-[18px] shrink-0" /> : <span className="text-[15px] w-5 text-center shrink-0">{iconEmoji}</span>}
            <span className="flex-1 truncate">{children}</span>
            {badge !== undefined && badge > 0 && (
                <span className="flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold bg-red-500 text-white rounded-full px-1">
                    {badge > 99 ? '99+' : badge}
                </span>
            )}
        </Link>
    );
}

// ── NavSection (collapsible) ────────────────────────────────────
export function NavSection({ title, children, defaultOpen = true }: { title?: string; children: React.ReactNode; defaultOpen?: boolean }) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    if (!title) {
        return <div className="space-y-0.5">{children}</div>;
    }

    return (
        <div>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="nav-section-label w-full flex items-center justify-between group cursor-pointer hover:text-gray-600 transition-colors"
            >
                <span>{title}</span>
                <ChevronDown className={`w-3 h-3 text-gray-300 group-hover:text-gray-400 transition-transform duration-200 ${isOpen ? '' : '-rotate-90'}`} />
            </button>
            <div className={`space-y-0.5 overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                {children}
            </div>
        </div>
    );
}

// ── SidebarShell ─────────────────────────────────────────────────
export default function SidebarShell({
    children,
    roleLabel,
}: {
    children: React.ReactNode;
    brandColor?: string; // kept for compatibility but ignored
    roleLabel?: string;
}) {
    const { data: session } = useSession();
    const user = session?.user as any;
    const t = useTranslations('Dashboard.Sidebar');

    return (
        <div className="flex h-full flex-col bg-[#FAFCFE]">
            {/* Logo */}
            <div className="flex items-center gap-2.5 px-5 py-4 shrink-0 border-b border-gray-100/80">
                <Logo size="sm" variant="dark" showText={true} showSubtitle={true} />
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 pb-4 pt-3 space-y-4">
                {children}
            </nav>

            {/* User Footer */}
            <div className="shrink-0 border-t border-gray-100 px-3 py-3">
                <div className="flex items-center gap-2.5 px-2 mb-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white bg-gradient-to-br from-[#0096C7] to-[#0077B6] shadow-sm">
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
                    <LogOut className="w-4 h-4" />
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
