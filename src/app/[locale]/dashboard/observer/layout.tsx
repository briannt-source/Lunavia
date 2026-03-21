import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Link } from '@/navigation';

export default async function ObserverLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect('/login');
    }

    // Allow Admin/Ops to preview Observer Mode
    const isAdmin = ['SUPER_ADMIN', 'OPS'].includes(session.user.role);
    const isObserver = session.user.role === 'OBSERVER';

    if (!isObserver && !isAdmin) {
        redirect('/dashboard');
    }

    const type = (session.user as any).observerType || 'SYSTEM'; // Default to SYSTEM for preview
    const isTypeA = type === 'SYSTEM';
    const isTypeB = type === 'OPERATOR_PERFORMANCE';
    const isTypeC = type === 'INVESTOR';

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* ── Topbar ── */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-4">
                            <span className="text-xl font-black tracking-tight text-gray-900 border-r border-gray-200 pr-4">
                                LUNAVIA
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-widest bg-gray-100 text-gray-800">
                                Observer Mode
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm font-semibold text-gray-900">{session.user.name || session.user.email}</p>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Type: {type}</p>
                            </div>
                            <Link href="/api/auth/signout" className="text-sm font-medium text-red-600 hover:text-red-800">
                                Sign out
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* ── Warning Banner ── */}
            <div className="bg-amber-50 border-b border-amber-200 py-2">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center items-center gap-2">
                    <span className="text-sm">👁️</span>
                    <p className="text-xs font-medium text-amber-800">
                        You are in Observer Mode. All data access is read-only, anonymized, and strictly audited.
                    </p>
                </div>
            </div>

            {/* ── Main Content ── */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Simulated Navigation based on Type */}
                <div className="mb-6 flex gap-2">
                    {isAdmin && (
                        <div className="flex gap-2">
                            <span className="text-xs font-bold text-gray-400 self-center mr-2 uppercase tracking-widest">Admin Preview:</span>
                            <Link href="/dashboard/observer?previewType=SYSTEM" className={`px-4 py-2 text-xs font-bold rounded-lg border ${!isTypeA ? 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50' : 'bg-gray-900 border-gray-900 text-white'}`}>Type A (System)</Link>
                            <Link href="/dashboard/observer?previewType=OPERATOR_PERFORMANCE" className={`px-4 py-2 text-xs font-bold rounded-lg border ${!isTypeB ? 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50' : 'bg-gray-900 border-gray-900 text-white'}`}>Type B (Operator)</Link>
                            <Link href="/dashboard/observer?previewType=INVESTOR" className={`px-4 py-2 text-xs font-bold rounded-lg border ${!isTypeC ? 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50' : 'bg-gray-900 border-gray-900 text-white'}`}>Type C (Investor)</Link>
                        </div>
                    )}
                </div>

                {children}
            </main>
        </div>
    );
}
