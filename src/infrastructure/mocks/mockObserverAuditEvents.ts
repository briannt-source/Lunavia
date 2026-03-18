/**
 * Mock Observer Audit Events — Stub for Observer API
 * 
 * Provides mock data for the observer audit endpoint until
 * real audit event storage is implemented.
 */

interface AuditEvent {
    id: string;
    tourRunId: string;
    companyId: string;
    eventType: string;
    timestamp: string;
    actor: string;
    description: string;
}

const MOCK_EVENTS: AuditEvent[] = [];

export function getAuditEventsByTourRunId(tourRunId: string): AuditEvent[] {
    return MOCK_EVENTS.filter(e => e.tourRunId === tourRunId);
}

export function getCompanyIdForTourRun(tourRunId: string): string | null {
    const event = MOCK_EVENTS.find(e => e.tourRunId === tourRunId);
    return event?.companyId || null;
}
