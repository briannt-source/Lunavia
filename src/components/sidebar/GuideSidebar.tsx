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
    CalendarCheck,
    Mail,
    FileText,
    FileSignature,
    Clock,
    Briefcase,
    Scale,
    User,
    Award,
    Coins,
    Wallet,
    Star,
    Settings,
    CheckCircle,
    Bell,
    MessageCircle,
} from 'lucide-react';

// Icon color groups — consistent visual hierarchy
const IC = {
    brand:   'text-lunavia-primary',   // #0077B6 — core navigation
    tour:    'text-lunavia-accent',     // #00B4D8 — tour discovery & management
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
                <NavItem href="/dashboard/guide/availability" icon={CalendarCheck} active={isActive('/dashboard/guide/availability')} iconColor={IC.work}>
                    {t('links.availability')}
                </NavItem>
                <NavItem href="/dashboard/guide/calendar" icon={Calendar} active={isActive('/dashboard/guide/calendar')} iconColor={IC.work}>
                    {t('links.calendar')}
                </NavItem>
                <NavItem href="/dashboard/guide/standby-requests" icon={Clock} active={isActive('/dashboard/guide/standby-requests')} iconColor={IC.tour}>
                    {t('links.standbyRequests')}
                </NavItem>
                <NavItem href="/dashboard/guide/portfolio" icon={Briefcase} active={isActive('/dashboard/guide/portfolio')} iconColor={IC.brand}>
                    {t('links.portfolio')}
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
                <NavItem href="/dashboard/guide/profile" icon={User} active={isActive('/dashboard/guide/profile')} iconColor={IC.account}>
                    {t('links.profile')}
                </NavItem>
                <NavItem href="/dashboard/guide/profile/trust" icon={Award} active={isActive('/dashboard/guide/profile/trust')} iconColor={IC.brand}>
                    {t('links.trustScore')}
                </NavItem>
                <NavItem href="/dashboard/guide/contract" icon={FileSignature} active={isActive('/dashboard/guide/contract')} iconColor={IC.account}>
                    {t('links.contract')}
                </NavItem>
                <NavItem href="/dashboard/account/subscription" icon={Star} active={isActive('/dashboard/account/subscription')} iconColor={IC.finance}>
                    {t('links.subscription')}
                </NavItem>
                <NavItem href="/dashboard/guide/settings" icon={Settings} active={isActive('/dashboard/guide/settings')} iconColor={IC.account}>
                    {t('links.settings')}
                </NavItem>
                <NavItem href="/dashboard/guide/verification" icon={CheckCircle} active={isActive('/dashboard/guide/verification')} iconColor={IC.work}>
                    {t('links.verification')}
                </NavItem>
                <NavItem href="/dashboard/notifications" icon={Bell} active={isActive('/dashboard/notifications')} iconColor={IC.account}>
                    {t('links.notifications')}
                </NavItem>
                <NavItem href="/messages" icon={MessageCircle} active={isActive('/messages')} iconColor={IC.brand}>
                    {t('links.messages')}
                </NavItem>
            </NavSection>
        </SidebarShell>
    );
}
