import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { BaseDashboardLayout } from '@/components/layout/BaseDashboardLayout';
import DemoResetPanel from '@/components/pitch/DemoResetPanel';

export const metadata = {
    title: 'Demo Tools — Lunavia',
};

/**
 * Demo Reset Page
 * 
 * Admin tools for resetting demo data during pitches.
 * Super Admin only.
 */
export default async function DemoPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect('/login');

    const userRole = session.user?.role;
    if (userRole !== 'SUPER_ADMIN') {
        redirect('/dashboard/admin');
    }

    const header = (
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Demo Tools</h1>
            <p className="mt-1 text-sm text-gray-500">
                Reset and manage demo data for investor pitches
            </p>
        </div>
    );

    return (
        <BaseDashboardLayout header={header}>
            <DemoResetPanel />

            {/* Quick Tips */}
            <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-6">
                <h3 className="font-semibold text-amber-900">Before a Demo</h3>
                <ul className="mt-2 space-y-1 text-sm text-amber-800">
                    <li>• Reset all demo data using "Reset All" button</li>
                    <li>• Enable PITCH_MODE in environment for watermark</li>
                    <li>• Test login with demo accounts before presenting</li>
                    <li>• Verify in-progress tour is available for live demo</li>
                </ul>
            </div>

            {/* Demo Flow Guide */}
            <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
                <h3 className="mb-4 font-semibold text-gray-900">Demo Flow Script</h3>
                <ol className="space-y-2 text-sm text-gray-700">
                    <li className="flex gap-2">
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-lunavia-primary-light text-xs font-medium text-lunavia-primary">1</span>
                        <span>Login as Operator (Saigon City Tours)</span>
                    </li>
                    <li className="flex gap-2">
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-lunavia-primary-light text-xs font-medium text-lunavia-primary">2</span>
                        <span>Create new Service Request</span>
                    </li>
                    <li className="flex gap-2">
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-lunavia-primary-light text-xs font-medium text-lunavia-primary">3</span>
                        <span>Switch to Guide view, apply for tour</span>
                    </li>
                    <li className="flex gap-2">
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-lunavia-primary-light text-xs font-medium text-lunavia-primary">4</span>
                        <span>Show trust ranking in applicant list</span>
                    </li>
                    <li className="flex gap-2">
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-lunavia-primary-light text-xs font-medium text-lunavia-primary">5</span>
                        <span>Assign guide, show check-in process</span>
                    </li>
                    <li className="flex gap-2">
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-lunavia-primary-light text-xs font-medium text-lunavia-primary">6</span>
                        <span>Complete tour, request payment</span>
                    </li>
                    <li className="flex gap-2">
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-lunavia-primary-light text-xs font-medium text-lunavia-primary">7</span>
                        <span>Confirm payment, show trust update</span>
                    </li>
                </ol>
            </div>
        </BaseDashboardLayout>
    );
}
