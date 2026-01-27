import { render, screen, waitFor } from "@testing-library/react";
import { HeroSection } from "../../../pages/Home";

jest.mock("../../../components/events/MapView", () => () => (
  <div data-testid="map-view-mock" />
));

interface EventCarouselProps {
  loading: boolean;
  error: string | null;
  events: unknown[];
}

jest.mock("../../../components/events/EventCarousel", () => ({
  EventCarousel: ({ loading, error, events }: EventCarouselProps) => {
    if (loading) return <p>Carregando eventos...</p>;
    if (error) return <p>{error}</p>;
    if (events.length === 0) return <p>Nenhum evento encontrado</p>;
    return <p>Eventos carregados</p>;
  },
}));

describe("HeroSection", () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  test("exibe estado de loading", () => {
    (global.fetch as jest.Mock).mockImplementation(
      () => new Promise<never>(() => {})
    );

    render(<HeroSection />);

    expect(screen.getByText(/carregando eventos/i)).toBeInTheDocument();
  });

  test("exibe mensagem de erro quando a API falha", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Erro ao buscar eventos")
    );

    render(<HeroSection />);

    await waitFor(() => {
      expect(screen.getByText(/erro ao carregar eventos/i)).toBeInTheDocument();
    });
  });

  test("exibe estado vazio quando não há eventos", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as Response);

    render(<HeroSection />);

    await waitFor(() => {
      expect(screen.getByText(/nenhum evento encontrado/i)).toBeInTheDocument();
    });
  });
});
