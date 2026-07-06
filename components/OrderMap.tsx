'use client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon
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

const shopIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const riderIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface Props {
  customerLocation: { lat: number; lng: number; address: string };
  riderLocation: { lat: number; lng: number } | null;
  shopLocation?: { lat: number; lng: number; address: string } | null;
}

export default function OrderMap({ customerLocation, riderLocation, shopLocation }: Props) {
  return (
    <MapContainer center={[customerLocation.lat, customerLocation.lng]} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false}>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={[customerLocation.lat, customerLocation.lng]} icon={customerIcon}>
        <Popup>Delivery Location: {customerLocation.address}</Popup>
      </Marker>
      {shopLocation && (
        <Marker position={[shopLocation.lat, shopLocation.lng]} icon={shopIcon}>
          <Popup>🏪 Restaurant: {shopLocation.address}</Popup>
        </Marker>
      )}
      {riderLocation && (
        <Marker position={[riderLocation.lat, riderLocation.lng]} icon={riderIcon}>
          <Popup>🛵 Your Rider</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
