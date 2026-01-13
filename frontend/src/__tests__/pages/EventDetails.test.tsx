import { render, screen } from "@testing-library/react";
import EventDetails from "../../pages/EventDetails";
import { MemoryRouter, Route, Routes } from "react-router-dom";

// Helpers

function renderWithRouter(eventId = "1") {
  return render(
    <MemoryRouter initialEntries={[`/eventos/${eventId}`]}>
      <Routes>
        <Route path="/eventos/:id" element={<EventDetails />} />
      </Routes>
    </MemoryRouter>
  );
}

function mockFetchOnce(data: unknown, ok = true, status = 200) {
  jest.spyOn(global, "fetch").mockResolvedValueOnce({
    ok,
    status,
    json: async () => data,
  } as Response);
}

function mockFetchReject(
  message = "Erro ao buscar detalhes do evento."
) {
  jest
    .spyOn(global, "fetch")
    .mockRejectedValueOnce(new Error(message));
}

// Tests
describe("EventDetails", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("exibe estado de loading inicialmente", () => {
    jest
      .spyOn(global, "fetch")
      .mockImplementation(() => new Promise(() => {}));

    renderWithRouter("1");

    expect(
      screen.getByText(/carregando detalhes do evento/i)
    ).toBeInTheDocument();
  });

  test("exibe erro quando evento não é encontrado (404)", async () => {
    mockFetchOnce({}, false, 404);

    renderWithRouter("999");

    expect(
      await screen.findByText(/evento não encontrado/i)
    ).toBeInTheDocument();
  });

  test("exibe erro genérico quando API falha", async () => {
    mockFetchReject();

    renderWithRouter("1");

    expect(
      await screen.findByText(/erro ao buscar detalhes do evento/i)
    ).toBeInTheDocument();
  });

  test("exibe estado vazio quando não há dados do evento", async () => {
    mockFetchOnce(null);

    renderWithRouter("1");

    expect(
      await screen.findByText(/nenhum dado de evento para exibir/i)
    ).toBeInTheDocument();
  });

  test("renderiza corretamente os detalhes do evento", async () => {
    mockFetchOnce({
      id: "1",
      nome: "Festival Cultural",
      descricao: "Descrição do evento",
      data: new Date().toISOString(),
      categoria: "Cultura",
      createdAt: new Date().toISOString(),
      parentId: null,
      externalLink: "https://evento.com",
      relatedLinks: ["https://link1.com"],
      children: [],
    });

    renderWithRouter("1");

    // título
    expect(
      await screen.findByText("Festival Cultural")
    ).toBeInTheDocument();

    // descrição
    expect(
      screen.getByText(/descrição do evento/i)
    ).toBeInTheDocument();

    // categoria 
    const category = document.querySelector(".event-category");
    expect(category).toHaveTextContent(/cultura/i);

    expect(
      screen.getByText(/visitar site oficial do evento/i)
    ).toBeInTheDocument();
  });

  test("exibe subeventos quando existirem", async () => {
    mockFetchOnce({
      id: "1",
      nome: "Evento Principal",
      descricao: "Descrição principal",
      data: new Date().toISOString(),
      categoria: "Cultura",
      createdAt: new Date().toISOString(),
      parentId: null,
      children: [
        {
          id: "2",
          nome: "Subevento 1",
          descricao: "Descrição subevento",
          data: new Date().toISOString(),
          categoria: "Show",
          createdAt: new Date().toISOString(),
          parentId: "1",
        },
      ],
    });

    renderWithRouter("1");

    expect(
      await screen.findByText("Subevento 1")
    ).toBeInTheDocument();

    expect(
      screen.getByText(/descrição subevento/i)
    ).toBeInTheDocument();
  });

  test("exibe mensagem quando não há subeventos", async () => {
    mockFetchOnce({
      id: "1",
      nome: "Evento Sem Sub",
      descricao: "Evento sem subeventos",
      data: new Date().toISOString(),
      categoria: "Cultura",
      createdAt: new Date().toISOString(),
      parentId: null,
      children: [],
    });

    renderWithRouter("1");

    expect(
      await screen.findByText(
        /este evento não possui subeventos/i
      )
    ).toBeInTheDocument();
  });
});
