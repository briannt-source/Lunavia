import { ReactNode } from 'react';
import GuideSidebar from '@/components/sidebar/GuideSidebar';
import { DensityProvider } from '@/components/density/DensityProvider';
import TourReminderPopup from '@/components/tour/TourReminderPopup';

export default function GuideLayout({ children }: { children: ReactNode }) {
  return (
    <DensityProvider>
      <div className="flex min-h-screen bg-gray-50">
        <aside className="w-56 border-r bg-white">
          <GuideSidebar />
        </aside>
        <main className="flex-1 p-6">{children}</main>
        <TourReminderPopup />
      </div>
    </DensityProvider>
  );
}
