export default function VerifiedBadge({ verified }: { verified: boolean }) {
  return (
    <span
      className={
        verified
          ? 'inline-block rounded bg-lunavia-primary px-2 py-0.5 text-xs font-semibold text-white'
          : 'inline-block rounded border border-gray-400 px-2 py-0.5 text-xs font-medium text-gray-600'
      }
    >
      {verified ? 'VERIFIED' : 'UNVERIFIED'}
    </span>
  );
}
