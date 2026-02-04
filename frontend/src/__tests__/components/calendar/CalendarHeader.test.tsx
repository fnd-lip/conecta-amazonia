import { render, screen, fireEvent } from "@testing-library/react";
import CalendarHeader from "../../../components/calendar/CalendarHeader";

// Mock do monthTitle para não depender de locale/ambiente
jest.mock("../../../lib/calendarDate", () => ({
  monthTitle: jest.fn(() => "janeiro de 2026"),
}));

describe("CalendarHeader", () => {
  test("renderiza título e subtítulo", () => {
    render(
      <CalendarHeader
        currentMonth={new Date("2026-01-01T12:00:00.000Z")}
        onPrev={() => {}}
        onNext={() => {}}
      />
    );

    expect(
      screen.getByText(/calendário mensal de eventos/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/clique em um dia destacado/i)
    ).toBeInTheDocument();
  });

  test("mostra o mês retornado por monthTitle", () => {
    render(
      <CalendarHeader
        currentMonth={new Date("2026-01-01T12:00:00.000Z")}
        onPrev={() => {}}
        onNext={() => {}}
      />
    );

    expect(screen.getByText("janeiro de 2026")).toBeInTheDocument();
  });

  test("chama onPrev ao clicar no botão de mês anterior", () => {
    const onPrev = jest.fn();
    const onNext = jest.fn();

    render(
      <CalendarHeader
        currentMonth={new Date("2026-01-01T12:00:00.000Z")}
        onPrev={onPrev}
        onNext={onNext}
      />
    );

    const prevBtn = screen.getByRole("button", { name: /mês anterior/i });
    fireEvent.click(prevBtn);

    expect(onPrev).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledTimes(0);
  });

  test("chama onNext ao clicar no botão de próximo mês", () => {
    const onPrev = jest.fn();
    const onNext = jest.fn();

    render(
      <CalendarHeader
        currentMonth={new Date("2026-01-01T12:00:00.000Z")}
        onPrev={onPrev}
        onNext={onNext}
      />
    );

    const nextBtn = screen.getByRole("button", { name: /próximo mês/i });
    fireEvent.click(nextBtn);

    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onPrev).toHaveBeenCalledTimes(0);
  });
});
