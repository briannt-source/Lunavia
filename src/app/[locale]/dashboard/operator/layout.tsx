import { ReactNode } from 'react';
import OperatorSidebar from '@/components/sidebar/OperatorSidebar';
import { DensityProvider } from '@/components/density/DensityProvider';
import TourReminderPopup from '@/components/tour/TourReminderPopup';
import MobileDashboardLayout from '@/components/layout/MobileDashboardLayout';
import { OperatorBottomNav } from '@/components/layout/BottomNav';

export default function OperatorLayout({ children }: { children: ReactNode }) {
  return (
    <DensityProvider>
      <MobileDashboardLayout
        sidebar={<OperatorSidebar />}
        role="TOUR_OPERATOR"
        bottomNav={<OperatorBottomNav />}
        extra={<TourReminderPopup />}
      >
        {children}
      </MobileDashboardLayout>
    </DensityProvider>
  );
}
