import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";

import Form from "@/components/events/Form";

const flushPromises = async () => {
  for (let i = 0; i < 6; i++) {
    await Promise.resolve();
  }
};

async function renderAndSettle(ui: React.ReactElement) {
  let result: ReturnType<typeof render> | null = null;

  await act(async () => {
    result = render(ui);
    await flushPromises();
  });

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return result!;
}

jest.mock("@/components/events/LocationPicker", () => ({
  __esModule: true,
  default: (props: {
    value: { latitude: number; longitude: number } | null;
    onSelect: (v: { latitude: number; longitude: number }) => void;
  }) => (
    <div data-testid="location-picker">
      <button
        type="button"
        onClick={() => props.onSelect({ latitude: -3.1, longitude: -60.02 })}
      >
        mock-select-location
      </button>
      <div data-testid="location-picker-value">
        {props.value
          ? `lat=${props.value.latitude},lng=${props.value.longitude}`
          : "no-value"}
      </div>
    </div>
  ),
}));

jest.mock("@/components/events/TicketLotManager", () => ({
  __esModule: true,
  default: ({ eventId }: { eventId: string | null }) => (
    <div data-testid="ticket-lot-manager">eventId:{eventId ?? "null"}</div>
  ),
}));

type FetchMock = (
  input: RequestInfo | URL,
  init?: RequestInit
) => Promise<Response>;

function respOkJson(data: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: async () => data,
  } as unknown as Response;
}

function respFailJson(status: number, data: unknown): Response {
  return {
    ok: false,
    status,
    json: async () => data,
  } as unknown as Response;
}

function setFetchMock(
  impl: (url: string, init?: RequestInit) => Promise<Response>
) {
  global.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString();
    return impl(url, init);
  }) as unknown as FetchMock;
}

beforeEach(() => {
  jest.restoreAllMocks();

  jest.spyOn(Storage.prototype, "getItem").mockImplementation((k: string) => {
    if (k === "token") return "token_teste";
    return null;
  });
});

afterEach(() => {
  jest.useRealTimers();
});

