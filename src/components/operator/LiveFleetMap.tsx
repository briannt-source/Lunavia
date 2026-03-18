'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon path issues in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/icons/marker-icon-2x.png',
    iconUrl: '/icons/marker-icon.png',
    shadowUrl: '/icons/marker-shadow.png',
});

// Custom Icons for different statuses
const createCustomIcon = (bgColor: string) => {
    return L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: ${bgColor}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
    });
};

const activeIcon = createCustomIcon('#10b981'); // Emerald
const idleIcon = createCustomIcon('#f59e0b'); // Amber

interface FleetData {
    tourId: string;
    tourTitle: string;
    guideName: string;
    guideAvatar?: string;
    plannedLocation: string;
    currentLocation: {
        latitude: number;
        longitude: number;
        speed?: number;
        lastUpdate: string;
    } | null;
}

// Helper to auto-fit bounds
function MapBoundsUpdater({ markers }: { markers: L.LatLngTuple[] }) {
    const map = useMap();
    useEffect(() => {
        if (markers.length > 0) {
            const bounds = L.latLngBounds(markers);
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }
    }, [map, markers]);
    return null;
}

export default function LiveFleetMap({ fleet }: { fleet: FleetData[] }) {
    const defaultCenter: L.LatLngTuple = [10.762622, 106.660172]; // HCMC Default

    // Extract all valid locations for bounds
    const activeLocations: L.LatLngTuple[] = fleet
        .filter(f => f.currentLocation)
        .map(f => [f.currentLocation!.latitude, f.currentLocation!.longitude]);

    return (
        <div className="w-full h-full relative z-0">
            <style jsx global>{`
                .leaflet-container {
                    width: 100%;
                    height: 100%;
                    min-height: 700px;
                    border-radius: 12px;
                    z-index: 0;
                }
            `}</style>
            
            <MapContainer center={defaultCenter} zoom={12} scrollWheelZoom={true}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {activeLocations.length > 0 && <MapBoundsUpdater markers={activeLocations} />}

                {fleet.filter(f => f.currentLocation).map(tour => {
                    const loc = tour.currentLocation!;
                    const isMoving = (loc.speed || 0) > 1; // Faster than 1 m/s (approx walking pace)
                    
                    return (
                        <Marker 
                            key={tour.tourId} 
                            position={[loc.latitude, loc.longitude]}
                            icon={isMoving ? activeIcon : idleIcon}
                        >
                            <Popup className="rounded-xl">
                                <div className="p-1 min-w-[200px]">
                                    <h3 className="font-bold text-slate-900 leading-tight mb-2">{tour.tourTitle}</h3>
                                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
                                        {tour.guideAvatar ? (
                                            <img src={tour.guideAvatar} alt="Guide" className="w-6 h-6 rounded-full" />
                                        ) : (
                                            <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-500">
                                                {tour.guideName[0]}
                                            </div>
                                        )}
                                        <span className="text-sm font-medium text-slate-700">{tour.guideName}</span>
                                    </div>
                                    <div className="text-xs text-slate-500 space-y-1">
                                        <div><span className="font-semibold text-slate-600">Location:</span> {tour.plannedLocation}</div>
                                        <div><span className="font-semibold text-slate-600">Speed:</span> {loc.speed ? `${Math.round(loc.speed)} m/s` : 'Stationary'}</div>
                                        <div><span className="font-semibold text-slate-600">Updated:</span> {new Date(loc.lastUpdate).toLocaleTimeString()}</div>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
}
