"use client";
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function VerificationForm({ initialReason }: { initialReason?: string | null }) {
  const [details, setDetails] = useState(initialReason ?? '');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/verification/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ legalName: details || 'N/A', country: 'N/A' }),
      });
      if (res.ok) {
        toast.success('Verification submitted');
      } else {
        const data = await res.json();
        toast.error(data.message || 'Error');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <textarea
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        placeholder="Explain your verification details"
        className="w-full rounded border px-3 py-2 text-sm"
        rows={3}
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded bg-blue-600 px-3 py-1 text-sm text-white disabled:opacity-50"
      >
        {loading ? 'Submitting…' : 'Submit for verification'}
      </button>
    </form>
  );
}
