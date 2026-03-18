"use client";
import { useState } from 'react';
import { VerificationDecision } from '@/domain/verification/VerificationDecision';
import {import toast from 'react-hot-toast';
import { VerificationSubmission } from '@/domain/verification/VerificationSubmission';

interface Props {
  submission: VerificationSubmission;
}

export default function VerificationCard({ submission }: Props) {
  const [state, setState] = useState(submission);
  const loading = state.status === 'APPROVED' || state.status === 'REJECTED';

  async function decide(decision: VerificationDecision) {
    try {
      const res = await fetch('/api/admin/verification/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: state.userId, decision }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Decision recorded');
        setState((prev) => ({ ...prev, status: data.status }));
      } else {
        toast.error(data.message || 'Error');
      }
    } catch (e: any) {
      toast.error('Network error');
    }
  }

  return (
    <div className="rounded border p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">User: {state.userId}</p>
          <p className="text-xs text-text-muted">Submitted: {new Date(state.submittedAt).toLocaleString()}</p>
        </div>
        <span className="text-xs font-semibold">{state.status}</span>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          className="rounded bg-green-600 px-3 py-1 text-xs text-white disabled:opacity-40"
          disabled={loading || state.status !== 'PENDING'}
          onClick={() => decide(VerificationDecision.APPROVE)}
        >
          Approve
        </button>
        <button
          className="rounded bg-red-600 px-3 py-1 text-xs text-white disabled:opacity-40"
          disabled={loading || state.status !== 'PENDING'}
          onClick={() => decide(VerificationDecision.REJECT)}
        >
          Reject
        </button>
      </div>
    </div>
  );
}
