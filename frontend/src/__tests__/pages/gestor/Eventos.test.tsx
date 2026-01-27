import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Eventos from "../../../pages/gestor/Eventos";
import * as authUtils from "../../../auth-utils";

// mock do navigate
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// mock do auth-utils (mantém as funções como jest.fn)
jest.mock("../../../auth-utils", () => ({
  isAuthenticated: jest.fn(),
  isAdmin: jest.fn(),
}));

// mock do componente que Eventos realmente usa no Dialog
jest.mock("../../../components/events/EventFormDialog", () => {
  return function MockEventFormDialog() {
    return <div>Formulário de Evento</div>;
  };
});

// helper para mockar fetch
const mockFetchOk = (data: unknown) => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => data,
  } as Response);
};

describe("Página Eventos (Gestor)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  test("exibe estado de loading inicialmente", async () => {
    (authUtils.isAuthenticated as jest.Mock).mockReturnValue(true);
    (authUtils.isAdmin as jest.Mock).mockReturnValue(false);

    // fetch pendente pra garantir que o loading apareça
    (global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise<never>(() => {})
    );

    render(
      <MemoryRouter>
        <Eventos />
      </MemoryRouter>
    );

    expect(await screen.findByText(/carregando eventos/i)).toBeInTheDocument();
  });

  test("redireciona para login se não estiver autenticado", async () => {
    (authUtils.isAuthenticated as jest.Mock).mockReturnValue(false);
    (authUtils.isAdmin as jest.Mock).mockReturnValue(false);

    render(
      <MemoryRouter>
        <Eventos />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });

  test("redireciona para admin se usuário for administrador", async () => {
    (authUtils.isAuthenticated as jest.Mock).mockReturnValue(true);
    (authUtils.isAdmin as jest.Mock).mockReturnValue(true);

    render(
      <MemoryRouter>
        <Eventos />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/admin");
    });
  });

  test("exibe estado vazio quando não há eventos", async () => {
    (authUtils.isAuthenticated as jest.Mock).mockReturnValue(true);
    (authUtils.isAdmin as jest.Mock).mockReturnValue(false);

    mockFetchOk({ events: [] });

    render(
      <MemoryRouter>
        <Eventos />
      </MemoryRouter>
    );

    expect(await screen.findByText(/nenhum evento cadastrado/i)).toBeInTheDocument();
  });

  test("exibe lista de eventos quando API retorna dados", async () => {
    (authUtils.isAuthenticated as jest.Mock).mockReturnValue(true);
    (authUtils.isAdmin as jest.Mock).mockReturnValue(false);

    mockFetchOk({
      events: [
        {
          id: "1",
          nome: "Evento Teste",
          descricao: "Descrição do evento",
          data: "2024-01-01T10:00:00Z",
          categoria: "cultura",
          children: [],
        },
      ],
    });

    render(
      <MemoryRouter>
        <Eventos />
      </MemoryRouter>
    );

    expect(await screen.findByText(/evento teste/i)).toBeInTheDocument();
    expect(screen.getByText(/descrição do evento/i)).toBeInTheDocument();

    // em Eventos.tsx você usa formatCategory() => primeira letra maiúscula
    expect(screen.getByText(/cultura/i)).toBeInTheDocument();
  });

  test("abre formulário ao clicar em 'Novo Evento'", async () => {
    (authUtils.isAuthenticated as jest.Mock).mockReturnValue(true);
    (authUtils.isAdmin as jest.Mock).mockReturnValue(false);

    mockFetchOk({ events: [] });

    render(
      <MemoryRouter>
        <Eventos />
      </MemoryRouter>
    );

    const button = await screen.findByRole("button", { name: /novo evento/i });
    fireEvent.click(button);

    expect(screen.getByText(/formulário de evento/i)).toBeInTheDocument();
  });
});
