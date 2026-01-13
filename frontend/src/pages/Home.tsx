import MapView from '../components/events/MapView';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EventCarousel } from '../components/events/EventCarousel';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import CalendarPage from '@/pages/CalendarPage';
import { EventCarouselSection } from '@/components/events/EventCarouselSection';

interface EventData {
  id: string;
  nome: string;
  categoria: string;
  data: string;
  local?: string;
}

interface FilterValues {
  categoria: string;
  dataInicio: string;
  dataFim: string;
  busca: string;
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
  const [searchInput, setSearchInput] = useState('');

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
        setEvents(data);
      } catch (err) {
        console.error('Falha ao buscar eventos:', err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, [filters]);

  const handleSearchClick = () => {
    setFilters((prev) => ({ ...prev, busca: searchInput }));
  };

  return (
    <section className="mt-16">
      <h2 className="text-2xl font-bold text-center mb-6">Eventos no Mapa</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="w-full h-125 bg-muted rounded-lg overflow-hidden border relative shadow-inner">
          <MapView />
        </div>

        <div className="flex flex-col h-125">
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Encontre o evento"
              className="rounded-md bg-white"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
            />
            <Button
              size="icon"
              className="bg-[#1A4331] hover:bg-[#153628] text-white w-10 shrink-0"
              onClick={handleSearchClick}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

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
                      className={`p-4 hover:bg-muted/30 cursor-pointer transition-colors ${i !== events.length - 1 ? 'border-b' : ''}`}
                    >
                      <h4 className="font-semibold text-sm text-foreground">
                        {event.nome}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {event.local || 'Local a definir'}, {event.data}
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
  return (
    <main className=" container mx-auto min-h-screen bg-background pb-20">
      <HeroSection />
      <EventCarouselSection
        title="Eventos Culturais"
        filters={{ categoria: 'cultura', limit: 10 }}
        emptyMessage="Nenhum evento cultural disponível no momento."
      />
      <EventCarouselSection
        title="Shows e Festas"
        filters={{ categoria: 'festividade', limit: 10 }}
        emptyMessage="Nenhum evento de shows disponível no momento."
      />
      <EventCarouselSection
        title="Turismo de Aventura"
        filters={{ categoria: 'turismo', limit: 10 }}
        emptyMessage="Nenhum evento de turismo disponível no momento."
      />
      <EventCarouselSection
        title="Gastronomia Local"
        filters={{ categoria: 'gastronomia', limit: 10 }}
        emptyMessage="Nenhum evento de gastronomia disponível no momento."
      />

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
