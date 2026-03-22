"use client";

import SidebarShell, { NavItem, NavSection, useIsActive } from './SidebarShell';
import { FeatureGate } from '@/components/plans/FeatureGate';
import { useTranslations } from 'next-intl';
import { usePathname } from '@/navigation';
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
} from 'lucide-react';

// Icon color groups — consistent visual hierarchy
const IC = {
    brand:   'text-lunavia-primary',   // #2E8BC0 — core navigation
    tour:    'text-lunavia-accent',     // #5BA4CF — tour & team
    ops:     'text-green-500',          // operations & tracking
    finance: 'text-amber-500',         // money-related
    alert:   'text-red-400',           // emergencies, disputes, risk
    account: 'text-gray-400',          // profile & settings (muted)
};

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
                <NavItem href="/dashboard/operator" icon={BarChart3} active={pathname === '/dashboard/operator'} iconColor={IC.brand}>
                    {t('links.dashboard')}
                </NavItem>
                <NavItem href="/dashboard/operator/tours" icon={ClipboardList} active={isActive('/dashboard/operator/tours') || isActive('/dashboard/operator/request')} iconColor={IC.brand}>
                    {t('links.tourManagement')}
                </NavItem>
                <NavItem href="/dashboard/operator/applications" icon={FileText} active={isActive('/dashboard/operator/applications')} iconColor={IC.tour}>
                    {t('links.applications')}
                </NavItem>
            </NavSection>

            {/* Team & Marketplace */}
            <NavSection title={user?.systemMode === 'INTERNAL_OPERATOR_MODE' ? t('sections.team') : t('sections.teamMarketplace')}>
                <FeatureGate
                    feature="TEAM_MANAGEMENT"
                    fallback={<NavItem href="#" icon={Users} locked badgeLabel="PRO" iconColor={IC.tour}>{t('links.myTeam')}</NavItem>}
                >
                    <NavItem href="/dashboard/operator/team" icon={Users} active={isActive('/dashboard/operator/team')} iconColor={IC.tour}>
                        {t('links.myTeam')}
                    </NavItem>
                </FeatureGate>
                {user?.systemMode !== 'INTERNAL_OPERATOR_MODE' && (
                    <NavItem href="/dashboard/operator/marketplace" icon={Search} active={isActive('/dashboard/operator/marketplace')} iconColor={IC.tour}>
                        {t('links.discoverGuides')}
                    </NavItem>
                )}
            </NavSection>

            {/* Finance */}
            {user?.systemMode !== 'INTERNAL_OPERATOR_MODE' && (
                <NavSection title={t('sections.finance')}>
                    <NavItem href="/dashboard/operator/wallet" icon={Wallet} active={isActive('/dashboard/operator/wallet')} iconColor={IC.finance}>
                        {t('links.wallet')}
                    </NavItem>
                    <NavItem href="/dashboard/operator/finance" icon={Coins} active={isActive('/dashboard/operator/finance')} iconColor={IC.finance}>
                        {t('links.commission')}
                    </NavItem>
                    <NavItem href="/dashboard/operator/payments" icon={Receipt} active={isActive('/dashboard/operator/payments')} iconColor={IC.finance}>
                        {t('links.payments')}
                    </NavItem>
                </NavSection>
            )}

            {/* Operations */}
            <NavSection title={t('sections.operations')}>
                <NavItem href="/dashboard/operator/fleet" icon={Map} active={isActive('/dashboard/operator/fleet')} iconColor={IC.ops}>
                    {t('links.liveFleetTracking')}
                </NavItem>
                <FeatureGate
                    feature="COMMAND_CENTER"
                    fallback={
                        <NavItem href="#" icon={Monitor} locked badgeLabel={isInternalOps ? 'OPS' : 'PRO'} iconColor={IC.ops}>
                            {t('links.commandCenter')}
                        </NavItem>
                    }
                >
                    <NavItem href="/dashboard/operator/command-center" icon={Monitor} active={isActive('/dashboard/operator/command-center')} iconColor={IC.ops}>
                        {t('links.commandCenter')}
                    </NavItem>
                </FeatureGate>
                <FeatureGate
                    feature="OPS_INSIGHTS"
                    fallback={
                        <NavItem href="#" icon={TrendingUp} locked badgeLabel={isInternalOps ? 'OPS_BUSINESS' : 'PRO'} iconColor={IC.ops}>
                            {t('links.insights')}
                        </NavItem>
                    }
                >
                    <NavItem href="/dashboard/operator/insights" icon={TrendingUp} active={isActive('/dashboard/operator/insights')} iconColor={IC.ops}>
                        {t('links.insights')}
                    </NavItem>
                </FeatureGate>
                <NavItem href="/dashboard/operator/emergencies" icon={Siren} active={isActive('/dashboard/operator/emergencies')} iconColor={IC.alert}>
                    {t('links.emergencies')}
                </NavItem>
                <NavItem href="/dashboard/operator/standby-requests" icon={Clock} active={isActive('/dashboard/operator/standby-requests')} iconColor={IC.tour}>
                    {t('links.standbyRequests')}
                </NavItem>
                <NavItem href="/dashboard/operator/disputes" icon={Scale} active={isActive('/dashboard/operator/disputes')} iconColor={IC.alert}>
                    {t('links.disputes')}
                </NavItem>
                <NavItem href="/dashboard/operator/blacklist" icon={Ban} active={isActive('/dashboard/operator/blacklist')} iconColor={IC.alert}>
                    {t('links.guideBlacklist')}
                </NavItem>
            </NavSection>

            {/* Account */}
            <NavSection title={t('sections.account')}>
                <NavItem href="/dashboard/operator/profile" icon={User} active={isActive('/dashboard/operator/profile') || isActive('/dashboard/operator/profile/trust') || isActive('/dashboard/operator/portfolio') || isActive('/dashboard/operator/company') || isActive('/dashboard/operator/settings')} iconColor={IC.account}>
                    {t('links.profile')}
                </NavItem>
            </NavSection>
        </SidebarShell>
    );
}
