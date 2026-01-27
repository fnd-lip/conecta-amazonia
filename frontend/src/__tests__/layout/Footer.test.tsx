/**
 * Testes do Footer (layout)
 * Objetivo: garantir que o rodapé sempre renderiza e exibe o texto principal.
 */

import { render, screen } from "@testing-library/react";
import Footer from "@/components/layout/Footer";

describe("Footer (Layout)", () => {
  test("renderiza o rodapé", () => {
    render(<Footer />);

    // <footer> costuma virar role="contentinfo"
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  test("mostra o texto de direitos reservados", () => {
    render(<Footer />);

    expect(
      screen.getByText(/conecta amazônia/i)
    ).toBeInTheDocument();
  });
});
