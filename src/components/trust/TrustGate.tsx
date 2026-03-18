"use client";
import { ReactElement, cloneElement } from 'react';
import { useSession } from 'next-auth/react';

interface Props {
  action: string; // reserved for future, not used in this soft phase
  children: ReactElement;
}

export default function TrustGate({ children }: Props) {
  const { data: session } = useSession();
  const trustState = (session?.user as any)?.trustState as string | undefined;
  const allowed = trustState === 'VERIFIED';

  if (allowed) return children;

  // Disable the child element (assumes it is a button or clickable)
  return cloneElement(children, {
    disabled: true,
    title: 'Action requires verified account',
    className: `${children.props.className ?? ''} opacity-50 cursor-not-allowed`,
  });
}
