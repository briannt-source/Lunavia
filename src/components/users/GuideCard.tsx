import React from 'react';
import TrustBadge from './TrustBadge';

interface GuideCardProps {
    guide: {
        id: string;
        roleMetadata: any;
        trustScore: number;
        trustState: string;
        verificationStatus: string;
        kycStatus: string;
        createdAt: string;
        completedTours: number;
        incidentCount: number;
        // rating?
    };
}

export default function GuideCard({ guide }: GuideCardProps) {
    const metadata = guide.roleMetadata || {};
    const joinDate = new Date(guide.createdAt).toLocaleDateString();

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Assigned Guide</h3>

            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center text-green-700 font-bold text-xl">
                        {(metadata.name || metadata.fullName || 'G')[0].toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{metadata.name || metadata.fullName || 'Unnamed Guide'}</h2>
                        <p className="text-sm text-gray-500">{metadata.email}</p>
                    </div>
                </div>
            </div>

            <div className="mt-4 space-y-3">
                <p className="text-sm text-gray-500">Member since {joinDate}</p>

                <TrustBadge
                    trustScore={guide.trustScore}
                    trustState={guide.trustState}
                    verificationStatus={guide.kycStatus}
                    type="KYC"
                />

                <div className="flex items-center gap-6 pt-2 border-t border-gray-100 mt-2">
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{guide.completedTours}</p>
                        <p className="text-xs text-gray-500">Tours Completed</p>
                    </div>
                    <div>
                        <p className={`text-2xl font-bold ${guide.incidentCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                            {guide.incidentCount}
                        </p>
                        <p className="text-xs text-gray-500">Incidents</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
