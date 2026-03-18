"use client";

interface Event {
  type:
  | 'TOUR_STARTED'
  | 'GPS_UPDATE'
  | 'CHECKPOINT_REACHED'
  | 'DELAY_REPORTED'
  | 'TOUR_COMPLETED'
  | 'INCIDENT_REPORTED'
  | 'STATUS_CHANGE'
  | 'CHECKPOINT'
  | 'START_DELAYED'
  | 'GPS_STOPPED'
  | 'ROUTE_DEVIATION'
  | 'EMERGENCY'
  | 'SOS_TRIGGERED'
  | 'TOUR_CANCELLED';
  timestamp: string | number | Date;
}

interface Props {
  events: Event[];
}

export default function ObserverInsights({ events }: Props) {
  if (events.length === 0) return null;

  const criticalEvents = events.filter((e) => e.type === 'INCIDENT_REPORTED').length;
  const delays = events.filter((e) => e.type === 'DELAY_REPORTED').length;
  const lastActivity = new Date(events[0].timestamp).toLocaleTimeString();

  return (
    <div className="mb-4 flex flex-wrap items-center gap-4 rounded border border-border-subtle bg-white p-3 text-sm">
      <div className="flex items-center gap-2">
        <span className="font-medium text-text-muted">Total Events:</span>
        <span className="font-semibold">{events.length}</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-medium text-text-muted">Critical:</span>
        <span
          className={`font-semibold ${criticalEvents > 0 ? 'text-red-600' : 'text-green-600'}`}
        >
          {criticalEvents}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-medium text-text-muted">Delays:</span>
        <span
          className={`font-semibold ${delays > 0 ? 'text-amber-600' : 'text-green-600'}`}
        >
          {delays}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-medium text-text-muted">Last Activity:</span>
        <span className="font-semibold">{lastActivity}</span>
      </div>
    </div>
  );
}
