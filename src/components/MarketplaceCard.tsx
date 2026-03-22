import VerifiedBadge from './VerifiedBadge';

interface Props {
  title: string;
  location: string;
  operator: string;
  verified: boolean;
  availability: string;
}

export default function MarketplaceCard({ title, location, operator, verified, availability }: Props) {
  return (
    <div className="rounded border bg-white p-4 shadow-sm">
      <h3 className="line-clamp-1 text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-xs text-gray-600">{location}</p>
      <p className="mt-1 text-xs text-gray-600">Provider: {operator}</p>
      <div className="mt-2 flex items-center justify-between text-xs">
        <VerifiedBadge verified={verified} />
        <span className="text-gray-500">{availability}</span>
      </div>
      <a
        href="/login"
        className="mt-3 block rounded bg-lunavia-primary px-3 py-1 text-center text-xs font-medium text-white hover:bg-lunavia-primary-hover"
      >
        View details
      </a>
    </div>
  );
}
