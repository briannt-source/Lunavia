"use client";

import SidebarShell, { NavItem, NavSection, useIsActive } from './SidebarShell';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

export default function GuideSidebar() {
    const pathname = usePathname();
    const isActive = useIsActive();
    const t = useTranslations('Dashboard.Sidebar');

    return (
        <SidebarShell brandColor="text-emerald-600" roleLabel={t('footer.tourGuide')}>
            {/* Core */}
            <NavSection>
                <NavItem href="/dashboard/guide" icon="📊" active={pathname === '/dashboard/guide'}>
                    {t('links.dashboard')}
                </NavItem>
            </NavSection>

            {/* Tours */}
            <NavSection title={t('sections.tours')}>
                <NavItem href="/dashboard/guide/available" icon="🔍" active={isActive('/dashboard/guide/available')}>
                    {t('links.marketplace')}
                </NavItem>
                <NavItem href="/dashboard/guide/tours" icon="📋" active={isActive('/dashboard/guide/tours')}>
                    {t('links.myTours')}
                </NavItem>
                <NavItem href="/dashboard/guide/calendar" icon="📅" active={isActive('/dashboard/guide/calendar')}>
                    {t('links.calendar')}
                </NavItem>
                <NavItem href="/dashboard/guide/portfolio" icon="💼" active={isActive('/dashboard/guide/portfolio')}>
                    {t('links.portfolio')}
                </NavItem>
                <NavItem href="/dashboard/guide/disputes" icon="⚖️" active={isActive('/dashboard/guide/disputes')}>
                    {t('links.disputes')}
                </NavItem>
            </NavSection>

            {/* Account */}
            <NavSection title={t('sections.account')}>
                <NavItem href="/dashboard/guide/profile" icon="👤" active={isActive('/dashboard/guide/profile')}>
                    {t('links.profile')}
                </NavItem>
                <NavItem href="/dashboard/guide/earnings" icon="💰" active={isActive('/dashboard/guide/earnings')}>
                    {t('links.earnings')}
                </NavItem>
                <NavItem href="/dashboard/account/subscription" icon="⭐" active={isActive('/dashboard/account/subscription')}>
                    {t('links.subscription')}
                </NavItem>
                <NavItem href="/dashboard/guide/settings" icon="⚙️" active={isActive('/dashboard/guide/settings')}>
                    {t('links.settings')}
                </NavItem>
                <NavItem href="/dashboard/guide/verification" icon="✓" active={isActive('/dashboard/guide/verification')}>
                    {t('links.verification')}
                </NavItem>
            </NavSection>
        </SidebarShell>
    );
}
