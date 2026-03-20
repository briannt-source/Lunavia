"use client";

import SidebarShell, { NavItem, NavSection, useIsActive } from './SidebarShell';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import {
    BarChart3,
    Search,
    ClipboardList,
    Calendar,
    Briefcase,
    Scale,
    User,
    Coins,
    Star,
    Settings,
    CheckCircle,
} from 'lucide-react';

export default function GuideSidebar() {
    const pathname = usePathname();
    const isActive = useIsActive();
    const t = useTranslations('Dashboard.Sidebar');

    return (
        <SidebarShell roleLabel={t('footer.tourGuide')}>
            {/* Core */}
            <NavSection>
                <NavItem href="/dashboard/guide" icon={BarChart3} active={pathname === '/dashboard/guide'}>
                    {t('links.dashboard')}
                </NavItem>
            </NavSection>

            {/* Tours */}
            <NavSection title={t('sections.tours')}>
                <NavItem href="/dashboard/guide/available" icon={Search} active={isActive('/dashboard/guide/available')}>
                    {t('links.marketplace')}
                </NavItem>
                <NavItem href="/dashboard/guide/tours" icon={ClipboardList} active={isActive('/dashboard/guide/tours')}>
                    {t('links.myTours')}
                </NavItem>
                <NavItem href="/dashboard/guide/calendar" icon={Calendar} active={isActive('/dashboard/guide/calendar')}>
                    {t('links.calendar')}
                </NavItem>
                <NavItem href="/dashboard/guide/portfolio" icon={Briefcase} active={isActive('/dashboard/guide/portfolio')}>
                    {t('links.portfolio')}
                </NavItem>
                <NavItem href="/dashboard/guide/disputes" icon={Scale} active={isActive('/dashboard/guide/disputes')}>
                    {t('links.disputes')}
                </NavItem>
            </NavSection>

            {/* Account */}
            <NavSection title={t('sections.account')}>
                <NavItem href="/dashboard/guide/profile" icon={User} active={isActive('/dashboard/guide/profile')}>
                    {t('links.profile')}
                </NavItem>
                <NavItem href="/dashboard/guide/earnings" icon={Coins} active={isActive('/dashboard/guide/earnings')}>
                    {t('links.earnings')}
                </NavItem>
                <NavItem href="/dashboard/account/subscription" icon={Star} active={isActive('/dashboard/account/subscription')}>
                    {t('links.subscription')}
                </NavItem>
                <NavItem href="/dashboard/guide/settings" icon={Settings} active={isActive('/dashboard/guide/settings')}>
                    {t('links.settings')}
                </NavItem>
                <NavItem href="/dashboard/guide/verification" icon={CheckCircle} active={isActive('/dashboard/guide/verification')}>
                    {t('links.verification')}
                </NavItem>
            </NavSection>
        </SidebarShell>
    );
}
