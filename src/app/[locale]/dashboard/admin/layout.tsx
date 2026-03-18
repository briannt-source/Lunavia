import { ReactNode } from 'react';
import Topbar from '@/components/layout/Topbar';
import { DensityProvider } from '@/components/density/DensityProvider';
import AdminSidebar from '@/components/sidebar/AdminSidebar';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <DensityProvider>
      <div className="flex min-h-screen bg-gray-50">
        <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r bg-white hidden lg:block">
          <AdminSidebar />
        </aside>
        <div className="flex flex-1 flex-col lg:pl-64 transition-all duration-300">
          <Topbar />
          <main className="flex-1 p-8">
            {children}
          </main>
        </div>
      </div>
    </DensityProvider>
  );
}
