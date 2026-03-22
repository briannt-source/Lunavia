"use client";
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

function AcceptInviteContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [state, setState] = useState<'loading' | 'valid' | 'accepting' | 'accepted' | 'error'>('loading');
    const [invitation, setInvitation] = useState<any>(null);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (!token) {
            setState('error');
            setErrorMsg('No invitation token provided.');
            return;
        }

        fetch(`/api/invite/accept?token=${token}`)
            .then(res => res.json())
            .then(data => {
                if (data.valid) {
                    setInvitation(data);
                    setState('valid');
                } else {
                    setState('error');
                    setErrorMsg(data.error || 'Invalid invitation.');
                }
            })
            .catch(() => {
                setState('error');
                setErrorMsg('Failed to validate invitation.');
            });
    }, [token]);

    async function handleAccept() {
        setState('accepting');
        try {
            const res = await fetch('/api/invite/accept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            });
            const data = await res.json();

            if (res.status === 401) {
                // Not logged in — redirect to login with callback
                router.push(`/login?callbackUrl=${encodeURIComponent(`/invite/accept?token=${token}`)}`);
                return;
            }

            if (data.success) {
                setState('accepted');
            } else {
                setState('error');
                setErrorMsg(data.error || 'Failed to accept invitation.');
            }
        } catch {
            setState('error');
            setErrorMsg('Something went wrong. Please try again.');
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                {state === 'loading' && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
                        <div className="animate-spin h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
                        <p className="text-gray-500 text-sm">Validating invitation…</p>
                    </div>
                )}

                {state === 'valid' && invitation && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                        <div className="text-center mb-6">
                            <h1 className="text-xl font-bold text-gray-900">Team Invitation</h1>
                            <p className="text-sm text-gray-500 mt-1">You&apos;ve been invited to join a team on Lunavia</p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <div className="flex items-center gap-3">
                                {invitation.operatorAvatar ? (
                                    <img src={invitation.operatorAvatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                                ) : (
                                    <div className="h-10 w-10 rounded-full bg-lunavia-muted/50 flex items-center justify-center text-sm font-bold text-[#5BA4CF]">
                                        {invitation.operatorName?.[0]?.toUpperCase() || '?'}
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">{invitation.operatorName}</p>
                                    <p className="text-xs text-gray-500">Tour Operator</p>
                                </div>
                            </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-6">
                            By accepting, you&apos;ll be linked to this operator&apos;s team pending internal review. You&apos;ll be eligible for direct tour assignments.
                        </p>

                        <button
                            onClick={handleAccept}
                            className="w-full bg-lunavia-primary text-white py-3 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
                        >
                            Accept Invitation
                        </button>

                        <p className="text-xs text-gray-400 text-center mt-4">
                            Expires {new Date(invitation.expiresAt).toLocaleDateString()}
                        </p>
                    </div>
                )}

                {state === 'accepting' && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
                        <div className="animate-spin h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
                        <p className="text-gray-500 text-sm">Accepting invitation…</p>
                    </div>
                )}

                {state === 'accepted' && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
                        <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 mb-2">Invitation Accepted</h2>
                        <p className="text-sm text-gray-500 mb-6">
                            Your request is pending internal review. You may be asked to upload a contract document.
                        </p>
                        <button
                            onClick={() => router.push('/dashboard/guide')}
                            className="bg-lunavia-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                )}

                {state === 'error' && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
                        <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 mb-2">Unable to Process</h2>
                        <p className="text-sm text-gray-500 mb-6">{errorMsg}</p>
                        <button
                            onClick={() => router.push('/login')}
                            className="text-sm font-medium text-[#5BA4CF] hover:text-[#2E8BC0]"
                        >
                            Go to Login →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function AcceptInvitePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
            </div>
        }>
            <AcceptInviteContent />
        </Suspense>
    );
}
