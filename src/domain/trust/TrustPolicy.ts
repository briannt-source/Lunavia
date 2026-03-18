import { TrustState } from './TrustState';

// Business rules around what a user can do based on their TrustState.
// Pure functions only — no imports from frameworks or infrastructure.

export function canLogin(state: TrustState): boolean {
  return state !== 'BLOCKED';
}

export function canAccessDashboard(state: TrustState): boolean {
  return state === 'VERIFIED' || state === 'PENDING';
}

export function canRequestService(state: TrustState): boolean {
  return state === 'VERIFIED';
}
