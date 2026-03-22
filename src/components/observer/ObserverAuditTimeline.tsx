"use client";
import useSWR from 'swr';
import { useMemo, useState } from 'react';
import ObserverInsights from './ObserverInsights';
import { PolicyGuard } from '@/components/policy/PolicyGuard';
import { PolicyAction } from '@/domain/policy';

interface Event {
  id: string;
  tourRunId: string;
  type:
  | 'TOUR_STARTED'
  | 'GPS_UPDATE'
  | 'CHECKPOINT_REACHED'
  | 'DELAY_REPORTED'
  | 'TOUR_COMPLETED'
  | 'INCIDENT_REPORTED'
  | 'STATUS_CHANGE'
  | 'CHECKPOINT'
  // Additional semantic types supported for UI mapping
  | 'START_DELAYED'
  | 'GPS_STOPPED'
  | 'ROUTE_DEVIATION'
  | 'EMERGENCY'
  | 'SOS_TRIGGERED'
  | 'TOUR_CANCELLED';
  message: string;
  timestamp: string | number | Date;
  actor?: string;
}

type EventFilter = 'ALL' | 'GPS' | 'DELAY' | 'INCIDENT' | 'SYSTEM';

type TimeWindow = 'FULL' | '15M' | '1H';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Group = 'GPS' | 'DELAY' | 'INCIDENT' | 'SYSTEM';

function styleForType(type: Event['type']) {
  switch (type) {
    case 'TOUR_STARTED':
      return { label: 'Tour started', dot: 'bg-green-600', border: 'border-green-200', icon: '▶', group: 'SYSTEM' as Group };
    case 'GPS_UPDATE':
      return { label: 'GPS update', dot: 'bg-lunavia-primary', border: 'border-lunavia-muted/60', icon: '⌖', group: 'GPS' as Group };
    case 'CHECKPOINT_REACHED':
      return { label: 'Checkpoint reached', dot: 'bg-teal-600', border: 'border-teal-200', icon: '⚑', group: 'SYSTEM' as Group };
    case 'DELAY_REPORTED':
      return { label: 'Delay reported', dot: 'bg-amber-600', border: 'border-amber-200', icon: '!', group: 'DELAY' as Group };
    case 'TOUR_COMPLETED':
      return { label: 'Tour completed', dot: 'bg-gray-600', border: 'border-gray-200', icon: '✓', group: 'SYSTEM' as Group };
    case 'INCIDENT_REPORTED':
      return { label: 'Incident reported', dot: 'bg-red-600', border: 'border-red-200', icon: '⚠', group: 'INCIDENT' as Group };
    case 'START_DELAYED':
    case 'GPS_STOPPED':
    case 'ROUTE_DEVIATION':
      return { label: type.replace(/_/g, ' ').toLowerCase(), dot: 'bg-amber-600', border: 'border-amber-200', icon: '!', group: 'DELAY' as Group };
    case 'EMERGENCY':
    case 'SOS_TRIGGERED':
    case 'TOUR_CANCELLED':
      return { label: type.replace(/_/g, ' ').toLowerCase(), dot: 'bg-red-600', border: 'border-red-200', icon: '⚠', group: 'INCIDENT' as Group };
    case 'STATUS_CHANGE':
      return { label: 'Status change', dot: 'bg-gray-500', border: 'border-gray-200', icon: '•', group: 'SYSTEM' as Group };
    case 'CHECKPOINT':
      return { label: 'Checkpoint', dot: 'bg-gray-500', border: 'border-gray-200', icon: '•', group: 'SYSTEM' as Group };
    default:
      return { label: type, dot: 'bg-gray-500', border: 'border-gray-200', icon: '•', group: 'SYSTEM' as Group };
  }
}

function cutoffMs(window: TimeWindow): number | null {
  if (window === 'FULL') return null;
  const now = Date.now();
  if (window === '15M') return now - 15 * 60 * 1000;
  return now - 60 * 60 * 1000;
}

