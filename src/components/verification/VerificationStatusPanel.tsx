"use client";
import { useRouter } from 'next/navigation';
import VerificationForm from './VerificationForm';
import VerificationAuditTrail from './VerificationAuditTrail';

type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
interface Props {
  status: VerificationStatus | null;
  trustState: string | undefined;
  role: string;
  rejectReason?: string | null;
  submittedAt?: string; // ISO string
  reviewedAt?: string | null; // ISO string
}

export default function VerificationStatusPanel({
  status,
  trustState,
  role,
  rejectReason,
  submittedAt,
  reviewedAt,
}: Props) {
  const router = useRouter();

  const events = [] as {
    type: 'SUBMITTED' | 'REJECTED' | 'APPROVED';
    at: string;
    message?: string;
  }[];
  if (submittedAt) {
    events.push({ type: 'SUBMITTED', at: submittedAt });
  }
  if (status === 'REJECTED' && reviewedAt) {
    events.push({ type: 'REJECTED', at: reviewedAt, message: rejectReason || undefined });
  }
  if (status === 'APPROVED' && reviewedAt) {
    events.push({ type: 'APPROVED', at: reviewedAt });
  }

  function goToVerification() {
    router.push(`/verification/${role.toLowerCase()}`);
  }

  if (!status || trustState === 'VERIFIED') {
    return (
      <div className="mb-4 rounded border-l-4 border-yellow-400 bg-yellow-50 p-3 text-sm text-yellow-800">
        Your account is not verified.{' '}
        <button className="underline" onClick={goToVerification}>
          Start verification
        </button>
      </div>
    );
  }

  if (status === 'PENDING') {
    return (
      <div className="mb-4 rounded border-l-4 border-blue-400 bg-blue-50 p-3 text-sm text-blue-800">
        <p>Your verification is under review.</p>
        <VerificationAuditTrail events={events} />
      </div>
    );
  }

  if (status === 'APPROVED') {
    return (
      <div className="mb-4 rounded border-l-4 border-green-400 bg-green-50 p-3 text-sm text-green-800">
        <p>You are verified. Enjoy full features!</p>
        <VerificationAuditTrail events={events} />
      </div>
    );
  }

  if (status === 'REJECTED') {
    return (
      <div className="mb-4 rounded border-l-4 border-red-400 bg-red-50 p-3 text-sm text-red-800">
        <p>Your verification was rejected. You can resubmit below.</p>
        {rejectReason && <p className="mt-1 text-xs">Reason: {rejectReason}</p>}
        <VerificationForm initialReason={rejectReason} />
        <VerificationAuditTrail events={events} />
      </div>
    );
  }

  return null;
}
