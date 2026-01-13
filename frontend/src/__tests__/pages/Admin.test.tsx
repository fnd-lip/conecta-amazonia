import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Admin from '../../pages/Admin';
import * as auth from '../../auth-utils';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../auth-utils', () => ({
  isAuthenticated: jest.fn(),
  isAdmin: jest.fn(),
}));

const mockFetch = (data: unknown) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => data,
  } as Response);
};

describe('Página Admin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('token', 'fake-token');
  });

  test('exibe loading inicialmente', async () => {
    (auth.isAuthenticated as jest.Mock).mockReturnValue(true);
    (auth.isAdmin as jest.Mock).mockReturnValue(true);

    mockFetch([]);

    render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>
    );

    expect(await screen.findByText(/carregando/i)).toBeInTheDocument();
  });

  test('redireciona para login se não estiver autenticado', async () => {
    (auth.isAuthenticated as jest.Mock).mockReturnValue(false);

    render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/login')
    );
  });

  test('redireciona para gestor se usuário não for admin', async () => {
    (auth.isAuthenticated as jest.Mock).mockReturnValue(true);
    (auth.isAdmin as jest.Mock).mockReturnValue(false);

    render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/gestor/eventos')
    );
  });

  test('exibe estado vazio de eventos', async () => {
    (auth.isAuthenticated as jest.Mock).mockReturnValue(true);
    (auth.isAdmin as jest.Mock).mockReturnValue(true);

    mockFetch([]);

    render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>
    );

    expect(
      await screen.findByText(/nenhum evento encontrado/i)
    ).toBeInTheDocument();
  });

  test('exibe lista de eventos quando API retorna dados', async () => {
    (auth.isAuthenticated as jest.Mock).mockReturnValue(true);
    (auth.isAdmin as jest.Mock).mockReturnValue(true);

    mockFetch([
      {
        id: '1',
        nome: 'Evento Teste',
        descricao: 'Descrição',
        data: '2024-01-01T10:00:00Z',
        categoria: 'Tech',
        user: { name: 'Admin' },
        children: [],
      },
    ]);

    render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>
    );

    expect(await screen.findByText('Evento Teste')).toBeInTheDocument();
  });

  test('troca para aba de usuários e exibe lista', async () => {
    (auth.isAuthenticated as jest.Mock).mockReturnValue(true);
    (auth.isAdmin as jest.Mock).mockReturnValue(true);

    (global.fetch as jest.Mock) = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [],
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [
          {
            id: '1',
            name: 'João',
            email: 'joao@email.com',
            type: 'ADMIN',
            createdAt: '2024-01-01T00:00:00Z',
          },
        ],
      } as Response);

    render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>
    );

    fireEvent.click(await screen.findByText('Usuários'));

    expect(await screen.findByText('João')).toBeInTheDocument();
    expect(screen.getByText('ADMIN')).toBeInTheDocument();
  });
});
