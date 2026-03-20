import { ReactNode } from 'react';
import GuideSidebar from '@/components/sidebar/GuideSidebar';
import { DensityProvider } from '@/components/density/DensityProvider';
import TourReminderPopup from '@/components/tour/TourReminderPopup';
import MobileDashboardLayout from '@/components/layout/MobileDashboardLayout';
import { GuideBottomNav } from '@/components/layout/BottomNav';

export default function GuideLayout({ children }: { children: ReactNode }) {
  return (
    <DensityProvider>
      <MobileDashboardLayout
        sidebar={<GuideSidebar />}
        role="TOUR_GUIDE"
        bottomNav={<GuideBottomNav />}
        extra={<TourReminderPopup />}
      >
        {children}
      </MobileDashboardLayout>
    </DensityProvider>
  );
}
