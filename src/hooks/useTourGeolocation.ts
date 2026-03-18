import { useEffect, useRef, useState } from 'react';

interface GeolocationHookProps {
    tourId: string;
    isActive: boolean; // Only ping when the tour is IN_PROGRESS
    pingIntervalMs?: number; // Default 60 seconds
}

export function useTourGeolocation({ tourId, isActive, pingIntervalMs = 60000 }: GeolocationHookProps) {
    const [lastPingAt, setLastPingAt] = useState<Date | null>(null);
    const [error, setError] = useState<string | null>(null);
    const watchIdRef = useRef<number | null>(null);
    const latestPosRef = useRef<GeolocationPosition | null>(null);

    // 1. Keep track of the device's latest position using watchPosition (highest accuracy, low battery drain compared to polling)
    useEffect(() => {
        if (!isActive) {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
                watchIdRef.current = null;
            }
            return;
        }

        if (!('geolocation' in navigator)) {
            setError('Geolocation is not supported by your browser.');
            return;
        }

        watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                latestPosRef.current = pos;
                setError(null);
            },
            (err) => {
                console.error('Geolocation watch error:', err);
                setError(`Location error: ${err.message}`);
            },
            {
                enableHighAccuracy: true,
                maximumAge: 10000,
                timeout: 20000,
            }
        );

        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, [isActive]);

    // 2. Transmit the latest known position on an interval interval
    useEffect(() => {
        if (!isActive) return;

        const transmitLocation = async () => {
            const pos = latestPosRef.current;
            if (!pos) return;

            try {
                const res = await fetch(`/api/tours/${tourId}/location`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude,
                        accuracy: pos.coords.accuracy,
                        speed: pos.coords.speed,
                        heading: pos.coords.heading,
                    }),
                });

                if (res.ok) {
                    setLastPingAt(new Date());
                    setError(null);
                } else {
                    const data = await res.json();
                    setError(data.error || 'Failed to transmit location');
                }
            } catch (err: any) {
                console.error('Ping transmission error:', err);
                setError('Network error transmitting location');
            }
        };

        // Fire immediately once on mount/activation
        transmitLocation();
        
        // Then loop
        const interval = setInterval(transmitLocation, pingIntervalMs);
        return () => clearInterval(interval);
    }, [tourId, isActive, pingIntervalMs]);

    return { lastPingAt, error, isTracking: isActive && !error };
}
