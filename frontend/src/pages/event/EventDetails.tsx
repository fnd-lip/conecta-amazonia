import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_URL } from '@/config/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, ExternalLink, ArrowLeft, MapPin } from 'lucide-react';
import TicketPurchase from './components/TicketPurchase';
import MapView from '@/components/events/MapView';
import type { TicketLot } from './components/TicketPurchase';

interface Subevento {
  id: string;
  nome: string;
  descricao: string;
  data: string;
  categoria: string;
  createdAt: string;
  parentId: string | null;
}

interface EventData {
  id: string;
  nome: string;
  descricao: string;
  data: string;
  categoria: string;
  createdAt: string;
  parentId: string | null;
  logoUrl?: string;
  externalLink?: string;
  relatedLinks?: string[];
  latitude?: number | null;
  longitude?: number | null;
  locationName?: string | null;
  children?: Subevento[];
  ticketLots?: TicketLot[];
}

function formatDate(isoDate: string) {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return (
    d.toLocaleDateString('pt-BR', { timeZone: 'UTC' }) +
    ' ' +
    d.toLocaleTimeString('pt-BR', {
      timeZone: 'UTC',
      hour: '2-digit',
      minute: '2-digit',
    })
  );
}

const resolveImageUrl = (url: string) => {
  if (url.startsWith('http')) return url;
  const base = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${base}${path}`;
};

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      setError('ID do evento não informado.');
      setLoading(false);
      return;
    }

    async function fetchEvent() {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(`${API_URL}/events/${id}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Evento não encontrado.');
          }
          throw new Error('Erro ao buscar detalhes do evento.');
        }

        const data: EventData = await response.json();
        setEvent(data);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : 'Erro ao carregar o evento.'
        );
      } finally {
        setLoading(false);
      }
    }

    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-muted-foreground">
          Carregando detalhes do evento...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-destructive">{error}</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-muted-foreground">
          Nenhum dado de evento para exibir.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section
        className="relative h-100 bg-cover bg-center bg-no-repeat"
        style={
          event.logoUrl
            ? { backgroundImage: `url(${resolveImageUrl(event.logoUrl)})` }
            : { backgroundColor: 'hsl(var(--muted))' }
        }
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            {event.nome}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {event.categoria}
            </Badge>
            <div className="flex items-center text-white/90">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="text-sm">{formatDate(event.data)}</span>
            </div>
          </div>
          {event.externalLink && (
            <div>
              <Button asChild variant="default" size="lg">
                <a
                  href={event.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Visitar site oficial do evento
                </a>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* About Section */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Sobre o evento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                {event.descricao}
              </p>
              {event.parentId && (
                <div className="pt-4">
                  <Button asChild variant="outline">
                    <Link
                      to={`/eventos/${event.parentId}`}
                      className="inline-flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Ver evento principal
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Location Map Section */}
        {event.latitude != null && event.longitude != null && (
          <section>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl md:text-3xl">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 md:w-6 md:h-6" />
                    Localização do Evento
                  </div>
                </CardTitle>
                <CardDescription className="text-sm">
                  Veja onde o evento será realizado no mapa abaixo
                </CardDescription>
              </CardHeader>
              <CardContent className="">
                <div className="w-full rounded-lg overflow-hidden">
                  <MapView
                    events={[
                      {
                        id: event.id,
                        nome: event.nome,
                        categoria: event.categoria,
                        latitude: event.latitude,
                        longitude: event.longitude,
                        locationName: event.locationName,
                      },
                    ]}
                    focusedEventId={event.id}
                  />
                </div>
                {event.locationName && (
                  <div className="pt-4 border-t bg-muted/30">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {event.locationName}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        )}

        {/* Tickets Section */}
        {event.ticketLots && event.ticketLots.length > 0 && (
          <TicketPurchase ticketLots={event.ticketLots} eventId={event.id} />
        )}

        {/* Subevents Section */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Subeventos</h2>
          {event.children && event.children.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {event.children.map((sub) => (
                <Card
                  key={sub.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <CardTitle className="text-xl">{sub.nome}</CardTitle>
                    <CardDescription className="flex flex-wrap items-center gap-2 pt-2">
                      <Badge variant="outline">{sub.categoria}</Badge>
                      <span className="text-xs flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(sub.data)}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {sub.descricao}
                    </p>
                    <Button asChild variant="default" className="w-full">
                      <Link to={`/eventos/${sub.id}`}>Ver detalhes</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">
                  Este evento não possui subeventos cadastrados.
                </p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Gallery Section */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Galeria de Fotos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
              'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80',
              'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=80',
              'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
            ].map((src, idx) => (
              <div
                key={idx}
                className="aspect-square overflow-hidden rounded-lg"
              >
                <img
                  src={src}
                  alt={`Paisagem ${idx + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Links Section */}
        {(event.externalLink ||
          (event.relatedLinks && event.relatedLinks.length > 0)) && (
          <section>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Links Úteis</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {event.externalLink && (
                    <li>
                      <a
                        href={event.externalLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary hover:underline"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Site oficial do evento
                      </a>
                    </li>
                  )}
                  {event.relatedLinks &&
                    event.relatedLinks.length > 0 &&
                    event.relatedLinks.map((link: string, idx: number) => (
                      <li key={link + idx}>
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-primary hover:underline break-all"
                        >
                          <ExternalLink className="w-4 h-4 shrink-0" />
                          {link}
                        </a>
                      </li>
                    ))}
                </ul>
              </CardContent>
            </Card>
          </section>
        )}
      </div>
    </div>
  );
}
