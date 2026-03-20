import { ReactNode } from 'react';
import { DensityProvider } from '@/components/density/DensityProvider';
import AdminSidebar from '@/components/sidebar/AdminSidebar';
import MobileDashboardLayout from '@/components/layout/MobileDashboardLayout';
import { AdminBottomNav } from '@/components/layout/BottomNav';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <DensityProvider>
      <MobileDashboardLayout
        sidebar={<AdminSidebar />}
        role="ADMIN"
        bottomNav={<AdminBottomNav />}
      >
        {children}
      </MobileDashboardLayout>
    </DensityProvider>
  );
}
