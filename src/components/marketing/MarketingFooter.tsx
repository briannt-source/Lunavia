import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Logo } from '@/components/logo';

export default function MarketingFooter() {
    const t = useTranslations('MarketingFooter');

    return (
        <footer className="bg-white border-t border-slate-200 py-16">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-5 gap-12">
                <div className="md:col-span-2">
                    <div className="mb-4">
                        <Logo size="sm" variant="dark" showText={true} showSubtitle={true} />
                    </div>
                    <p className="text-sm text-slate-500 max-w-xs leading-relaxed">{t('brand_desc')}</p>
                </div>
                <div>
                    <h4 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wider">{t('categories.platform')}</h4>
                    <ul className="space-y-3 text-sm text-slate-500">
                        <li><Link href="/pricing" className="hover:text-lunavia-primary transition">{t('links.pricing')}</Link></li>
                        <li><Link href="/about" className="hover:text-lunavia-primary transition">{t('links.about')}</Link></li>
                        <li><Link href="/signup" className="hover:text-lunavia-primary transition">{t('links.get_started')}</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wider">{t('categories.trust')}</h4>
                    <ul className="space-y-3 text-sm text-slate-500">
                        <li><Link href="/trust-safety" className="hover:text-lunavia-primary transition">{t('links.trust_safety')}</Link></li>
                        <li><Link href="/tour-health" className="hover:text-lunavia-primary transition">{t('links.tour_health')}</Link></li>
                        <li><Link href="/verification-guide" className="hover:text-lunavia-primary transition">{t('links.verification_guide')}</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wider">{t('categories.legal')}</h4>
                    <ul className="space-y-3 text-sm text-slate-500">
                        <li><Link href="/faq" className="hover:text-lunavia-primary transition">{t('links.faq')}</Link></li>
                        <li><Link href="/terms" className="hover:text-lunavia-primary transition">{t('links.terms')}</Link></li>
                        <li><Link href="/privacy" className="hover:text-lunavia-primary transition">{t('links.privacy')}</Link></li>
                    </ul>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
                <p>{t('copyright').replace('{year}', new Date().getFullYear().toString())}</p>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>{t('status')}</span>
                </div>
            </div>
        </footer>
    );
}
