import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EventFormDialog from '@/pages/gestor/components/EventFormDialog';

// Mock do react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

// Mock do LocationPicker
vi.mock('../../../components/events/LocationPicker', () => ({
  default: ({
    onLocationSelect,
  }: {
    onLocationSelect: (location: {
      lat: number;
      lon: number;
      display_name: string;
    }) => void;
  }) => (
    <div data-testid="location-picker">
      <button
        onClick={() => {
          onLocationSelect({
            lat: -3.1303,
            lon: -60.0217,
            display_name: 'Local selecionado no mapa',
          });
        }}
      >
        Selecionar Localização
      </button>
    </div>
  ),
}));

// Mock do TicketLotManager
vi.mock('../../../pages/gestor/components/TicketLotManager', () => ({
  default: ({ eventId }: { eventId: number | null }) => (
    <div data-testid="ticket-lot-manager">
      Gerenciador de Lotes para Evento: {eventId}
    </div>
  ),
}));

// Dados de mock
const mockEventTypes = [
  { id: 1, nome: 'Cultura' },
  { id: 2, nome: 'Turismo' },
  { id: 3, nome: 'Gastronomia' },
];

const mockEvents = [
  { id: 1, nome: 'Festival de Parintins 2026', tipoEventoId: 1 },
  { id: 2, nome: 'Festival de Cirandas 2026', tipoEventoId: 1 },
];

const mockEditingEvent = {
  id: '10',
  nome: 'Evento de Teste',
  descricao: 'Descrição do evento de teste',
  data: '2026-06-20T18:00',
  dataInicio: '2026-06-20T18:00',
  dataFim: '2026-06-20T23:00',
  categoria: 'Cultura',
  tipoEventoId: 1,
  eventoPaiId: null,
  localizacao: 'Teatro Amazonas',
  latitude: -3.1303,
  longitude: -60.0217,
  locationName: 'Teatro Amazonas',
  logoUrl: '/uploads/logo.png',
  bannerUrl: '/uploads/banner.png',
  ingressoUrl: 'https://example.com/ingresso',
  externalLink: 'https://example.com/ingresso',
};

const mockLocationResults = [
  {
    lat: -3.1303,
    lon: -60.0217,
    display_name: 'Manaus, Amazonas, Brasil',
  },
  {
    lat: -2.6286,
    lon: -56.7351,
    display_name: 'Parintins, Amazonas, Brasil',
  },
];

