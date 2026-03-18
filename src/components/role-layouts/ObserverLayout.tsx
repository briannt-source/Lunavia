"use client";
import { ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { PolicyGuard } from '@/components/policy/PolicyGuard';
import { PolicyAction } from '@/domain/policy';
import Topbar from '@/components/layout/Topbar';

export default function ObserverLayout({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;

  return (
    <div className="flex min-h-screen bg-bg-subtle text-text-main">
      <div className="flex flex-1 flex-col">
        <Topbar role={userRole} />
        <main className="flex-1 p-6">
          <PolicyGuard action={PolicyAction.VIEW_OBSERVER_DASHBOARD}>{children}</PolicyGuard>
        </main>
      </div>
    </div>
  );
}
