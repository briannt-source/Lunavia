'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import OperatorPublicProfile from '@/components/marketplace/OperatorPublicProfile';

export default function OperatorProfilePage() {
    const params = useParams();
    const operatorId = params?.id as string;
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchOperator() {
            try {
                const res = await fetch(`/api/marketplace/operators/${operatorId}`);
                const json = await res.json();
                if (json.success) setData(json.data);
                else setError(json.error || 'Operator not found');
            } catch { setError('Failed to load operator profile'); }
            finally { setLoading(false); }
        }
        if (operatorId) fetchOperator();
    }, [operatorId]);

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
                    <p className="text-red-700">{error || 'Operator not found'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <OperatorPublicProfile
                operator={data.operator}
                stats={data.stats}
                tours={data.tours}
                reviews={data.reviews}
            />
        </div>
    );
}