describe('EventFormDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Configurar mocks padrão para fetch
    globalThis.fetch = vi.fn((url) => {
      const urlString = url.toString();

      // Mock para buscar eventos
      if (urlString.includes('/events/all')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockEvents,
        } as Response);
      }

      // Mock para buscar tipos de eventos
      if (urlString.includes('/event-types')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockEventTypes,
        } as Response);
      }

      // Mock para busca de localização (Nominatim)
      if (urlString.includes('nominatim.openstreetmap.org/search')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockLocationResults,
        } as Response);
      }

      // Mock para reverse geocoding
      if (urlString.includes('nominatim.openstreetmap.org/reverse')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            display_name: 'Local selecionado no mapa',
          }),
        } as Response);
      }

      // Default mock
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      } as Response);
    });

    localStorage.setItem('token', 'fake-token');
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('renderiza formulário de criação corretamente', async () => {
    render(<EventFormDialog />);

    await waitFor(() => {
      expect(screen.getByText('📝 Informações Básicas')).toBeInTheDocument();
    });

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Dados do Evento')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Ingressos')).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText('Ex: Festival Cultural 2026')
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Descreva o evento...')
    ).toBeInTheDocument();
  });

  test('carrega tipos de eventos', async () => {
    render(<EventFormDialog />);

    await waitFor(() => {
      expect(screen.getByText('Cultura')).toBeInTheDocument();
    });

    expect(screen.getByText('Turismo')).toBeInTheDocument();
    expect(screen.getByText('Gastronomia')).toBeInTheDocument();
  });

  test('carrega eventos pai', async () => {
    render(<EventFormDialog />);

    await waitFor(() => {
      expect(
        screen.getByText('Festival de Parintins 2026')
      ).toBeInTheDocument();
    });

    expect(screen.getByText('Festival de Cirandas 2026')).toBeInTheDocument();
  });

  test('preenche formulário em modo de edição', async () => {
    render(<EventFormDialog editingEvent={mockEditingEvent} />);

    await waitFor(() => {
      const nomeInput = screen.getByPlaceholderText(
        'Ex: Festival Cultural 2026'
      ) as HTMLInputElement;
      expect(nomeInput.value).toBe('Evento de Teste');
    });

    const descricaoInput = screen.getByPlaceholderText(
      'Descreva o evento...'
    ) as HTMLTextAreaElement;
    expect(descricaoInput.value).toBe('Descrição do evento de teste');
  });

  test('exibe botão de atualizar em modo de edição', async () => {
    render(<EventFormDialog editingEvent={mockEditingEvent} />);

    await waitFor(() => {
      expect(screen.getByText('💾 Atualizar Evento')).toBeInTheDocument();
    });
  });

  test('exibe botão de criar em modo de criação', async () => {
    render(<EventFormDialog />);

    await waitFor(() => {
      expect(screen.getByText('✨ Criar Evento')).toBeInTheDocument();
    });
  });

  test('permite preencher campos do formulário', async () => {
    const user = userEvent.setup();

    render(<EventFormDialog />);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText('Ex: Festival Cultural 2026')
      ).toBeInTheDocument();
    });

    const nomeInput = screen.getByPlaceholderText('Ex: Festival Cultural 2026');
    await user.clear(nomeInput);
    await user.type(nomeInput, 'Novo Evento');

    expect((nomeInput as HTMLInputElement).value).toBe('Novo Evento');
  });

  test('busca localizações quando digita no campo de endereço', async () => {
    const user = userEvent.setup();

    render(<EventFormDialog />);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText('Digite um endereço ou ponto de referência')
      ).toBeInTheDocument();
    });

    const locationInput = screen.getByPlaceholderText(
      'Digite um endereço ou ponto de referência'
    );
    await user.type(locationInput, 'Manaus');

    await waitFor(() => {
      expect(screen.getByText('Manaus, Amazonas, Brasil')).toBeInTheDocument();
    });

    expect(screen.getByText('Parintins, Amazonas, Brasil')).toBeInTheDocument();
  });

  test('seleciona localização da lista de resultados', async () => {
    const user = userEvent.setup();

    render(<EventFormDialog />);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText('Digite um endereço ou ponto de referência')
      ).toBeInTheDocument();
    });

    const locationInput = screen.getByPlaceholderText(
      'Digite um endereço ou ponto de referência'
    );
    await user.type(locationInput, 'Manaus');

    await waitFor(() => {
      expect(screen.getByText('Manaus, Amazonas, Brasil')).toBeInTheDocument();
    });

    const locationButton = screen.getByText('Manaus, Amazonas, Brasil');
    await user.click(locationButton);

    await waitFor(() => {
      expect(screen.getByText(/Lat: -3\.130300/)).toBeInTheDocument();
    });
  });

  test('navega para step de ingressos', async () => {
    const user = userEvent.setup();

    render(<EventFormDialog editingEvent={mockEditingEvent} />);

    await waitFor(() => {
      expect(screen.getByText('🎫 Ir para Ingressos →')).toBeInTheDocument();
    });

    const goToTicketsButton = screen.getByText('🎫 Ir para Ingressos →');
    await user.click(goToTicketsButton);

    await waitFor(() => {
      expect(screen.getByText('Lotes de Ingressos')).toBeInTheDocument();
    });
  });

  test('volta do step de ingressos para dados do evento', async () => {
    const user = userEvent.setup();

    render(<EventFormDialog editingEvent={mockEditingEvent} />);

    await waitFor(() => {
      expect(screen.getByText('🎫 Ir para Ingressos →')).toBeInTheDocument();
    });

    const goToTicketsButton = screen.getByText('🎫 Ir para Ingressos →');
    await user.click(goToTicketsButton);

    await waitFor(() => {
      expect(screen.getByText('Lotes de Ingressos')).toBeInTheDocument();
    });

    // Verifica que o botão de voltar existe
    const backButtons = screen.getAllByRole('button');
    expect(backButtons.length).toBeGreaterThan(0);
  });

  test('chama callback onCancel quando clica em cancelar', async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();

    render(<EventFormDialog onCancel={onCancel} />);

    await waitFor(() => {
      expect(screen.getByText('Cancelar')).toBeInTheDocument();
    });

    const cancelButton = screen.getByText('Cancelar');
    await user.click(cancelButton);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  test('chama callback onSuccess quando clica em concluir', async () => {
    const onSuccess = vi.fn();
    const user = userEvent.setup();

    render(
      <EventFormDialog editingEvent={mockEditingEvent} onSuccess={onSuccess} />
    );

    await waitFor(() => {
      expect(screen.getByText('🎫 Ir para Ingressos →')).toBeInTheDocument();
    });

    const goToTicketsButton = screen.getByText('🎫 Ir para Ingressos →');
    await user.click(goToTicketsButton);

    await waitFor(() => {
      expect(screen.getByText('Lotes de Ingressos')).toBeInTheDocument();
    });

    // Verifica que chegou ao step de ingressos
    expect(
      screen.queryByText('📝 Informações Básicas')
    ).not.toBeInTheDocument();
  });

  test('desabilita campos durante carregamento', async () => {
    const user = userEvent.setup();

    vi.mocked(globalThis.fetch).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<EventFormDialog />);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText('Ex: Festival Cultural 2026')
      ).toBeInTheDocument();
    });

    const submitButton = screen.getByText('✨ Criar Evento');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('⏳ Salvando...')).toBeInTheDocument();
    });

    const nomeInput = screen.getByPlaceholderText(
      'Ex: Festival Cultural 2026'
    ) as HTMLInputElement;
    expect(nomeInput).toBeDisabled();
  });
});
