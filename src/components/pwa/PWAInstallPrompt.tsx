'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
    const t = useTranslations('Components.PWAInstall');
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showBanner, setShowBanner] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Check if already installed as PWA
        const standalone = window.matchMedia('(display-mode: standalone)').matches
            || (window.navigator as any).standalone === true;
        setIsStandalone(standalone);
        if (standalone) return;

        // Check if dismissed recently
        const dismissed = localStorage.getItem('lunavia_pwa_dismissed');
        if (dismissed) {
            const dismissedAt = parseInt(dismissed, 10);
            // Don't show again for 7 days
            if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) return;
        }

        // Check visit count
        const visits = parseInt(localStorage.getItem('lunavia_visits') || '0', 10) + 1;
        localStorage.setItem('lunavia_visits', String(visits));
        if (visits < 2) return; // Show after 2nd visit

        // Detect iOS
        const ua = navigator.userAgent;
        const isiOS = /iPhone|iPad|iPod/.test(ua) && !(window as any).MSStream;
        setIsIOS(isiOS);

        // Android/Desktop: listen for install prompt
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setShowBanner(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // iOS: show banner manually (no beforeinstallprompt on Safari)
        if (isiOS) {
            setShowBanner(true);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    async function handleInstall() {
        if (deferredPrompt) {
            await deferredPrompt.prompt();
            const choice = await deferredPrompt.userChoice;
            if (choice.outcome === 'accepted') {
                setShowBanner(false);
            }
            setDeferredPrompt(null);
        }
    }

    function handleDismiss() {
        setShowBanner(false);
        localStorage.setItem('lunavia_pwa_dismissed', String(Date.now()));
    }

    if (!showBanner || isStandalone) return null;

    return (
        <div className="fixed bottom-16 lg:bottom-4 inset-x-4 z-[70] animate-slide-in-up">
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-4 flex items-center gap-3">
                {/* Icon */}
                <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                    <Download className="h-5 w-5 text-indigo-600" />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{t('title')}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{t('desc')}</p>
                </div>

                {/* Actions */}
                {!isIOS && deferredPrompt && (
                    <button
                        onClick={handleInstall}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition shrink-0"
                    >
                        {t('install')}
                    </button>
                )}
                <button
                    onClick={handleDismiss}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition shrink-0"
                    aria-label="Close"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
