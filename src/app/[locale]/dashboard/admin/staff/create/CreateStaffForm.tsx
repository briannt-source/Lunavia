"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const INTERNAL_ROLES = [
    { value: 'OPS', label: 'Operations (OPS)', desc: 'Monitor tours, verify guides, handle incidents & support.' },
    { value: 'FINANCE', label: 'Finance', desc: 'Can view payments, revenues, and plans.' },
    { value: 'KYC_ANALYST', label: 'KYC Analyst', desc: 'Review and verify operator/guide identity documents.' },
];

export default function CreateStaffForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [warning, setWarning] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await fetch('/api/admin/staff', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const json = await res.json();

            if (!res.ok) {
                throw new Error(json.error || 'Failed to create staff');
            }

            // Show warning if email failed but account was created
            if (json.warning) {
                setError(null);
                setWarning(`✅ Account created but email could not be sent. Please share the login credentials manually (password: ${data.password}).`);
                setTimeout(() => {
                    router.push('/dashboard/admin/staff');
                    router.refresh();
                }, 3000);
            } else {
                router.push('/dashboard/admin/staff');
                router.refresh();
            }
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded text-sm">
                    {error}
                </div>
            )}
            {warning && (
                <div className="bg-amber-50 text-amber-800 border border-amber-200 p-3 rounded text-sm">
                    {warning}
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input name="name" type="text" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-lunavia-primary focus:outline-none focus:ring-1 focus:ring-lunavia-primary" placeholder="e.g. Sarah Connor" />
                </div>

                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Email Address (Corp)</label>
                    <input name="email" type="email" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-lunavia-primary focus:outline-none focus:ring-1 focus:ring-lunavia-primary" placeholder="sarah@lunavia.vn" />
                </div>

                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Assigned Role</label>
                    <div className="mt-2 space-y-2">
                        {INTERNAL_ROLES.map((role) => (
                            <div key={role.value} className="flex items-start">
                                <div className="flex h-5 items-center">
                                    <input
                                        id={role.value}
                                        name="role"
                                        type="radio"
                                        value={role.value}
                                        required
                                        className="h-4 w-4 border-gray-300 text-lunavia-primary focus:ring-lunavia-primary"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor={role.value} className="font-medium text-gray-700">{role.label}</label>
                                    <p className="text-gray-500">{role.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Temporary Password</label>
                    <input
                        name="password"
                        type="text"
                        required
                        minLength={8}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-lunavia-primary focus:outline-none focus:ring-1 focus:ring-lunavia-primary font-mono"
                        placeholder="SecurePass123!"
                    />
                    <p className="mt-1 text-xs text-gray-500">Staff member should rotate this immediately.</p>
                </div>
            </div>

            <div className="pt-4 border-t border-gray-200 flex justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center rounded-md border border-transparent bg-lunavia-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-lunavia-primary-hover focus:outline-none focus:ring-2 focus:ring-lunavia-primary focus:ring-offset-2 disabled:opacity-50"
                >
                    {loading ? 'Creating Account...' : 'Create Staff Account'}
                </button>
            </div>
        </form>
    );
}
