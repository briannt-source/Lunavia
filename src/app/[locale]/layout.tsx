import type { Metadata } from "next";
export const dynamic = "force-dynamic";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/lib/auth-provider";
import { QueryProvider } from "@/providers/query-provider";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ReactNode } from 'react';
import PWAInstallPrompt from '@/components/pwa/PWAInstallPrompt';

export default async function LocaleLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  const locale = (await Promise.resolve(params)).locale;
  const messages = await getMessages();

  return (
    <AuthProvider>
      <QueryProvider>
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
          <PWAInstallPrompt />
          <Toaster position="top-right" />
        </NextIntlClientProvider>
      </QueryProvider>
    </AuthProvider>
  );
}

