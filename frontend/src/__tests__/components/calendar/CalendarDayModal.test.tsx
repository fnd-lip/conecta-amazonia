import { render, screen, fireEvent } from "@testing-library/react";
import CalendarDayModal from "../../../components/calendar/CalendarDayModal";
import type { ApiEvent } from "../../../api/calendarEvents";

jest.mock("../../../lib/calendarDate", () => ({
  formatBRDate: jest.fn((key: string) => `BR(${key})`),
  formatTime: jest.fn(() => "10:30"),
}));

describe("CalendarDayModal", () => {
  test("não renderiza nada quando selectedDayKey é null", () => {
    const { container } = render(
      <CalendarDayModal selectedDayKey={null} selectedEvents={[]} onClose={() => {}} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  test("renderiza título com a data formatada", () => {
    render(
      <CalendarDayModal selectedDayKey="2026-01-10" selectedEvents={[]} onClose={() => {}} />
    );

    expect(screen.getByText("Eventos em BR(2026-01-10)")).toBeInTheDocument();
  });

  test("mostra mensagem quando não há eventos", () => {
    render(
      <CalendarDayModal selectedDayKey="2026-01-10" selectedEvents={[]} onClose={() => {}} />
    );

    expect(screen.getByText(/nenhum evento encontrado/i)).toBeInTheDocument();
  });

  test("renderiza lista de eventos com nome e horário", () => {
    const events: ApiEvent[] = [
      { id: "1", nome: "Evento Teste", data: "2026-01-10T10:30:00.000Z" },
    ];

    render(
      <CalendarDayModal selectedDayKey="2026-01-10" selectedEvents={events} onClose={() => {}} />
    );

    expect(screen.getByText(/evento teste/i)).toBeInTheDocument();
    expect(screen.getByText("10:30")).toBeInTheDocument();
  });

  test("renderiza categoria e descrição quando existirem", () => {
    const events: ApiEvent[] = [
      {
        id: "1",
        nome: "Evento A",
        data: "2026-01-10T10:30:00.000Z",
        categoria: "Cultura",
        descricao: "Uma descrição",
      },
    ];

    render(
      <CalendarDayModal selectedDayKey="2026-01-10" selectedEvents={events} onClose={() => {}} />
    );

    expect(screen.getByText("Cultura")).toBeInTheDocument();
    expect(screen.getByText("Uma descrição")).toBeInTheDocument();
  });

  test("chama onClose ao clicar no backdrop", () => {
    const onClose = jest.fn();

    const { container } = render(
      <CalendarDayModal selectedDayKey="2026-01-10" selectedEvents={[]} onClose={onClose} />
    );

    const backdrop = container.querySelector(".cal-backdrop");
    expect(backdrop).toBeTruthy();

    fireEvent.click(backdrop as Element);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("chama onClose ao clicar no botão de fechar (✕)", () => {
    const onClose = jest.fn();

    render(
      <CalendarDayModal selectedDayKey="2026-01-10" selectedEvents={[]} onClose={onClose} />
    );

    fireEvent.click(screen.getByText("✕"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("não fecha ao clicar dentro do modal (stopPropagation)", () => {
    const onClose = jest.fn();

    const { container } = render(
      <CalendarDayModal selectedDayKey="2026-01-10" selectedEvents={[]} onClose={onClose} />
    );

    const modal = container.querySelector(".cal-modal");
    expect(modal).toBeTruthy();

    fireEvent.click(modal as Element);
    expect(onClose).not.toHaveBeenCalled();
  });
});
