"use client";
import { useState } from 'react';
import { InMemoryReferralRepo } from '@/infrastructure/repositories/inMemoryReferralRepo';

export default function ReferralConfigPanel() {
  const initial = InMemoryReferralRepo.getPolicy();
  const [enabled, setEnabled] = useState(initial.enabled);
  const [days, setDays] = useState(initial.reward.value);

  function save() {
    InMemoryReferralRepo.setPolicy({
      enabled,
      reward: { type: 'PRO_DAYS', value: Number(days) },
    });
  }

  return (
    <div className="space-y-4 rounded border border-border-subtle bg-white p-4">
      <div className="flex items-center gap-2">
        <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
        <span className="text-sm">Referral enabled</span>
      </div>
      <div className="space-y-1">
        <label className="text-xs text-text-muted">Reward (PRO days)</label>
        <input
          type="number"
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="w-32 rounded border px-2 py-1 text-sm"
        />
      </div>
      <button
        type="button"
        onClick={save}
        className="rounded bg-lunavia-primary px-3 py-1 text-sm text-white"
      >
        Save
      </button>
    </div>
  );
}
