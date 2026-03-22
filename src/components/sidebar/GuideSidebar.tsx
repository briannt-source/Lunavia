"use client";

import SidebarShell, { NavItem, NavSection, useIsActive } from './SidebarShell';
import { useTranslations } from 'next-intl';
import { usePathname } from '@/navigation';
import {
    BarChart3,
    Search,
    ClipboardList,
    ClipboardCheck,
    Calendar,
    Mail,
    FileText,
    Clock,
    Scale,
    User,
    Coins,
    Wallet,
} from 'lucide-react';

// Icon color groups — consistent visual hierarchy
const IC = {
    brand:   'text-lunavia-primary',   // #2E8BC0 — core navigation
    tour:    'text-lunavia-accent',     // #5BA4CF — tour discovery & management
    work:    'text-green-500',          // active work / assignments
    finance: 'text-amber-500',         // money-related
    account: 'text-gray-400',          // profile & settings (muted)
};

export default function GuideSidebar() {
    const pathname = usePathname();
    const isActive = useIsActive();
    const t = useTranslations('Dashboard.Sidebar');

    return (
        <SidebarShell roleLabel={t('footer.tourGuide')}>
            {/* Core */}
            <NavSection>
                <NavItem href="/dashboard/guide" icon={BarChart3} active={pathname === '/dashboard/guide'} iconColor={IC.brand}>
                    {t('links.dashboard')}
                </NavItem>
            </NavSection>

            {/* Tours */}
            <NavSection title={t('sections.tours')}>
                <NavItem href="/dashboard/guide/available" icon={Search} active={isActive('/dashboard/guide/available')} iconColor={IC.tour}>
                    {t('links.marketplace')}
                </NavItem>
                <NavItem href="/dashboard/guide/tours" icon={ClipboardList} active={isActive('/dashboard/guide/tours')} iconColor={IC.tour}>
                    {t('links.myTours')}
                </NavItem>
                <NavItem href="/dashboard/guide/applications" icon={FileText} active={isActive('/dashboard/guide/applications')} iconColor={IC.tour}>
                    {t('links.applications')}
                </NavItem>
                <NavItem href="/dashboard/guide/assignments" icon={ClipboardCheck} active={isActive('/dashboard/guide/assignments')} iconColor={IC.work}>
                    {t('links.assignments')}
                </NavItem>
                <NavItem href="/dashboard/guide/invites" icon={Mail} active={isActive('/dashboard/guide/invites')} iconColor={IC.tour}>
                    {t('links.invites')}
                </NavItem>
                <NavItem href="/dashboard/guide/calendar" icon={Calendar} active={isActive('/dashboard/guide/calendar') || isActive('/dashboard/guide/availability')} iconColor={IC.work}>
                    {t('links.calendar')}
                </NavItem>
                <NavItem href="/dashboard/guide/standby-requests" icon={Clock} active={isActive('/dashboard/guide/standby-requests')} iconColor={IC.tour}>
                    {t('links.standbyRequests')}
                </NavItem>
                <NavItem href="/dashboard/guide/disputes" icon={Scale} active={isActive('/dashboard/guide/disputes')} iconColor={IC.account}>
                    {t('links.disputes')}
                </NavItem>
            </NavSection>

            {/* Finance */}
            <NavSection title={t('sections.finance')}>
                <NavItem href="/dashboard/guide/wallet" icon={Wallet} active={isActive('/dashboard/guide/wallet')} iconColor={IC.finance}>
                    {t('links.wallet')}
                </NavItem>
                <NavItem href="/dashboard/guide/earnings" icon={Coins} active={isActive('/dashboard/guide/earnings')} iconColor={IC.finance}>
                    {t('links.earnings')}
                </NavItem>
            </NavSection>

            {/* Account */}
            <NavSection title={t('sections.account')}>
                <NavItem href="/dashboard/guide/profile" icon={User} active={isActive('/dashboard/guide/profile') || isActive('/dashboard/guide/profile/trust') || isActive('/dashboard/guide/portfolio') || isActive('/dashboard/guide/contract') || isActive('/dashboard/guide/settings')} iconColor={IC.account}>
                    {t('links.profile')}
                </NavItem>
            </NavSection>
        </SidebarShell>
    );
}
