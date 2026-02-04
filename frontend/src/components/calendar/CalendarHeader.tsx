import { monthTitle } from '../../lib/calendarDate';

type Props = {
  currentMonth: Date;
  onPrev: () => void;
  onNext: () => void;
};

export default function CalendarHeader({ currentMonth, onPrev, onNext }: Props) {
  return (
    <header className="cal-header">
      <div>
        <h1>Calendário Mensal de Eventos</h1>
        <p className="cal-subtitle">
          Clique em um dia destacado para ver os eventos daquele dia.
        </p>
      </div>

      <div className="cal-nav">
        <button className="cal-btn" onClick={onPrev} aria-label="Mês anterior">
          ←
        </button>
        <div className="cal-month">{monthTitle(currentMonth)}</div>
        <button className="cal-btn" onClick={onNext} aria-label="Próximo mês">
          →
        </button>
      </div>
    </header>
  );
}
