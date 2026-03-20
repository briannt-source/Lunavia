"use client";

import SidebarShell, { NavItem, NavSection, useIsActive } from './SidebarShell';
import { FeatureGate } from '@/components/plans/FeatureGate';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function OperatorSidebar() {
    const pathname = usePathname();
    const isActive = useIsActive();
    const { data: session } = useSession();
    const user = session?.user as any;
    const isInternalOps = user?.plan?.startsWith('OPS_');
    const t = useTranslations('Dashboard.Sidebar');

    return (
        <SidebarShell brandColor="text-indigo-600" roleLabel={t('footer.tourOperator')}>
            {/* Core */}
            <NavSection>
                <NavItem href="/dashboard/operator" icon="📊" active={pathname === '/dashboard/operator'}>
                    {t('links.dashboard')}
                </NavItem>
                <NavItem href="/dashboard/operator/tours" icon="📋" active={isActive('/dashboard/operator/tours')}>
                    {t('links.myTours')}
                </NavItem>
            </NavSection>

            {/* Team & Marketplace */}
            <NavSection title={user?.systemMode === 'INTERNAL_OPERATOR_MODE' ? t('sections.team') : t('sections.teamMarketplace')}>
                <FeatureGate
                    feature="TEAM_MANAGEMENT"
                    fallback={<NavItem href="#" icon="👥" locked badgeLabel="PRO">{t('links.myTeam')}</NavItem>}
                >
                    <NavItem href="/dashboard/operator/team" icon="👥" active={isActive('/dashboard/operator/team')}>
                        {t('links.myTeam')}
                    </NavItem>
                </FeatureGate>
                {user?.systemMode !== 'INTERNAL_OPERATOR_MODE' && (
                    <NavItem href="/marketplace/guides" icon="🔍" active={isActive('/marketplace/guides')}>
                        {t('links.discoverGuides')}
                    </NavItem>
                )}
            </NavSection>

            {/* Finance */}
            {user?.systemMode !== 'INTERNAL_OPERATOR_MODE' && (
                <NavSection title={t('sections.finance')}>
                    <NavItem href="/dashboard/operator/wallet" icon="💳" active={isActive('/dashboard/operator/wallet')}>
                        {t('links.wallet')}
                    </NavItem>
                    <NavItem href="/dashboard/operator/finance" icon="💰" active={isActive('/dashboard/operator/finance')}>
                        {t('links.commission')}
                    </NavItem>
                </NavSection>
            )}

            {/* Operations */}
            <NavSection title={t('sections.operations')}>
                <NavItem href="/dashboard/operator/fleet" icon="🗺️" active={isActive('/dashboard/operator/fleet')}>
                    {t('links.liveFleetTracking')}
                </NavItem>
                <FeatureGate
                    feature="COMMAND_CENTER"
                    fallback={
                        <NavItem href="#" icon="🖥️" locked badgeLabel={isInternalOps ? 'OPS' : 'PRO'}>
                            {t('links.commandCenter')}
                        </NavItem>
                    }
                >
                    <NavItem href="/dashboard/operator/command-center" icon="🖥️" active={isActive('/dashboard/operator/command-center')}>
                        {t('links.commandCenter')}
                    </NavItem>
                </FeatureGate>
                <FeatureGate
                    feature="OPS_INSIGHTS"
                    fallback={
                        <NavItem href="#" icon="📈" locked badgeLabel={isInternalOps ? 'OPS_BUSINESS' : 'PRO'}>
                            {t('links.insights')}
                        </NavItem>
                    }
                >
                    <NavItem href="/dashboard/operator/insights" icon="📈" active={isActive('/dashboard/operator/insights')}>
                        {t('links.insights')}
                    </NavItem>
                </FeatureGate>
                <NavItem href="/dashboard/operator/disputes" icon="⚖️" active={isActive('/dashboard/operator/disputes')}>
                    {t('links.disputes')}
                </NavItem>
                <NavItem href="/dashboard/operator/blacklist" icon="🚫" active={isActive('/dashboard/operator/blacklist')}>
                    {t('links.guideBlacklist')}
                </NavItem>
            </NavSection>

            {/* Account */}
            <NavSection title={t('sections.account')}>
                <NavItem href="/dashboard/operator/profile" icon="👤" active={isActive('/dashboard/operator/profile')}>
                    {t('links.profile')}
                </NavItem>
                <NavItem href="/dashboard/operator/portfolio" icon="💼" active={isActive('/dashboard/operator/portfolio')}>
                    {t('links.portfolio')}
                </NavItem>
                <NavItem href="/dashboard/account/subscription" icon="⭐" active={isActive('/dashboard/account/subscription')}>
                    {t('links.subscription')}
                </NavItem>
                <NavItem href="/dashboard/operator/verification" icon="🛡️" active={isActive('/dashboard/operator/verification')}>
                    {t('links.verification')}
                </NavItem>
                <NavItem href="/dashboard/operator/settings" icon="⚙️" active={isActive('/dashboard/operator/settings')}>
                    {t('links.settings')}
                </NavItem>
            </NavSection>
        </SidebarShell>
    );
}
