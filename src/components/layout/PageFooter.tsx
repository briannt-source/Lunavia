import { ReactNode } from 'react';

export default function PageFooter({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <footer className="mt-8 border-t pt-4 text-sm text-gray-500">{children}</footer>;
}
