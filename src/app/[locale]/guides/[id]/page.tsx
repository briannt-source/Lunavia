'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import GuidePublicProfile from '@/components/marketplace/GuidePublicProfile';

export default function GuideProfilePage() {
    const params = useParams();
    const guideId = params?.id as string;
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchGuide() {
            try {
                const res = await fetch(`/api/marketplace/guides/${guideId}`);
                const json = await res.json();
                if (json.success) setData(json.data);
                else setError(json.error || 'Guide not found');
            } catch { setError('Failed to load guide profile'); }
            finally { setLoading(false); }
        }
        if (guideId) fetchGuide();
    }, [guideId]);

    const handleInvite = (id: string) => {
        alert(`Invite guide ${id} — wire to tour selection modal`);
    };

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-32 bg-gray-100 rounded-xl" />
                    <div className="h-48 bg-gray-100 rounded-xl" />
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                    <p className="text-red-700">{error || 'Guide not found'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <GuidePublicProfile
                guide={data.guide}
                recentActivity={data.recentActivity}
                reviews={data.reviews}
                onInvite={handleInvite}
            />
        </div>
    );
}
