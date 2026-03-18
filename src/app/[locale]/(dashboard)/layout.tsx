import { ReactNode } from 'react';
import OperatorSidebar from '@/components/sidebar/OperatorSidebar';
import GuideSidebar from '@/components/sidebar/GuideSidebar';
import AdminSidebar from '@/components/sidebar/AdminSidebar';
import { headers } from 'next/headers';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = headers().get('x-invoke-path') || '';
  let Sidebar = OperatorSidebar as React.ComponentType;
  if (pathname.startsWith('/dashboard/guide')) Sidebar = GuideSidebar;
  if (pathname.startsWith('/dashboard/admin')) Sidebar = AdminSidebar;
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-56 border-r bg-white">
        <Sidebar />
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
