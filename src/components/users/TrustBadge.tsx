import React from 'react';
import Tooltip from '@/components/ui/Tooltip';

interface TrustBadgeProps {
    trustScore: number;
    trustState?: string;
    verificationStatus: string; // 'APPROVED' | 'PENDING' | ...
    type: 'KYC' | 'KYB';
}

export default function TrustBadge({ trustScore, trustState, verificationStatus, type }: TrustBadgeProps) {
    const isVerified = verificationStatus === 'APPROVED';

    // Trust colors
    let trustColor = 'bg-gray-100 text-gray-600';
    if (trustScore >= 100) trustColor = 'bg-green-100 text-green-700';
    else if (trustScore >= 80) trustColor = 'bg-blue-100 text-blue-700';
    else if (trustScore >= 50) trustColor = 'bg-yellow-100 text-yellow-700';
    else trustColor = 'bg-red-100 text-red-700';

    return (
        <div className="flex flex-wrap items-center gap-2">
            {/* Verification Badge */}
            <Tooltip content={`Indicates ${type} identity verification status`}>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium cursor-help ${isVerified ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                    {isVerified ? (
                        <>
                            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {type} Verified
                        </>
                    ) : (
                        `${type} ${verificationStatus}`
                    )}
                </span>
            </Tooltip>

            {/* Trust Score Badge */}
            <Tooltip content="Reflects operational reliability based on past tours and incidents">
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium cursor-help ${trustColor}`}>
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {trustScore} pts {trustState ? `(${trustState})` : ''}
                </span>
            </Tooltip>
        </div>
    );
}
