import PublicLayout from '../layout';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'MarketingHowItWorks' });
  return { title: t('title') };
}

export default async function HowItWorksPage() {
  const t = await getTranslations('MarketingHowItWorks');
  return (
    <PublicLayout>
      <h1 className="text-2xl font-semibold">{t('h1')}</h1>
      <ol className="mt-4 space-y-2 text-sm text-gray-700 list-decimal list-inside">
        <li>{t('step1')}</li>
        <li>{t('step2')}</li>
        <li>{t('step3')}</li>
        <li>{t('step4')}</li>
      </ol>
      <p className="mt-6 text-sm">
        {t('join.text')} <Link href="/signup" className="text-lunavia-primary underline">{t('join.link')}</Link>.
      </p>
    </PublicLayout>
  );
}
