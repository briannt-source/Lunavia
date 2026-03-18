import { subscribeToTourLiveUpdates } from './mockTourLiveStream';
import { TourLiveUpdate } from '@/domain/tour/TourLiveUpdate';
import { RealtimeAdapter } from '@/domain/realtime/RealtimeAdapter';

export const MockRealtimeAdapter: RealtimeAdapter<TourLiveUpdate> = {
  subscribe: (cb) => subscribeToTourLiveUpdates(cb),
};
