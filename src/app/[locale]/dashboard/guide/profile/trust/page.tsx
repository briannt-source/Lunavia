import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { TrustHistoryGraph } from '@/components/profile/TrustHistoryGraph';
import { Link } from '@/navigation';

export const metadata = { title: 'Trust Score — Lunavia' };

export default async function TrustPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect('/login');

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <Link href="/dashboard/guide/profile" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition">
                ← Back to Profile
            </Link>
            <div>
                <h1 className="text-xl font-bold text-gray-900">Trust Score History</h1>
                <p className="text-sm text-gray-500 mt-1">Track how your trust score changes over time.</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <TrustHistoryGraph userId={session.user.id} />
            </div>
        </div>
    );
}
