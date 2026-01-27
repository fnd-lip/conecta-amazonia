import React from 'react';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import EventCardsCarouselSection from '../../../components/events/EventCardsCarouselSection';

// evita problemas com import de css
jest.mock(
  '../../../components/events/EventCardsCarouselSection.css',
  () => ({})
);

// Mock do EventCard: capturar props recebidas
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

jest.mock('../../../components/card/EventCard', () => {
  return {
    __esModule: true,
    default: (props: EventCardProps) => EventCardMock(props),
  };
});

// --- fetch helpers ---
type JsonValue = unknown;
type FetchResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<JsonValue>;
};

function mockFetchResolvedOnce(response: FetchResponse): void {
  (global.fetch as unknown as jest.Mock).mockResolvedValueOnce(response);
}

function mockFetchPending(): { resolve: (r: FetchResponse) => void } {
  let resolveFn: ((r: FetchResponse) => void) | null = null;

  (global.fetch as unknown as jest.Mock).mockImplementationOnce(
    () =>
      new Promise<FetchResponse>((resolve) => {
        resolveFn = resolve;
      })
  );

  return {
    resolve: (r: FetchResponse) => {
      resolveFn?.(r);
    },
  };
}

beforeEach(() => {
  global.fetch = jest.fn();
  EventCardMock.mockClear();
});

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

describe('EventCardsCarouselSection', () => {
  it('renderiza o título', async () => {
    mockFetchResolvedOnce({
      ok: true,
      status: 200,
      json: async () => [],
    });

    render(<EventCardsCarouselSection title="Destaques" />);

    expect(screen.getByText('Destaques')).toBeInTheDocument();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  it("mostra 'Carregando...' enquanto o fetch está pendente", async () => {
    const pending = mockFetchPending();

    render(<EventCardsCarouselSection title="Em alta" />);

    expect(screen.getByText('Carregando...')).toBeInTheDocument();

    pending.resolve({
      ok: true,
      status: 200,
      json: async () => [],
    });

    await waitFor(() => {
      expect(screen.queryByText('Carregando...')).not.toBeInTheDocument();
    });
  });

  it('mostra emptyMessage quando lista vem vazia', async () => {
    mockFetchResolvedOnce({
      ok: true,
      status: 200,
      json: async () => [],
    });

    render(
      <EventCardsCarouselSection
        title="Sem eventos"
        emptyMessage="Nada por aqui"
      />
    );

    expect(await screen.findByText('Nada por aqui')).toBeInTheDocument();
    expect(EventCardMock).not.toHaveBeenCalled();
  });

  it('mostra erro quando API retorna !ok', async () => {
    mockFetchResolvedOnce({
      ok: false,
      status: 500,
      json: async () => [],
    });

    render(<EventCardsCarouselSection title="Erro" />);

    expect(await screen.findByText(/Erro:/i)).toBeInTheDocument();
    expect(screen.getByText(/Erro na API: 500/i)).toBeInTheDocument();
    expect(EventCardMock).not.toHaveBeenCalled();
  });

  it('renderiza cards quando fetch retorna eventos e monta props', async () => {
    const data = [
      {
        id: '1',
        nome: 'Evento 1',
        categoria: 'show',
        data: '2026-01-10T00:00:00.000Z',
        logoUrl: '/uploads/logo1.png',
      },
      {
        id: '2',
        nome: 'Evento 2',
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

    render(<EventCardsCarouselSection title="Lista" />);

    expect(await screen.findByText('Evento 1')).toBeInTheDocument();
    expect(screen.getByText('Evento 2')).toBeInTheDocument();

    expect(EventCardMock).toHaveBeenCalledTimes(2);

    const firstProps = EventCardMock.mock.calls[0][0] as EventCardProps;
    expect(firstProps.variant).toBe('carousel');
    expect(firstProps.event.id).toBe('1');
    expect(firstProps.event.local).toBe('Show');
    expect(firstProps.event.imagem).toBe(
      'http://localhost:3001/uploads/logo1.png'
    );
    expect(typeof firstProps.formattedDate).toBe('string');

    const secondProps = EventCardMock.mock.calls[1][0] as EventCardProps;
    expect(secondProps.event.id).toBe('2');
    expect(secondProps.event.local).toBe('Local do evento');
    expect(secondProps.event.imagem).toBe('/icons/event-placeholder.svg');
    expect(secondProps.formattedDate).toBe('');
  });

  it('aplica filters.limit no front (slice)', async () => {
    const data = [
      { id: '1', nome: 'A' },
      { id: '2', nome: 'B' },
      { id: '3', nome: 'C' },
    ];

    mockFetchResolvedOnce({
      ok: true,
      status: 200,
      json: async () => data,
    });

    render(<EventCardsCarouselSection title="Limit" filters={{ limit: 2 }} />);

    expect(await screen.findByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.queryByText('C')).not.toBeInTheDocument();
    expect(EventCardMock).toHaveBeenCalledTimes(2);
  });

  it('monta querystring com filters (categoria/dataInicio/dataFim)', async () => {
    mockFetchResolvedOnce({
      ok: true,
      status: 200,
      json: async () => [],
    });

    render(
      <EventCardsCarouselSection
        title="Filtro"
        filters={{
          categoria: 'show',
          dataInicio: '2026-01-01',
          dataFim: '2026-02-01',
        }}
      />
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    const calledUrl = (global.fetch as unknown as jest.Mock).mock
      .calls[0][0] as string;

    expect(calledUrl.startsWith('http://localhost:3001/events/all?')).toBe(
      true
    );
    expect(calledUrl).toContain('categoria=show');
    expect(calledUrl).toContain('dataInicio=2026-01-01');
    expect(calledUrl).toContain('dataFim=2026-02-01');
  });

  it("clicar em 'Avançar' chama scrollBy no scroller", async () => {
    mockFetchResolvedOnce({
      ok: true,
      status: 200,
      json: async () => [],
    });

    const { container } = render(<EventCardsCarouselSection title="Scroll" />);

    const scroller = container.querySelector(
      '.carousel-row'
    ) as HTMLDivElement | null;
    expect(scroller).not.toBeNull();

    const scrollByMock = jest.fn();
    Object.defineProperty(scroller as HTMLDivElement, 'scrollBy', {
      value: scrollByMock,
      writable: true,
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(screen.getByRole('button', { name: 'Avançar' }));

    expect(scrollByMock).toHaveBeenCalledWith({
      left: 320,
      behavior: 'smooth',
    });
  });
});
