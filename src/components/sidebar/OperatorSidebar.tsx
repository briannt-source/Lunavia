"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { FeatureGate } from '@/components/plans/FeatureGate';
import { useTranslations } from 'next-intl';

function NavItem({ href, icon, children, active }: { href: string; icon: string; children: React.ReactNode; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${active
        ? 'bg-indigo-50 text-indigo-700'
        : 'text-gray-600 hover:bg-gray-100'
        }`}
    >
      <span className="text-base">{icon}</span>
      {children}
    </Link>
  );
}

function NavSection({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      {title && (
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

function LockedNavItem({ icon, label, badgeLabel = 'PRO' }: { icon: string; label: string; badgeLabel?: string }) {
  return (
    <div className="rounded-lg px-3 py-2 text-sm">
      <div className="flex items-center gap-2.5 font-medium text-gray-400 cursor-not-allowed">
        <span className="text-base">{icon}</span>
        <span className="flex-1">{label}</span>
        <span className="text-[10px] font-bold bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">{badgeLabel}</span>
      </div>
    </div>
  );
}

export default function OperatorSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as any;
  const isInternalOps = user?.plan?.startsWith('OPS_');
  const t = useTranslations('Dashboard.Sidebar');

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="border-b border-gray-200 px-4 py-4">
        <Link href="/" className="text-xl font-bold text-indigo-600">
          Lunavia
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-5 overflow-y-auto p-4">
        {/* ── Core ─────────────────── */}
        <NavSection>
          <NavItem href="/dashboard/operator" icon="📊" active={pathname === '/dashboard/operator'}>
            {t('links.dashboard')}
          </NavItem>
          <NavItem href="/dashboard/operator/tours" icon="📋" active={isActive('/dashboard/operator/tours')}>
            {t('links.myTours')}
          </NavItem>
        </NavSection>

        {/* ── Team & Marketplace ──── */}
        <NavSection title={user?.systemMode === 'INTERNAL_OPERATOR_MODE' ? t('sections.team') : t('sections.teamMarketplace')}>
          <FeatureGate
            feature="TEAM_MANAGEMENT"
            fallback={<LockedNavItem icon="👥" label={t('links.myTeam')} />}
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

        {/* ── Finance ─────────────── */}
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

        {/* ── Operations ──────────── */}
        <NavSection title={t('sections.operations')}>
          <NavItem href="/dashboard/operator/fleet" icon="🗺️" active={isActive('/dashboard/operator/fleet')}>
            {t('links.liveFleetTracking')}
          </NavItem>
          <FeatureGate
            feature="COMMAND_CENTER"
            fallback={
              <div className="rounded-lg px-3 py-2 text-sm">
                <div className="flex items-center gap-2.5 font-medium text-gray-400 cursor-not-allowed">
                  <span className="text-base">🖥️</span>
                  <span className="flex-1">{t('links.commandCenter')}</span>
                  <span className="text-[10px] font-bold bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">{isInternalOps ? 'OPS' : 'PRO'}</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-1 ml-7">Live tour monitoring</p>
              </div>
            }
          >
            <NavItem href="/dashboard/operator/command-center" icon="🖥️" active={isActive('/dashboard/operator/command-center')}>
              {t('links.commandCenter')}
            </NavItem>
          </FeatureGate>
          <FeatureGate
            feature="OPS_INSIGHTS"
            fallback={<LockedNavItem icon="📈" label={t('links.insights')} badgeLabel={isInternalOps ? 'OPS_BUSINESS' : 'PRO'} />}
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

        {/* ── Account ─────────────── */}
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
      </nav>

      {/* User Footer */}
      <div className="border-t border-gray-200 p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
            {user?.email?.[0]?.toUpperCase() || 'O'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-gray-900">
              {user?.email || 'Operator'}
            </div>
            <div className="text-xs text-gray-500">{t('footer.tourOperator')}</div>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
        >
          <span>🚪</span>
          {t('footer.logOut')}
        </button>
      </div>
    </div>
  );
}
