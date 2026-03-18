export interface RealtimeAdapter<T> {
  subscribe(callback: (data: T) => void): () => void;
}
