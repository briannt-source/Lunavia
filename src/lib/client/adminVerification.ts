export async function approveVerification(id: string) {
  const res = await fetch(`/api/admin/verification/${id}/approve`, { method: 'POST' });
  if (!res.ok) throw new Error('Approve failed');
  return res.json();
}

export async function rejectVerification(id: string, reason: string) {
  const res = await fetch(`/api/admin/verification/${id}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) throw new Error('Reject failed');
  return res.json();
}

export async function requestVerification(userId: string) {
  const res = await fetch(`/api/admin/verification/${userId}/request`, { method: 'POST' });
  if (!res.ok) throw new Error('Request failed');
  return res.json();
}
