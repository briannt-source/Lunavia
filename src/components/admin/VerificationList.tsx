import { VerificationSubmission } from '@/domain/verification/VerificationSubmission';
import VerificationCard from './VerificationCard';
import EmptyState from '@/components/EmptyState';

export default function VerificationList({ submissions }: { submissions: VerificationSubmission[] }) {
  if (!submissions.length) {
    return <EmptyState title="No submissions yet" />;
  }

  return (
    <div className="space-y-4">
      {submissions.map((s) => (
        <VerificationCard key={s.id} submission={s} />
      ))}
    </div>
  );
}
