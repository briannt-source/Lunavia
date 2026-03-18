import EmptyState from '@/components/EmptyState';

export const metadata = { title: 'Cancellation Review — Admin' };

export default function AdminCancellationPage() {
  return (
    <>
      <h1 className="text-xl font-semibold">Cancellation Review</h1>
      <EmptyState title="No cancellations to review" />
    </>
  );
}
