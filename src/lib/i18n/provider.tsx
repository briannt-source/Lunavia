'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import en from '@/lib/i18n/en.json';
import vi from '@/lib/i18n/vi.json';

export type Locale = 'en' | 'vi';

const TRANSLATIONS: Record<Locale, typeof en> = { en, vi };

interface I18nContextType {
    locale: Locale;
    t: (key: string) => string;
    setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextType>({
    locale: 'en',
    t: (key) => key,
    setLocale: () => {},
});

export function useTranslation() {
    return useContext(I18nContext);
}

/**
 * Resolve a dot-separated key like "home.heroTitle" → translations.home.heroTitle
 */
function resolveKey(obj: any, key: string): string {
    const parts = key.split('.');
    let current = obj;
    for (const part of parts) {
        if (current === undefined || current === null) return key;
        current = current[part];
    }
    return typeof current === 'string' ? current : key;
}

/**
 * Get locale from cookie
 */
function getStoredLocale(): Locale | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(/(?:^|;\s*)locale=(en|vi)/);
    return match ? (match[1] as Locale) : null;
}

/**
 * Store locale in cookie (365 days)
 */
function storeLocale(locale: Locale) {
    if (typeof document === 'undefined') return;
    document.cookie = `locale=${locale};path=/;max-age=${365 * 24 * 60 * 60};SameSite=Lax`;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>('en');
    const [initialized, setInitialized] = useState(false);

    // On mount: check cookie, then IP
    useEffect(() => {
        const stored = getStoredLocale();
        if (stored) {
            setLocaleState(stored);
            setInitialized(true);
            return;
        }

        // IP-based detection (free API)
        fetch('https://ipapi.co/json/')
            .then(res => res.json())
            .then(data => {
                const detectedLocale: Locale = data.country_code === 'VN' ? 'vi' : 'en';
                setLocaleState(detectedLocale);
                storeLocale(detectedLocale);
            })
            .catch(() => {
                // Default to English on error
                storeLocale('en');
            })
            .finally(() => setInitialized(true));
    }, []);

    const setLocale = useCallback((newLocale: Locale) => {
        setLocaleState(newLocale);
        storeLocale(newLocale);
    }, []);

    const t = useCallback((key: string) => {
        return resolveKey(TRANSLATIONS[locale], key);
    }, [locale]);

    // Render immediately even before IP check completes (defaults to English)
    return (
        <I18nContext.Provider value={{ locale, t, setLocale }}>
            {children}
        </I18nContext.Provider>
    );
}
