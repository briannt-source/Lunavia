"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function InternalProfileForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    async function handlePasswordChange(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const formData = new FormData(e.currentTarget);
        const currentPassword = formData.get('currentPassword') as string;
        const newPassword = formData.get('newPassword') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/account/password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to update password');
            }

            setMessage({ type: 'success', text: 'Password updated successfully' });
            (e.target as HTMLFormElement).reset();
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handlePasswordChange} className="max-w-md space-y-4">
            {message && (
                <div className={`p-3 rounded text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700">Current Password</label>
                <input
                    name="currentPassword"
                    type="password"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <input
                    name="newPassword"
                    type="password"
                    required
                    minLength={8}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                <input
                    name="confirmPassword"
                    type="password"
                    required
                    minLength={8}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
                {loading ? 'Updating...' : 'Update Password'}
            </button>
        </form>
    );
}
