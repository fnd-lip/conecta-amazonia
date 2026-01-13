import { render, screen } from "@testing-library/react";
import SobreNos from "../../pages/Sobre";

describe("Página Sobre Nós", () => {
  test("renderiza título principal e subtítulo", () => {
    render(<SobreNos />);

    expect(
      screen.getByRole("heading", {
        name: /conecta amazônia/i,
        level: 1,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/turismo e integração cultural na amazônia/i)
    ).toBeInTheDocument();
  });

  test("renderiza seção 'O que é o Conecta Amazônia?'", () => {
    render(<SobreNos />);

    expect(
      screen.getByRole("heading", {
        name: /o que é o conecta amazônia/i,
        level: 2,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/plataforma que aproxima visitantes/i)
    ).toBeInTheDocument();
  });

  test("renderiza benefícios da plataforma", () => {
    render(<SobreNos />);

    expect(
      screen.getByRole("heading", { name: /turismo sustentável/i, level: 3 })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: /rotas comunitárias/i, level: 3 })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: /eventos culturais/i, level: 3 })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: /mapas interativos/i, level: 3 })
    ).toBeInTheDocument();
  });

  test("renderiza seção 'Como funciona?'", () => {
    render(<SobreNos />);

    expect(
      screen.getByRole("heading", { name: /como funciona/i })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/o gestor local acessa a plataforma/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/a comunidade ganha visibilidade e renda/i)
    ).toBeInTheDocument();
  });

  test("renderiza chamada para ação com link para login", () => {
    render(<SobreNos />);

    const link = screen.getByRole("link", {
      name: /entrar no sistema/i,
    });

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/login");
  });

  test("renderiza imagens principais com atributo alt", () => {
    render(<SobreNos />);

    expect(
      screen.getByRole("img", { name: /amazônia/i })
    ).toBeInTheDocument();
  });
});
