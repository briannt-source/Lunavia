"use client";
import { useSession } from 'next-auth/react';

export default function TrustBanner() {
  const { data: session } = useSession();
  const state = (session?.user as any)?.trustState as string | undefined;

  if (!state || state === 'VERIFIED') return null;

  let text = '';
  let color = '';
  switch (state) {
    case 'UNVERIFIED':
      text = 'Your account is not verified. Please complete verification to unlock full features.';
      color = 'bg-yellow-50 text-yellow-800 border-yellow-400';
      break;
    case 'PENDING':
      text = 'Your verification is under review.';
      color = 'bg-blue-50 text-blue-800 border-blue-400';
      break;
    case 'REJECTED':
      text = 'Your verification was rejected. Please resubmit.';
      color = 'bg-red-50 text-red-800 border-red-400';
      break;
    case 'BLOCKED':
      text = 'Your account is blocked. Contact support for assistance.';
      color = 'bg-red-50 text-red-800 border-red-600';
      break;
    default:
      return null;
  }

  return (
    <div className={`mb-4 rounded border-l-4 ${color} px-4 py-3 text-sm`}>{text}</div>
  );
}
