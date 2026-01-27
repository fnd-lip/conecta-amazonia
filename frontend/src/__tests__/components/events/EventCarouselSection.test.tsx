import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { EventCarouselSection } from "../../../components/events/EventCarouselSection";

// Mock do EventCard 
type EventCardProps = {
  variant: string;
  event: {
    id: string;
    nome: string;
    categoria?: string;
    data?: string;
    imagem: string;
    local: string;
  };
  formattedDate: string;
};

const EventCardMock = jest.fn((props: EventCardProps) => (
  <div data-testid="event-card" data-id={props.event.id}>
    {props.event.nome}
  </div>
));

jest.mock("@/components/card/EventCard", () => {
  return {
    __esModule: true,
    default: (props: EventCardProps) => EventCardMock(props),
  };
});

// Mock do Carousel(shadcn) 
type CarouselProps = { children: React.ReactNode; className?: string; opts?: unknown };
type CarouselContentProps = { children: React.ReactNode; className?: string };
type CarouselItemProps = { children: React.ReactNode; className?: string };
type CarouselControlProps = { className?: string };

jest.mock("@/components/ui/carousel", () => {
  return {
    __esModule: true,
    Carousel: (props: CarouselProps) => (
      <div data-testid="carousel" className={props.className}>
        {props.children}
      </div>
    ),
    CarouselContent: (props: CarouselContentProps) => (
      <div data-testid="carousel-content" className={props.className}>
        {props.children}
      </div>
    ),
    CarouselItem: (props: CarouselItemProps) => (
      <div data-testid="carousel-item" className={props.className}>
        {props.children}
      </div>
    ),
    CarouselPrevious: (props: CarouselControlProps) => (
      <button data-testid="carousel-prev" className={props.className} type="button">
        Prev
      </button>
    ),
    CarouselNext: (props: CarouselControlProps) => (
      <button data-testid="carousel-next" className={props.className} type="button">
        Next
      </button>
    ),
  };
});

// fetch helpers 
type JsonValue = unknown;
type FetchResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<JsonValue>;
};

function mockFetchResolvedOnce(response: FetchResponse): void {
  (global.fetch as unknown as jest.Mock).mockResolvedValueOnce(response);
}

beforeEach(() => {
  global.fetch = jest.fn();
  EventCardMock.mockClear();
});

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

describe("EventCarouselSection", () => {
  it("renderiza título e link 'Ver tudo'", async () => {
    mockFetchResolvedOnce({
      ok: true,
      status: 200,
      json: async () => [],
    });

    render(<EventCarouselSection title="Em destaque" />);

    expect(screen.getByText("Em destaque")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /Ver tudo/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/");

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
  });

  it("mostra loading quando fetch está pendente", async () => {
    // fetch pendente para pegar estado loading
    (global.fetch as unknown as jest.Mock).mockImplementationOnce(
      () => new Promise(() => {})
    );

    render(<EventCarouselSection title="Loading" />);

    expect(screen.getByText("Carregando...")).toBeInTheDocument();
  });

  it("mostra emptyMessage quando lista vem vazia", async () => {
    mockFetchResolvedOnce({
      ok: true,
      status: 200,
      json: async () => [],
    });

    render(
      <EventCarouselSection title="Vazio" emptyMessage="Nenhum por aqui" />
    );

    expect(await screen.findByText("Nenhum por aqui")).toBeInTheDocument();
    expect(screen.queryByTestId("carousel")).not.toBeInTheDocument();
    expect(EventCardMock).not.toHaveBeenCalled();
  });

  it("mostra erro quando API retorna !ok", async () => {
    mockFetchResolvedOnce({
      ok: false,
      status: 500,
      json: async () => [],
    });

    render(<EventCarouselSection title="Erro" />);

    expect(await screen.findByText(/Erro:/i)).toBeInTheDocument();
    expect(screen.getByText(/Erro na API: 500/i)).toBeInTheDocument();

    expect(screen.queryByTestId("carousel")).not.toBeInTheDocument();
    expect(EventCardMock).not.toHaveBeenCalled();
  });

  it("renderiza Carousel com itens quando retorna eventos", async () => {
    const data = [
      {
        id: "1",
        nome: "Evento 1",
        categoria: "show",
        data: "2026-01-10T00:00:00.000Z",
        logoUrl: "/uploads/logo1.png",
      },
      {
        id: "2",
        nome: "Evento 2",
        categoria: undefined,
        data: undefined,
        logoUrl: null,
      },
    ];

    mockFetchResolvedOnce({
      ok: true,
      status: 200,
      json: async () => data,
    });

    render(<EventCarouselSection title="Lista" />);

    // espera cards renderizarem
    expect(await screen.findByText("Evento 1")).toBeInTheDocument();
    expect(screen.getByText("Evento 2")).toBeInTheDocument();

    // carousel aparece
    expect(screen.getByTestId("carousel")).toBeInTheDocument();
    expect(screen.getAllByTestId("carousel-item")).toHaveLength(2);

    // controles existem
    expect(screen.getByTestId("carousel-prev")).toBeInTheDocument();
    expect(screen.getByTestId("carousel-next")).toBeInTheDocument();

    // props do EventCard
    expect(EventCardMock).toHaveBeenCalledTimes(2);

    const firstProps = EventCardMock.mock.calls[0][0] as EventCardProps;
    expect(firstProps.variant).toBe("carousel");
    expect(firstProps.event.id).toBe("1");
    expect(firstProps.event.local).toBe("Show");
    expect(firstProps.event.imagem).toBe("http://localhost:3001/uploads/logo1.png");
    expect(typeof firstProps.formattedDate).toBe("string");

    const secondProps = EventCardMock.mock.calls[1][0] as EventCardProps;
    expect(secondProps.event.id).toBe("2");
    expect(secondProps.event.local).toBe("Local do evento");
    expect(secondProps.event.imagem).toBe("/icons/event-placeholder.svg");
    expect(secondProps.formattedDate).toBe("");
  });

  it("aplica filters.limit no front (slice)", async () => {
    const data = [
      { id: "1", nome: "A" },
      { id: "2", nome: "B" },
      { id: "3", nome: "C" },
    ];

    mockFetchResolvedOnce({
      ok: true,
      status: 200,
      json: async () => data,
    });

    render(<EventCarouselSection title="Limit" filters={{ limit: 2 }} />);

    expect(await screen.findByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.queryByText("C")).not.toBeInTheDocument();

    expect(EventCardMock).toHaveBeenCalledTimes(2);
  });

  it("monta querystring com filters (categoria/dataInicio/dataFim)", async () => {
    mockFetchResolvedOnce({
      ok: true,
      status: 200,
      json: async () => [],
    });

    render(
      <EventCarouselSection
        title="Filtro"
        filters={{
          categoria: "show",
          dataInicio: "2026-01-01",
          dataFim: "2026-02-01",
        }}
      />
    );

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

    const calledUrl = (global.fetch as unknown as jest.Mock).mock.calls[0][0] as string;

    expect(calledUrl.startsWith("http://localhost:3001/events/all?")).toBe(true);
    expect(calledUrl).toContain("categoria=show");
    expect(calledUrl).toContain("dataInicio=2026-01-01");
    expect(calledUrl).toContain("dataFim=2026-02-01");
  });
});
