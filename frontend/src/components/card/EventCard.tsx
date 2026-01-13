import './EventCard.css';
import { useNavigate } from 'react-router-dom';

type BaseEvent = {
  id: string;
  nome: string;
  descricao?: string;
  categoria?: string;
  data?: string;

  // usados no carrossel
  imagem?: string | null;
  local?: string;
};

interface EventCardProps {
  event: BaseEvent;
  variant?: 'simple' | 'carousel';
  formattedDate?: string;
}

export default function EventCard({
  event,
  variant = 'simple',
  formattedDate,
}: EventCardProps) {
  const navigate = useNavigate();
  const goToDetails = () => navigate(`/eventos/${event.id}`);

  if (variant === 'carousel') {
    return (
      <div
        className="event-card-carousel"
        onClick={goToDetails}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && goToDetails()}
      >
        {/* Imagem (cinza como no exemplo quando não tiver imagem real) */}
        <div className="event-card-carousel__thumb">
          {event.imagem ? (
            <img src={event.imagem} alt={event.nome} />
          ) : (
            <div className="event-card-carousel__thumb-placeholder" />
          )}
        </div>

        <div className="event-card-carousel__body">
          <h3 className="event-card-carousel__title">{event.nome}</h3>
          <p className="event-card-carousel__line">
            {event.local || 'Local do evento'}
          </p>
          <p className="event-card-carousel__line">
            {event.data
              ? formattedDate || new Date(event.data).toLocaleString('pt-BR')
              : 'Data a definir'}
          </p>
        </div>
      </div>
    );
  }

  // Card antigo (mantido)
  return (
    <div
      className="event-card"
      onClick={goToDetails}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') goToDetails();
      }}
    >
      <div className="event-circle">
        <span className="event-letter">{event.nome.charAt(0).toUpperCase()}</span>
      </div>

      <h3 className="event-title">{event.nome}</h3>

      {event.descricao && <p className="event-description">{event.descricao}</p>}
      {event.categoria && <p className="event-meta">{event.categoria}</p>}
      {event.data && (
        <p className="event-meta">
          {new Date(event.data).toLocaleDateString('pt-BR')}
        </p>
      )}
    </div>
  );
}
