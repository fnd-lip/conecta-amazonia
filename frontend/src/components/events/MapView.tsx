import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './MapView.css';

// Fix for Leaflet default icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface EventLocation {
  id: string;
  nome: string;
  categoria: string;
  latitude?: number | null;
  longitude?: number | null;
  locationName?: string | null;
}

interface MapViewProps {
  events?: EventLocation[];
  focusedEventId?: string | null;
}

function MapFocus({
  latitude,
  longitude,
}: {
  latitude: number | null;
  longitude: number | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (latitude === null || longitude === null) return;
    map.flyTo([latitude, longitude], Math.max(map.getZoom(), 13), {
      animate: true,
      duration: 0.5,
    });
  }, [latitude, longitude, map]);

  return null;
}

export default function MapView({ events, focusedEventId }: MapViewProps) {
  const eventLocations = (events || []).filter(
    (event) =>
      Number.isFinite(event.latitude) && Number.isFinite(event.longitude)
  ) as Array<
    EventLocation & {
      latitude: number;
      longitude: number;
    }
  >;

  const centerPosition: [number, number] = eventLocations.length
    ? [eventLocations[0].latitude, eventLocations[0].longitude]
    : [-3.119, -60.0217];
  const focusedEvent = focusedEventId
    ? eventLocations.find((event) => event.id === focusedEventId)
    : null;
  const markerRefs = useRef<Record<string, L.Marker>>({});

  useEffect(() => {
    if (!focusedEvent) return;
    const marker = markerRefs.current[focusedEvent.id];
    if (marker) {
      marker.openPopup();
    }
  }, [focusedEvent?.id]);

  return (
    <div className="map-container">
      <MapContainer
        className="h-[400px] w-full z-0 relative"
        center={centerPosition}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapFocus
          latitude={focusedEvent ? focusedEvent.latitude : null}
          longitude={focusedEvent ? focusedEvent.longitude : null}
        />

        {eventLocations.map((event) => (
          <Marker
            key={event.id}
            position={[event.latitude, event.longitude]}
            ref={(marker) => {
              if (marker) {
                markerRefs.current[event.id] = marker;
              }
            }}
          >
            <Popup>
              <div className="popup-content">
                <strong>{event.nome}</strong>
                <br />
                <span className="popup-category">{event.categoria}</span>
                {event.locationName && (
                  <>
                    <br />
                    <span>{event.locationName}</span>
                  </>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
