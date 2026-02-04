export default function CalendarWeekdays() {
  return (
    <div className="cal-weekdays">
      {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((w) => (
        <div key={w} className="cal-weekday">
          {w}
        </div>
      ))}
    </div>
  );
}
