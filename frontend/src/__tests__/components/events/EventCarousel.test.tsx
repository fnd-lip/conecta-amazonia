import React, { act } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { EventCarousel } from "../../../components/events/EventCarousel";

// Mock dos ícones (lucide-react)
jest.mock("lucide-react", () => ({
  ChevronLeft: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="icon-left" {...props} />
  ),
  ChevronRight: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="icon-right" {...props} />
  ),
  Calendar: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="icon-calendar" {...props} />
  ),
}));

type TestEvent = {
  id: string;
  nome: string;
  data?: string;
  imagem?: string | null;
  logoUrl?: string | null;
};

function makeEvents(): TestEvent[] {
  return [
    {
      id: "1",
      nome: "Evento 1",
      data: "2026-01-09T10:30:00.000Z",
      imagem: "https://example.com/img1.jpg",
    },
    {
      id: "2",
      nome: "Evento 2",
      data: "2026-01-11T12:00:00.000Z",
      logoUrl: "/uploads/logo2.png",
    },
    {
      id: "3",
      nome: "Evento 3",
    },
  ];
}

describe("EventCarousel", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("renderiza estado de loading", () => {
    const { container } = render(
      <EventCarousel events={[]} loading={true} error={null} />
    );

    // skeletons possuem animate-pulse
    expect(container.querySelectorAll(".animate-pulse").length).toBe(3);
  });

  it("renderiza estado de erro", () => {
    render(<EventCarousel events={[]} loading={false} error={"Deu ruim"} />);
    expect(screen.getByText("Deu ruim")).toBeInTheDocument();
  });

  it("renderiza estado vazio quando events.length === 0", () => {
    render(<EventCarousel events={[]} loading={false} error={null} />);
    expect(screen.getByText(/Nenhum evento disponível/i)).toBeInTheDocument();
  });

  it("renderiza eventos e botões de navegação quando há mais de 1 evento", () => {
    render(<EventCarousel events={makeEvents()} loading={false} error={null} />);

    expect(screen.getByText("Evento 1")).toBeInTheDocument();
    expect(screen.getByText("Evento 2")).toBeInTheDocument();
    expect(screen.getByText("Evento 3")).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /Evento anterior/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Próximo evento/i })
    ).toBeInTheDocument();

    // dots
    expect(
      screen.getByRole("button", { name: "Ir para slide 1" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Ir para slide 2" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Ir para slide 3" })
    ).toBeInTheDocument();

    expect(screen.getAllByRole("button", { name: /Ver detalhes/i }).length).toBe(
      3
    );
  });

  it("clicar no indicador muda o slide ativo (classe do dot vira bg-black w-8)", () => {
    render(<EventCarousel events={makeEvents()} loading={false} error={null} />);

    const dot1 = screen.getByRole("button", { name: "Ir para slide 1" });
    const dot2 = screen.getByRole("button", { name: "Ir para slide 2" });

    // inicialmente o 1 está ativo
    expect(dot1.className).toContain("bg-black");
    expect(dot1.className).toContain("w-8");
    expect(dot2.className).toContain("bg-gray-300");

    fireEvent.click(dot2);

    expect(dot2.className).toContain("bg-black");
    expect(dot2.className).toContain("w-8");
    expect(dot1.className).toContain("bg-gray-300");
  });

  it("clicar no botão Próximo/Anterior atualiza o indicador ativo", () => {
    render(<EventCarousel events={makeEvents()} loading={false} error={null} />);

    const next = screen.getByRole("button", { name: /Próximo evento/i });
    const prev = screen.getByRole("button", { name: /Evento anterior/i });

    const dot1 = screen.getByRole("button", { name: "Ir para slide 1" });
    const dot2 = screen.getByRole("button", { name: "Ir para slide 2" });
    const dot3 = screen.getByRole("button", { name: "Ir para slide 3" });

    expect(dot1.className).toContain("bg-black");

    fireEvent.click(next);
    expect(dot2.className).toContain("bg-black");

    fireEvent.click(next);
    expect(dot3.className).toContain("bg-black");

    fireEvent.click(next);
    expect(dot1.className).toContain("bg-black");

    fireEvent.click(prev);
    expect(dot3.className).toContain("bg-black");
  });

  it("auto-rotate: após 5s avança o slide (se tiver mais de 1 evento)", () => {
    render(<EventCarousel events={makeEvents()} loading={false} error={null} />);

    const dot1 = screen.getByRole("button", { name: "Ir para slide 1" });
    const dot2 = screen.getByRole("button", { name: "Ir para slide 2" });

    expect(dot1.className).toContain("bg-black");

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(dot2.className).toContain("bg-black");
  });

  it("clicar em 'Ver detalhes' NÃO muda o slide (stopPropagation)", () => {
    render(<EventCarousel events={makeEvents()} loading={false} error={null} />);

    const dot1 = screen.getByRole("button", { name: "Ir para slide 1" });
    expect(dot1.className).toContain("bg-black");

    // pega botão do primeiro evento
    const btn = screen.getAllByRole("button", { name: /Ver detalhes/i })[0];

    fireEvent.click(btn);

    expect(dot1.className).toContain("bg-black");
  });

  it("mostra ícone de calendário quando evento tem data", () => {
    render(<EventCarousel events={makeEvents()} loading={false} error={null} />);
    expect(screen.getAllByTestId("icon-calendar").length).toBeGreaterThanOrEqual(
      1
    );
  });
});
