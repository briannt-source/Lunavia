"use client";
interface Event {
  type: 'SUBMITTED' | 'REJECTED' | 'APPROVED';
  at: string;
  message?: string;
}

export default function VerificationAuditTrail({ events }: { events: Event[] }) {
  if (!events.length) return null;
  return (
    <ul className="mt-4 space-y-2 border-l pl-4 text-sm">
      {events.map((e, idx) => (
        <li key={idx} className="flex gap-2">
          <span>
            {e.type === 'SUBMITTED' && '🕒'}
            {e.type === 'REJECTED' && '⚠️'}
            {e.type === 'APPROVED' && '✅'}
          </span>
          <div>
            <p className="font-medium">{e.type}</p>
            {e.message && <p className="text-xs text-text-muted">{e.message}</p>}
            <p className="text-xs text-text-muted">{new Date(e.at).toLocaleString()}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
