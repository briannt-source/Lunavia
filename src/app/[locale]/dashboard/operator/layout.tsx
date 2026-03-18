import { ReactNode } from 'react';
import Topbar from '@/components/layout/Topbar';
import OperatorSidebar from '@/components/sidebar/OperatorSidebar';
import { DensityProvider } from '@/components/density/DensityProvider';
import TourReminderPopup from '@/components/tour/TourReminderPopup';

export default function OperatorLayout({ children }: { children: ReactNode }) {
  return (
    <DensityProvider>
      <div className="flex min-h-screen bg-gray-50">
        <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r bg-white hidden lg:block">
          <OperatorSidebar />
        </aside>
        <div className="flex flex-1 flex-col lg:pl-64 transition-all duration-300">
          <Topbar role="TOUR_OPERATOR" />
          <main className="flex-1 p-6">{children}</main>
        </div>
        <TourReminderPopup />
      </div>
    </DensityProvider>
  );
}
