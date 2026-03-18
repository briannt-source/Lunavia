import MarketingNavbar from '@/components/marketing/MarketingNavbar';
import Link from 'next/link';
import MarketingFooter from '@/components/marketing/MarketingFooter';

export const metadata = {
    title: 'Lunavia — Tour Operations & Guide Marketplace Platform',
    description: 'Tour management, guide marketplace, escrow payment, and governance — in one platform. Choose Marketplace or Operations plans.',
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <MarketingNavbar />

            <main className="flex-grow">
                {children}
            </main>

            <MarketingFooter />
        </div>
    );
}
