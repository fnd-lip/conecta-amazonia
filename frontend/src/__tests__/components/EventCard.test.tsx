/**
 * Testes do EventCard
 * Objetivo: garantir que renderiza as infos e navega para detalhes ao clicar.
 */

import { render, screen, fireEvent } from "@testing-library/react";
import EventCard from "@/components/card/EventCard";

// Eu mocko o useNavigate pra capturar a navegação ao clicar no card.
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useNavigate: () => mockNavigate,
  };
});

describe("EventCard (Card)", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  test("renderiza no modo simple e navega ao clicar", () => {
    render(
      <EventCard
        event={{
          id: "1",
          nome: "Festival Cultural",
          descricao: "Um evento bem legal",
          categoria: "cultura",
          data: "2026-01-01T12:00:00.000Z",
        }}
      />
    );

    expect(screen.getByText(/festival cultural/i)).toBeInTheDocument();

    // O componente usa role="button" no container
    fireEvent.click(screen.getByRole("button"));

    expect(mockNavigate).toHaveBeenCalledWith("/eventos/1");
  });

  test("renderiza no modo carousel e mostra fallback quando não tem imagem", () => {
    render(
      <EventCard
        variant="carousel"
        event={{
          id: "2",
          nome: "Feira de Turismo",
          local: "Itacoatiara",
          data: "2026-02-02T10:00:00.000Z",
          imagem: null,
        }}
      />
    );

    expect(screen.getByText(/feira de turismo/i)).toBeInTheDocument();
    expect(screen.getByText(/itacoatiara/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button"));
    expect(mockNavigate).toHaveBeenCalledWith("/eventos/2");
  });
});
