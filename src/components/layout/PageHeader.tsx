import { ReactNode } from 'react';

interface Props {
  title: string;
  subtitle?: string;
  status?: ReactNode;
  actions?: ReactNode;
}

export default function PageHeader({ title, subtitle, status, actions }: Props) {
  return (
    <div className="mb-6 space-y-2 sm:mb-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold leading-tight">{title}</h1>
          {status}
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
      {subtitle && <p className="text-sm text-text-muted">{subtitle}</p>}
    </div>
  );
}
