"use client";
import { ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import GuideSidebar from '@/components/sidebar/GuideSidebar';
import Topbar from '@/components/layout/Topbar';
import TrustBanner from '@/components/trust/TrustBanner';

export default function GuideLayout({ children }: { children: ReactNode }) {
  const { data: session } = useSession();

  return (
    <div className="flex min-h-screen bg-bg-subtle text-text-main">
      <aside className="w-56 flex-shrink-0 border-r border-border-subtle bg-white">
        <GuideSidebar />
      </aside>
      <div className="flex flex-1 flex-col">
        <Topbar role="TOUR_GUIDE" />
        <main className="flex-1 p-6">
          <TrustBanner />
          {children}
        </main>
      </div>
    </div>
  );
}
