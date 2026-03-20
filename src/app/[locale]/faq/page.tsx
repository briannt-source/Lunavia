import React from 'react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'FAQ' });
  return { title: t('title') };
}

export default async function FAQPage() {
    const t = await getTranslations('FAQ');
    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">
            <div className="max-w-3xl mx-auto px-6 py-16">
                <Link href="/" className="inline-block mb-8 text-indigo-600 font-medium hover:underline">{t('back')}</Link>
                <h1 className="text-4xl font-bold mb-12">{t('h1')}</h1>

                <div className="space-y-10">
                    <div>
                        <h3 className="text-xl font-semibold mb-3">{t('q1')}</h3>
                        <p className="text-gray-600 leading-relaxed">
                            {t('a1')}
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold mb-3">{t('q2')}</h3>
                        <p className="text-gray-600 leading-relaxed">
                            {t('a2')}
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold mb-3">{t('q3')}</h3>
                        <p className="text-gray-600 leading-relaxed">
                            {t('a3')}
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold mb-3">{t('q4')}</h3>
                        <p className="text-gray-600 leading-relaxed">
                            {t('a4')}
                        </p>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-gray-100 text-center">
                    <p className="text-gray-500">{t('more')}</p>
                    <Link href="mailto:support@lunavia.vn" className="text-indigo-600 font-bold hover:underline mt-2 inline-block">{t('contact')}</Link>
                </div>
            </div>
        </div>
    );
}
