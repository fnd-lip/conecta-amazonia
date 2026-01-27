/**
 * Testes do Header (layout)
 * Objetivo: garantir que o menu muda conforme o tipo de usuário (admin/gestor)
 * e que, quando não há token, não aparecem opções de usuário logado.
 */

jest.mock("@/assets/conecta.svg", () => "logo-mock");

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Header from "@/components/layout/Header";

// Mock do jwtDecode porque o Header usa auth-utils
jest.mock("jwt-decode", () => ({
  jwtDecode: jest.fn(),
}));

import { jwtDecode } from "jwt-decode";

type Payload = {
  id: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
};

function renderHeader() {
  return render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>
  );
}

describe("Header (Layout)", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test("quando NÃO tem token, não mostra 'Painel Administrativo'", () => {
    renderHeader();

    expect(
        screen.queryByRole("button", { name: /painel administrativo/i })
    ).not.toBeInTheDocument();
  });

  test("quando tem token e usuário é ADMIN, aparece 'Painel Administrativo'", () => {
    localStorage.setItem("token", "fake-token");

    (jwtDecode as jest.Mock).mockReturnValue({
      id: "1",
      email: "admin@teste.com",
      role: "Administrador",
      iat: 0,
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
    } as Payload);

    renderHeader();

    expect(
      screen.getByRole("button", { name: /painel administrativo/i })
    ).toBeInTheDocument();
  });

  test("quando tem token e usuário NÃO é admin, aparece 'Meus Eventos'", () => {
    localStorage.setItem("token", "fake-token");

    (jwtDecode as jest.Mock).mockReturnValue({
      id: "2",
      email: "gestor@teste.com",
      role: "Gestor",
      iat: 0,
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
    } as Payload);

    renderHeader();

    expect(
      screen.getByRole("button", { name: /meus eventos/i })
    ).toBeInTheDocument();
  });
});
