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
    CreditCard,
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
                <NavItem href="/dashboard/guide/applications" icon={FileText} active={isActive('/dashboard/guide/applications')}>
                    {t('links.applications')}
                </NavItem>
                <NavItem href="/dashboard/guide/assignments" icon={ClipboardCheck} active={isActive('/dashboard/guide/assignments')}>
                    {t('links.assignments')}
                </NavItem>
                <NavItem href="/dashboard/guide/invites" icon={Mail} active={isActive('/dashboard/guide/invites')}>
                    {t('links.invites')}
                </NavItem>
                <NavItem href="/dashboard/guide/availability" icon={CalendarCheck} active={isActive('/dashboard/guide/availability')}>
                    {t('links.availability')}
                </NavItem>
                <NavItem href="/dashboard/guide/calendar" icon={Calendar} active={isActive('/dashboard/guide/calendar')}>
                    {t('links.calendar')}
                </NavItem>
                <NavItem href="/dashboard/guide/standby-requests" icon={Clock} active={isActive('/dashboard/guide/standby-requests')}>
                    {t('links.standbyRequests')}
                </NavItem>
                <NavItem href="/dashboard/guide/portfolio" icon={Briefcase} active={isActive('/dashboard/guide/portfolio')}>
                    {t('links.portfolio')}
                </NavItem>
                <NavItem href="/dashboard/guide/disputes" icon={Scale} active={isActive('/dashboard/guide/disputes')}>
                    {t('links.disputes')}
                </NavItem>
            </NavSection>

            {/* Finance */}
            <NavSection title={t('sections.finance')}>
                <NavItem href="/dashboard/guide/wallet" icon={Wallet} active={isActive('/dashboard/guide/wallet')}>
                    {t('links.wallet')}
                </NavItem>
                <NavItem href="/dashboard/guide/earnings" icon={Coins} active={isActive('/dashboard/guide/earnings')}>
                    {t('links.earnings')}
                </NavItem>
                <NavItem href="/dashboard/payment-methods" icon={CreditCard} active={isActive('/dashboard/payment-methods')}>
                    {t('links.paymentMethods')}
                </NavItem>
            </NavSection>

            {/* Account */}
            <NavSection title={t('sections.account')}>
                <NavItem href="/dashboard/guide/profile" icon={User} active={isActive('/dashboard/guide/profile')}>
                    {t('links.profile')}
                </NavItem>
                <NavItem href="/dashboard/guide/profile/trust" icon={Award} active={isActive('/dashboard/guide/profile/trust')}>
                    {t('links.trustScore')}
                </NavItem>
                <NavItem href="/dashboard/guide/contract" icon={FileSignature} active={isActive('/dashboard/guide/contract')}>
                    {t('links.contract')}
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
                <NavItem href="/dashboard/notifications" icon={Bell} active={isActive('/dashboard/notifications')}>
                    {t('links.notifications')}
                </NavItem>
                <NavItem href="/messages" icon={MessageCircle} active={isActive('/messages')}>
                    {t('links.messages')}
                </NavItem>
            </NavSection>
        </SidebarShell>
    );
}
