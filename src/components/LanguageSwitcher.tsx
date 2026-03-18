'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/navigation';
import { useTransition } from 'react';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLocaleChange = (newLocale: string) => {
    startTransition(() => {
      router.replace(pathname, { locale: newLocale as any });
    });
  };

  return (
    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
      <button
        type="button"
        disabled={isPending}
        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
          locale === 'en' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
        }`}
        onClick={() => handleLocaleChange('en')}
      >
        EN
      </button>
      <button
        type="button"
        disabled={isPending}
        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
          locale === 'vi' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
        }`}
        onClick={() => handleLocaleChange('vi')}
      >
        VI
      </button>
    </div>
  );
}
