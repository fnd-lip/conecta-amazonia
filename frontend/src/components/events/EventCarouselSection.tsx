import EventCard from '@/components/card/EventCard';
import type { EventCarouselFilters } from '@/components/events/EventCardsCarouselSection';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useEffect, useMemo, useState } from 'react';
import { API_URL } from '@/config/api';

type ApiEvent = {
  id: string;
  nome: string;
  categoria?: string;
  data?: string;
  logoUrl?: string | null;
};

type Props = {
  title: string;
  filters?: EventCarouselFilters;
  emptyMessage?: string;
};

function apiBaseUrl() {
  return API_URL;
}

const fallbackImages = ['/icons/event-placeholder.svg'];

function formatDatePtBR(dateString?: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleString('pt-BR');
}

function formatCategory(value?: string) {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const resolveImageUrl = (url: string) =>
  url.startsWith('http') ? url : `${apiBaseUrl()}${url}`;

const getEventImage = (event: ApiEvent, index: number) =>
  event.logoUrl ? resolveImageUrl(event.logoUrl) : fallbackImages[index % fallbackImages.length];

export function EventCarouselSection({
  title,
  filters,
  emptyMessage = 'Nenhum evento encontrado para esse filtro.',
}: Props) {
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (filters?.categoria) params.set('categoria', filters.categoria);
    if (filters?.dataInicio) params.set('dataInicio', filters.dataInicio);
    if (filters?.dataFim) params.set('dataFim', filters.dataFim);
    return params.toString();
  }, [filters?.categoria, filters?.dataInicio, filters?.dataFim]);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const url = `${apiBaseUrl()}/events/all${query ? `?${query}` : ''}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Erro na API: ${res.status}`);

        const data: ApiEvent[] = await res.json();
        const list = Array.isArray(data) ? data : [];

        const limited =
          typeof filters?.limit === 'number'
            ? list.slice(0, filters.limit)
            : list;

        setEvents(limited);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro ao buscar eventos');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [query, filters?.limit]);

  const showEmpty = !loading && !error && events.length === 0;

  return (
    <section className="w-full py-8 px-4">
      {/* Header com título e Ver tudo */}
      <div className="flex items-center justify-between mb-6 ">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
          {title}
        </h2>
        <a
          href="/"
          className="text-blue-600 hover:text-blue-700 font-medium text-sm md:text-base transition-colors"
        >
          Ver tudo
        </a>
      </div>

      {loading && (
        <div className="text-center py-12 text-gray-500">Carregando...</div>
      )}
      {error && (
        <div className="text-center py-12 text-red-500">Erro: {error}</div>
      )}
      {showEmpty && (
        <div className="text-center py-12 text-gray-500">{emptyMessage}</div>
      )}

      {!loading && !error && events.length > 0 && (
        <Carousel
          opts={{
            align: 'start',
            loop: false,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4 sm:-ml-0">
            {events.map((ev, idx) => (
              <CarouselItem
                key={ev.id}
                className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
              >
                <EventCard
                  variant="carousel"
                  event={{
                    id: ev.id,
                    nome: ev.nome,
                    categoria: ev.categoria,
                    data: ev.data,
                    imagem: getEventImage(ev, idx),
                    local: ev.categoria
                      ? formatCategory(ev.categoria)
                      : 'Local do evento',
                  }}
                  formattedDate={formatDatePtBR(ev.data)}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-left-4 md:-left-12" />
          <CarouselNext className="-right-4 md:-right-12" />
        </Carousel>
      )}
    </section>
  );
}
