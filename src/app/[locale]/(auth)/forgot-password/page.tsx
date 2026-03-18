'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();

            if (data.success) {
                setSent(true);
            } else {
                setError(data.error || 'Something went wrong');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-white p-6">
            <div className="w-full max-w-sm animate-fade-in">
                <div className="mb-10 text-center">
                    <Link href="/" className="text-3xl font-black text-indigo-600 tracking-widest uppercase">
                        Lunavia.
                    </Link>
                </div>

                {sent ? (
                    <div className="text-center space-y-6">
                        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Check your email</h1>
                        <p className="text-sm text-gray-500">
                            If an account exists with <strong className="text-gray-700">{email}</strong>, we&apos;ve sent a password reset link. It expires in 1 hour.
                        </p>
                        <div className="pt-4 space-y-3">
                            <button
                                onClick={() => { setSent(false); setEmail(''); }}
                                className="text-sm text-indigo-600 hover:underline font-medium"
                            >
                                Try a different email
                            </button>
                            <p className="text-sm text-gray-400">
                                <Link href="/login" className="text-gray-900 font-semibold hover:underline">Back to login</Link>
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="mb-8 text-center">
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Forgot your password?</h1>
                            <p className="mt-2 text-sm text-gray-500">Enter your email and we&apos;ll send you a reset link.</p>
                        </div>

                        {error && (
                            <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-xl bg-gray-900 px-4 py-3.5 font-semibold text-white hover:bg-black disabled:opacity-50 transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
                            >
                                {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
                                {loading ? 'Sending...' : 'Send reset link'}
                            </button>
                        </form>

                        <p className="mt-8 text-center text-sm text-gray-500">
                            Remember your password?{' '}
                            <Link href="/login" className="font-semibold text-gray-900 hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </>
                )}
            </div>
        </main>
    );
}
