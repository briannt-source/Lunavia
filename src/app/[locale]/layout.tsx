import type { Metadata } from "next";
export const dynamic = "force-dynamic";
import { Inter } from "next/font/google";
import "../globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/lib/auth-provider";
import { QueryProvider } from "@/providers/query-provider";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ReactNode } from 'react';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lunavia - Sea You Travel Platform",
  description: "Nền tảng AI-powered của Sea You Travel - Kết nối thông minh Tour Operator & HDV",
  manifest: "/manifest.json",
  themeColor: "#3B82F6",
};

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  const locale = (await Promise.resolve(params)).locale;
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <QueryProvider>
            <NextIntlClientProvider messages={messages} locale={locale}>
              {children}
              <Toaster position="top-right" />
            </NextIntlClientProvider>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
