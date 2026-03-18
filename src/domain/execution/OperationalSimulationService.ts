/**
 * OperationalSimulationService — Tour Operations Simulation Engine
 *
 * Simulates real tour operations for testing and validation.
 * All simulated data is flagged with isSimulation = true.
 *
 * Safety:
 *   - No real payments
 *   - No real trust penalties
 *   - No real notifications
 *   - All events tagged isSimulation = true
 */

import { prisma } from '@/lib/prisma';
import { TourExecutionEventService, EXECUTION_EVENT_TYPES } from './TourExecutionEventService';

// ── Constants ─────────────────────────────────────────────────────────

const SIMULATION_PREFIX = '[SIM]';

const SCENARIOS = {
    NORMAL_EXECUTION: 'NORMAL_EXECUTION',
    GUIDE_LATE_REPLACEMENT: 'GUIDE_LATE_REPLACEMENT',
    GUIDE_NO_SHOW: 'GUIDE_NO_SHOW',
    EMERGENCY_SOS: 'EMERGENCY_SOS',
    SEGMENT_CHECKINS: 'SEGMENT_CHECKINS',
    TOUR_COMPLETION: 'TOUR_COMPLETION',
} as const;

type SimulationScenario = keyof typeof SCENARIOS;

// ── Simulation Engine ─────────────────────────────────────────────────

interface SimulationConfig {
    scenario: SimulationScenario;
    tourCount: number; // 10, 50, 100
    operatorId: string;
}

/**
 * Run a full simulation: creates tours, guide assignments, and execution events.
 * All data is flagged as simulation — no real side effects.
 */
async function runSimulation(config: SimulationConfig) {
    const { scenario, tourCount, operatorId } = config;

    // Verify operator exists
    const operator = await prisma.user.findUnique({
        where: { id: operatorId },
        select: { id: true, name: true },
    });
    if (!operator) throw new Error('OPERATOR_NOT_FOUND');

    const results: Array<{
        tourId: string;
        title: string;
        scenario: string;
        eventsGenerated: number;
        status: 'SUCCESS' | 'ERROR';
    }> = [];
    const errors: Array<{ index: number; error: string }> = [];
    let totalEventsGenerated = 0;

    for (let i = 0; i < tourCount; i++) {
        try {
            const result = await simulateSingleTour(operatorId, scenario, i);
            totalEventsGenerated += result.eventsGenerated;
            results.push({ ...result, status: 'SUCCESS' });
        } catch (err: any) {
            errors.push({ index: i, error: err?.message || String(err) });
        }
    }

    const successCount = results.length;
    const errorCount = errors.length;

    return {
        scenario,
        tourCount,
        simulatedTours: successCount,
        totalEventsGenerated,
        errorCount,
        results,
        errors,
        summary: {
            success: successCount,
            failed: errorCount,
            totalEvents: totalEventsGenerated,
            operatorId,
            operatorName: operator.name || operatorId,
        },
        message: `${SIMULATION_PREFIX} Simulated ${successCount}/${tourCount} tours with scenario: ${scenario}` +
            (errorCount > 0 ? ` (${errorCount} errors)` : ''),
    };
}

/**
 * Simulate a single tour lifecycle.
 */
async function simulateSingleTour(
    operatorId: string,
    scenario: SimulationScenario,
    index: number
) {
    const now = new Date();
    const startTime = new Date(now.getTime() + (index + 1) * 3600000); // stagger by 1h each
    const endTime = new Date(startTime.getTime() + 4 * 3600000); // 4h tour

    // 1. Create simulated tour
    const tour = await prisma.serviceRequest.create({
        data: {
            operatorId,
            title: `${SIMULATION_PREFIX} Tour ${index + 1} - ${scenario}`,
            description: `Simulated tour for scenario: ${scenario}`,
            startTime,
            endTime,
            location: 'Simulation City',
            province: 'Simulation Province',
            language: 'English',
            status: 'ASSIGNED',
            visibility: 'PRIVATE',
            groupSize: Math.floor(Math.random() * 15) + 5,
            durationMinutes: 240,
            totalPayout: Math.floor(Math.random() * 3000000) + 500000,
            currency: 'VND',
        },
    });

    // 2. Generate execution events based on scenario
    const events = await generateScenarioEvents(tour.id, scenario);

    return {
        tourId: tour.id,
        title: tour.title,
        scenario,
        eventsGenerated: events.length,
    };
}

