import MapView from '../components/events/MapView';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  EventAutocomplete,
  type AutocompleteEvent,
} from '../components/events/EventAutocomplete';
import { EventCarousel } from '../components/events/EventCarousel';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import CalendarPage from '@/pages/CalendarPage';
import { EventCarouselSection } from '@/components/events/EventCarouselSection';
interface EventData {
  id: string;
  nome: string;
  categoria: string;
  data: string;
  local?: string;
  logoUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  locationName?: string | null;
}


interface FilterValues {
  categoria: string;
  dataInicio: string;
  dataFim: string;
  busca: string;
}
interface EventType {
  id: number;
  nome: string;
}
// Seção Hero (Carousel Principal)
export const HeroSection = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadHighlights() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch('http://localhost:3001/events/all?limit=10');

        if (!res.ok) {
          throw new Error('Erro ao buscar eventos');
        }

        const data: EventData[] = await res.json();
        setEvents(data);
      } catch {
        setError('Erro ao carregar eventos');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }

    loadHighlights();
  }, []);

  return (
    <section>
      <h2 className="mt-2 text-2xl text-center font-bold">Próximos eventos</h2>
      <EventCarousel events={events} loading={loading} error={error} />
    </section>
  );
};

// Mapa

const EventsMapSection = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [focusedEventId, setFocusedEventId] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterValues>({
    categoria: '',
    dataInicio: '',
    dataFim: '',
    busca: '',
  });

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        const params = new URLSearchParams();

        if (filters.categoria && filters.categoria !== 'todos') {
          params.append('categoria', filters.categoria);
        }
        if (filters.dataInicio) params.append('dataInicio', filters.dataInicio);
        if (filters.dataFim) params.append('dataFim', filters.dataFim);
        if (filters.busca) params.append('nome', filters.busca);

        const url = `http://localhost:3001/events/all${params.toString() ? '?' + params.toString() : ''}`;

        const res = await fetch(url);

        if (!res.ok) {
          throw new Error(`Erro na API: ${res.status}`);
        }

        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        const withLocation = list.filter(
          (event: EventData) =>
            event.latitude !== null &&
            event.latitude !== undefined &&
            event.longitude !== null &&
            event.longitude !== undefined
        );
        setEvents(withLocation);
      } catch (err) {
        console.error('Falha ao buscar eventos:', err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, [filters]);

  const handleSuggestionSelected = (event: AutocompleteEvent) => {
    setFilters({ categoria: '', dataInicio: '', dataFim: '', busca: '' });
    setEvents([event as EventData]);
    setFocusedEventId(event.id);
  };
  const handleFullSearch = (term: string) => {
    setFilters((prev) => ({ ...prev, busca: term }));
  };

  useEffect(() => {
    const handler = (event: Event) => {
      const custom = event as CustomEvent<{ id?: string }>;
      if (custom.detail?.id) {
        setFocusedEventId(custom.detail.id);
      }
    };

    window.addEventListener('assistant-focus-event', handler as EventListener);
    return () =>
      window.removeEventListener(
        'assistant-focus-event',
        handler as EventListener
      );
  }, []);

  return (
    <section id="events-map-section" className="mt-16">
      <h2 className="text-2xl font-bold text-center mb-6">Eventos no Mapa</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="w-full h-125 bg-muted rounded-lg overflow-hidden border relative shadow-inner">
          <MapView events={events} focusedEventId={focusedEventId} />
        </div>

        <div className="flex flex-col h-125">
          <EventAutocomplete
            onSelectSuggestion={handleSuggestionSelected}
            onSearchSubmit={handleFullSearch}
            className="mb-4"
          />

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-sm font-medium text-muted-foreground mr-1">
              Filtros:
            </span>

            <Select
              onValueChange={(val) =>
                setFilters((prev) => ({ ...prev, categoria: val }))
              }
            >
              <SelectTrigger className="h-9 bg-white text-xs px-2 w-25">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                <SelectItem value="cultura">Cultura</SelectItem>
                <SelectItem value="aventura">Aventura</SelectItem>
                <SelectItem value="gastronomia">Gastronomia</SelectItem>
              </SelectContent>
            </Select>
            <input
              type="date"
              className="h-9 rounded-md border border-input bg-white px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, dataInicio: e.target.value }))
              }
            />

            <input
              type="date"
              className="h-9 rounded-md border border-input bg-white px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, dataFim: e.target.value }))
              }
            />
          </div>
          <div className="flex-1 border rounded-md bg-white overflow-hidden flex flex-col relative">
            {loading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            <div className="overflow-y-auto flex-1">
              {events.length > 0
                ? events.map((event, i) => (
                  <div
                    key={event.id}
                    className={`p-4 hover:bg-muted/30 cursor-pointer transition-colors ${focusedEventId === event.id ? 'bg-muted/40' : ''
                      } ${i !== events.length - 1 ? 'border-b' : ''}`}
                    onClick={() => setFocusedEventId(event.id)}
                  >
                    <h4 className="font-semibold text-sm text-foreground">
                      {event.nome}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {event.locationName || event.local || 'Local a definir'}
                      , {event.data}
                    </p>
                  </div>
                ))
                : !loading && (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm p-4 text-center">
                    Nenhum evento encontrado com esses filtros.
                  </div>
                )}

              <div className="grow bg-white min-h-5"></div>
            </div>

            <div className="p-2 border-t flex justify-between items-center text-xs text-muted-foreground bg-gray-50">
              <span>Exibindo {events.length} eventos</span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6"
                  disabled
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <Button
                  size="icon"
                  className="h-6 w-6 bg-[#1A4331] hover:bg-[#153628]"
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Adicionar a lógica da seção de carrossel de eventos

export default function Home() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [eventTypesLoading, setEventTypesLoading] = useState(true);
  const [eventTypesError, setEventTypesError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEventTypes() {
      try {
        setEventTypesLoading(true);
        setEventTypesError(null);
        const res = await fetch('http://localhost:3001/event-types');
        if (!res.ok) {
          throw new Error('Erro ao carregar categorias');
        }
        const data = await res.json();
        setEventTypes(Array.isArray(data) ? data : []);
      } catch (err) {
        setEventTypes([]);
        setEventTypesError(
          err instanceof Error ? err.message : 'Erro ao carregar categorias'
        );
      } finally {
        setEventTypesLoading(false);
      }
    }

    loadEventTypes();
  }, []);
  return (
    <main className=" container mx-auto min-h-screen bg-background pb-20">
      <HeroSection />
      {eventTypesLoading && (
        <div className="text-center py-10 text-gray-500">
          Carregando categorias...
        </div>
      )}
      {eventTypesError && (
        <div className="text-center py-10 text-red-500">{eventTypesError}</div>
      )}
      {!eventTypesLoading && !eventTypesError && eventTypes.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          Nenhuma categoria encontrada.
        </div>
      )}
      {!eventTypesLoading &&
        !eventTypesError &&
        eventTypes.map((type) => (
          <EventCarouselSection
            key={type.id}
            title={type.nome}
            filters={{ categoria: type.nome, limit: 10 }}
            emptyMessage={`Nenhum evento disponível para ${type.nome}.`}
          />
        ))}
      <EventsMapSection />
      <section className="py-8">
        <div className="rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-center mb-6">
            Planeje sua visita
          </h2>
          <p className="mb-6">
            Veja todos os eventos do mês e encontre atividades por dia.
          </p>
          <CalendarPage />
        </div>
      </section>
    </main>
  );
}




