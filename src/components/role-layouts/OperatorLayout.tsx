"use client";
import { ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import OperatorSidebar from '@/components/sidebar/OperatorSidebar';
import Topbar from '@/components/layout/Topbar';
import TrustBanner from '@/components/trust/TrustBanner';

export default function OperatorLayout({ children }: { children: ReactNode }) {
  const { data: session } = useSession();

  return (
    <div className="flex min-h-screen bg-bg-subtle text-text-main">
      <aside className="w-56 flex-shrink-0 border-r border-border-subtle bg-white">
        <OperatorSidebar />
      </aside>
      <div className="flex flex-1 flex-col">
        <Topbar role="TOUR_OPERATOR" />
        <main className="flex-1 p-6">
          <TrustBanner />
          {children}
        </main>
      </div>
    </div>
  );
}
