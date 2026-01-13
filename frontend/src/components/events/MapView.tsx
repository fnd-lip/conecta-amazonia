import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './MapView.css';

// Fix para os ícones padrão do Leaflet no React
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
  latitude: number;
  longitude: number;
}

interface MapViewProps {
  events?: EventLocation[];
}

// Coordenadas mockadas para eventos (cidades da Amazônia)
const mockEventLocations: EventLocation[] = [
  {
    id: '1',
    nome: 'Semana Cultural',
    categoria: 'cultura',
    latitude: -3.119,
    longitude: -60.0217,
  }, // Manaus
  {
    id: '2',
    nome: 'Oficina de dança',
    categoria: 'cultura',
    latitude: -3.1428,
    longitude: -58.4443,
  }, // Itacoatiara
  {
    id: '3',
    nome: 'Feira de alimentos',
    categoria: 'gastronomia',
    latitude: -2.6276,
    longitude: -56.7358,
  }, // Parintins
  {
    id: '4',
    nome: 'Festival da Amazônia',
    categoria: 'festividade',
    latitude: -3.3537,
    longitude: -64.7106,
  }, // Tefé
  {
    id: '5',
    nome: 'Mostra de Artesanato',
    categoria: 'cultura',
    latitude: -3.132,
    longitude: -59.985,
  }, // Manaus Centro
];

export default function MapView({ events }: MapViewProps) {
  const eventLocations = events || mockEventLocations;

  // Centro do mapa (Manaus - coração da Amazônia)
  const centerPosition: [number, number] = [-3.119, -60.0217];

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

        {eventLocations.map((event) => (
          <Marker key={event.id} position={[event.latitude, event.longitude]}>
            <Popup>
              <div className="popup-content">
                <strong>{event.nome}</strong>
                <br />
                <span className="popup-category">{event.categoria}</span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
