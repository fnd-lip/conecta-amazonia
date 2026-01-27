import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import L from 'leaflet';
import './LocationPicker.css';

// Fix for Leaflet default icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

type LocationValue = {
  latitude: number;
  longitude: number;
};

interface LocationPickerProps {
  value: LocationValue | null;
  onSelect: (value: LocationValue) => void;
}

function LocationMarker({
  position,
  onSelect,
}: {
  position: LocationValue | null;
  onSelect: (value: LocationValue) => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView([position.latitude, position.longitude], map.getZoom(), {
        animate: true,
      });
    }
  }, [map, position]);

  useMapEvents({
    click(e) {
      onSelect({ latitude: e.latlng.lat, longitude: e.latlng.lng });
    },
  });

  if (!position) return null;
  return <Marker position={[position.latitude, position.longitude]} />;
}

export default function LocationPicker({ value, onSelect }: LocationPickerProps) {
  const center: [number, number] = value
    ? [value.latitude, value.longitude]
    : [-3.119, -60.0217];

  return (
    <div className="location-picker">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        className="location-picker__map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={value} onSelect={onSelect} />
      </MapContainer>
      <div className="location-picker__hint">
        Clique no mapa para ajustar a localizacao.
      </div>
    </div>
  );
}
