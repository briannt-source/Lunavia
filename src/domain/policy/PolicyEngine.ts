import { PolicyAction } from './PolicyAction';
import { PolicySubject } from './PolicySubject';
import { PolicyContext } from './PolicyContext';
import { PolicyDecision } from './PolicyDecision';

export function evaluatePolicy(
  _subject: PolicySubject,
  _action: PolicyAction,
  _context: PolicyContext
): PolicyDecision {
  // IMPORTANT:
  // This is a STUB implementation.
  // All actions are allowed for now.
  // Enforcement will be added in later steps.

  return { allowed: true };
}
