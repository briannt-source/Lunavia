import { TourLiveUpdate } from '@/domain/tour/TourLiveUpdate';
import { getActiveTourRuns } from '../mocks/mockTourRuns';

// This mimics a WebSocket subscription
export function subscribeToTourLiveUpdates(callback: (update: TourLiveUpdate) => void) {
  const intervalId = setInterval(() => {
    const tours = getActiveTourRuns();
    if (tours.length === 0) return;

    // Pick a random tour to update
    const tourToUpdate = tours[Math.floor(Math.random() * tours.length)];

    // Slightly change its coordinates
    const newLat = (tourToUpdate as any).latitude + (Math.random() - 0.5) * 0.001;
    const newLng = (tourToUpdate as any).longitude + (Math.random() - 0.5) * 0.001;

    callback({
      tourId: tourToUpdate.id,
      latitude: newLat,
      longitude: newLng,
      timestamp: Date.now(),
    });
  }, 2500);

  // Return an unsubscribe function
  return () => clearInterval(intervalId);
}
