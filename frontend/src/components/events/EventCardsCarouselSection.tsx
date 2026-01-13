import { useEffect, useMemo, useRef, useState } from 'react';
import EventCard from '../card/EventCard';
import './EventCardsCarouselSection.css';

type ApiEvent = {
  id: string;
  nome: string;
  categoria?: string;
  data?: string;
};

export type EventCarouselFilters = {
  categoria?: string;
  dataInicio?: string;
  dataFim?: string;
  limit?: number; // aplicado no front
};

type Props = {
  title: string;
  filters?: EventCarouselFilters;
  emptyMessage?: string;
};

const fallbackImages = ['/banners/banner1.jpg', '/banners/banner2.jpg', '/banners/banner3.jpg'];

function apiBaseUrl() {
  return 'http://localhost:3001';
}

function formatDatePtBR(dateString?: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleString('pt-BR');
}

export default function EventCardsCarouselSection({
  title,
  filters,
  emptyMessage = 'Nenhum evento encontrado para esse filtro.',
}: Props) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
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
          typeof filters?.limit === 'number' ? list.slice(0, filters.limit) : list;

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

  const scrollRight = () => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: 320, behavior: 'smooth' });
  };

  const showEmpty = !loading && !error && events.length === 0;

  return (
    <section className="carousel-section">
      <h2 className="carousel-title">{title}</h2>

      <div className="carousel-box">
        <div ref={scrollerRef} className="carousel-row">
          {loading && <div className="carousel-msg">Carregando...</div>}
          {error && <div className="carousel-msg error">Erro: {error}</div>}
          {showEmpty && <div className="carousel-msg">{emptyMessage}</div>}

          {!loading &&
            !error &&
            events.map((ev, idx) => (
              <EventCard
                key={ev.id}
                variant="carousel"
                event={{
                  id: ev.id,
                  nome: ev.nome,
                  categoria: ev.categoria,
                  data: ev.data,
                  imagem: fallbackImages[idx % fallbackImages.length], // placeholder
                  local: ev.categoria ? `${ev.categoria}` : 'Local do evento',
                }}
                formattedDate={formatDatePtBR(ev.data)}
              />
            ))}
        </div>

        {/* seta do lado direito (igual ao exemplo) */}
        <button className="carousel-arrow" type="button" onClick={scrollRight} aria-label="Avançar">
          ›
        </button>
      </div>
    </section>
  );
}
