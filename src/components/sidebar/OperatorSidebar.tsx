"use client";

import SidebarShell, { NavItem, NavSection, useIsActive } from './SidebarShell';
import { FeatureGate } from '@/components/plans/FeatureGate';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
    BarChart3,
    ClipboardList,
    Users,
    Search,
    Wallet,
    Coins,
    Receipt,
    Map,
    Monitor,
    TrendingUp,
    Scale,
    Ban,
    Siren,
    Clock,
    FileText,
    User,
    Briefcase,
    Building2,
    Award,
    Star,
    ShieldCheck,
    Settings,
    Bell,
    MessageCircle,
    CreditCard,
} from 'lucide-react';

export default function OperatorSidebar() {
    const pathname = usePathname();
    const isActive = useIsActive();
    const { data: session } = useSession();
    const user = session?.user as any;
    const isInternalOps = user?.plan?.startsWith('OPS_');
    const t = useTranslations('Dashboard.Sidebar');

    return (
        <SidebarShell roleLabel={t('footer.tourOperator')}>
            {/* Core */}
            <NavSection>
                <NavItem href="/dashboard/operator" icon={BarChart3} active={pathname === '/dashboard/operator'}>
                    {t('links.dashboard')}
                </NavItem>
                <NavItem href="/dashboard/operator/tours" icon={ClipboardList} active={isActive('/dashboard/operator/tours')}>
                    {t('links.myTours')}
                </NavItem>
                <NavItem href="/dashboard/operator/applications" icon={FileText} active={isActive('/dashboard/operator/applications')}>
                    {t('links.applications')}
                </NavItem>
            </NavSection>

            {/* Team & Marketplace */}
            <NavSection title={user?.systemMode === 'INTERNAL_OPERATOR_MODE' ? t('sections.team') : t('sections.teamMarketplace')}>
                <FeatureGate
                    feature="TEAM_MANAGEMENT"
                    fallback={<NavItem href="#" icon={Users} locked badgeLabel="PRO">{t('links.myTeam')}</NavItem>}
                >
                    <NavItem href="/dashboard/operator/team" icon={Users} active={isActive('/dashboard/operator/team')}>
                        {t('links.myTeam')}
                    </NavItem>
                </FeatureGate>
                {user?.systemMode !== 'INTERNAL_OPERATOR_MODE' && (
                    <NavItem href="/marketplace/guides" icon={Search} active={isActive('/marketplace/guides')}>
                        {t('links.discoverGuides')}
                    </NavItem>
                )}
            </NavSection>

            {/* Finance */}
            {user?.systemMode !== 'INTERNAL_OPERATOR_MODE' && (
                <NavSection title={t('sections.finance')}>
                    <NavItem href="/dashboard/operator/wallet" icon={Wallet} active={isActive('/dashboard/operator/wallet')}>
                        {t('links.wallet')}
                    </NavItem>
                    <NavItem href="/dashboard/operator/finance" icon={Coins} active={isActive('/dashboard/operator/finance')}>
                        {t('links.commission')}
                    </NavItem>
                    <NavItem href="/dashboard/operator/payments" icon={Receipt} active={isActive('/dashboard/operator/payments')}>
                        {t('links.payments')}
                    </NavItem>
                    <NavItem href="/dashboard/payment-methods" icon={CreditCard} active={isActive('/dashboard/payment-methods')}>
                        {t('links.paymentMethods')}
                    </NavItem>
                </NavSection>
            )}

            {/* Operations */}
            <NavSection title={t('sections.operations')}>
                <NavItem href="/dashboard/operator/fleet" icon={Map} active={isActive('/dashboard/operator/fleet')}>
                    {t('links.liveFleetTracking')}
                </NavItem>
                <FeatureGate
                    feature="COMMAND_CENTER"
                    fallback={
                        <NavItem href="#" icon={Monitor} locked badgeLabel={isInternalOps ? 'OPS' : 'PRO'}>
                            {t('links.commandCenter')}
                        </NavItem>
                    }
                >
                    <NavItem href="/dashboard/operator/command-center" icon={Monitor} active={isActive('/dashboard/operator/command-center')}>
                        {t('links.commandCenter')}
                    </NavItem>
                </FeatureGate>
                <FeatureGate
                    feature="OPS_INSIGHTS"
                    fallback={
                        <NavItem href="#" icon={TrendingUp} locked badgeLabel={isInternalOps ? 'OPS_BUSINESS' : 'PRO'}>
                            {t('links.insights')}
                        </NavItem>
                    }
                >
                    <NavItem href="/dashboard/operator/insights" icon={TrendingUp} active={isActive('/dashboard/operator/insights')}>
                        {t('links.insights')}
                    </NavItem>
                </FeatureGate>
                <NavItem href="/dashboard/operator/emergencies" icon={Siren} active={isActive('/dashboard/operator/emergencies')}>
                    {t('links.emergencies')}
                </NavItem>
                <NavItem href="/dashboard/operator/standby-requests" icon={Clock} active={isActive('/dashboard/operator/standby-requests')}>
                    {t('links.standbyRequests')}
                </NavItem>
                <NavItem href="/dashboard/operator/disputes" icon={Scale} active={isActive('/dashboard/operator/disputes')}>
                    {t('links.disputes')}
                </NavItem>
                <NavItem href="/dashboard/operator/blacklist" icon={Ban} active={isActive('/dashboard/operator/blacklist')}>
                    {t('links.guideBlacklist')}
                </NavItem>
            </NavSection>

            {/* Account */}
            <NavSection title={t('sections.account')}>
                <NavItem href="/dashboard/operator/profile" icon={User} active={isActive('/dashboard/operator/profile')}>
                    {t('links.profile')}
                </NavItem>
                <NavItem href="/dashboard/operator/profile/trust" icon={Award} active={isActive('/dashboard/operator/profile/trust')}>
                    {t('links.trustScore')}
                </NavItem>
                <NavItem href="/dashboard/operator/portfolio" icon={Briefcase} active={isActive('/dashboard/operator/portfolio')}>
                    {t('links.portfolio')}
                </NavItem>
                <NavItem href="/dashboard/operator/company" icon={Building2} active={isActive('/dashboard/operator/company')}>
                    {t('links.company')}
                </NavItem>
                <NavItem href="/dashboard/account/subscription" icon={Star} active={isActive('/dashboard/account/subscription')}>
                    {t('links.subscription')}
                </NavItem>
                <NavItem href="/dashboard/operator/verification" icon={ShieldCheck} active={isActive('/dashboard/operator/verification')}>
                    {t('links.verification')}
                </NavItem>
                <NavItem href="/dashboard/operator/settings" icon={Settings} active={isActive('/dashboard/operator/settings')}>
                    {t('links.settings')}
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
