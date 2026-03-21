'use client';

import { BaseDashboardLayout } from '@/components/layout/BaseDashboardLayout';
import { GuideCalendar } from '@/components/dashboard/GuideCalendar';
import { useTranslations } from 'next-intl';

export default function GuideCalendarPage() {
    const t = useTranslations('Guide.Calendar');

    return (
        <BaseDashboardLayout
            header={
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
                    <p className="text-sm text-gray-600">{t('subtitle')}</p>
                </div>
            }
        >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <GuideCalendar />
            </div>
        </BaseDashboardLayout>
    );
}
