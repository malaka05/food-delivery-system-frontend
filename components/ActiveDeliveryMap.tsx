'use client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const riderIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

interface Props {
  pickupLocation: { lat: number; lng: number; address: string };
  deliveryLocation: { lat: number; lng: number; address: string };
}

export default function ActiveDeliveryMap({ pickupLocation, deliveryLocation }: Props) {
  return (
    <MapContainer center={[deliveryLocation.lat, deliveryLocation.lng]} zoom={14} style={{ height: '100%', width: '100%', minHeight: '400px' }} zoomControl={false}>
      <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='&copy; OpenStreetMap contributors' />
      <Marker position={[pickupLocation.lat, pickupLocation.lng]}>
        <Popup>Pickup: {pickupLocation.address}</Popup>
      </Marker>
      <Marker position={[deliveryLocation.lat, deliveryLocation.lng]} icon={riderIcon}>
        <Popup>Deliver to: {deliveryLocation.address}</Popup>
      </Marker>
    </MapContainer>
  );
}
