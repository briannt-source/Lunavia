export default function StateBanner({ state }: { state: string }) {
  return (
    <div className="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
      Current state: {state}
    </div>
  );
}
