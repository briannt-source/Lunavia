import { MockRealtimeAdapter } from './MockRealtimeAdapter';
import { WebSocketRealtimeAdapter } from './WebSocketRealtimeAdapter';
import { RealtimeAdapter } from '@/domain/realtime/RealtimeAdapter';
import { TourLiveUpdate } from '@/domain/tour/TourLiveUpdate';

export const realtimeAdapter: RealtimeAdapter<TourLiveUpdate> =
  process.env.NEXT_PUBLIC_REALTIME === 'ws'
    ? WebSocketRealtimeAdapter(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000')
    : MockRealtimeAdapter;
