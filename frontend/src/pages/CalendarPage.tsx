import { useEffect, useMemo, useState } from 'react';
import './CalendarPage.css';

import type { ApiEvent } from '../api/calendarEvents';
import { fetchCalendarEvents } from '../api/calendarEvents';
import { addMonths, endOfMonth, parseISO, startOfMonth, toKeyLocal } from '../lib/calendarDate';

import CalendarHeader from '../components/calendar/CalendarHeader';
import CalendarWeekdays from '../components/calendar/CalendarWeekdays';
import CalendarGrid from '../components/calendar/CalendarGrid';
import CalendarDayModal from '../components/calendar/CalendarDayModal';

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);

  // CA-121: consumir API GET /events
  useEffect(() => {
    async function loadEvents() {
      setLoading(true);
      setError('');

      const startDateISO = startOfMonth(currentMonth).toISOString();
      const endDateISO = endOfMonth(currentMonth).toISOString();

      try {
        const data = await fetchCalendarEvents({ startDateISO, endDateISO });
        setEvents(data);
      } catch (e: unknown) {
        if (e instanceof Error) setError(e.message);
        else setError('Erro ao buscar eventos do calendário.');
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
        <CalendarHeader currentMonth={currentMonth} onPrev={prevMonth} onNext={nextMonth} />

        {loading && <p className="cal-status">Carregando eventos...</p>}
        {error && <p className="cal-error">{error}</p>}

        <CalendarWeekdays />

        <CalendarGrid
          currentMonth={currentMonth}
          eventsByDay={eventsByDay}
          onSelectDayKey={setSelectedDayKey}
        />
      </div>

      <CalendarDayModal
        selectedDayKey={selectedDayKey}
        selectedEvents={selectedEvents}
        onClose={() => setSelectedDayKey(null)}
      />
    </div>
  );
}
