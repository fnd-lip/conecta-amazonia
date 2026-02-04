import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DashboardIngressoEvento from '../../pages/gestor/DashboardIngressoEvento';
import * as authUtils from '../../auth-utils';

// Mock do react-router-dom
const mockNavigate = vi.fn();
const mockParams = { id: 'event-123' };

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockParams,
  };
});

// Mock das funções de autenticação
vi.mock('../../auth-utils', () => ({
  isAuthenticated: vi.fn(),
  isGestor: vi.fn(),
  isAdmin: vi.fn(),
}));

// Mock do recharts para evitar problemas de renderização
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AreaChart: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Area: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
}));

const mockStatistics = {
  eventId: 'event-123',
  eventName: 'Festival de Parintins 2026',
  eventDate: '2026-06-26T20:00:00Z',
  eventType: 'Cultura',
  totalTicketsAvailable: 1000,
  totalTicketsSold: 500,
  ticketsRemaining: 500,
  ticketsValidated: 100,
  totalRevenue: 75000,
  totalOrders: 150,
  ticketLots: [
    {
      id: 'lot-1',
      name: '1º Lote - Arquibancada',
      price: 150,
      quantity: 500,
      sold: 400,
      remaining: 100,
      active: false,
    },
    {
      id: 'lot-2',
      name: '2º Lote - Arquibancada',
      price: 200,
      quantity: 500,
      sold: 100,
      remaining: 400,
      active: true,
    },
  ],
};

const mockDailySales = {
  dailySales: [
    {
      date: '2026-01-01',
      tickets: 50,
      revenue: 7500,
      accumulated: 50,
    },
    {
      date: '2026-01-02',
      tickets: 100,
      revenue: 15000,
      accumulated: 150,
    },
  ],
};

