'use client';

import { Link, usePathname } from '@/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '../LanguageSwitcher';

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
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-600/20">L</div>
                    <span className="text-xl font-bold tracking-tight text-slate-900">Lunavia</span>
                </Link>

                {/* Desktop nav */}
                <nav className="hidden md:flex items-center gap-1">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${pathname === link.href
                                ? 'text-blue-600 bg-blue-50'
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
                    <Link href="/signup" className="hidden sm:block px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-600/25">
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
                                ? 'text-blue-600 bg-blue-50'
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
                    <Link href="/signup" onClick={() => setOpen(false)} className="block px-4 py-3 rounded-lg text-sm font-semibold text-white bg-blue-600 text-center hover:bg-blue-700">
                        {t('nav.startFree')}
                    </Link>
                </div>
            )}
        </header>
    );
}
