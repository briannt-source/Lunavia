import { ReactNode } from 'react';
import PublicHeader from '@/components/PublicHeader';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PublicHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </>
  );
}