describe('DashboardIngressoEvento', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn();
    localStorage.setItem('token', 'fake-token');
  });

  afterEach(() => {
    localStorage.clear();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <DashboardIngressoEvento />
      </BrowserRouter>
    );
  };

  test('redireciona para login se não estiver autenticado', () => {
    vi.mocked(authUtils.isAuthenticated).mockReturnValue(false);

    renderComponent();

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('redireciona para home se não for gestor nem admin', () => {
    vi.mocked(authUtils.isAuthenticated).mockReturnValue(true);
    vi.mocked(authUtils.isGestor).mockReturnValue(false);
    vi.mocked(authUtils.isAdmin).mockReturnValue(false);

    renderComponent();

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('exibe loading inicialmente', () => {
    vi.mocked(authUtils.isAuthenticated).mockReturnValue(true);
    vi.mocked(authUtils.isGestor).mockReturnValue(true);

    vi.mocked(globalThis.fetch).mockImplementation(() => new Promise(() => {}));

    renderComponent();

    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  test('exibe mensagem de erro quando a requisição falha', async () => {
    vi.mocked(authUtils.isAuthenticated).mockReturnValue(true);
    vi.mocked(authUtils.isGestor).mockReturnValue(true);

    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: false,
      status: 404,
    } as Response);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Evento não encontrado')).toBeInTheDocument();
    });
  });

  test('exibe erro de permissão quando status é 403', async () => {
    vi.mocked(authUtils.isAuthenticated).mockReturnValue(true);
    vi.mocked(authUtils.isGestor).mockReturnValue(true);

    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: false,
      status: 403,
    } as Response);

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText('Você não tem permissão para visualizar este evento')
      ).toBeInTheDocument();
    });
  });

  test('renderiza dashboard com estatísticas do evento', async () => {
    vi.mocked(authUtils.isAuthenticated).mockReturnValue(true);
    vi.mocked(authUtils.isGestor).mockReturnValue(true);

    vi.mocked(globalThis.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStatistics,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockDailySales,
      } as Response);

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText('Festival de Parintins 2026')
      ).toBeInTheDocument();
    });

    // Verifica se os cards de resumo estão presentes
    expect(screen.getByText('Receita Total')).toBeInTheDocument();
    expect(screen.getByText('Ingressos Vendidos')).toBeInTheDocument();
    expect(screen.getByText('Ingressos Restantes')).toBeInTheDocument();
    expect(screen.getByText('Ingressos Validados')).toBeInTheDocument();

    // Verifica valores - usando getAllByText pois podem aparecer múltiplas vezes
    const text500 = screen.getAllByText('500');
    expect(text500.length).toBeGreaterThan(0);

    const text100 = screen.getAllByText('100');
    expect(text100.length).toBeGreaterThan(0);
  });

  test('exibe tabela de lotes corretamente', async () => {
    vi.mocked(authUtils.isAuthenticated).mockReturnValue(true);
    vi.mocked(authUtils.isGestor).mockReturnValue(true);

    vi.mocked(globalThis.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStatistics,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockDailySales,
      } as Response);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Detalhamento por Lote')).toBeInTheDocument();
    });

    // Verifica se os lotes estão na tabela
    expect(screen.getByText('1º Lote - Arquibancada')).toBeInTheDocument();
    expect(screen.getByText('2º Lote - Arquibancada')).toBeInTheDocument();

    // Verifica badges de status
    expect(screen.getByText('Ativo')).toBeInTheDocument();
    expect(screen.getByText('Inativo')).toBeInTheDocument();
  });

  test('exibe mensagem quando não há lotes cadastrados', async () => {
    vi.mocked(authUtils.isAuthenticated).mockReturnValue(true);
    vi.mocked(authUtils.isGestor).mockReturnValue(true);

    const emptyStatistics = {
      ...mockStatistics,
      ticketLots: [],
    };

    vi.mocked(globalThis.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => emptyStatistics,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockDailySales,
      } as Response);

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText('Nenhum lote de ingresso cadastrado para este evento.')
      ).toBeInTheDocument();
    });
  });

  test('exibe gráfico quando há dados de vendas diárias', async () => {
    vi.mocked(authUtils.isAuthenticated).mockReturnValue(true);
    vi.mocked(authUtils.isGestor).mockReturnValue(true);

    vi.mocked(globalThis.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStatistics,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockDailySales,
      } as Response);

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText('Evolução de Vendas por Dia')
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        'Gráfico mostrando a quantidade de ingressos vendidos por dia'
      )
    ).toBeInTheDocument();
  });

  test('permite admin visualizar dashboard', async () => {
    vi.mocked(authUtils.isAuthenticated).mockReturnValue(true);
    vi.mocked(authUtils.isGestor).mockReturnValue(false);
    vi.mocked(authUtils.isAdmin).mockReturnValue(true);

    vi.mocked(globalThis.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStatistics,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockDailySales,
      } as Response);

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText('Festival de Parintins 2026')
      ).toBeInTheDocument();
    });

    // Admin não deve ser redirecionado
    expect(mockNavigate).not.toHaveBeenCalledWith('/');
  });

  test('formata corretamente valores monetários', async () => {
    vi.mocked(authUtils.isAuthenticated).mockReturnValue(true);
    vi.mocked(authUtils.isGestor).mockReturnValue(true);

    vi.mocked(globalThis.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStatistics,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockDailySales,
      } as Response);

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText('Festival de Parintins 2026')
      ).toBeInTheDocument();
    });

    // Verifica se há valores monetários formatados
    const currencyElements = screen.getAllByText(/R\$|BRL/);
    expect(currencyElements.length).toBeGreaterThan(0);
  });

  test('calcula e exibe porcentagem de vendas corretamente', async () => {
    vi.mocked(authUtils.isAuthenticated).mockReturnValue(true);
    vi.mocked(authUtils.isGestor).mockReturnValue(true);

    vi.mocked(globalThis.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStatistics,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockDailySales,
      } as Response);

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText('Festival de Parintins 2026')
      ).toBeInTheDocument();
    });

    // 500 vendidos de 1000 = 50%
    await waitFor(() => {
      expect(screen.getByText(/50\.0%/)).toBeInTheDocument();
    });
  });
});
