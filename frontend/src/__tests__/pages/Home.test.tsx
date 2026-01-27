import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";

// ajuste o caminho conforme seu projeto
import Home, { HeroSection } from "../../pages/Home";

type FetchResponse<T> = {
  ok: boolean;
  status: number;
  json: () => Promise<T>;
};

function okJson<T>(data: T): Promise<FetchResponse<T>> {
  return Promise.resolve({
    ok: true,
    status: 200,
    json: async () => data,
  });
}

function failJson<T>(status = 500, data?: T): Promise<FetchResponse<T>> {
  return Promise.resolve({
    ok: false,
    status,
    json: async () => (data as T),
  });
}

/**
 * Mocks de componentes filhos
 */
jest.mock("../../components/events/EventCarousel", () => ({
  EventCarousel: ({
    events,
    loading,
    error,
  }: {
    events: Array<{ id: string; nome: string }>;
    loading: boolean;
    error: string | null;
  }) => (
    <div data-testid="event-carousel">
      <div>loading:{String(loading)}</div>
      <div>error:{error ?? ""}</div>
      <div>events:{events.length}</div>
    </div>
  ),
}));

jest.mock("../../components/events/EventCarouselSection", () => ({
  EventCarouselSection: ({
    title,
    emptyMessage,
    filters,
  }: {
    title: string;
    emptyMessage: string;
    filters: Record<string, unknown>;
  }) => (
    <div data-testid="event-carousel-section">
      <div>title:{title}</div>
      <div>empty:{emptyMessage}</div>
      <div>filters:{JSON.stringify(filters)}</div>
    </div>
  ),
}));

jest.mock("../../components/events/MapView", () => ({
  __esModule: true,
  default: ({
    events,
    focusedEventId,
  }: {
    events: Array<{ id: string; nome: string }>;
    focusedEventId: string | null;
  }) => (
    <div data-testid="map-view">
      <div>events:{events.length}</div>
      <div>focused:{focusedEventId ?? ""}</div>
    </div>
  ),
}));

jest.mock("../../components/events/EventAutocomplete", () => ({
  EventAutocomplete: ({
    onSelectSuggestion,
    onSearchSubmit,
  }: {
    onSelectSuggestion: (ev: {
      id: string;
      nome: string;
      data: string;
      latitude: number;
      longitude: number;
      locationName?: string;
      local?: string;
    }) => void;
    onSearchSubmit: (term: string) => void;
    className?: string;
  }) => (
    <div data-testid="event-autocomplete">
      <button
        type="button"
        onClick={() =>
          onSelectSuggestion({
            id: "ev-1",
            nome: "Evento Sugerido",
            data: "2026-01-10",
            latitude: -3.1,
            longitude: -60.0,
            locationName: "Manaus",
            local: "Manaus",
          })
        }
      >
        select-suggestion
      </button>

      <button type="button" onClick={() => onSearchSubmit("feira")}>
        submit-search
      </button>
    </div>
  ),
}));

jest.mock("@/pages/CalendarPage", () => ({
  __esModule: true,
  default: () => <div data-testid="calendar-page">CalendarPage</div>,
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: string;
    size?: string;
  }) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
}));

/**
 * Mock do Select (Radix) -> vira <select> nativo
 */
jest.mock("@/components/ui/select", () => ({
  Select: ({
    onValueChange,
    children,
  }: {
    onValueChange?: (val: string) => void;
    children: React.ReactNode;
  }) => (
    <div data-testid="select-wrapper">
      <select
        aria-label="Categoria"
        data-testid="categoria-select"
        onChange={(e) => onValueChange?.(e.target.value)}
      >
        <option value="">Categoria</option>
        <option value="todos">Todas</option>
        <option value="cultura">Cultura</option>
        <option value="aventura">Aventura</option>
        <option value="gastronomia">Gastronomia</option>
      </select>
      {children}
    </div>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="select-trigger">{children}</div>
  ),
  SelectValue: ({ placeholder }: { placeholder?: string }) => (
    <span data-testid="select-value">{placeholder ?? ""}</span>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="select-content">{children}</div>
  ),
  SelectItem: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) => (
    <div data-testid="select-item" data-value={value}>
      {children}
    </div>
  ),
}));

