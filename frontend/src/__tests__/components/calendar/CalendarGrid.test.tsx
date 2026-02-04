import { render, screen, fireEvent, within } from "@testing-library/react";
import CalendarGrid from "../../../components/calendar/CalendarGrid";
import type { ApiEvent } from "../../../api/calendarEvents";
import { toKeyLocal } from "../../../lib/calendarDate";

describe("CalendarGrid", () => {
  test("renderiza o grid do mês com dias sem eventos desabilitados", () => {
    const onSelectDayKey = jest.fn();

    // Janeiro 2026
    const currentMonth = new Date(2026, 0, 1);
    const eventsByDay = new Map<string, ApiEvent[]>();

    const { container } = render(
      <CalendarGrid
        currentMonth={currentMonth}
        eventsByDay={eventsByDay}
        onSelectDayKey={onSelectDayKey}
      />
    );

    expect(container.querySelector(".cal-grid")).toBeInTheDocument();

    const disabledButtons = screen.getAllByTitle(/sem eventos/i);
    expect(disabledButtons.length).toBeGreaterThanOrEqual(28);

    disabledButtons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });

    expect(onSelectDayKey).not.toHaveBeenCalled();
  });

  test("habilita dia com evento, mostra badge e chama onSelectDayKey ao clicar", () => {
    const onSelectDayKey = jest.fn();

    const currentMonth = new Date(2026, 0, 1);

    const day10 = new Date(2026, 0, 10);
    const key10 = toKeyLocal(day10);

    const eventsByDay = new Map<string, ApiEvent[]>();
    eventsByDay.set(key10, [
      { id: "1", nome: "Evento A", data: day10.toISOString() },
      { id: "2", nome: "Evento B", data: day10.toISOString() },
    ]);

    render(
      <CalendarGrid
        currentMonth={currentMonth}
        eventsByDay={eventsByDay}
        onSelectDayKey={onSelectDayKey}
      />
    );

    const dayWithEventsButton = screen.getByTitle(/2 evento/i);

    expect(dayWithEventsButton).not.toBeDisabled();
    expect(dayWithEventsButton.className).toMatch(/cal-has-events/);

    // Verifica o badge "2" dentro do botão correto (evita confundir com o dia 2)
    const badge = within(dayWithEventsButton).getByText("2");
    expect(badge).toBeInTheDocument();

    fireEvent.click(dayWithEventsButton);
    expect(onSelectDayKey).toHaveBeenCalledTimes(1);
    expect(onSelectDayKey).toHaveBeenCalledWith(key10);
  });

  test("não chama onSelectDayKey ao clicar em dia sem eventos", () => {
    const onSelectDayKey = jest.fn();

    const currentMonth = new Date(2026, 0, 1);
    const eventsByDay = new Map<string, ApiEvent[]>();

    render(
      <CalendarGrid
        currentMonth={currentMonth}
        eventsByDay={eventsByDay}
        onSelectDayKey={onSelectDayKey}
      />
    );

    const disabledDay = screen.getAllByTitle(/sem eventos/i)[0];
    expect(disabledDay).toBeDisabled();

    fireEvent.click(disabledDay);

    expect(onSelectDayKey).not.toHaveBeenCalled();
  });
});
