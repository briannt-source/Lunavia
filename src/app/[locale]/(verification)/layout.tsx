import { ReactNode } from 'react';

export default function VerificationLayout({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-xl font-semibold">Account Verification</h1>
      <div className="mt-6">{children}</div>
    </main>
  );
}
