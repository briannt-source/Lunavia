export function isAdmin(role: string | undefined): boolean {
  return (
    role === 'SUPER_ADMIN' ||
    role === 'ADMIN' ||
    role === 'OPS' ||
    role === 'CS' ||
    role === 'FINANCE' ||
    role === 'KYC_ANALYST'
  );
}
