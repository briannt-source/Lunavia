"use client";

import SidebarShell, { NavItem, NavSection, useIsActive } from './SidebarShell';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import { useTranslations } from 'next-intl';
import { usePathname } from '@/navigation';
import {
    LayoutDashboard,
    Eye,
    Radar,
    BarChart3,
    Users,
    Map,
    ShieldCheck,
    AlertTriangle,
    Scale,
    XCircle,
    ShieldAlert,
    MessageSquare,
    Brain,
    Vault,
    ArrowUpCircle,
    ArrowDownCircle,
    BookOpen,
    CreditCard,
    Ticket,
    Gift,
    Landmark,
    UserCog,
    Wrench,
    Lock,
    Gavel,
    Activity,
    FlaskConical,
    PieChart,
    Monitor,
    User,
    Building2,
    FileText,
    BrainCircuit,
    Banknote,
    Settings,
    ArrowRightLeft,
    Binoculars,
    Shield,
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

const ADMIN_ROLES = ["SUPER_ADMIN", "MODERATOR", "OPS_CS", "FINANCE", "FINANCE_LEAD", "SUPPORT_STAFF"];

export default function AdminSidebar() {
    const { data: session } = useSession();
    const user = session?.user as any;
    const role = user?.role;
    const pathname = usePathname();
    const isActive = useIsActive();
    const t = useTranslations('Dashboard.Sidebar');

    const isSuperAdmin = role === 'SUPER_ADMIN';
    const isModerator = role === 'MODERATOR' || isSuperAdmin;
    const isOps = role === 'OPS_CS' || isModerator;
    const isFinance = role === 'FINANCE' || role === 'FINANCE_LEAD' || isSuperAdmin;
    const isKycAnalyst = role === 'KYC_ANALYST' || isSuperAdmin;

    const { data: stats } = useSWR(isOps || isFinance ? '/api/admin/pending-stats' : null, fetcher, {
        refreshInterval: 60000,
        revalidateOnFocus: true,
    });

    const roleLabel = isSuperAdmin ? 'Super Admin'
        : role === 'MODERATOR' ? 'Moderator'
        : role === 'OPS_CS' ? 'Operations'
        : role === 'FINANCE_LEAD' ? 'Finance Lead'
        : role === 'FINANCE' ? 'Finance'
        : 'Admin';

    return (
        <SidebarShell roleLabel={roleLabel}>
            {/* ── Command Center ─────────────── */}
            <NavSection title={t('sections.commandCenter')}>
                <NavItem href="/dashboard/admin" icon={LayoutDashboard} active={pathname?.endsWith('/admin') || pathname?.endsWith('/admin/')}>
                    {t('links.dashboard')}
                </NavItem>
                {isOps && (
                    <NavItem href="/dashboard/admin/god-mode" icon={Eye} active={isActive('/dashboard/admin/god-mode')}>
                        {t('links.godMode')}
                    </NavItem>
                )}
                {isOps && (
                    <NavItem href="/dashboard/admin/fleet" icon={Radar} active={isActive('/dashboard/admin/fleet')}>
                        {t('links.globalFleet')}
                    </NavItem>
                )}
                <NavItem href="/dashboard/admin/analytics" icon={BarChart3} active={isActive('/dashboard/admin/analytics')}>
                    {t('links.analytics')}
                </NavItem>
            </NavSection>

            {/* ── Operations ────────────────── */}
            {(isOps || isKycAnalyst) && (
                <NavSection title={t('sections.operations')}>
                    {isOps && (
                        <NavItem href="/dashboard/admin/users" icon={Users} active={isActive('/dashboard/admin/users')}>
                            {t('links.marketplaceUsers')}
                        </NavItem>
                    )}
                    {isOps && (
                        <NavItem href="/dashboard/admin/companies" icon={Building2} active={isActive('/dashboard/admin/companies')}>
                            {t('links.companies')}
                        </NavItem>
                    )}
                    {isOps && (
                        <NavItem href="/dashboard/admin/tours" icon={Map} active={isActive('/dashboard/admin/tours')}>
                            {t('links.tourControl')}
                        </NavItem>
                    )}
                    {(isOps || isKycAnalyst) && (
                        <NavItem href="/dashboard/admin/verification" icon={ShieldCheck} active={isActive('/dashboard/admin/verification')} badge={stats?.verifications}>
                            {t('links.verification')}
                        </NavItem>
                    )}
                    {isOps && (
                        <NavItem href="/dashboard/admin/incidents" icon={AlertTriangle} active={isActive('/dashboard/admin/incidents')}>
                            {t('links.incidents')}
                        </NavItem>
                    )}
                    {isOps && (
                        <NavItem href="/dashboard/admin/disputes" icon={Scale} active={isActive('/dashboard/admin/disputes')}>
                            {t('links.disputeRes')}
                        </NavItem>
                    )}
                    {isOps && (
                        <NavItem href="/dashboard/admin/cancellation" icon={XCircle} active={isActive('/dashboard/admin/cancellation')}>
                            {t('links.cancellations')}
                        </NavItem>
                    )}
                    {isOps && (
                        <NavItem href="/dashboard/admin/risk" icon={ShieldAlert} active={isActive('/dashboard/admin/risk')}>
                            {t('links.risk')}
                        </NavItem>
                    )}
                    {isOps && (
                        <NavItem href="/dashboard/admin/requests" icon={FileText} active={isActive('/dashboard/admin/requests')}>
                            {t('links.serviceRequests')}
                        </NavItem>
                    )}
                    {isOps && (
                        <NavItem href="/dashboard/admin/feedback" icon={MessageSquare} active={isActive('/dashboard/admin/feedback')}>
                            {t('links.feedback')}
                        </NavItem>
                    )}
                    {isSuperAdmin && (
                        <NavItem href="/dashboard/admin/platform-intelligence" icon={BrainCircuit} active={isActive('/dashboard/admin/platform-intelligence')}>
                            {t('links.platformIntelligence')}
                        </NavItem>
                    )}
                </NavSection>
            )}

            {/* ── Finance ──────────────────── */}
            {isFinance && (
                <NavSection title={t('sections.finance')}>
                    <NavItem href="/dashboard/admin/finance/omniscience" icon={Brain} active={isActive('/dashboard/admin/finance/omniscience')}>
                        {t('links.omniscience')}
                    </NavItem>

                    {/* Escrow sub-section */}
                    <NavSection title={t('links.escrow')} defaultOpen={true}>
                        <NavItem href="/dashboard/admin/finance/escrow/topups" icon={ArrowUpCircle} active={isActive('/dashboard/admin/finance/escrow/topups')} badge={stats?.topups}>
                            {t('links.topups')}
                        </NavItem>
                        <NavItem href="/dashboard/admin/finance/escrow/withdrawals" icon={ArrowDownCircle} active={isActive('/dashboard/admin/finance/escrow/withdrawals')} badge={stats?.withdrawals}>
                            {t('links.withdrawals')}
                        </NavItem>
                        <NavItem href="/dashboard/admin/finance/escrow/ledger" icon={BookOpen} active={isActive('/dashboard/admin/finance/escrow/ledger')}>
                            {t('links.ledger')}
                        </NavItem>
                    </NavSection>

                    <NavItem href="/dashboard/admin/payments" icon={Banknote} active={isActive('/dashboard/admin/payments')}>
                        {t('links.paymentOverview')}
                    </NavItem>
                    <NavItem href="/dashboard/admin/transfers" icon={ArrowRightLeft} active={isActive('/dashboard/admin/transfers')}>
                        {t('links.transfers')}
                    </NavItem>
                    <NavItem href="/dashboard/admin/finance/revenue/subscriptions" icon={CreditCard} active={isActive('/dashboard/admin/finance/revenue/subscriptions')} badge={stats?.subscriptions}>
                        {t('links.subscriptions')}
                    </NavItem>
                    <NavItem href="/dashboard/admin/vouchers" icon={Ticket} active={isActive('/dashboard/admin/vouchers')}>
                        {t('links.vouchers')}
                    </NavItem>
                    <NavItem href="/dashboard/admin/referral" icon={Gift} active={isActive('/dashboard/admin/referral')}>
                        {t('links.referrals')}
                    </NavItem>
                    <NavItem href="/dashboard/admin/payment-settings" icon={Settings} active={isActive('/dashboard/admin/payment-settings')}>
                        {t('links.paymentSettings')}
                    </NavItem>
                    <NavItem href="/dashboard/admin/settings/bank" icon={Landmark} active={isActive('/dashboard/admin/settings/bank')}>
                        {t('links.bankSettings')}
                    </NavItem>
                </NavSection>
            )}

            {/* ── System ───────────────────── */}
            {isSuperAdmin && (
                <NavSection title={t('sections.system')}>
                    <NavItem href="/dashboard/admin/staff" icon={UserCog} active={isActive('/dashboard/admin/staff')}>
                        {t('links.staff')}
                    </NavItem>
                    <NavItem href="/dashboard/admin/admins" icon={Shield} active={isActive('/dashboard/admin/admins')}>
                        {t('links.adminManagement')}
                    </NavItem>
                    <NavItem href="/dashboard/admin/maintenance" icon={Wrench} active={isActive('/dashboard/admin/maintenance')}>
                        {t('links.maintenance')}
                    </NavItem>
                    <NavItem href="/dashboard/admin/permissions" icon={Lock} active={isActive('/dashboard/admin/permissions')}>
                        {t('links.permissions')}
                    </NavItem>
                    <NavItem href="/dashboard/admin/governance" icon={Gavel} active={isActive('/dashboard/admin/governance')}>
                        {t('links.governance')}
                    </NavItem>
                    <NavItem href="/dashboard/admin/pilot" icon={Activity} active={isActive('/dashboard/admin/pilot')}>
                        {t('links.systemHealth')}
                    </NavItem>
                    <NavItem href="/dashboard/admin/simulation" icon={FlaskConical} active={isActive('/dashboard/admin/simulation')}>
                        {t('links.simulation')}
                    </NavItem>
                    <NavItem href="/dashboard/observer" icon={Binoculars} active={isActive('/dashboard/observer')}>
                        {t('links.observer')}
                    </NavItem>
                </NavSection>
            )}

            {/* ── Pitch Mode ───────────────── */}
            {(isSuperAdmin || isFinance) && (
                <NavSection title={t('sections.pitchMode')}>
                    <NavItem href="/dashboard/admin/investor" icon={PieChart} active={isActive('/dashboard/admin/investor')}>
                        {t('links.investor')}
                    </NavItem>
                    <NavItem href="/dashboard/admin/demo" icon={Monitor} active={isActive('/dashboard/admin/demo')}>
                        {t('links.demo')}
                    </NavItem>
                </NavSection>
            )}

            {/* ── Profile ──────────────────── */}
            <NavSection>
                <NavItem href="/dashboard/admin/profile" icon={User} active={isActive('/dashboard/admin/profile')}>
                    {t('links.myProfile')}
                </NavItem>
                <NavItem href="/dashboard/admin/settings" icon={Settings} active={isActive('/dashboard/admin/settings')}>
                    {t('links.adminSettings')}
                </NavItem>
            </NavSection>
        </SidebarShell>
    );
}