describe("Form (events)", () => {
  it("renderiza modo criação e carrega eventos pai + tipos de evento", async () => {
    setFetchMock(async (url) => {
      if (url === "http://localhost:3001/events/all") {
        return respOkJson([{ id: "p1", nome: "Evento Pai 1" }]);
      }
      if (url === "http://localhost:3001/event-types") {
        return respOkJson([{ id: 1, nome: "show" }]);
      }
      return respOkJson([]);
    });

    await renderAndSettle(<Form />);

    expect(screen.getByText(/Cadastro de Evento/i)).toBeInTheDocument();

    // evento pai vindo do fetch
    expect(screen.getByText("Evento Pai 1")).toBeInTheDocument();

    // tipos de evento vindos do fetch 
    expect(screen.getByText("show")).toBeInTheDocument();

    // TicketLotManager sempre presente 
    expect(screen.getByTestId("ticket-lot-manager")).toHaveTextContent(
      "eventId:null"
    );
  });

  it("cria evento (POST) com sucesso e chama onSuccess; em criação limpa campos e volta eventId para null", async () => {
    const onSuccess = jest.fn();

    setFetchMock(async (url, init) => {
      if (url === "http://localhost:3001/events/all") return respOkJson([]);
      if (url === "http://localhost:3001/event-types")
        return respOkJson([{ id: 1, nome: "show" }]);

      if (url === "http://localhost:3001/events" && init?.method === "POST") {
        return respOkJson({ id: "novo_id" });
      }

      return respOkJson([]);
    });

    await renderAndSettle(<Form onSuccess={onSuccess} />);

    // preencher alguns campos básicos
    fireEvent.change(screen.getByPlaceholderText(/Ex: Festival Cultural/i), {
      target: { value: "Meu Evento" },
    });

    fireEvent.change(screen.getByPlaceholderText(/Descreva o evento/i), {
      target: { value: "Descrição" },
    });

    const dt = document.querySelector('input[name="data"]') as HTMLInputElement;
    fireEvent.change(dt, { target: { value: "2026-01-09T10:30" } });

    const categoria = document.querySelector(
      'select[name="categoria"]'
    ) as HTMLSelectElement;
    fireEvent.change(categoria, { target: { value: "show" } });

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /Cadastrar Evento/i })
      );
      await flushPromises();
    });

    expect(onSuccess).toHaveBeenCalledTimes(1);

    // mensagem de sucesso
    expect(
      screen.getByText(/Evento cadastrado com sucesso!/i)
    ).toBeInTheDocument();

    // Como é modo criação, o componente limpa e seta createdEventId(null)
    expect(screen.getByTestId("ticket-lot-manager")).toHaveTextContent(
      "eventId:null"
    );

    // e limpa pelo menos o nome (verifica que esvaziou)
    expect(
      screen.getByPlaceholderText(/Ex: Festival Cultural/i)
    ).toHaveValue("");
  });

  it("modo edição: mostra título 'Editar Evento', faz PUT e NÃO limpa form; mantém TicketLotManager com id do evento", async () => {
    setFetchMock(async (url, init) => {
      if (url === "http://localhost:3001/events/all") return respOkJson([]);
      if (url === "http://localhost:3001/event-types") return respOkJson([]);

      if (url === "http://localhost:3001/events/ev1" && init?.method === "PUT") {
        return respOkJson({ id: "ev1" });
      }

      return respOkJson([]);
    });

    await renderAndSettle(
      <Form
        editingEvent={{
          id: "ev1",
          nome: "Evento Antigo",
          descricao: "Desc antiga",
          data: "2026-01-09T10:30:00.000Z",
          categoria: "show",
          latitude: null,
          longitude: null,
          locationName: null,
        }}
        onCancel={() => {}}
      />
    );

    expect(screen.getByText(/Editar Evento/i)).toBeInTheDocument();

    // TicketLotManager recebe o id do editingEvent 
    expect(screen.getByTestId("ticket-lot-manager")).toHaveTextContent(
      "eventId:ev1"
    );

    // Atualiza nome e salva
    const nomeInput = screen.getByPlaceholderText(
      /Ex: Festival Cultural/i
    ) as HTMLInputElement;

    expect(nomeInput).toHaveValue("Evento Antigo");

    fireEvent.change(nomeInput, { target: { value: "Evento Atualizado" } });

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /Atualizar Evento/i })
      );
      await flushPromises();
    });

    // sucesso em edição
    expect(
      screen.getByText(/Evento atualizado com sucesso!/i)
    ).toBeInTheDocument();

    expect(nomeInput).toHaveValue("Evento Atualizado");

    // TicketLotManager segue com ev1
    expect(screen.getByTestId("ticket-lot-manager")).toHaveTextContent(
      "eventId:ev1"
    );
  });

  it("botão Cancelar (apenas em edição) chama onCancel", async () => {
    const onCancel = jest.fn();

    setFetchMock(async (url) => {
      if (url === "http://localhost:3001/events/all") return respOkJson([]);
      if (url === "http://localhost:3001/event-types") return respOkJson([]);
      return respOkJson([]);
    });

    await renderAndSettle(
      <Form
        editingEvent={{
          id: "ev1",
          nome: "Evento",
          descricao: "Desc",
          data: "2026-01-09T10:30:00.000Z",
          categoria: "show",
          latitude: null,
          longitude: null,
          locationName: null,
        }}
        onCancel={onCancel}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Cancelar/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("valida arquivo inválido: tipo errado mostra mensagem de erro", async () => {
    setFetchMock(async (url) => {
      if (url === "http://localhost:3001/events/all") return respOkJson([]);
      if (url === "http://localhost:3001/event-types") return respOkJson([]);
      return respOkJson([]);
    });

    await renderAndSettle(<Form />);

    const fileInput = document.querySelector(
      'input[type="file"][name="logo"]'
    ) as HTMLInputElement;

    const badFile = new File(["x"], "bad.txt", { type: "text/plain" });
    fireEvent.change(fileInput, { target: { files: [badFile] } });

    expect(
      screen.getByText(/Formato de imagem invalido\. Use JPG, PNG ou WebP\./i)
    ).toBeInTheDocument();
  });

  it("busca endereço (debounce 400ms) e ao selecionar resultado mostra coordenadas", async () => {
    jest.useFakeTimers();

    setFetchMock(async (url) => {
      if (url === "http://localhost:3001/events/all") return respOkJson([]);
      if (url === "http://localhost:3001/event-types") return respOkJson([]);

      if (url.startsWith("https://nominatim.openstreetmap.org/search")) {
        return respOkJson([
          {
            display_name: "Manaus, AM, Brasil",
            lat: "-3.100000",
            lon: "-60.020000",
          },
        ]);
      }

      if (url.startsWith("https://nominatim.openstreetmap.org/reverse")) {
        return respOkJson({ display_name: "Manaus, AM, Brasil" });
      }

      return respOkJson([]);
    });

    await renderAndSettle(<Form />);

    const locationInput = screen.getByPlaceholderText(
      /Digite um endereco ou ponto de referencia/i
    ) as HTMLInputElement;

    fireEvent.change(locationInput, { target: { value: "Manaus" } });

    await act(async () => {
      jest.advanceTimersByTime(450);
      await flushPromises();
    });

    const resultBtn = screen.getByRole("button", {
      name: /Manaus, AM, Brasil/i,
    });

    fireEvent.click(resultBtn);

    expect(screen.getByText(/Lat:\s*-3\.100000/i)).toBeInTheDocument();
    expect(screen.getByText(/Lng:\s*-60\.020000/i)).toBeInTheDocument();
  });

  it("quando API de salvar falha, mostra mensagem de erro", async () => {
    setFetchMock(async (url, init) => {
      if (url === "http://localhost:3001/events/all") return respOkJson([]);
      if (url === "http://localhost:3001/event-types")
        return respOkJson([{ id: 1, nome: "show" }]);

      if (url === "http://localhost:3001/events" && init?.method === "POST") {
        return respFailJson(400, { error: "Erro ao cadastrar evento" });
      }

      return respOkJson([]);
    });

    await renderAndSettle(<Form />);

    fireEvent.change(screen.getByPlaceholderText(/Ex: Festival Cultural/i), {
      target: { value: "Meu Evento" },
    });

    fireEvent.change(screen.getByPlaceholderText(/Descreva o evento/i), {
      target: { value: "Descrição" },
    });

    const dt = document.querySelector('input[name="data"]') as HTMLInputElement;
    fireEvent.change(dt, { target: { value: "2026-01-09T10:30" } });

    const categoria = document.querySelector(
      'select[name="categoria"]'
    ) as HTMLSelectElement;
    fireEvent.change(categoria, { target: { value: "show" } });

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /Cadastrar Evento/i })
      );
      await flushPromises();
    });

    expect(screen.getByText(/Erro ao cadastrar evento/i)).toBeInTheDocument();
  });
});
