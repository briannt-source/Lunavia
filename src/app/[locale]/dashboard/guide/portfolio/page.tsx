'use client';

import useSWR, { mutate } from 'swr';
import { useSession } from 'next-auth/react';
import PortfolioHeader from '@/components/portfolio/PortfolioHeader';
import PortfolioStats from '@/components/portfolio/PortfolioStats';
import PortfolioTours from '@/components/portfolio/PortfolioTours';
import PortfolioAbout from '@/components/portfolio/PortfolioAbout';
import PortfolioTimeline from '@/components/portfolio/PortfolioTimeline';
import PortfolioShareCard from '@/components/portfolio/PortfolioShareCard';
import GuidePerformanceCard from '@/components/guide/GuidePerformanceCard';
import { useTranslations } from 'next-intl';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function GuidePortfolioPage() {
    const t = useTranslations('Guide.Portfolio');
    const { data: session } = useSession();
    const { data, error, isLoading } = useSWR('/api/portfolio', fetcher);

    if (isLoading) return <div className="p-8 text-center text-gray-500">{t('loading')}</div>;
    if (error) return <div className="p-8 text-center text-red-500">{t('loadError')}</div>;
    if (!data?.profile) return <div className="p-8 text-center text-gray-500">{t('notFound')}</div>;

    const isOwner = session?.user?.email === data.profile.email;

    const handleUpdate = async (updateData: any) => {
        try {
            const res = await fetch('/api/portfolio', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });
            if (!res.ok) throw new Error('Failed to update');
            mutate('/api/portfolio');
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
                    <p className="text-sm text-gray-500">{t('subtitle')}</p>
                    <a href={`/guides/${data.profile.id}`} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                        {t('viewPublic')}
                    </a>
                </div>
                <PortfolioShareCard
                        user={data.profile}
                        stats={data.stats}
                        role="TOUR_GUIDE"
                    />
                </div>

                <PortfolioHeader
                    user={data.profile}
                    isEditable={isOwner}
                    onUpdate={handleUpdate}
                />

                <PortfolioStats
                    stats={data.stats}
                    role="TOUR_GUIDE"
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal About — Guide keeps skills, languages, bio */}
                        <PortfolioAbout
                            user={data.profile}
                            isEditable={isOwner}
                            onUpdate={handleUpdate}
                        />
                        <PortfolioTours tours={data.portfolioTours} />
                    </div>
                    <div className="lg:col-span-1 space-y-6">
                        {/* Experience Timeline — Guide-specific (individual career history) */}
                        <PortfolioTimeline
                            workHistory={data.profile.workHistory}
                            isEditable={isOwner}
                            onUpdate={handleUpdate}
                        />
                        {/* Guide Performance Card — THE core differentiator */}
                        <GuidePerformanceCard guideId={data.profile.id} />
                    </div>
                </div>
        </div>
    );
}
