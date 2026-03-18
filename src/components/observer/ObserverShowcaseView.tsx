"use client";
import ObserverMap from '@/components/observer/ObserverMap';

export default function ObserverShowcaseView({ tours }: { tours: any[] }) {
  const totalRunning = tours.length;
  const allGood = true;

  return (
    <div className="space-y-6">
      <div className="rounded border border-border-subtle bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Live Operations</p>
            <p className="text-xs text-text-muted">Company showcase view</p>
          </div>
          <span className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
            {allGood ? 'All Good' : 'Attention'}
          </span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded border border-border-subtle bg-bg-subtle p-3">
            <p className="text-xs text-text-muted">Running tours</p>
            <p className="text-lg font-semibold">{totalRunning}</p>
          </div>
          <div className="rounded border border-border-subtle bg-bg-subtle p-3">
            <p className="text-xs text-text-muted">On-time rate</p>
            <p className="text-lg font-semibold">100%</p>
          </div>
          <div className="rounded border border-border-subtle bg-bg-subtle p-3">
            <p className="text-xs text-text-muted">Completed today</p>
            <p className="text-lg font-semibold">0</p>
          </div>
        </div>
      </div>

      <ObserverMap tours={tours} />
    </div>
  );
}
