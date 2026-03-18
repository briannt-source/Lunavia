import { RealtimeAdapter } from '@/domain/realtime/RealtimeAdapter';
import { TourLiveUpdate } from '@/domain/tour/TourLiveUpdate';

export function WebSocketRealtimeAdapter(url: string): RealtimeAdapter<TourLiveUpdate> {
  return {
    subscribe(callback) {
      const ws = new WebSocket(url);
      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data) as TourLiveUpdate;
          callback(data);
        } catch (_) {}
      };
      return () => ws.close();
    },
  };
}
