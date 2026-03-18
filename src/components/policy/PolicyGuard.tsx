"use client";

import { ReactNode } from 'react';
import { PolicyAction } from '@/domain/policy';
import { usePolicy } from '@/application/policy/usePolicy';

export function PolicyGuard({
  action,
  children,
  fallback,
}: {
  action: PolicyAction;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { can } = usePolicy();
  const allowed = can(action, 'any');

  if (!allowed) {
    return (
      fallback ?? (
        <div className="rounded-md border border-dashed p-4 text-sm text-text-muted">
          This feature is not available under your current access level.
        </div>
      )
    );
  }

  return <>{children}</>;
}

