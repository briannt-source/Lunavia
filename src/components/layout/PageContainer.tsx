import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export default function PageContainer({ children }: Props) {
  return <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">{children}</div>;
}
