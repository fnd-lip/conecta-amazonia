import type { ApiEvent } from '../../api/calendarEvents';
import { formatBRDate, formatTime } from '../../lib/calendarDate';

type Props = {
  selectedDayKey: string | null;
  selectedEvents: ApiEvent[];
  onClose: () => void;
};

export default function CalendarDayModal({ selectedDayKey, selectedEvents, onClose }: Props) {
  if (!selectedDayKey) return null;

  return (
    <div className="cal-backdrop" onClick={onClose}>
      <div className="cal-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cal-modal-header">
          <h2>Eventos em {formatBRDate(selectedDayKey)}</h2>
          <button className="cal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {selectedEvents.length === 0 ? (
          <p className="cal-status">Nenhum evento encontrado.</p>
        ) : (
          <ul className="cal-list">
            {selectedEvents.map((ev) => (
              <li key={ev.id} className="cal-item">
                <div className="cal-item-top">
                  <strong>{ev.nome}</strong>
                  <span className="cal-time">{formatTime(ev.data)}</span>
                </div>
                {ev.categoria && <div className="cal-cat">{ev.categoria}</div>}
                {ev.descricao && <div className="cal-desc">{ev.descricao}</div>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
