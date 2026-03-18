import React from 'react';
import TrustBadge from './TrustBadge';

interface OperatorCardProps {
    operator: {
        id: string;
        roleMetadata: any;
        trustScore: number;
        trustState: string;
        verificationStatus: string;
        kybStatus: string;
        createdAt: string;
        completedTours: number;
        incidentCount: number;
    };
}

export default function OperatorCard({ operator }: OperatorCardProps) {
    const metadata = operator.roleMetadata || {};
    const joinDate = new Date(operator.createdAt).toLocaleDateString();

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Tour Operator</h3>

            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">{metadata.companyName || metadata.name || 'Unnamed Operator'}</h2>
                    <p className="text-sm text-gray-500 mt-1">Member since {joinDate}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold text-xl">
                    {(metadata.companyName || 'O')[0].toUpperCase()}
                </div>
            </div>

            <div className="mt-4 space-y-3">
                <TrustBadge
                    trustScore={operator.trustScore}
                    trustState={operator.trustState}
                    verificationStatus={operator.kybStatus}
                    type="KYB"
                />

                <div className="flex items-center gap-6 pt-2 border-t border-gray-100">
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{operator.completedTours}</p>
                        <p className="text-xs text-gray-500">Tours Completed</p>
                    </div>
                    <div>
                        <p className={`text-2xl font-bold ${operator.incidentCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                            {operator.incidentCount}
                        </p>
                        <p className="text-xs text-gray-500">Incidents</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
