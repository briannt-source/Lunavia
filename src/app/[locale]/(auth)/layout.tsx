import { ReactNode } from 'react';

export const metadata = {
  title: 'Authentication — Lunavia',
  description: 'Access Lunavia platform',
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