function csvEscape(value: string) {
  const needsQuotes = /[",\n]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows.map((r) => r.map(csvEscape).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function ObserverAuditTimeline({ tourRunId }: { tourRunId: string }) {
  const { data, isLoading } = useSWR(`/api/observer/tours/${tourRunId}/audit`, fetcher);
  const [eventFilter, setEventFilter] = useState<EventFilter>('ALL');
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('FULL');

  const allEvents: Event[] = useMemo(() => {
    if (!data?.success || !data.events) return [];
    return (data.events as Event[]).slice().sort((a: any, b: any) => {
      const ta = new Date(a.timestamp).getTime();
      const tb = new Date(b.timestamp).getTime();
      return tb - ta;
    });
  }, [data]);

  const filteredEvents = useMemo(() => {
    const cutoff = cutoffMs(timeWindow);

    return allEvents.filter((e) => {
      const ts = new Date(e.timestamp).getTime();
      if (cutoff && ts < cutoff) return false;

      const meta = styleForType(e.type);
      if (eventFilter === 'ALL') return true;
      return meta.group === eventFilter;
    });
  }, [allEvents, eventFilter, timeWindow]);

  function handleExportCsv() {
    const rows: string[][] = [
      ['Time', 'Event type', 'Message', 'Actor'],
      ...filteredEvents.map((e) => [
        new Date(e.timestamp).toLocaleString(),
        e.type,
        e.message,
        e.actor || 'system',
      ]),
    ];
    downloadCsv(`tour-${tourRunId}-audit.csv`, rows);
  }

  function handlePrintView() {
    window.print();
  }

  if (isLoading) {
    return <p className="mt-3 text-sm text-text-muted">Loading timeline…</p>;
  }

  if (!data?.success && !isLoading) {
    return <p className="mt-3 text-sm text-red-600">Unable to load timeline</p>;
  }

  if (allEvents.length === 0) {
    return <p className="mt-3 text-sm text-text-muted">No audit events</p>;
  }

  return (
    <div className="mt-3 rounded border border-border-subtle bg-white p-3 text-sm print:bg-white print:text-black">
      <div className="print:hidden">
        <ObserverInsights events={filteredEvents} />
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span>Event</span>
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value as EventFilter)}
              className="rounded border border-border-subtle bg-white px-2 py-1 text-xs"
            >
              <option value="ALL">All</option>
              <option value="GPS">GPS</option>
              <option value="DELAY">Delay</option>
              <option value="INCIDENT">Incident</option>
              <option value="SYSTEM">System</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span>Time</span>
            <select
              value={timeWindow}
              onChange={(e) => setTimeWindow(e.target.value as TimeWindow)}
              className="rounded border border-border-subtle bg-white px-2 py-1 text-xs"
            >
              <option value="FULL">Full tour</option>
              <option value="15M">Last 15 minutes</option>
              <option value="1H">Last 1 hour</option>
            </select>
          </div>
        </div>

        <PolicyGuard action={PolicyAction.EXPORT_AUDIT_DATA} fallback={<div />}>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="rounded border border-border-subtle px-3 py-1 text-xs text-text-muted"
            >
              ⭳ Export CSV
            </button>
            <button
              type="button"
              onClick={handlePrintView}
              className="rounded border border-border-subtle px-3 py-1 text-xs text-text-muted"
            >
              ⎙ Print view
            </button>
          </div>
        </PolicyGuard>
      </div>

      {filteredEvents.length === 0 ? (
        <p className="text-sm text-text-muted">No matching events</p>
      ) : (
        <ul className="space-y-3 border-l border-border-subtle pl-4">
          {filteredEvents.map((e) => {
            const s = styleForType(e.type);
            return (
              <li key={e.id} className={`relative pl-1 ${s.border}`}>
                <span className={`absolute -left-[9px] top-1.5 h-2 w-2 rounded-full ${s.dot}`} />
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium">
                      <span className="mr-2 text-text-muted">{s.icon}</span>
                      {s.label}
                    </p>
                    <p className="text-text-muted">{e.message}</p>
                  </div>
                  <p className="whitespace-nowrap text-xs text-text-muted">
                    {new Date(e.timestamp).toLocaleString()}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
