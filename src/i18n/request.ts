import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '../navigation';

export default getRequestConfig(async ({ requestLocale }) => {
  // `requestLocale` can be a single Promise or a string. Wait for it:
  let locale = await requestLocale;
  
  // Validate that the incoming `locale` parameter is valid
  if (!locale || !routing.locales.includes(locale as any)) {
      locale = routing.defaultLocale;
  }

  return {
    locale: locale as string,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
