'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token') || '';
    const router = useRouter();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const passwordValid = password.length >= 8;
    const passwordsMatch = password === confirmPassword;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!passwordValid || !passwordsMatch) return;

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });
            const data = await res.json();

            if (data.success) {
                setSuccess(true);
                setTimeout(() => router.push('/login'), 3000);
            } else {
                setError(data.error || 'Failed to reset password');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    if (!token) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-white p-6">
                <div className="w-full max-w-sm text-center space-y-6">
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Invalid reset link</h1>
                    <p className="text-sm text-gray-500">This reset link is missing or invalid. Please request a new one.</p>
                    <Link href="/forgot-password" className="inline-block px-6 py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-black transition">
                        Request new link
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-white p-6">
            <div className="w-full max-w-sm animate-fade-in">
                <div className="mb-10 text-center">
                    <Link href="/" className="text-3xl font-black text-indigo-600 tracking-widest uppercase">
                        Lunavia.
                    </Link>
                </div>

                {success ? (
                    <div className="text-center space-y-6">
                        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Password reset!</h1>
                        <p className="text-sm text-gray-500">Your password has been updated. Redirecting to login...</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-8 text-center">
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Set new password</h1>
                            <p className="mt-2 text-sm text-gray-500">Choose a strong password for your account.</p>
                        </div>

                        {error && (
                            <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">New password</label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="At least 8 characters"
                                    className={`w-full rounded-xl border bg-white px-4 py-3 text-gray-900 outline-none transition-all ${password && !passwordValid ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'}`}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm new password</label>
                                <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Repeat password"
                                    className={`w-full rounded-xl border bg-white px-4 py-3 text-gray-900 outline-none transition-all ${confirmPassword && !passwordsMatch ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'}`}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !passwordValid || !passwordsMatch}
                                className="w-full rounded-xl bg-gray-900 px-4 py-3.5 font-semibold text-white hover:bg-black disabled:opacity-50 transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
                            >
                                {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
                                {loading ? 'Resetting...' : 'Reset password'}
                            </button>
                        </form>

                        <p className="mt-8 text-center text-sm text-gray-500">
                            <Link href="/login" className="font-semibold text-gray-900 hover:underline">
                                Back to login
                            </Link>
                        </p>
                    </>
                )}
            </div>
        </main>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<main className="flex min-h-screen bg-white" />}>
            <ResetPasswordContent />
        </Suspense>
    );
}
