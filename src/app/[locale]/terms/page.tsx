import React from 'react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
    const t = await getTranslations({ locale, namespace: 'Terms' });
    return { title: t('title') };
}

export default async function TermsPage() {
    const t = await getTranslations('Terms');

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <div className="max-w-4xl mx-auto px-8 py-16 bg-white shadow-sm min-h-screen">
                <Link href="/" className="inline-block mb-8 text-gray-500 hover:text-gray-900">{t('back')}</Link>
                <h1 className="text-3xl font-bold mb-2">{t('h1')}</h1>
                <p className="text-gray-500 mb-12">{t('lastUpdated')}</p>

                <div className="prose prose-indigo max-w-none text-gray-600">
                    <h3>{t('p1Title')}</h3>
                    <p>{t('p1Desc')}</p>

                    <h3>{t('p2Title')}</h3>
                    <p>{t('p2Desc')}</p>

                    <h3>{t('p3Title')}</h3>
                    <p>{t('p3Desc')}</p>

                    <h3>{t('p4Title')}</h3>
                    <p>{t('p4Desc')}</p>
                </div>
            </div>
        </div>
    );
}
