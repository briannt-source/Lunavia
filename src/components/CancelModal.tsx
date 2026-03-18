"use client";
import { useState } from 'react';

export default function CancelModal() {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
      >
        Cancel Service
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-sm rounded bg-white p-4 text-sm shadow">
            <h3 className="font-medium">Cancel Service</h3>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Free-text reason"
              className="mt-3 h-24 w-full rounded border px-2 py-1"
            />
            <div className="mt-4 flex justify-end space-x-2">
              <button onClick={() => setOpen(false)} className="px-3 py-1">Close</button>
              <button disabled className="rounded bg-red-600 px-3 py-1 text-white opacity-50">
                Confirm (disabled)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
