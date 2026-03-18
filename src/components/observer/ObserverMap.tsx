import { TourRun } from '@/domain/tour/TourRun';

export default function ObserverMap({ tours }: { tours: TourRun[] }) {
  return (
    <div className="rounded border bg-white p-4">
      <p className="text-sm font-medium">Map view (placeholder)</p>
      <div className="mt-3 space-y-2">
        {(tours as any[]).map((t) => (
          <div key={t.id} className="rounded border px-3 py-2 text-sm">
            <div className="font-medium">{t.tourName}</div>
            <div className="text-xs text-text-muted">
              Lat: {t.latitude}, Lng: {t.longitude}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
