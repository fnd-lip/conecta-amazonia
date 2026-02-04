import { useMemo } from 'react';
import type { ApiEvent } from '../../api/calendarEvents';
import { endOfMonth, startOfMonth, toKeyLocal } from '../../lib/calendarDate';

type EmptyCell = { date: null; key: null };
type DayCell = { date: Date; key: string };
type Cell = EmptyCell | DayCell;

type Props = {
  currentMonth: Date;
  eventsByDay: Map<string, ApiEvent[]>;
  onSelectDayKey: (key: string) => void;
};

export default function CalendarGrid({ currentMonth, eventsByDay, onSelectDayKey }: Props) {
  const cells = useMemo((): Cell[] => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);

    const firstWeekday = start.getDay();
    const totalDays = end.getDate();

    const out: Cell[] = [];

    for (let i = 0; i < firstWeekday; i++) out.push({ date: null, key: null });

    for (let day = 1; day <= totalDays; day++) {
      const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      out.push({ date: d, key: toKeyLocal(d) });
    }

    while (out.length % 7 !== 0) out.push({ date: null, key: null });

    return out;
  }, [currentMonth]);

  return (
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
            onClick={() => hasEvents && onSelectDayKey(cell.key)}
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
  );
}
