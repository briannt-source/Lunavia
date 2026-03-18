export interface AuditTrailItem {
  at: string;
  action: string;
  actor?: string;
}

export default function AuditTrail({ items }: { items: AuditTrailItem[] }) {
  return (
    <div className="rounded border bg-white p-4">
      <h3 className="text-sm font-medium text-gray-900">Audit Trail</h3>
      <ul className="mt-3 space-y-2 text-sm text-gray-700">
        {items.length === 0 ? (
          <li className="text-gray-500">No audit entries.</li>
        ) : (
          items.map((item, idx) => (
            <li key={idx} className="flex items-start justify-between gap-4">
              <span className="text-gray-600">{item.at}</span>
              <span className="flex-1">{item.action}</span>
              {item.actor && <span className="text-gray-500">{item.actor}</span>}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
