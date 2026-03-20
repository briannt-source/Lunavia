'use client';

import { Link, usePathname } from '@/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '../LanguageSwitcher';
import { Logo } from '@/components/logo';

const NAV_LINKS = [
    { href: '/', labelKey: 'nav.home' },
    { href: '/pricing', labelKey: 'nav.pricing' },
    { href: '/about', labelKey: 'nav.about' },
    { href: '/contact', labelKey: 'nav.contact' },
];

export default function MarketingNavbar() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();
    const t = useTranslations('Home');

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <Logo size="md" variant="dark" showText={true} showSubtitle={false} />

                {/* Desktop nav */}
                <nav className="hidden md:flex items-center gap-1">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${pathname === link.href
                                ? 'text-lunavia-primary bg-lunavia-light'
                                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                                }`}
                        >
                            {t(link.labelKey)}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-3">
                    <LanguageSwitcher />

                    <Link href="/login" className="hidden sm:block px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition">{t('nav.login')}</Link>
                    <Link href="/signup" className="hidden sm:block px-5 py-2.5 rounded-xl bg-lunavia-primary text-white text-sm font-semibold hover:bg-lunavia-primary-dark transition shadow-lg shadow-[#0077B6]/20">
                        {t('nav.startFree')}
                    </Link>

                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setOpen(!open)}
                        className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition"
                        aria-label="Menu"
                    >
                        {open ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {open && (
                <div className="md:hidden border-t border-slate-200 bg-white px-6 py-4 space-y-1 animate-fade-in">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setOpen(false)}
                            className={`block px-4 py-3 rounded-lg text-sm font-medium transition ${pathname === link.href
                                ? 'text-lunavia-primary bg-lunavia-light'
                                : 'text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            {t(link.labelKey)}
                        </Link>
                    ))}
                    <hr className="border-slate-200 my-2" />
                    <Link href="/login" onClick={() => setOpen(false)} className="block px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100">
                        {t('nav.login')}
                    </Link>
                    <Link href="/signup" onClick={() => setOpen(false)} className="block px-4 py-3 rounded-lg text-sm font-semibold text-white bg-lunavia-primary text-center hover:bg-lunavia-primary-dark">
                        {t('nav.startFree')}
                    </Link>
                </div>
            )}
        </header>
    );
}
