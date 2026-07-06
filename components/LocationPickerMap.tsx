'use client';
import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon paths in Next.js builds
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const customerIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

interface Props {
    value: { lat: number; lng: number };
    onChange: (coords: { lat: number; lng: number }) => void;
}

// Helper to keep map view centered when the value changes from outside (e.g. Locate Me)
function ChangeView({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
}

// Helper to click anywhere on map and place marker
function MapEventsHandler({ onChange }: { onChange: (coords: { lat: number; lng: number }) => void }) {
    useMapEvents({
        click(e) {
            onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
        },
    });
    return null;
}

export default function LocationPickerMap({ value, onChange }: Props) {
    const markerRef = useRef<L.Marker | null>(null);

    const eventHandlers = {
        dragend() {
            const marker = markerRef.current;
            if (marker != null) {
                const latLng = marker.getLatLng();
                onChange({ lat: latLng.lat, lng: latLng.lng });
            }
        },
    };

    return (
        <MapContainer
            center={[value.lat, value.lng]}
            zoom={15}
            style={{ height: '220px', width: '100%', borderRadius: '12px', zIndex: 10 }}
            zoomControl={true}
        >
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <ChangeView center={[value.lat, value.lng]} />
            <MapEventsHandler onChange={onChange} />
            <Marker
                draggable={true}
                eventHandlers={eventHandlers}
                position={[value.lat, value.lng]}
                ref={markerRef}
                icon={customerIcon}
            />
        </MapContainer>
    );
}
