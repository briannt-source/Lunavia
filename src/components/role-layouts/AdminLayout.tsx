"use client";
import { ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import AdminSidebar from '@/components/sidebar/AdminSidebar';
import Topbar from '@/components/layout/Topbar';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;

  return (
    <div className="flex min-h-screen bg-bg-subtle text-text-main">
      <aside className="w-56 flex-shrink-0 border-r border-border-subtle bg-white">
        <AdminSidebar />
      </aside>
      <div className="flex flex-1 flex-col">
        <Topbar role={userRole} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
