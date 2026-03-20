'use client';

import { usePathname, useRouter } from '@/navigation';
import { useLocale } from 'next-intl';
import { useTransition } from 'react';

/**
 * Language switcher component.
 * Switches between Vietnamese and English while preserving current path.
 */
export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const toggleLocale = () => {
    const nextLocale = locale === 'en' ? 'vi' : 'en';
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  return (
    <button
      onClick={toggleLocale}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors
        bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200
        hover:bg-gray-200 dark:hover:bg-slate-600
        disabled:opacity-50 disabled:cursor-wait"
      title={locale === 'en' ? 'Chuyển sang Tiếng Việt' : 'Switch to English'}
    >
      <span className="text-base">{locale === 'en' ? '🇻🇳' : '🇬🇧'}</span>
      <span>{locale === 'en' ? 'VI' : 'EN'}</span>
    </button>
  );
}
