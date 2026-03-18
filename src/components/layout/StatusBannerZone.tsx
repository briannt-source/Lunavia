import { ReactNode } from 'react';

export default function StatusBannerZone({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <div className="mb-6">{children}</div>;
}
