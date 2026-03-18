export default function StateRejected({ reason }: { reason?: string }) {
  return (
    <div className="rounded border-l-4 border-red-600 bg-red-50 p-4 text-sm text-red-800">
      Your submission was rejected.{reason ? ` Reason: ${reason}` : ''}
    </div>
  );
}
