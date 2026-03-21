import { Link } from '@/navigation';
import InternalProfileForm from '../InternalProfileForm';

export const metadata = {
    title: 'Security — Lunavia',
};

export default function SecurityPage() {
    return (
        <div className="max-w-xl mx-auto space-y-6">
            {/* Back link */}
            <Link href="/dashboard/admin/profile" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition">
                ← Back to Profile
            </Link>

            {/* Header */}
            <div>
                <h1 className="text-xl font-bold text-gray-900">Security Settings</h1>
                <p className="text-sm text-gray-500 mt-1">Manage your password and account security.</p>
            </div>

            {/* Password Change Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center text-lg">
                        🔑
                    </div>
                    <div>
                        <h2 className="font-semibold text-gray-900">Change Password</h2>
                        <p className="text-xs text-gray-500">Update your account password</p>
                    </div>
                </div>
                <InternalProfileForm />
            </div>

            {/* Session Info Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center text-lg">
                        🖥️
                    </div>
                    <div>
                        <h2 className="font-semibold text-gray-900">Active Sessions</h2>
                        <p className="text-xs text-gray-500">Your current login session</p>
                    </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-green-50 border border-green-100">
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm font-medium text-green-800">Current session</span>
                    </div>
                    <span className="text-xs text-green-600">Active now</span>
                </div>
            </div>
        </div>
    );
}
