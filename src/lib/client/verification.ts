export interface VerificationDoc {
  url: string;
  type: string; // GOVERNMENT_ID, PROOF_OF_ADDRESS, BUSINESS_DOC
}

export async function submitVerification(payload: {
  role: string;
  documents: VerificationDoc[];
}) {
  const res = await fetch('/api/verification/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error((await res.json()).error || 'Verification submit failed');
  }
  return res.json();
}
