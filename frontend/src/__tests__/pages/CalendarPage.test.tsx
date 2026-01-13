import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import CalendarPage from "../../pages/CalendarPage";
// Helpers

function mockFetchOnce(data: unknown, ok = true) {
  jest.spyOn(global, "fetch").mockResolvedValueOnce({
    ok,
    json: async () => data,
  } as Response);
}

function mockFetchError() {
  jest
    .spyOn(global, "fetch")
    .mockRejectedValueOnce(new Error("Erro ao buscar eventos"));
}
// Tests

describe("CalendarPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("exibe estado de loading ao carregar eventos", () => {
    jest
      .spyOn(global, "fetch")
      .mockImplementation(() => new Promise(() => {}));

    render(<CalendarPage />);

    expect(
      screen.getByText(/carregando eventos/i)
    ).toBeInTheDocument();
  });

  test("exibe mensagem de erro quando a API falha", async () => {
    mockFetchError();

    render(<CalendarPage />);

    await waitFor(() => {
      expect(
        screen.getByText(/erro ao buscar eventos/i)
      ).toBeInTheDocument();
    });
  });

  test("renderiza calendário corretamente quando não há eventos no mês", async () => {
    mockFetchOnce([]);

    render(<CalendarPage />);

    await waitFor(() => {
      expect(
        screen.getByText(/calendário mensal de eventos/i)
      ).toBeInTheDocument();
    });

    const disabledDays = screen.getAllByTitle(/sem eventos/i);
    expect(disabledDays.length).toBeGreaterThan(0);

    disabledDays.forEach((day) => {
      expect(day).toBeDisabled();
    });
  });

  test("abre modal ao clicar em um dia com eventos", async () => {
    const mockEventDate = new Date();
    mockEventDate.setDate(10);

    mockFetchOnce([
      {
        id: "1",
        nome: "Evento Teste",
        data: mockEventDate.toISOString(),
      },
    ]);

    render(<CalendarPage />);

    await waitFor(() => {
      expect(
        screen.getByText(/calendário mensal de eventos/i)
      ).toBeInTheDocument();
    });

    const dayWithEvent = screen.getByTitle(/1 evento/i);
    fireEvent.click(dayWithEvent);

    expect(
      await screen.findByText(/evento teste/i)
    ).toBeInTheDocument();
  });

  test("dias sem eventos permanecem desabilitados", async () => {
    mockFetchOnce([]);

    render(<CalendarPage />);

    await waitFor(() => {
      expect(
        screen.getByText(/calendário mensal de eventos/i)
      ).toBeInTheDocument();
    });

    const disabledDays = screen.getAllByTitle(/sem eventos/i);

    expect(disabledDays.length).toBe(31);

    disabledDays.forEach((day) => {
      expect(day).toBeDisabled();
    });
  });
});
