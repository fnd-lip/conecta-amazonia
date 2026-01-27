import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "../../pages/Login";
import { MemoryRouter } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

// Mocks
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("jwt-decode", () => ({
  jwtDecode: jest.fn(),
}));

// Helpers
function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );
}

// Tests
describe("Login Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    jest.restoreAllMocks(); // garante que spyOn(fetch) não vaza entre testes
  });

  test("renderiza formulário de login", () => {
    renderLogin();

    // ✅ Texto real da tela
    expect(screen.getByRole("heading", { name: /login/i })).toBeInTheDocument();
    expect(
      screen.getByText(/acesse a área para gerenciar seus eventos/i)
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /entrar/i })).toBeInTheDocument();
  });

  test("exibe erros de validação ao submeter formulário vazio", async () => {
    renderLogin();

    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    expect(await screen.findByText(/informe o e-mail/i)).toBeInTheDocument();
    expect(await screen.findByText(/informe a senha/i)).toBeInTheDocument();
  });

  test("exibe estado de loading ao submeter formulário", async () => {
    jest.spyOn(global, "fetch").mockImplementation(() => new Promise(() => {}));

    renderLogin();

    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: "gestor@teste.com" },
    });

    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: "123456" },
    });

    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    expect(await screen.findByText(/entrando/i)).toBeInTheDocument();
  });

  test("exibe erro quando API retorna falha de login", async () => {
    jest.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "E-mail ou senha inválidos." }),
    } as Response);

    renderLogin();

    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: "gestor@teste.com" },
    });

    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: "123456" },
    });

    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    expect(
      await screen.findByText(/e-mail ou senha inválidos/i)
    ).toBeInTheDocument();
  });

  test("redireciona para /admin quando usuário é Administrador", async () => {
    jest.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: "fake-token" }),
    } as Response);

    (jwtDecode as jest.Mock).mockReturnValue({
      role: "Administrador",
    });

    renderLogin();

    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: "admin@teste.com" },
    });

    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: "123456" },
    });

    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(localStorage.getItem("token")).toBe("fake-token");
      expect(mockNavigate).toHaveBeenCalledWith("/admin");
    });
  });

  test("redireciona para /gestor/eventos quando usuário não é Administrador", async () => {
    jest.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: "fake-token" }),
    } as Response);

    (jwtDecode as jest.Mock).mockReturnValue({
      role: "Gestor",
    });

    renderLogin();

    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: "gestor@teste.com" },
    });

    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: "123456" },
    });

    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/gestor/eventos");
    });
  });
});
