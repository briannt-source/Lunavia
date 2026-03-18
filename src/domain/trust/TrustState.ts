// Pure domain representation of user trust state within Lunavia.
// Framework-agnostic and free of side-effects.

export type TrustState =
  | 'UNVERIFIED' // User signed up but has not submitted verification
  | 'PENDING'    // Verification submitted and awaiting review
  | 'VERIFIED'   // Verification approved by admin
  | 'BLOCKED';   // Manually blocked (cannot use the platform)
