import { useEffect, useMemo, useState } from 'react';
import './CalendarPage.css';
// import { Link } from 'react-router-dom';

type ApiEvent = {
  id: string;
  nome: string;
  categoria?: string;
  data: string;
  descricao?: string;
};

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}
function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}
function toKeyLocal(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function parseISO(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}
function monthTitle(date: Date) {
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}
function formatBRDate(key: string) {
  const [y, m, d] = key.split('-');
  return `${d}/${m}/${y}`;
}
function formatTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(() =>
    startOfMonth(new Date())
  );
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);

  // CA-121: consumir API GET /events
  useEffect(() => {
    async function loadEvents() {
      setLoading(true);
      setError('');

      const startDate = startOfMonth(currentMonth).toISOString();
      const endDate = endOfMonth(currentMonth).toISOString();
      const url = `http://localhost:3001/events/calendar?start=${startDate}&end=${endDate}`;

      try {
        const res = await fetch(url);

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = (await res.json()) as ApiEvent[];

        if (Array.isArray(data)) {
          setEvents(data);
        } else {
          // Caso o backend retorne algo estranho
          setEvents([]);
        }
      } catch (e: unknown) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError('Erro ao buscar eventos do calendário.');
        }
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, [currentMonth]);

  // CA-119: dias com eventos (agrupamento por YYYY-MM-DD)
  const eventsByDay = useMemo(() => {
    const map = new Map<string, ApiEvent[]>();

    for (const ev of events) {
      const d = parseISO(ev.data);
      if (!d) continue;

      const key = toKeyLocal(d);
      const list = map.get(key) ?? [];
      list.push(ev);
      map.set(key, list);
    }

    return map;
  }, [events]);

  // CA-118: grid do calendário
  const cells = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);

    const firstWeekday = start.getDay(); // dom=0 ... sáb=6
    const totalDays = end.getDate();

    const out: Array<{ date: Date | null; key: string | null }> = [];

    for (let i = 0; i < firstWeekday; i++) out.push({ date: null, key: null });

    for (let day = 1; day <= totalDays; day++) {
      const d = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      );
      out.push({ date: d, key: toKeyLocal(d) });
    }

    while (out.length % 7 !== 0) out.push({ date: null, key: null });

    return out;
  }, [currentMonth]);

  const selectedEvents = useMemo(() => {
    if (!selectedDayKey) return [];
    return eventsByDay.get(selectedDayKey) ?? [];
  }, [eventsByDay, selectedDayKey]);

  function prevMonth() {
    setCurrentMonth((m) => addMonths(m, -1));
  }
  function nextMonth() {
    setCurrentMonth((m) => addMonths(m, 1));
  }

  return (
    <div className="cal-page">
      <div className="cal-card">
        <header className="cal-header">
          <div>
            <h1>Calendário Mensal de Eventos</h1>
            <p className="cal-subtitle">
              Clique em um dia destacado para ver os eventos daquele dia.
            </p>
          </div>

          <div className="cal-nav">
            <button
              className="cal-btn"
              onClick={prevMonth}
              aria-label="Mês anterior"
            >
              ←
            </button>
            <div className="cal-month">{monthTitle(currentMonth)}</div>
            <button
              className="cal-btn"
              onClick={nextMonth}
              aria-label="Próximo mês"
            >
              →
            </button>
          </div>
        </header>

        {loading && <p className="cal-status">Carregando eventos...</p>}
        {error && <p className="cal-error">{error}</p>}

        <div className="cal-weekdays">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((w) => (
            <div key={w} className="cal-weekday">
              {w}
            </div>
          ))}
        </div>

        <div className="cal-grid">
          {cells.map((cell, idx) => {
            if (!cell.date || !cell.key) {
              return <div key={idx} className="cal-cell cal-empty" />;
            }

            const count = eventsByDay.get(cell.key)?.length ?? 0;
            const hasEvents = count > 0;

            return (
              <button
                key={cell.key}
                className={`cal-cell ${hasEvents ? 'cal-has-events' : ''}`}
                onClick={() => hasEvents && setSelectedDayKey(cell.key)}
                disabled={!hasEvents}
                title={hasEvents ? `${count} evento(s)` : 'Sem eventos'}
              >
                <div className="cal-day">{cell.date.getDate()}</div>

                {hasEvents && (
                  <div className="cal-badge">
                    <span className="cal-dot" />
                    <span>{count}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* <div className="calendar-footer">
        <Link to="/" className="calendar-back-btn">
          Voltar para a página inicial
        </Link>
      </div> */}

      {/* CA-120: modal/lista do dia */}
      {selectedDayKey && (
        <div className="cal-backdrop" onClick={() => setSelectedDayKey(null)}>
          <div className="cal-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cal-modal-header">
              <h2>Eventos em {formatBRDate(selectedDayKey)}</h2>
              <button
                className="cal-close"
                onClick={() => setSelectedDayKey(null)}
              >
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
                    {ev.categoria && (
                      <div className="cal-cat">{ev.categoria}</div>
                    )}
                    {ev.descricao && (
                      <div className="cal-desc">{ev.descricao}</div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
