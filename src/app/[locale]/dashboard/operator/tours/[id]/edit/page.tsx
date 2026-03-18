"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TourForm from '@/components/tour/TourForm';

export default function EditTourPage({ params }: { params: { id: string } }) {
    const [tour, setTour] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetch(`/api/requests?mine=true`)
            .then(res => res.json())
            .then(data => {
                const found = (data.data?.requests || []).find((r: any) => r.id === params.id);
                if (found) {
                    setTour(found);
                } else {
                    router.push('/dashboard/operator/tours');
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [params.id, router]);

    if (loading) return <div className="p-8"><div className="animate-spin h-8 w-8 border-2 border-indigo-600 rounded-full border-t-transparent mx-auto"></div></div>;
    if (!tour) return null;

    return <TourForm initialData={tour} isEdit={true} />;
}
