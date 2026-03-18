"use client";
import { NavLink } from '@/components/NavLink';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import useSWR from 'swr';
import { useTranslations } from 'next-intl';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function AdminSidebar() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const role = user?.role;
  const t = useTranslations('Dashboard.Sidebar');

  // ── Role-based visibility ──────────────────────────────────────
  const isSuperAdmin = role === 'SUPER_ADMIN';
  const isOps = role === 'OPS' || isSuperAdmin;
  const isFinance = role === 'FINANCE' || isSuperAdmin;
  const isKycAnalyst = role === 'KYC_ANALYST' || isSuperAdmin;

  const [escrowOpen, setEscrowOpen] = useState(true);

  // Auto-refresh stats every 60s
  const { data: stats } = useSWR(isOps || isFinance ? '/api/admin/pending-stats' : null, fetcher, {
      refreshInterval: 60000,
      revalidateOnFocus: true,
  });

  const renderBadge = (count?: number) => {
      if (!count) return null;
      return (
          <span className="ml-2 bg-rose-500 text-white py-0.5 px-2 rounded-full text-[10px] font-bold leading-none shadow-sm">
              {count > 99 ? '99+' : count}
          </span>
      );
  };

  const pendingEscrow = (stats?.topups || 0) + (stats?.withdrawals || 0);

  return (
    <nav className="flex flex-col h-full bg-white border-r border-gray-200 w-64">
      <div className="p-4 space-y-0.5 overflow-y-auto flex-1 text-sm font-medium">

        {/* ── Command Center ─────────────────────────────────── */}
        <SidebarHeading>{t('sections.commandCenter')}</SidebarHeading>
        <NavLink href="/dashboard/admin">{t('links.dashboard')}</NavLink>
        {isOps && <NavLink href="/dashboard/admin/god-mode">{t('links.godMode')}</NavLink>}
        {isOps && <NavLink href="/dashboard/admin/fleet">{t('links.globalFleet')}</NavLink>}
        <NavLink href="/dashboard/admin/analytics">{t('links.analytics')}</NavLink>

        {/* ── Operations ─────────────────────────────────────── */}
        {(isOps || isKycAnalyst) && (
          <>
            <SidebarHeading>{t('sections.operations')}</SidebarHeading>
            {isOps && <NavLink href="/dashboard/admin/users">{t('links.marketplaceUsers')}</NavLink>}
            {isOps && <NavLink href="/dashboard/admin/tours">{t('links.tourControl')}</NavLink>}
            {(isOps || isKycAnalyst) && (
              <NavLink href="/dashboard/admin/verification">
                <span>{t('links.verification')}</span>
                {renderBadge(stats?.verifications)}
              </NavLink>
            )}
            {isOps && <NavLink href="/dashboard/admin/incidents">{t('links.incidents')}</NavLink>}
            {isOps && <NavLink href="/dashboard/admin/disputes">{t('links.disputeRes')}</NavLink>}
            {isOps && <NavLink href="/dashboard/admin/cancellation">{t('links.cancellations')}</NavLink>}
            {isOps && <NavLink href="/dashboard/admin/risk">{t('links.risk')}</NavLink>}
            {isOps && <NavLink href="/dashboard/admin/feedback">{t('links.feedback')}</NavLink>}
          </>
        )}

        {/* ── Finance ────────────────────────────────────────── */}
        {isFinance && (
          <>
            <SidebarHeading>{t('sections.finance')}</SidebarHeading>
            <NavLink href="/dashboard/admin/finance/omniscience">{t('links.omniscience')}</NavLink>

            {/* Escrow Sub-menu */}
            <button
              onClick={() => setEscrowOpen(!escrowOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <span className="flex items-center gap-2">
                {t('links.escrow')}
              </span>
              <div className="flex items-center gap-2">
                {!escrowOpen && renderBadge(pendingEscrow)}
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${escrowOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            {escrowOpen && (
              <div className="ml-4 border-l border-gray-100 pl-2 space-y-0.5">
                <NavLink href="/dashboard/admin/finance/escrow/topups">
                    <span>{t('links.topups')}</span>
                    {renderBadge(stats?.topups)}
                </NavLink>
                <NavLink href="/dashboard/admin/finance/escrow/withdrawals">
                    <span>{t('links.withdrawals')}</span>
                    {renderBadge(stats?.withdrawals)}
                </NavLink>
                <NavLink href="/dashboard/admin/finance/escrow/ledger">{t('links.ledger')}</NavLink>
              </div>
            )}

            <NavLink href="/dashboard/admin/finance/revenue/subscriptions">
                <span>{t('links.subscriptions')}</span>
                {renderBadge(stats?.subscriptions)}
            </NavLink>
            <NavLink href="/dashboard/admin/vouchers">{t('links.vouchers')}</NavLink>
            <NavLink href="/dashboard/admin/referral">{t('links.referrals')}</NavLink>
            <NavLink href="/dashboard/admin/settings/bank">{t('links.bankSettings')}</NavLink>
          </>
        )}

        {/* ── System (SUPER_ADMIN only) ──────────────────────── */}
        {isSuperAdmin && (
          <>
            <SidebarHeading>{t('sections.system')}</SidebarHeading>
            <NavLink href="/dashboard/admin/staff">{t('links.staff')}</NavLink>
            <NavLink href="/dashboard/admin/maintenance">{t('links.maintenance')}</NavLink>
            <NavLink href="/dashboard/admin/permissions">{t('links.permissions')}</NavLink>
            <NavLink href="/dashboard/admin/governance">{t('links.governance')}</NavLink>
            <NavLink href="/dashboard/admin/pilot">{t('links.systemHealth')}</NavLink>
            <NavLink href="/dashboard/admin/simulation">{t('links.simulation')}</NavLink>
          </>
        )}

        {/* ── Pitch Mode ─────────────────────────────────────── */}
        {(isSuperAdmin || isFinance) && (
          <>
            <SidebarHeading>{t('sections.pitchMode')}</SidebarHeading>
            <NavLink href="/dashboard/admin/investor">{t('links.investor')}</NavLink>
            <NavLink href="/dashboard/admin/demo">{t('links.demo')}</NavLink>
          </>
        )}
      </div>

      <div className="p-4 border-t border-gray-200">
        <NavLink href="/dashboard/admin/profile">{t('links.myProfile')}</NavLink>
      </div>
    </nav>
  );
}

function SidebarHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-7 mb-1 px-3 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">
      {children}
    </div>
  );
}
