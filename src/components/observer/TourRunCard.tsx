import { TourRun } from '@/domain/tour/TourRun';

export default function TourRunCard({ tour }: { tour: TourRun }) {
  const badgeColor =
    tour.status === 'RUNNING'
      ? 'bg-green-600'
      : tour.status === 'PAUSED'
      ? 'bg-yellow-500'
      : 'bg-gray-500';
  return (
    <div className="rounded border p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{tour.tourName}</h3>
        <span className={`rounded px-2 py-0.5 text-xs text-white ${badgeColor}`}>{tour.status}</span>
      </div>
      <p className="mt-1 text-xs text-text-muted">Operator: {tour.operatorName}</p>
      {tour.guideName && <p className="text-xs text-text-muted">Guide: {tour.guideName}</p>}
      <p className="text-xs text-text-muted">Started: {tour.startedAt.toLocaleTimeString()}</p>
    </div>
  );
}
