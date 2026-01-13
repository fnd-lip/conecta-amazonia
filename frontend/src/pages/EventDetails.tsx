import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './EventDetails.css';

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
  children?: Subevento[];
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

        const response = await fetch(`http://localhost:3001/events/${id}`);

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
    return <p>Carregando detalhes do evento...</p>;
  }

  if (error) {
    return <p className="error-text">{error}</p>;
  }

  if (!event) {
    return <p className="error-text">Nenhum dado de evento para exibir.</p>;
  }

  return (
    <div className="event-page">
      <section
        className="event-hero"
        style={
          event.logoUrl
            ? { backgroundImage: `url(http://localhost:3001${event.logoUrl})` }
            : {}
        }
      >
        <div className="event-hero-overlay">
          <div className="event-hero-content">
            <h1 className="event-hero-title">{event.nome}</h1>
            <div className="event-hero-meta">
              <span className="event-category">{event.categoria}</span>
              <span className="event-date">{formatDate(event.data)}</span>
            </div>
            {event.externalLink && (
              <a
                href={event.externalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="event-official-site-btn"
              >
                Visitar site oficial do evento
              </a>
            )}
          </div>
        </div>
      </section>
      <section className="event-main-info">
        <div className="event-main-container">
          <h2>Sobre o evento</h2>
          <p className="event-main-description">{event.descricao}</p>
          {event.parentId && (
            <a
              href={`/eventos/${event.parentId}`}
              className="event-parent-link"
            >
              Ver evento principal
            </a>
          )}
        </div>
      </section>
      <section className="event-subevents-section">
        <div className="event-main-container">
          <h2>Subeventos</h2>
          {event.children && event.children.length > 0 ? (
            <div className="subevents-grid">
              {event.children.map((sub) => (
                <div key={sub.id} className="subevent-card">
                  <h3>{sub.nome}</h3>
                  <div className="subevent-meta">
                    <span>{sub.categoria}</span>
                    <span>{formatDate(sub.data)}</span>
                  </div>
                  <p>{sub.descricao}</p>
                  <a href={`/eventos/${sub.id}`} className="subevent-link">
                    Ver detalhes
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-subevents">
              Este evento não possui subeventos cadastrados.
            </p>
          )}
        </div>
      </section>

      {/* Galeria de Fotos mockada */}
      <section className="event-gallery-section">
        <div className="event-main-container">
          <h2>Galeria de Fotos</h2>
          <div className="event-gallery-grid">
            <img
              src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"
              alt="Paisagem 1"
            />
            <img
              src="https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80"
              alt="Paisagem 2"
            />
            <img
              src="https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=80"
              alt="Paisagem 3"
            />
            <img
              src="https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80"
              alt="Paisagem 4"
            />
          </div>
        </div>
      </section>

      {/* Links Externos e relacionados */}
      <section className="event-links-section">
        <div className="event-main-container">
          <h2>Links Úteis</h2>
          <ul className="event-links-list">
            {event.externalLink && (
              <li>
                <a
                  href={event.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Site oficial do evento
                </a>
              </li>
            )}
            {event.relatedLinks &&
              event.relatedLinks.length > 0 &&
              event.relatedLinks.map((link: string, idx: number) => (
                <li key={link + idx}>
                  <a href={link} target="_blank" rel="noopener noreferrer">
                    {link}
                  </a>
                </li>
              ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