describe("Home", () => {
  const consoleErrorSpy = jest
    .spyOn(console, "error")
    .mockImplementation(() => {});

  beforeEach(() => {
    jest.clearAllMocks();

    global.fetch = jest.fn((input: RequestInfo | URL) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;

      // HeroSection - highlights
      if (url === "http://localhost:3001/events/all?limit=10") {
        return okJson([
          {
            id: "h1",
            nome: "Highlight 1",
            categoria: "cultura",
            data: "2026-01-20",
          },
        ]);
      }

      // Home - event types
      if (url === "http://localhost:3001/event-types") {
        return okJson([
          { id: 1, nome: "Cultura" },
          { id: 2, nome: "Aventura" },
        ]);
      }

      // EventsMapSection - lista (com/sem querystring)
      if (url.startsWith("http://localhost:3001/events/all")) {
        return okJson([
          {
            id: "m1",
            nome: "Evento Mapa 1",
            categoria: "cultura",
            data: "2026-01-05",
            latitude: -3.1,
            longitude: -60.0,
            locationName: "Manaus",
          },
          // filtrado (sem lat/long)
          {
            id: "m2",
            nome: "Sem Local",
            categoria: "cultura",
            data: "2026-01-06",
            latitude: null,
            longitude: null,
          },
        ]);
      }

      return okJson([]);
    }) as unknown as typeof fetch;
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  it("HeroSection: chama API de highlights e passa props para EventCarousel", async () => {
    render(<HeroSection />);

    expect(
      screen.getByRole("heading", { name: /próximos eventos/i })
    ).toBeInTheDocument();

    // garante que a chamada aconteceu
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3001/events/all?limit=10"
      );
    });

    const carousel = screen.getByTestId("event-carousel");

    // ✅ AQUI é a correção: espera o estado assíncrono terminar
    await waitFor(() => {
      expect(carousel).toHaveTextContent("loading:false");
    });

    expect(carousel).toHaveTextContent("error:");
    expect(carousel).toHaveTextContent("events:1");
  });

  it("Home: carrega categorias e renderiza uma seção por tipo", async () => {
    render(<Home />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3001/event-types"
      );
    });

    await waitFor(() => {
      const sections = screen.getAllByTestId("event-carousel-section");
      expect(sections.length).toBe(2);
    });

    const sections = screen.getAllByTestId("event-carousel-section");
    expect(sections[0]).toHaveTextContent("title:Cultura");
    expect(sections[1]).toHaveTextContent("title:Aventura");

    expect(screen.getByTestId("calendar-page")).toBeInTheDocument();
    expect(screen.getByTestId("map-view")).toBeInTheDocument();
    expect(screen.getByTestId("event-autocomplete")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Exibindo 1 eventos/i)).toBeInTheDocument();
    });
  });

  it("Home: quando event-types falha, mostra mensagem de erro do componente", async () => {
    (global.fetch as jest.Mock).mockImplementation((input: RequestInfo | URL) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;

      if (url === "http://localhost:3001/events/all?limit=10") return okJson([]);
      if (url === "http://localhost:3001/event-types") return failJson(500);
      if (url.startsWith("http://localhost:3001/events/all")) return okJson([]);
      return okJson([]);
    });

    render(<Home />);

    await waitFor(() => {
      expect(
        screen.getByText(/Erro ao carregar categorias/i)
      ).toBeInTheDocument();
    });
  });

  it("EventsMapSection (via Home): autocomplete seleciona sugestão e foca o evento", async () => {
    render(<Home />);

    await waitFor(() => {
      expect(screen.getByTestId("map-view")).toHaveTextContent("events:1");
    });

    fireEvent.click(screen.getByRole("button", { name: /select-suggestion/i }));

    await waitFor(() => {
      expect(screen.getByText("Evento Sugerido")).toBeInTheDocument();
      expect(screen.getByTestId("map-view")).toHaveTextContent("focused:ev-1");
      expect(screen.getByText(/Exibindo 1 eventos/i)).toBeInTheDocument();
    });
  });

  it("EventsMapSection (via Home): alterar filtros dispara chamada com querystring (dataInicio/dataFim/categoria)", async () => {
    render(<Home />);

    fireEvent.change(screen.getByTestId("categoria-select"), {
      target: { value: "cultura" },
    });

    const dateInputs = Array.from(
      document.querySelectorAll('input[type="date"]')
    ) as HTMLInputElement[];

    expect(dateInputs.length).toBeGreaterThanOrEqual(2);

    fireEvent.change(dateInputs[0], { target: { value: "2026-01-01" } });
    fireEvent.change(dateInputs[1], { target: { value: "2026-01-31" } });

    await waitFor(() => {
      const calls = (global.fetch as jest.Mock).mock.calls
        .map((c) => String(c[0]))
        .filter((u) => u.startsWith("http://localhost:3001/events/all"));

      const hit = calls.find(
        (u) =>
          u.includes("categoria=cultura") &&
          u.includes("dataInicio=2026-01-01") &&
          u.includes("dataFim=2026-01-31")
      );

      expect(hit).toBeTruthy();
    });
  });
});
