"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

function NavItem({ href, icon, children, active }: { href: string; icon: string; children: React.ReactNode; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${active
        ? 'bg-green-50 text-green-700'
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
    <div className="space-y-1">
      {title && (
        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

export default function GuideSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as any;
  const t = useTranslations('Dashboard.Sidebar');

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="border-b border-gray-200 px-4 py-4">
        <Link href="/" className="text-xl font-bold text-green-600">
          Lunavia
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto p-4">
        <NavSection>
          <NavItem href="/dashboard/guide" icon="📊" active={pathname === '/dashboard/guide'}>
            {t('links.dashboard')}
          </NavItem>
        </NavSection>

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
      </nav>

      {/* User Footer */}
      <div className="border-t border-gray-200 p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-green-700">
            {user?.email?.[0]?.toUpperCase() || 'G'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-gray-900">
              {user?.email || 'Guide'}
            </div>
            <div className="text-xs text-gray-500">{t('footer.tourGuide')}</div>
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