/**
 * Generate execution events for a specific scenario.
 * All events are marked isSimulation = true.
 */
async function generateScenarioEvents(tourId: string, scenario: SimulationScenario) {
    const events: any[] = [];
    // IMPORTANT: Never simulate SUPER_ADMIN actors — only TOUR_OPERATOR, TOUR_GUIDE, OPS
    const createEvent = async (eventType: string, description: string, role = 'LEAD_GUIDE', metadata?: any, delayMs = 0) => {
        const event = await TourExecutionEventService.createExecutionEvent({
            tourId,
            eventType,
            role,
            description: `${SIMULATION_PREFIX} ${description}`,
            metadata: { ...metadata, simulatedAt: new Date(Date.now() + delayMs).toISOString() },
            isSimulation: true,
        });
        events.push(event);
        return event;
    };

    switch (scenario) {
        case 'NORMAL_EXECUTION':
            await createEvent(EXECUTION_EVENT_TYPES.GUIDE_VERIFIED, 'Lead guide identity verified.', 'LEAD_GUIDE', {}, 0);
            await createEvent('CONFIRM_PICKUP_ARRIVAL', 'Driver confirmed pickup arrival.', 'DRIVER', {}, 500);
            await createEvent(EXECUTION_EVENT_TYPES.PICKUP_STARTED, 'Pickup started at hotel.', 'LEAD_GUIDE', {}, 1000);
            await createEvent(EXECUTION_EVENT_TYPES.DEPARTURE_CONFIRMED, 'All guests on board. Departing.', 'LEAD_GUIDE', { guestCount: 8 }, 2000);
            await createEvent(EXECUTION_EVENT_TYPES.TOUR_STARTED, 'Tour commenced.', 'LEAD_GUIDE', {}, 3000);
            await createEvent(EXECUTION_EVENT_TYPES.SEGMENT_CHECKED_IN, 'Assistant checked in: Coral Island.', 'ASSISTANT_GUIDE', { segmentName: 'Coral Island' }, 4000);
            await createEvent(EXECUTION_EVENT_TYPES.SEGMENT_CHECKED_IN, 'Assistant checked in: Snorkeling.', 'ASSISTANT_GUIDE', { segmentName: 'Snorkeling' }, 5000);
            await createEvent(EXECUTION_EVENT_TYPES.SEGMENT_CHECKED_IN, 'Lead guide checked in: Lunch.', 'LEAD_GUIDE', { segmentName: 'Lunch' }, 6000);
            await createEvent(EXECUTION_EVENT_TYPES.TOUR_COMPLETED, 'Tour completed successfully.', 'LEAD_GUIDE', {}, 7000);
            break;

        case 'GUIDE_LATE_REPLACEMENT':
            await createEvent(EXECUTION_EVENT_TYPES.GUIDE_VERIFIED, 'Original guide verified.', 'LEAD_GUIDE', {}, 0);
            await createEvent(EXECUTION_EVENT_TYPES.GUIDE_REPLACED, 'Guide replaced due to emergency.', 'LEAD_GUIDE', { reason: 'Family emergency' }, 1000);
            await createEvent(EXECUTION_EVENT_TYPES.GUIDE_VERIFIED, 'Replacement guide verified.', 'LEAD_GUIDE', {}, 2000);
            await createEvent('CONFIRM_PICKUP_ARRIVAL', 'Driver confirmed pickup arrival (delayed).', 'DRIVER', {}, 2500);
            await createEvent(EXECUTION_EVENT_TYPES.PICKUP_STARTED, 'Pickup started (delayed 30min).', 'LEAD_GUIDE', {}, 3000);
            await createEvent(EXECUTION_EVENT_TYPES.TOUR_STARTED, 'Tour commenced after delay.', 'LEAD_GUIDE', {}, 4000);
            await createEvent(EXECUTION_EVENT_TYPES.TOUR_COMPLETED, 'Tour completed.', 'LEAD_GUIDE', {}, 5000);
            break;

        case 'GUIDE_NO_SHOW':
            await createEvent(EXECUTION_EVENT_TYPES.GUIDE_VERIFIED, 'Guide claims verified but did not appear.', 'LEAD_GUIDE', {}, 0);
            await createEvent('GUIDE_NO_SHOW', 'Guide did not show up. NoShow policy triggered.', 'LEAD_GUIDE', {}, 1000);
            await createEvent('ALERT_TRIGGERED', 'Operational alert: guide no-show.', 'LEAD_GUIDE', { alertType: 'GUIDE_NO_SHOW' }, 2000);
            break;

        case 'EMERGENCY_SOS':
            await createEvent('SOS_BROADCAST_TRIGGERED', 'SOS broadcast sent to 25 guides.', 'LEAD_GUIDE', { broadcastCount: 25 }, 0);
            await createEvent('SOS_GUIDE_ACCEPTED', 'Guide responded to SOS.', 'LEAD_GUIDE', {}, 1000);
            await createEvent(EXECUTION_EVENT_TYPES.GUIDE_VERIFIED, 'SOS guide verified.', 'LEAD_GUIDE', {}, 2000);
            await createEvent('CONFIRM_PICKUP_ARRIVAL', 'Driver at pickup point.', 'DRIVER', {}, 2500);
            await createEvent(EXECUTION_EVENT_TYPES.PICKUP_STARTED, 'Emergency pickup started.', 'LEAD_GUIDE', {}, 3000);
            await createEvent(EXECUTION_EVENT_TYPES.TOUR_COMPLETED, 'Tour completed after SOS.', 'LEAD_GUIDE', {}, 4000);
            break;

        case 'SEGMENT_CHECKINS':
            await createEvent(EXECUTION_EVENT_TYPES.GUIDE_VERIFIED, 'Guide verified.', 'LEAD_GUIDE', {}, 0);
            await createEvent(EXECUTION_EVENT_TYPES.TOUR_STARTED, 'Tour started.', 'LEAD_GUIDE', {}, 1000);
            for (let i = 1; i <= 6; i++) {
                const role = i % 2 === 0 ? 'ASSISTANT_GUIDE' : 'LEAD_GUIDE';
                await createEvent(EXECUTION_EVENT_TYPES.SEGMENT_CHECKED_IN, `${role === 'ASSISTANT_GUIDE' ? 'Assistant' : 'Lead'} checked in: Segment ${i}.`, role, { segmentIndex: i }, 1000 + i * 500);
            }
            await createEvent(EXECUTION_EVENT_TYPES.TOUR_COMPLETED, 'All segments completed.', 'LEAD_GUIDE', {}, 5000);
            break;

        case 'TOUR_COMPLETION':
            await createEvent(EXECUTION_EVENT_TYPES.GUIDE_VERIFIED, 'Guide verified.', 'LEAD_GUIDE', {}, 0);
            await createEvent('CONFIRM_PICKUP_ARRIVAL', 'Driver Minh confirmed pickup arrival.', 'DRIVER', {}, 500);
            await createEvent(EXECUTION_EVENT_TYPES.PICKUP_STARTED, 'Pickup complete.', 'LEAD_GUIDE', {}, 1000);
            await createEvent(EXECUTION_EVENT_TYPES.DEPARTURE_CONFIRMED, 'Departed.', 'LEAD_GUIDE', {}, 2000);
            await createEvent(EXECUTION_EVENT_TYPES.TOUR_STARTED, 'Tour in progress.', 'LEAD_GUIDE', {}, 3000);
            await createEvent(EXECUTION_EVENT_TYPES.INCIDENT_REPORTED, 'Minor incident: guest delayed.', 'ASSISTANT_GUIDE', { severity: 'LOW' }, 4000);
            await createEvent(EXECUTION_EVENT_TYPES.TOUR_COMPLETED, 'Tour completed with minor incident.', 'LEAD_GUIDE', {}, 5000);
            break;
    }

    return events;
}

// ── Cleanup ───────────────────────────────────────────────────────────

/**
 * Remove all simulation data. Safe — only deletes records where isSimulation = true
 * or tours with [SIM] prefix.
 */
async function cleanupSimulation() {
    // Delete simulation execution events
    const deletedEvents = await (prisma as any).tourExecutionEvent.deleteMany({
        where: { isSimulation: true },
    });

    // Delete simulation tours
    const deletedTours = await prisma.serviceRequest.deleteMany({
        where: { title: { startsWith: SIMULATION_PREFIX } },
    });

    return {
        deletedEvents: deletedEvents.count,
        deletedTours: deletedTours.count,
        message: `${SIMULATION_PREFIX} Cleanup complete.`,
    };
}

// ── Exports ───────────────────────────────────────────────────────────

export const OperationalSimulationService = {
    runSimulation,
    cleanupSimulation,
    SCENARIOS,
    SIMULATION_PREFIX,
};
