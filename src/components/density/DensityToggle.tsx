"use client";
import { useDensity } from './DensityProvider';

export default function DensityToggle() {
  const { density, toggle } = useDensity();
  return (
    <button
      onClick={toggle}
      aria-label="Toggle density"
      className="rounded p-1 text-gray-500 transition hover:bg-gray-100"
    >
      {density === 'comfortable' ? (
        // compact icon
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M3 5h14M3 10h14M3 15h14" />
        </svg>
      ) : (
        // comfortable icon (more spacing)
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M3 4h14M3 10h14M3 16h14" />
        </svg>
      )}
    </button>
  );
}
