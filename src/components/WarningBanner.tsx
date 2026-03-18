export default function WarningBanner({ text }: { text: string }) {
  return (
    <div className="rounded border-l-4 border-yellow-500 bg-yellow-50 p-4 text-sm text-yellow-800">
      {text}
    </div>
  );
}
